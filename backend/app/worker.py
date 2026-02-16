"""
ARQ Worker — runs scraping jobs from the Redis queue.

Start with:  arq app.worker.WorkerSettings
"""
import asyncio
import os
from pathlib import Path

from arq.connections import RedisSettings
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
    """
    from app.services.scraper import ScraperService

    scraper = ScraperService()
    result = await asyncio.to_thread(scraper.run_scraper, email=email, password=password)
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
