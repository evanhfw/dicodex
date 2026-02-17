"""
ARQ Worker — runs scraping jobs from the Redis queue.

Start with:  arq app.worker.WorkerSettings
"""
import asyncio
import os
from pathlib import Path

from arq.connections import RedisSettings
from arq.jobs import Job
from dotenv import load_dotenv

# Load environment variables (for local dev)
load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")


def _parse_redis_url(url: str) -> RedisSettings:
    """Parse redis://host:port into RedisSettings."""
    url = url.removeprefix("redis://")
    host, _, port_str = url.partition(":")
    port = int(port_str) if port_str else 6379
    return RedisSettings(host=host or "redis", port=port)


async def scrape_task(ctx: dict, email: str, password: str) -> dict:
    """
    ARQ task: run the Dicoding scraper.

    Selenium is blocking, so we offload to a thread via asyncio.to_thread.
    Instrumented with Prometheus metrics for monitoring.
    """
    import time

    from app.metrics import arq_job_duration_seconds, arq_jobs_total
    from app.services.scraper import ScraperService

    start = time.monotonic()
    try:
        scraper = ScraperService()
        result = await asyncio.to_thread(scraper.run_scraper, email=email, password=password)
        arq_jobs_total.labels(status="success").inc()
        return result
    except Exception as e:
        arq_jobs_total.labels(status="failed").inc()
        
        # Send Alert
        try:
            from app.services.monitoring import DiscordMonitor
            # We don't need app state for simple alerting, just the env vars loaded in init
            monitor = DiscordMonitor(None)
            await monitor.send_alert(
                title="Job Failed", 
                details={
                   "Job": "Scrape Task",
                   "Email": email, 
                   "Error": str(e)
                }
            )
        except Exception as alert_err:
             print(f"Failed to send alert: {alert_err}")
             
        raise
    finally:
        duration = time.monotonic() - start
        arq_job_duration_seconds.observe(duration)
    job_id = ctx["job_id"]
    redis = ctx["redis"]

    async def update_progress(message: str, current_step: int, total_steps: int):
        """Callback to update progress in Redis."""
        percent = int((current_step / total_steps) * 100)
        await redis.setex(
            f"job_progress:{job_id}",
            3600,  # Expire in 1 hour
            f"{percent}|{message}|{current_step}|{total_steps}",
        )

    # We need to run the scraper in a thread because it's blocking (Selenium).
    # But the callback is async (Redis write), so we need a bridge.
    # Actually, the scraper calls the callback synchronously.
    # So we need a sync wrapper that schedules the async Redis write.
    
    # Better approach: The scraper is synchronous. The callback passed to it MUST be synchronous.
    # So we define a sync callback that uses a loop to run the async redis call? 
    # Or just use a synchronous Redis client? 
    # ARQ uses aioredis.
    
    # Since we are running scraper in a separate thread, we can't easily wait for async redis calls in the main loop 
    # from that thread without a new loop.
    
    # Alternative: The callback launches a fire-and-forget task in the main event loop?
    # But we are in `asyncio.to_thread`, which runs in a separate thread.
    
    # Let's use a thread-safe way to communicate back to the main loop.
    # or just use a sync redis client inside the thread?
    # Using a sync redis client is cleaner for the threaded scraper.
    
    def sync_progress_callback(message: str, current_step: int, total_steps: int):
        import redis as sync_redis
        
        # Create a new sync redis connection key just for this update (or reuse if we can)
        # For simplicity and thread safety, let's create a ephemeral connection or use a global pool if avail.
        # But we don't have a global sync pool.
        
        try:
             # Parse REDIS_URL again or use the global one
            r = sync_redis.from_url(REDIS_URL)
            percent = int((current_step / total_steps) * 100)
            r.setex(
                f"job_progress:{job_id}",
                3600,
                f"{percent}|{message}|{current_step}|{total_steps}",
            )
            r.close()
        except Exception as e:
            print(f"Error updating progress: {e}")

    scraper = ScraperService()
    
    # We pass the SYNC callback to the scraper
    result = await asyncio.to_thread(
        scraper.run_scraper, 
        email=email, 
        password=password, 
        progress_callback=sync_progress_callback
    )
    return result


class WorkerSettings:
    """ARQ worker configuration."""

    functions = [scrape_task]
    redis_settings = _parse_redis_url(REDIS_URL)

    # Concurrency: max 5 scrape jobs at once (Selenium has SE_NODE_MAX_SESSIONS=5)
    max_jobs = 5

    # Timeout: 10 minutes per scrape job
    job_timeout = 600

    # Keep results in Redis for 1 hour so frontend can poll
    keep_result = 3600

    # Retry once on failure
    max_tries = 2

    # Health check interval
    health_check_interval = 30
