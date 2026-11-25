"""Repair Icogon's existing-file plan mismatch and Windows preview subprocess handling.

Save in Icogon.AI/ and run: python fix_icogon_planner_preview.py
Only edits two backend files after verifying expected anchors; writes .icogon-backup files.
"""
from __future__ import annotations

import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SERVICE = ROOT / "app/orchestrator/service.py"
PREVIEW = ROOT / "app/sandbox/preview.py"


def patch_service(source: str) -> str:
    marker = "# ICOGON FIX: reconcile existing project files before validation."
    if marker in source:
        return source
    anchor = "            run.plan = response.plan\n\n            validate_file_plan("
    if source.count(anchor) != 1:
        raise RuntimeError("service.py planning-step anchor changed; refusing to overwrite it")
    replacement = '''            run.plan = response.plan

            # ICOGON FIX: reconcile existing project files before validation.
            # The LLM frequently marks existing React entry files (index.html,
            # src/App.tsx, etc.) as 'create' when editing a previous run.
            # Keep all path and protected-file validation in place.
            existing_paths = {
                file.path
                for file in request.context_files
                if file.operation == "upsert"
            }
            for entry in run.plan.file_plan:
                if entry.path in ALWAYS_PRESERVE:
                    continue  # Never automatically change protected files.
                if entry.action == "create" and entry.path in existing_paths:
                    entry.action = "modify"
                    entry.create = False
                    entry.modify = True
                elif entry.action == "modify" and entry.path not in existing_paths:
                    entry.action = "create"
                    entry.modify = False
                    entry.create = True

            validate_file_plan('''
    return source.replace(anchor, replacement, 1)


def patch_preview(source: str) -> str:
    marker = "# ICOGON FIX: threaded subprocess works on Windows selector event loops."
    if marker in source:
        return source
    if "import subprocess\n" not in source:
        if source.count("import shutil\n") != 1:
            raise RuntimeError("preview.py import anchor changed; refusing to overwrite it")
        source = source.replace("import shutil\n", "import shutil\nimport subprocess\n", 1)
    start_needle = "        process = await asyncio.create_subprocess_exec(\n"
    end_needle = "        try:\n            result = json.loads(stdout)\n"
    if source.count(start_needle) != 1 or source.count(end_needle) != 1:
        raise RuntimeError("preview.py subprocess anchor changed; refusing to overwrite it")
    start = source.index(start_needle)
    end = source.index(end_needle, start)
    old_block = source[start:end]
    if "await asyncio.wait_for(process.communicate(payload), timeout=20)" not in old_block:
        raise RuntimeError("preview.py subprocess logic changed; refusing to overwrite it")
    new_block = '''        # ICOGON FIX: threaded subprocess works on Windows selector event loops.
        # Uvicorn --reload can run an event loop that cannot spawn async processes.
        # subprocess.run also enforces a hard timeout and cleans up the child.
        try:
            completed = await asyncio.to_thread(
                subprocess.run,
                [node, "--max-old-space-size=256", str(COMPILER)],
                input=payload,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=environment,
                timeout=20,
                check=False,
            )
        except subprocess.TimeoutExpired:
            raise PreviewError(
                "Preview compilation was interrupted or exceeded 20 seconds"
            ) from None
        except OSError as exc:
            raise PreviewError(f"Preview compiler could not start: {exc}") from None

        stdout = completed.stdout
'''
    source = source[:start] + new_block + source[end:]
    if source.count('if process.returncode or "errors" in result:') != 1:
        raise RuntimeError("preview.py process status anchor changed; refusing to overwrite it")
    source = source.replace('if process.returncode or "errors" in result:', 'if completed.returncode or "errors" in result:', 1)
    return source


def main() -> None:
    if not SERVICE.is_file() or not PREVIEW.is_file():
        raise SystemExit("Run from the Icogon.AI repository root (missing app/ files).")

    originals = {SERVICE: SERVICE.read_text(encoding="utf-8"), PREVIEW: PREVIEW.read_text(encoding="utf-8")}
    try:
        updated = {SERVICE: patch_service(originals[SERVICE]), PREVIEW: patch_preview(originals[PREVIEW])}
        for path, source in updated.items():
            ast.parse(source, filename=str(path))
        # Check everything before changing anything. Do not clobber backups.
        for path, source in updated.items():
            if source != originals[path]:
                backup = path.with_name(path.name + ".icogon-backup")
                if backup.exists():
                    raise RuntimeError(f"Backup already exists: {backup}. Move it before reapplying.")
        for path, source in updated.items():
            if source == originals[path]:
                print(f"Already patched: {path.relative_to(ROOT)}")
                continue
            backup = path.with_name(path.name + ".icogon-backup")
            backup.write_text(originals[path], encoding="utf-8")
            path.write_text(source, encoding="utf-8")
            print(f"Patched: {path.relative_to(ROOT)} (backup: {backup.name})")
    except Exception as exc:
        raise SystemExit(f"No additional changes applied: {exc}") from None

    print("Done. Restart FastAPI and the orchestrator worker, then start a NEW run.")


if __name__ == "__main__":
    main()
