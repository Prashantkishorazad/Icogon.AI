from __future__ import annotations

"""
Deterministic offline provider used for orchestration tests and local
development.

Behavior:

- Fresh projects receive a small real multi-file website.
- Incremental projects modify only the files explicitly selected by
  the planner and preserve unrelated context.
- 3D projects continue using the existing scene template.
- Repair behavior remains deterministic for orchestration tests.
"""

from pathlib import PurePosixPath
from typing import Any

from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    FileChange,
    FilePlanEntry,
    GenerationPlan,
    PlanResponse,
    PlanTask,
    ProviderUsage,
    RunRequest,
    VerificationResult,
)


class MockAgentProvider:
    """
    Deterministic offline provider used for orchestration tests and
    local development.
    """

    async def create_plan(
        self,
        request: RunRequest,
        brief: Any,
        architecture: Any,
    ) -> PlanResponse:
        from app.agents.templates import scene_blueprint

        normalized_prompt = request.prompt.lower()

        three_d_keywords = (
            "3d",
            "three-dimensional",
            "three dimensional",
            "threejs",
            "three.js",
            "webgl",
            "react three fiber",
            "r3f",
        )

        signals = {
            "three_d"
            for keyword in three_d_keywords
            if keyword in normalized_prompt
        }

        three_d = "three_d" in signals

        existing = {
            file.path
            for file in request.context_files
        }

        # ============================================================
        # 3D PROJECT
        # ============================================================

        if three_d:
            generated_paths = [
                "src/main.tsx",
                "src/App.tsx",
                "src/styles.css",
                "index.html",
                "package.json",
            ]

            blueprint = scene_blueprint()

            tasks = [
                PlanTask(
                    id="task-1",
                    title="Build interactive 3D application",
                    description=request.prompt,
                    target_files=generated_paths,
                )
            ]

        # ============================================================
        # INCREMENTAL PROJECT
        # ============================================================

        elif request.context_files:
            generated_paths = [
                "index.html",
            ]

            blueprint = None

            tasks = [
                PlanTask(
                    id="task-1",
                    title="Update requested page",
                    description=request.prompt,
                    target_files=[
                        "index.html",
                    ],
                )
            ]

        # ============================================================
        # FRESH SIMPLE WEBSITE
        # ============================================================

        else:
            generated_paths = [
                "index.html",
                "styles.css",
                "script.js",
                "content.json",
                "package.json",
                "vite.config.js",
            ]

            blueprint = None

            tasks = [
                PlanTask(
                    id="task-1",
                    title="Build website structure",
                    description=(
                        "Create the responsive website structure, "
                        "navigation, content sections and footer "
                        "requested by the user."
                    ),
                    target_files=[
                        "index.html",
                        "content.json",
                        "package.json",
                    ],
                ),
                PlanTask(
                    id="task-2",
                    title="Build visual system and interactions",
                    description=(
                        "Implement responsive styling and lightweight "
                        "client-side interactions for the requested "
                        "website."
                    ),
                    target_files=[
                        "styles.css",
                        "script.js",
                        "vite.config.js",
                    ],
                    depends_on=[
                        "task-1",
                    ],
                ),
            ]

        plan = GenerationPlan(
            blueprint=blueprint,
            summary=(
                f"Create a multi-file implementation for: "
                f"{request.prompt}"
            ),
            assumptions=[
                "The project uses the existing repository conventions.",
                "Generated code must be verified before it is published.",
            ],
            tasks=tasks,
            file_plan=[
                FilePlanEntry(
                    path=path,
                    action=(
                        "modify"
                        if path in existing
                        else "create"
                    ),
                    reason=(
                        "Required by the requested application."
                    ),
                )
                for path in generated_paths
            ]
            + [
                FilePlanEntry(
                    path=path,
                    action="preserve",
                    reason="Unchanged project file.",
                )
                for path in sorted(
                    existing - set(generated_paths)
                )
            ],
        )

        return PlanResponse(
            plan=plan,
            usage=ProviderUsage(
                input_tokens=30,
                output_tokens=100,
            ),
        )

    async def generate_changes(
        self,
        request: RunRequest,
        brief: Any,
        architecture: Any,
        plan: GenerationPlan,
    ) -> ChangeResponse:
        # ============================================================
        # 3D PROJECT
        # ============================================================

        if (
            plan.blueprint
            and plan.blueprint.template == "react-three"
        ):
            from app.agents.templates import scene_snapshot

            return ChangeResponse(
                changes=scene_snapshot(),
                usage=ProviderUsage(
                    input_tokens=90,
                    output_tokens=120,
                ),
            )

        # ============================================================
        # DETERMINE WHETHER THIS IS AN INCREMENTAL PLAN
        # ============================================================
        #
        # Do NOT use request.context_files here.
        #
        # implementation_context() intentionally filters preserved
        # files before the implementation provider receives them.
        #
        # The approved plan is therefore the authoritative source for
        # deciding whether this is a modification or a fresh project.
        # ============================================================

        print("\n========== MOCK IMPLEMENTATION DEBUG ==========")
        print(
            "PROMPT:",
            request.prompt,
        )
        print(
            "CONTEXT FILES:",
            [
                file.path
                for file in request.context_files
            ],
        )
        print(
            "PLAN:",
            [
                (entry.path, entry.action)
                for entry in plan.file_plan
            ],
        )
        print("===============================================\n")

        incremental = any(
            entry.action in {
                "preserve",
                "modify",
                "delete",
                "read",
            }
            for entry in plan.file_plan
        )

        if incremental:
            changes: list[FileChange] = []

            for entry in plan.file_plan:
                if entry.action not in {"create", "modify"}:
                    continue

                if entry.path == "index.html":
                    changes.append(
                        FileChange(
                            path="index.html",
                            content=incremental_index_html_snapshot(
                                request.prompt
                            ),
                        )
                    )
                else:
                    changes.append(
                        FileChange(
                            path=entry.path,
                            content=incremental_fallback_snapshot(
                                entry.path,
                                request.prompt,
                            ),
                        )
                    )

            for entry in plan.file_plan:
                if entry.action == "delete":
                    changes.append(
                        FileChange(
                            path=entry.path,
                            content="",
                        )
                    )

            return ChangeResponse(
                changes=ChangeSet(
                    summary="Offline incremental website update.",
                    files=changes,
                ),
                usage=ProviderUsage(
                    input_tokens=0,
                    output_tokens=0,
                ),
            )

        # ============================================================
        # LEGACY INCREMENTAL
        # ============================================================

        if incremental:
            target_files = [
                entry.path
                for entry in plan.file_plan
                if entry.action in {
                    "modify",
                    "delete",
                }
            ]

            files: list[FileChange] = []

            if "index.html" in target_files:
                files.append(
                    FileChange(
                        path="index.html",
                        content=demo_html(
                            request.prompt
                        ),
                    )
                )

            # Deterministic fallback for any future incremental
            # target selected by the planner.
            for path in target_files:
                if path == "index.html":
                    continue

                files.append(
                    FileChange(
                        path=path,
                        content=(
                            f"<!-- Updated by ICOGON AI -->\n"
                            f"<!-- Request: {request.prompt} -->\n"
                        ),
                    )
                )

            return ChangeResponse(
                changes=ChangeSet(
                    summary=(
                        "Offline incremental website update."
                    ),
                    files=files,
                ),
                usage=ProviderUsage(
                    input_tokens=90,
                    output_tokens=160,
                ),
            )

        # ============================================================
        # FRESH MULTI-FILE WEBSITE
        # ============================================================

        website = simple_website_snapshot(
            request.prompt
        )

        return ChangeResponse(
            changes=website,
            usage=ProviderUsage(
                input_tokens=120,
                output_tokens=320,
            ),
        )

    async def repair_changes(
        self,
        request: RunRequest,
        brief: Any,
        architecture: Any,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse:
        repaired = changes.model_copy(
            deep=True
        )

        repaired.summary = (
            "Repair generated output after verification feedback"
        )

        writable = {
            entry.path
            for entry in plan.file_plan
            if entry.action in {
                "create",
                "modify",
            }
        }

        repaired.files = [
            file
            for file in repaired.files
            if file.path in writable
        ]

        if not repaired.files:
            repaired = (
                await self.generate_changes(
                    request,
                    brief,
                    architecture,
                    plan,
                )
            ).changes

            repaired.summary = (
                "Repair generated output after verification feedback"
            )

        # Keep the deterministic repair behavior used by the
        # orchestration tests.
        if repaired.files:
            repaired.files[0].content += (
                "\n<!-- Verification feedback addressed. -->\n"
            )

        return ChangeResponse(
            changes=repaired,
            usage=ProviderUsage(
                input_tokens=100,
                output_tokens=80,
            ),
        )


class StaticChangeVerifier:
    async def verify(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> VerificationResult:
        has_files = bool(
            changes.files
        )

        paths_are_relative = all(
            self._is_safe_project_path(
                change.path
            )
            for change in changes.files
        )

        passed = (
            has_files
            and paths_are_relative
        )

        feedback: list[str] = []

        if not has_files:
            feedback.append(
                "The change set must contain at least one file."
            )

        if not paths_are_relative:
            feedback.append(
                "All generated paths must stay inside the project workspace."
            )

        return VerificationResult(
            passed=passed,
            checks={
                "has_files": has_files,
                "safe_relative_paths": paths_are_relative,
            },
            feedback=feedback,
        )

    @staticmethod
    def _is_safe_project_path(
        path: str,
    ) -> bool:
        if (
            not path
            or "\\" in path
            or "\x00" in path
        ):
            return False

        candidate = PurePosixPath(
            path
        )

        return (
            not candidate.is_absolute()
            and candidate.parts not in {
                (),
                (".",),
            }
            and ".." not in candidate.parts
            and ":" not in candidate.parts[0]
        )


# ============================================================================
# SIMPLE WEBSITE
# ============================================================================


def simple_website_snapshot(
    prompt: str,
) -> ChangeSet:
    title = infer_site_title(
        prompt
    )

    return ChangeSet(
        summary=(
            f"Generated multi-file website for: {prompt}"
        ),
        files=[
            FileChange(
                path="index.html",
                content=f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>{title}</title>
  <link rel="stylesheet" href="./styles.css" />
</head>

<body>
  <header class="site-header">
    <a class="brand" href="#top">{title}</a>

    <nav class="nav">
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="top">
    <section id="home" class="hero">
      <div class="hero-content">
        <p class="eyebrow">Built with ICOGON AI</p>
        <h1>{title}</h1>
        <p class="hero-copy">
          A responsive website generated from your request.
        </p>

        <a
          class="button"
          href="#services"
        >
          Explore
        </a>
      </div>
    </section>

    <section id="about" class="section">
      <p class="eyebrow">About</p>
      <h2>Designed around your idea</h2>
      <p>
        This website structure was generated from the user's
        natural-language request.
      </p>
    </section>

    <section id="services" class="section">
      <p class="eyebrow">Services</p>
      <h2>What we offer</h2>

      <div class="cards">
        <article class="card">
          <h3>Modern Design</h3>
          <p>Clean responsive layouts for modern products.</p>
        </article>

        <article class="card">
          <h3>Fast Experience</h3>
          <p>Lightweight frontend structure with simple interactions.</p>
        </article>

        <article class="card">
          <h3>AI Generated</h3>
          <p>Built from a natural-language product description.</p>
        </article>
      </div>
    </section>

    <section id="contact" class="section contact">
      <p class="eyebrow">Contact</p>
      <h2>Let's build something</h2>

      <button
        class="button"
        id="contactButton"
        type="button"
      >
        Get Started
      </button>

      <p
        id="contactMessage"
        class="contact-message"
        aria-live="polite"
      ></p>
    </section>
  </main>

  <footer class="footer">
    <span>{title}</span>
    <span>Generated by ICOGON AI</span>
  </footer>

  <script src="./script.js"></script>
</body>
</html>
""",
            ),
            FileChange(
                path="styles.css",
                content="""* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #111827;
  background: #ffffff;
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 7%;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(12px);
}

.brand {
  font-weight: 800;
  letter-spacing: -0.03em;
}

.nav {
  display: flex;
  gap: 20px;
  color: #4b5563;
  font-size: 14px;
}

.nav a:hover {
  color: #111827;
}

.hero {
  min-height: 78vh;
  display: grid;
  place-items: center;
  padding: 80px 7%;
  background:
    radial-gradient(
      circle at top right,
      #dbeafe,
      transparent 45%
    ),
    linear-gradient(
      135deg,
      #ffffff,
      #f8fafc
    );
}

.hero-content {
  width: min(850px, 100%);
  text-align: center;
}

.eyebrow {
  margin: 0 0 12px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-size: clamp(48px, 9vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.07em;
}

.hero-copy {
  max-width: 620px;
  margin: 28px auto;
  color: #6b7280;
  font-size: 20px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 13px 22px;
  background: #111827;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.section {
  width: min(1100px, 86%);
  margin: 0 auto;
  padding: 100px 0;
}

.section h2 {
  margin: 0 0 20px;
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1;
  letter-spacing: -0.05em;
}

.section > p:not(.eyebrow) {
  max-width: 680px;
  color: #6b7280;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 40px;
}

.card {
  padding: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.06);
}

.card h3 {
  margin-top: 0;
}

.card p {
  margin-bottom: 0;
  color: #6b7280;
}

.contact {
  text-align: center;
}

.contact > p:not(.eyebrow) {
  margin-left: auto;
  margin-right: auto;
}

.contact-message {
  min-height: 24px;
  margin-top: 18px;
  color: #2563eb;
  font-weight: 600;
}

.footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 7%;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 760px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .nav {
    flex-wrap: wrap;
  }

  .hero {
    min-height: 70vh;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .footer {
    flex-direction: column;
  }
}
""",
            ),
            FileChange(
                path="script.js",
                content="""const contactButton =
  document.getElementById("contactButton");

const contactMessage =
  document.getElementById("contactMessage");

if (contactButton && contactMessage) {
  contactButton.addEventListener(
    "click",
    () => {
      contactMessage.textContent =
        "Thanks! Your request has been received.";
    },
  );
}
""",
            ),
            FileChange(
                path="content.json",
                content="""{
  "generatedBy": "ICOGON AI",
  "type": "simple-website",
  "sections": [
    "home",
    "about",
    "services",
    "contact"
  ]
}
""",
            ),
            FileChange(
                path="package.json",
                content="""{
  "name": "icogon-generated-site",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^6.3.5"
  }
}
""",
            ),
            FileChange(
                path="vite.config.js",
                content="""import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist"
  }
});
""",
            ),
        ],
    )


def infer_site_title(
    prompt: str,
) -> str:
    normalized = " ".join(
        prompt.strip().split()
    )

    if not normalized:
        return "ICOGON AI Website"

    words = normalized.split()

    if len(words) <= 6:
        return normalized.title()

    return " ".join(words[:6]).title()


# ============================================================================
# LEGACY INCREMENTAL DEMO
# ============================================================================


def incremental_index_html_snapshot(prompt: str) -> str:
    """Return deterministic HTML for an incremental index.html update."""
    title = infer_site_title(prompt)

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
</head>
<body>
  <main>
    <header>
      <p>Built with ICOGON AI</p>
      <h1>{title}</h1>
    </header>
    <section>
      <h2>Updated Website</h2>
      <p>{prompt}</p>
    </section>
    <footer>
      <p>Generated by ICOGON AI</p>
    </footer>
  </main>
</body>
</html>
"""


def incremental_fallback_snapshot(
    path: str,
    prompt: str,
) -> str:
    """Return deterministic content for non-index incremental files."""
    suffix = PurePosixPath(path).suffix.lower()

    if suffix == ".css":
        return f"""/* Updated by ICOGON AI */
/* Request: {prompt} */

:root {{
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}}

body {{
  margin: 0;
  min-height: 100vh;
}}
"""

    if suffix in {".js", ".mjs", ".cjs"}:
        return f"""// Updated by ICOGON AI
// Request: {prompt}

console.log("ICOGON AI incremental update: {path}");
"""

    if suffix == ".json":
        import json

        return json.dumps(
            {
                "generatedBy": "ICOGON AI",
                "updatedFile": path,
                "request": prompt,
            },
            indent=2,
        ) + "\n"

    if suffix in {".tsx", ".jsx"}:
        component_name = (
            PurePosixPath(path)
            .stem
            .replace("-", " ")
            .replace("_", " ")
            .title()
            .replace(" ", "")
        ) or "GeneratedComponent"

        return f"""import React from "react";

export default function {component_name}() {{
  return (
    <main>
      <h1>ICOGON AI</h1>
      <p>{prompt}</p>
    </main>
  );
}}
"""

    if suffix in {".ts", ".py"}:
        return (
            f"# Updated by ICOGON AI\n"
            f"# Request: {prompt}\n"
            f"# File: {path}\n"
        )

    return (
        f"<!-- Updated by ICOGON AI -->\n"
        f"<!-- Request: {prompt} -->\n"
    )


def demo_html(
    prompt: str,
) -> str:
    escaped = (
        prompt
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>ICOGON AI Demo</title>
</head>
<body>
  <main>
    <h1>ICOGON AI</h1>
    <p>Generated from your request:</p>
    <p>{escaped}</p>
  </main>
</body>
</html>
"""