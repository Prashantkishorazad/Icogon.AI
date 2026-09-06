"""Small, versioned design playbooks supplied to the planner, not keyword-only output."""

import re

PLAYBOOKS = {
    "website": "Conversion-led editorial website: strong positioning, deliberate typography, varied section rhythm, clear navigation and a working primary CTA. Avoid generic card grids, invented testimonials and fake customer metrics.",
    "portfolio": "Work-led portfolio: distinctive art direction, project case studies, accessible project navigation and a working contact interaction. Use specific sample content labelled as sample, never invented professional credentials.",
    "dashboard": "Task-focused product UI: useful data hierarchy, filters, search, sortable lists, clear empty/error/loading states and working create/edit flows. Prefer density and clarity over decoration.",
    "commerce": "Product browsing with categories, search, variant selection, cart quantity/remove and totals. Checkout is explicitly a demo until a server payment integration exists; never fake a successful charge.",
    "game": "Playable browser game: explicit controls, deterministic rules, score, restart, pause and touch/keyboard support. Separate simulation from rendering, cap frame delta and avoid external assets.",
    "three_d": "A purposeful Three.js scene integrated into a real website: procedural geometry, lighting and camera composition; visible controls and accessible DOM alternatives. Cap pixel ratio at 1.5, resize via ResizeObserver, respect reduced motion, dispose GPU resources, cancel animation frames on cleanup and show a usable fallback when WebGL is unavailable.",
    "fullstack": "Browser frontend plus clearly documented API/data contracts. Implement local in-memory interactions for preview. List required backend endpoints, auth and environment setup; do not imply a database/payment/auth backend is connected.",
}


def design_context(prompt: str, files=()) -> dict:
    text = prompt.lower()
    rules = [
        ("three_d", r"\b(3d|three\.?js|webgl|three-dimensional)\b"),
        ("game", r"\b(game|platformer|puzzle|arcade)\b"),
        ("commerce", r"\b(shop|store|ecommerce|e-commerce|cart)\b"),
        ("dashboard", r"\b(dashboard|saas|crm|admin|analytics|task board)\b"),
        ("portfolio", r"\b(portfolio|photographer|case studies)\b"),
        ("fullstack", r"\b(fullstack|full-stack|backend|database|authentication)\b"),
    ]
    matches = [name for name, pattern in rules if re.search(pattern, text)] or [
        "website"
    ]
    if (
        any(re.search(r"from\s+['\"]three(?:/|['\"])", f.content) for f in files)
        and "three_d" not in matches
    ):
        matches.append("three_d")
    paths = {f.path for f in files}
    if any(p.endswith((".tsx", ".jsx")) for p in paths):
        template = "react-three" if "three_d" in matches else "react"
    elif paths:
        template = "preserve-existing"
    else:
        template = "react-three" if "three_d" in matches else "react"
    return {
        "suggested_template": template,
        "project_signals": matches,
        "playbooks": [PLAYBOOKS[name] for name in matches],
        "instruction": "These are routing hints, not a substitute for understanding the prompt. Choose and explain the actual project type, design and scope in the blueprint.",
    }


DESIGN_SYSTEM_PROMPT = """
Create a coherent product, not a generic template. First decide audience, user goal,
information architecture and a specific visual direction. The blueprint must name
palette, typography, spacing, layout, motion and real user interactions. Carry it
through every file. Use CSS variables, responsive layouts, visible focus styles,
semantic HTML and readable contrast. No fake metrics, lorem ipsum, dead buttons or
unlabelled placeholder integrations. Provide meaningful content and honest limitations.

Runtime contract: select html, react or react-three. For new React projects emit
src/main.tsx (createRoot on #root), src/App.tsx, src/styles.css, index.html with
a root div and module script pointing at /src/main.tsx, and package.json with
Vite dev/build scripts plus declared dependencies so the export runs locally.
Use relative file imports, plain CSS and React JSX. Available packages are react,
react-dom, three and lucide-react. No CDN imports, remote assets, Tailwind compiler,
dynamic package installs, Node builtins, runtime require(), eval or external services.
For 3D use Three.js from a React effect with cleanup; import addons from
three/addons/. Use procedural assets so the preview works without network access.
Include a DOM fallback and controls, not just an empty canvas. Native/mobile/server
requests may produce a browser prototype plus contracts; state that scope explicitly.
Preserve existing conventions and files for follow-up edits. Return complete source
snapshots, not diffs. Never claim a build, browser test or deployment ran.
"""
