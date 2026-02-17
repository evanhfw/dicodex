"""
Custom Prometheus metrics for ARQ worker monitoring.
"""
from prometheus_client import Counter, Gauge, Histogram

# Job completion counter (labels: status=success|failed)
arq_jobs_total = Counter(
    "arq_jobs_total",
    "Total ARQ jobs processed",
    ["status"],
)

# Job duration histogram
arq_job_duration_seconds = Histogram(
    "arq_job_duration_seconds",
    "Duration of ARQ job execution in seconds",
    buckets=[1, 5, 10, 30, 60, 120, 300, 600],
)

# Current queued jobs gauge
arq_jobs_queued = Gauge(
    "arq_jobs_queued",
    "Number of ARQ jobs currently queued",
)
