"""Allow the React Router packages already installed by Icogon in generated previews.

Run once from the Icogon.AI repository root:
    python fix_icogon_router_preview.py

This edits ONLY the package allowlist in compile-preview.mjs; other preview
customizations (including existing CSS/Tailwind fixes) are preserved.
"""
from pathlib import Path
from shutil import copy2
import re

TARGET = Path("icogon-frontend/scripts/compile-preview.mjs")
ALLOWED = ("react-router", "react-router-dom")


def main() -> None:
    if not TARGET.is_file():
        raise SystemExit(f"Cannot find {TARGET}. Run from the Icogon.AI root folder.")
    original = TARGET.read_text(encoding="utf-8")
    expression = re.compile(r"const\s+allowedPackages\s*=\s*new\s+Set\(\s*\[(?P<items>.*?)\]\s*\);", re.S)
    matches = list(expression.finditer(original))
    if len(matches) != 1:
        raise SystemExit("Expected exactly one allowedPackages Set; no changes made.")
    match = matches[0]
    items = match.group("items")
    current = set(re.findall(r"[\"']([^\"']+)[\"']\s*,?", items))
    if not {"react", "react-dom"}.issubset(current):
        raise SystemExit("Unrecognized preview allowlist; no changes made.")
    missing = [package for package in ALLOWED if package not in current]
    if not missing:
        print(f"Already fixed: {TARGET}")
        return
    # Require the existing react-dom line, so unrelated source cannot be edited.
    anchor = re.search(r"^(?P<indent>[ \t]*)[\"']react-dom[\"']\s*,\s*$", items, re.M)
    if anchor is None:
        raise SystemExit("Cannot find the react-dom allowlist entry; no changes made.")
    newline = "\r\n" if "\r\n" in original else "\n"
    # Insert directly after the react-dom item; leave all other code unchanged.
    added = "".join(f'{newline}{anchor.group("indent")}"{package}",' for package in missing)
    new_items = items[:anchor.end()] + added + items[anchor.end():]
    patched = original[:match.start("items")] + new_items + original[match.end("items"):]
    backup = TARGET.with_name(TARGET.name + ".before_router_fix.bak")
    if not backup.exists():
        copy2(TARGET, backup)
    TARGET.write_text(patched, encoding="utf-8", newline="")
    print(f"Patched {TARGET}: enabled {', '.join(missing)}")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
