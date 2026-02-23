"""
Custom ARQ worker entrypoint.

Python 3.12+ removed implicit event loop creation in asyncio.get_event_loop().
ARQ's Worker.__init__ calls get_event_loop() which fails without a running loop.
This script creates one explicitly before starting the ARQ worker.
"""
import asyncio

# Create event loop before ARQ tries to get it
try:
    asyncio.get_event_loop()
except RuntimeError:
    asyncio.set_event_loop(asyncio.new_event_loop())

from arq.worker import run_worker  # noqa: E402
from app.worker import WorkerSettings  # noqa: E402

if __name__ == "__main__":
    run_worker(WorkerSettings)
