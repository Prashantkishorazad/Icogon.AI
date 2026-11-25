"""Improve Icogon generation/review of styled, usable web apps.

Run from Icogon.AI repository root:
    python fix_icogon_visual_quality.py

Only changes known prompt sections and the new-run quality setting.
Backs up originals and refuses to overwrite unrecognized local code.
"""
from pathlib import Path
from shutil import copy2

ROOT = Path.cwd()
MARKER = "ICOGON_VISUAL_QUALITY_V1"


def edit_file(relative: str, replacements: list[tuple[str, str]]) -> tuple[Path, bytes, bytes, bool]:
    path = ROOT / relative
    if not path.is_file():
        raise SystemExit(f"Missing {relative}; run from Icogon.AI root. No changes made.")
    before = path.read_bytes()
    text = before.decode("utf-8")
    newline = "\r\n" if b"\r\n" in before else "\n"
    normalized = text.replace("\r\n", "\n")
    if MARKER in normalized:
        return path, before, before, True
    for old, new in replacements:
        count = normalized.count(old)
        if count != 1:
            raise SystemExit(
                f"Expected one matching section in {relative}; found {count}. "
                "Your local code differs. No changes made."
            )
        normalized = normalized.replace(old, new, 1)
    after = normalized.replace("\n", newline).encode("utf-8")
    return path, before, after, False


DESIGN = "app/agents/design.py"
PROVIDER = "app/orchestrator/provider.py"
WORKSPACE = "icogon-frontend/src/pages/Builder/BuilderWorkspacePage.tsx"

changes = [
    edit_file(DESIGN, [
        (
            "unlabelled placeholder integrations. Provide meaningful content and honest limitations.\n",
            "unlabelled placeholder integrations. Provide meaningful content and honest limitations.\n"
            "\n"
            "ICOGON_VISUAL_QUALITY_V1: Every screen must look and function like the requested product,\n"
            "not merely compile. Navigation must have deliberate CSS for the header, links, buttons,\n"
            "mobile menu, main layout and footer. For dashboards, create real information-dense\n"
            "views with a metric overview, useful populated tables/lists, filters/search and\n"
            "functional management actions appropriate to the prompt. Use clearly labelled demo\n"
            "data where real integrations are unavailable, never claim real live metrics.\n"
            "CSS must actually be imported by the React entry or its app module, and component\n"
            "class names must correspond to CSS selectors. Keep a cohesive palette, spacing,\n"
            "typography, hover and focus states, mobile/tablet breakpoints and sufficient contrast.\n"
            "A title with a welcome paragraph and plain navigation is NOT a completed dashboard.\n",
        ),
    ]),
    edit_file(PROVIDER, [
        (
            '"Build polished responsive desktop, tablet and mobile layouts.\\n"',
            '"Build polished responsive desktop, tablet and mobile layouts.\\n"\n'
            '            "ICOGON_VISUAL_QUALITY_V1: Build the actual screens, not a header plus introductory paragraph.\\n"\n'
            '            "For dashboards include a substantive metrics overview, searchable/filterable operational data, appropriate management interactions and responsive navigation.\\n"\n'
            '            "Style ALL visible elements, including header, navigation links, sidebar, hamburger, buttons, content cards, tables and footer. Browser-default blue links or unstyled buttons are unacceptable.\\n"\n'
            '            "Ensure src/styles.css has substantive selectors matching the generated components and is imported from src/main.tsx or src/App.tsx.\\n"\n'
            '            "Use coherent CSS variables and responsive breakpoints. If data is not integrated, show honest, labelled sample data with working local-state interactions.\\n"',
        ),
        (
            '"Do not claim that build or typecheck was executed.\\n"',
            '"Do not claim that build or typecheck was executed.\\n"\n'
            '                "ICOGON_VISUAL_QUALITY_V1: Compare implementation source against the blueprint pages, interactions, and requested functionality.\\n"\n'
            '                "A dashboard containing only navigation, a title and welcome copy is incomplete: return approved=false and a blocking finding with a specific repair instruction.\\n"\n'
            '                "Flag obviously unstyled navigation, missing stylesheet imports, CSS selectors missing for important UI elements, and requested feature areas missing from the UI.\\n"\n'
            '                "Judge only defects evident from supplied source; never pretend a visual browser test was performed.\\n"',
        ),
        (
            '"Check concrete defects only. "\n                "Do not claim tests were run. "',
            '"Check concrete defects only, including missing feature views, empty dashboards, unstyled controls and missing stylesheet imports. "\n'
            '                "Do not claim tests were run. "',
        ),
    ]),
    edit_file(WORKSPACE, [
        (
            'quality: "balanced",',
            'quality: "polished", /* ICOGON_VISUAL_QUALITY_V1: enable source quality review for new runs */',
        ),
    ]),
]

for path, before, after, already in changes:
    if already:
        print(f"Already patched: {path.relative_to(ROOT)}")
        continue
    backup = path.with_name(path.name + ".visual-quality.bak")
    if not backup.exists():
        copy2(path, backup)
    path.write_bytes(after)
    print(f"Patched: {path.relative_to(ROOT)} (backup: {backup.name})")
print("Complete. Restart the worker and frontend; start a NEW polished run to test.")
