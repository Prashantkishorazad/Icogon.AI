from __future__ import annotations

import asyncio
import logging
import os
import socket
from uuid import uuid4

from app.orchestrator.runtime import runtime

logger = logging.getLogger("icogon.orchestrator.worker")


async def run_worker() -> None:
    if runtime.inline_execution_enabled:
        raise RuntimeError("Dedicated workers require ORCHESTRATOR_BACKEND=postgres")

    service = await runtime.get_service()
    worker_id = os.getenv("ORCHESTRATOR_WORKER_ID", "").strip()
    if not worker_id:
        worker_id = f"{socket.gethostname()}-{uuid4()}"
    poll_interval = max(
        0.1,
        float(os.getenv("ORCHESTRATOR_POLL_INTERVAL_SECONDS", "1")),
    )
    lease_seconds = max(
        5,
        int(os.getenv("ORCHESTRATOR_LEASE_SECONDS", "30")),
    )

    logger.info("orchestrator worker started", extra={"worker_id": worker_id})
    failure_delay = poll_interval
    try:
        while True:
            try:
                run = await service.process_next(worker_id, lease_seconds)
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception(
                    "orchestrator worker iteration failed",
                    extra={"worker_id": worker_id},
                )
                await asyncio.sleep(failure_delay)
                failure_delay = min(30.0, failure_delay * 2)
                continue

            failure_delay = poll_interval
            if run is None:
                await asyncio.sleep(poll_interval)
            else:
                logger.info(
                    "orchestrator run processed",
                    extra={
                        "worker_id": worker_id,
                        "run_id": run.id,
                        "status": run.status.value,
                    },
                )
    finally:
        await runtime.close()


def main() -> None:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
