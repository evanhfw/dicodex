import shutil
import asyncio
import os
import time
from datetime import datetime, timedelta

import httpx
import psutil
from app.metrics import arq_jobs_total


class DiscordMonitor:
    def __init__(self, app_state):
        self.app_state = app_state
        self.monitor_webhook_url = os.getenv("DISCORD_MONITOR_WEBHOOK_URL")
        self.alert_webhook_url = os.getenv("DISCORD_ALERT_WEBHOOK_URL")
        self.interval = int(os.getenv("MONITOR_INTERVAL", "60"))
        
        # Tracking for rates
        self._last_check_time = time.monotonic()
        self._last_job_count_success = 0
        self._last_job_count_failed = 0
        
        # Initialize job counts
        self._update_job_counts()

    def _update_job_counts(self):
        """Update internal counters from Prometheus metrics."""
        # Note: prometheus_client Counter values are essentially stateless for us here, 
        # we need to access the underlying value.
        # This is a bit of a hack to get current value from the metric object directly
        # assuming arq_jobs_total is a Counter.
        try:
            self._last_job_count_success = arq_jobs_total.labels(status="success")._value.get()
            self._last_job_count_failed = arq_jobs_total.labels(status="failed")._value.get()
        except Exception:
            # Metrics might not be initialized yet
            self._last_job_count_success = 0
            self._last_job_count_failed = 0

    async def start(self):
        """Start the monitoring loop."""
        if not self.monitor_webhook_url:
            print("WARNING: DISCORD_MONITOR_WEBHOOK_URL not set. Monitoring disabled.")
            return

        print(f"Starting Discord monitoring (interval={self.interval}s)...")
        while True:
            try:
                await asyncio.sleep(self.interval)
                await self.send_report()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                # import traceback
                # traceback.print_exc()

    async def collect_stats(self):
        """Collect system and application metrics."""
        # System Stats
        cpu_percent = psutil.cpu_percent()
        mem = psutil.virtual_memory()
        mem_used_mb = mem.used / (1024 * 1024)
        mem_total_gb = mem.total / (1024 * 1024 * 1024)
        mem_percent = mem.percent

        # Disk Usage (output volume)
        try:
            disk = shutil.disk_usage("/app/output")
            disk_free_gb = disk.free / (1024 * 1024 * 1024)
            disk_total_gb = disk.total / (1024 * 1024 * 1024)
            disk_percent = (disk.used / disk.total) * 100
        except Exception:
            disk_free_gb = 0
            disk_total_gb = 0
            disk_percent = 0

        # Uptime
        start_time = getattr(self.app_state, "start_time", time.time())
        uptime_seconds = int(time.time() - start_time)
        uptime_str = str(timedelta(seconds=uptime_seconds))

        # Queue Stats
        pool = getattr(self.app_state, "arq_pool", None)
        queue_queued = 0
        queue_deferred = 0
        redis_status = "Not Initialized"
        
        if pool:
            try:
                # Check Redis connection
                await pool.ping()
                redis_status = "Connected"
                
                # Get Queue Counts
                # Default arq keys: arq:queue (List), arq:deferred (ZSet)
                queue_queued = await pool.llen("arq:queue")
                queue_deferred = await pool.zcard("arq:deferred")
                
            except Exception:
                redis_status = "Disconnected"

        # Worker Performance (Rates)
        current_time = time.monotonic()
        time_delta = current_time - self._last_check_time
        
        # Get current values
        try:
            current_success = arq_jobs_total.labels(status="success")._value.get()
            current_failed = arq_jobs_total.labels(status="failed")._value.get()
        except:
             current_success = 0
             current_failed = 0
        
        # Calculate delta
        delta_success = current_success - self._last_job_count_success
        delta_failed = current_failed - self._last_job_count_failed
        
        # Fix possible negative deltas if metrics reset (restart)
        if delta_success < 0: delta_success = current_success
        if delta_failed < 0: delta_failed = current_failed

        # Throughput (jobs per minute)
        throughput = 0
        if time_delta > 0:
             throughput = (delta_success + delta_failed) * (60 / time_delta)
             
        error_rate = 0
        total_delta = delta_success + delta_failed
        if total_delta > 0:
            error_rate = (delta_failed / total_delta) * 100

        # Update tracking
        self._last_check_time = current_time
        self._last_job_count_success = current_success
        self._last_job_count_failed = current_failed

        return {
            "cpu": cpu_percent,
            "mem_used": int(mem_used_mb),
            "mem_total": f"{mem_total_gb:.1f}",
            "mem_percent": mem_percent,
            "disk_free": f"{disk_free_gb:.1f}",
            "disk_total": f"{disk_total_gb:.1f}",
            "disk_percent": int(disk_percent),
            "uptime": uptime_str,
            "throughput": int(throughput),
            "latency": "N/A", 
            "errors": int(delta_failed),
            "error_rate": f"{error_rate:.1f}",
            "queue_queued": queue_queued,
            "queue_deferred": queue_deferred,
            "redis": redis_status
        }

    async def send_report(self):
        """Construct and send the periodic report."""
        stats = await self.collect_stats()
        
        # Determine Status Color
        color = 0x57F287 # Green
        try:
            if float(stats["error_rate"]) > 10:
                color = 0xED4245 # Red
            elif stats["cpu"] > 80 or stats["mem_percent"] > 90 or stats["disk_percent"] > 90:
                color = 0xFEE75C # Yellow
        except:
            pass
          
        
        embed = {
            "title": "📊 Student Dashboard Monitor",
            "color": color,
            "fields": [
                {
                    "name": "System Status",
                    "value": (
                        f"• CPU: {stats['cpu']}%\n"
                        f"• RAM: {stats['mem_used']}MB/{stats['mem_total']}GB ({stats['mem_percent']}%)\n"
                        f"• Disk: {stats['disk_free']}GB free of {stats['disk_total']}GB\n"
                        f"• Uptime: {stats['uptime']}"
                    ),
                    "inline": False
                },
                {
                    "name": f"Worker Performance (Last {self.interval}s)",
                    "value": (
                        f"• Throughput: {stats['throughput']} jobs/min\n"
                        f"• Error Rate: {stats['error_rate']}% ({stats['errors']} errors)"
                    ),
                    "inline": False
                },
                 {
                    "name": "Queue Health",
                    "value": (
                        f"• Redis: {stats['redis']}\n"
                        f"• Queued: {stats['queue_queued']}\n"
                        f"• Deferred: {stats['queue_deferred']}"
                    ),
                    "inline": False
                }
            ],
            "footer": {"text": f"Status: {'🟢 Healthy' if color == 0x57F287 else '⚠️ Issues Detected'}"} 
        }

        async with httpx.AsyncClient() as client:
            try:
                await client.post(self.monitor_webhook_url, json={"embeds": [embed], "username": "Dashboard Monitor"})
            except Exception as e:
                print(f"Failed to send Discord monitoring report: {e}")

    async def send_alert(self, title: str, details: dict):
        """Send an alert to the critical webhook."""
        if not self.alert_webhook_url:
            print("WARNING: DISCORD_ALERT_WEBHOOK_URL not set. Alerting disabled.")
            return

        embed = {
            "title": f"🚨 {title}",
            "color": 0xED4245, # Red
            "fields": [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for k, v in details.items():
            embed["fields"].append({"name": k, "value": str(v), "inline": False})
        
        async with httpx.AsyncClient() as client:
             try:
                await client.post(self.alert_webhook_url, json={"embeds": [embed], "username": "Dashboard Alert"})
             except Exception as e:
                print(f"Failed to send Discord alert: {e}")
