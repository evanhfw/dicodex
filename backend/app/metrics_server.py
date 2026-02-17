"""
Lightweight HTTP server to expose Prometheus metrics from the ARQ worker.

Runs on port 9101 in a background thread so it doesn't block the worker.
"""
import threading

from prometheus_client import start_http_server


def start_metrics_server(port: int = 9101) -> None:
    """Start the Prometheus metrics HTTP server in a daemon thread."""
    def _serve():
        start_http_server(port)

    thread = threading.Thread(target=_serve, daemon=True)
    thread.start()
    print(f"[metrics] Prometheus metrics server started on :{port}")
