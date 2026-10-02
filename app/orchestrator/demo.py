"""Run the complete real LLM pipeline:
python -m app.orchestrator.demo
"""

import argparse
import asyncio
from uuid import uuid4

from app.orchestrator.models import RunRequest
from app.orchestrator.runtime import OrchestratorRuntime


async def main(prompt: str):
    runtime = OrchestratorRuntime()

    try:
        service = await runtime.get_service()

        run = await service.submit(
            RunRequest(
                user_id="local-demo",
                project_id="demo",
                prompt=prompt,
                idempotency_key=f"real-polished-{uuid4()}",
                quality="polished",
            )
        )

        result = await service.execute(run.id)

        print(result.model_dump_json(indent=2))

        if result.status.value != "completed":
            raise SystemExit(1)

    finally:
        await runtime.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--prompt",
        default=(
            "Create a modern responsive SaaS landing page for ICOGON AI "
            "with a navbar, hero section, features section, pricing section, "
            "FAQ section, and responsive mobile layout."
        ),
    )

    asyncio.run(main(parser.parse_args().prompt))