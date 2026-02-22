import shutil
import asyncio
import os
import time
from datetime import datetime, timedelta

import httpx
import psutil


class DiscordMonitor:
    def __init__(self, app_state):
        self.app_state = app_state
        self.monitor_webhook_url = os.getenv("DISCORD_MONITOR_WEBHOOK_URL")
        self.alert_webhook_url = os.getenv("DISCORD_ALERT_WEBHOOK_URL")
        self.interval = int(os.getenv("MONITOR_INTERVAL", "60"))

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

    async def collect_stats(self):
        """Collect system metrics: CPU, RAM, Disk, Uptime."""
        cpu_percent = psutil.cpu_percent()
        mem = psutil.virtual_memory()
        mem_used_mb = mem.used / (1024 * 1024)
        mem_total_gb = mem.total / (1024 * 1024 * 1024)
        mem_percent = mem.percent

        try:
            disk = shutil.disk_usage("/app/output")
            disk_free_gb = disk.free / (1024 * 1024 * 1024)
            disk_total_gb = disk.total / (1024 * 1024 * 1024)
            disk_percent = (disk.used / disk.total) * 100
        except Exception:
            disk_free_gb = 0
            disk_total_gb = 0
            disk_percent = 0

        start_time = getattr(self.app_state, "start_time", time.time())
        uptime_seconds = int(time.time() - start_time)
        uptime_str = str(timedelta(seconds=uptime_seconds))

        return {
            "cpu": cpu_percent,
            "mem_used": int(mem_used_mb),
            "mem_total": f"{mem_total_gb:.1f}",
            "mem_percent": mem_percent,
            "disk_free": f"{disk_free_gb:.1f}",
            "disk_total": f"{disk_total_gb:.1f}",
            "disk_percent": int(disk_percent),
            "uptime": uptime_str,
        }

    async def send_report(self):
        """Construct and send the periodic report."""
        stats = await self.collect_stats()

        color = 0x57F287  # Green
        if stats["cpu"] > 80 or stats["mem_percent"] > 90 or stats["disk_percent"] > 90:
            color = 0xFEE75C  # Yellow

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
                    "inline": False,
                },
            ],
            "footer": {"text": f"Status: {'🟢 Healthy' if color == 0x57F287 else '⚠️ Issues Detected'}"},
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
            "color": 0xED4245,
            "fields": [],
            "timestamp": datetime.utcnow().isoformat(),
        }

        for k, v in details.items():
            embed["fields"].append({"name": k, "value": str(v), "inline": False})

        async with httpx.AsyncClient() as client:
            try:
                await client.post(self.alert_webhook_url, json={"embeds": [embed], "username": "Dashboard Alert"})
            except Exception as e:
                print(f"Failed to send Discord alert: {e}")
