import asyncio
from pathlib import Path

from app.orchestrator.models import ChangeSet, FileChange
from app.sandbox.docker import DockerSandbox
from app.sandbox.models import ResourceLimits, SandboxCommand
from app.sandbox.verifier import SandboxChangeVerifier
from app.sandbox.runtime import build_change_verifier

verifier = build_change_verifier()


async def main():
    print("=" * 80)
    print("ICOGON AI — DOCKER BUILD SMOKE TEST")
    print("=" * 80)

    changes = ChangeSet(
        files=[
            FileChange(
                path="package.json",
                operation="upsert",
                content="""{
  "name": "icogon-docker-test",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.4.1",
    "vite": "^6.3.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {}
}""",
            ),
            FileChange(
                path="index.html",
                operation="upsert",
                content="""<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>ICOGON Docker Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>""",
            ),
            FileChange(
                path="src/main.jsx",
                operation="upsert",
                content="""import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <h1>ICOGON Docker Build Test</h1>;
}

createRoot(document.getElementById("root")).render(<App />);
""",
            ),
        ]
    )

    print("\nRunning Docker npm install + npm run build...")
    print("-" * 80)

    result = await verifier.verify(
        project_id="docker-build-smoke",
        changes=changes,
    )

    print("\n" + "=" * 80)
    print("RESULT")
    print("=" * 80)

    print(f"Passed: {result.passed}")
    print(f"Checks: {result.checks}")

    if result.feedback:
        print("\nFeedback:")
        for item in result.feedback:
            print(item)

    print("\n" + "=" * 80)

    if result.passed:
        print("DOCKER BUILD SUCCESS")
    else:
        print("DOCKER BUILD FAILED")

    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())