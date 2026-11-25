"""ICOGON: reduce oversized repair requests and detect missing React imports.

Usage (from Icogon.AI repository root): python fix_icogon_413_imports.py
Backs up both files, refuses unknown source structure, and is safe to rerun.
This changes backend code only; it does not edit generated websites.
"""
from __future__ import annotations

from pathlib import Path
from shutil import copy2
import re

ROOT = Path.cwd()
PROVIDER = Path('app/orchestrator/provider.py')
CONTEXT = Path('app/agents/context.py')
MARKER = 'ICOGON_SCOPED_REPAIR_V1'


def line_endings(raw: bytes) -> str:
    return '\r\n' if b'\r\n' in raw else '\n'


def patch_provider(src: str) -> str:
    if MARKER in src:
        return src
    # Conservative request budget for an account with 8,000 TPM. The previous
    # 4 chars/token estimator underestimates code-heavy JSON prompts.
    constants = {
        'GROQ_TPM_BUDGET': '6500',
        'CHARS_PER_TOKEN': '3',
        'TOKEN_SAFETY_MARGIN': '600',
    }
    for name, new_value in constants.items():
        pattern = rf'(?m)^({re.escape(name)}\s*=\s*)\d+(?:_\d+)*\s*$'
        src, count = re.subn(pattern, lambda m: m.group(1) + new_value, src, count=1)
        if count != 1:
            raise ValueError(f'Cannot locate {name}; no files modified')

    start_marker = '        if role == "repair engineer":\n'
    if src.count(start_marker) != 1:
        raise ValueError('Cannot safely identify provider repair payload block')
    start = src.index(start_marker)
    end_marker = '            return payload\n'
    stop = src.find(end_marker, start)
    if stop == -1 or stop - start > 5000:
        raise ValueError('Cannot safely identify the end of repair payload block')
    stop += len(end_marker)

    replacement = '''        if role == "repair engineer":

            # ICOGON_SCOPED_REPAIR_V1: never resend an entire generated site
            # merely to repair an import or one component. Groq TPM is a
            # per-request service constraint, not the run's token budget.
            compact_plan = self._compact_plan(context.get("plan"))
            payload["allowed_file_plan"] = [
                {"path": entry.get("path"), "action": entry.get("action")}
                for entry in compact_plan.get("file_plan", [])
                if isinstance(entry, dict)
            ]
            payload["planned_pages"] = compact_plan.get("pages", [])[:10]

            raw_feedback = context.get("feedback") or []
            if not isinstance(raw_feedback, list):
                raw_feedback = [raw_feedback]
            # Eliminate giant stack traces while retaining the actual error.
            feedback = [str(item)[:1300] for item in raw_feedback[:5]]
            payload["feedback"] = feedback
            feedback_text = "\\n".join(feedback)

            changes = _model_dump(context.get("changes"))
            if not isinstance(changes, dict):
                changes = {}
            all_files = [
                file for file in changes.get("files", [])
                if isinstance(file, dict) and isinstance(file.get("path"), str)
                and file.get("operation", "upsert") != "delete"
            ]
            paths = [file["path"] for file in all_files]
            payload["existing_file_paths"] = paths

            # Build errors usually name the importer: e.g. src/App.tsx.
            # Send full source only for the files which need repair.
            affected = [
                file for file in all_files
                if file["path"] in feedback_text
            ]
            if not affected:
                # Source-quality review can omit the precise offending path.
                preferred = ("src/App.tsx", "src/styles.css", "src/main.tsx")
                affected = [
                    file for path in preferred for file in all_files
                    if file["path"] == path
                ]
            if not affected:
                affected = all_files[:1]

            chosen = []
            total_content_chars = 0
            max_context_chars = 11000
            for file in affected[:MAX_REPAIR_FILES]:
                content = file.get("content", "")
                if not isinstance(content, str):
                    continue
                if total_content_chars + len(content) > max_context_chars:
                    # Avoid returning incomplete source and accidentally
                    # destroying a working component with a truncated rewrite.
                    if not chosen:
                        raise ProviderError(
                            "repair_context_too_large",
                            "The affected file is too large to repair safely "
                            "on the current 8,000-TPM model. Split the file "
                            "into smaller components or use a higher-TPM model.",
                            False,
                        )
                    break
                chosen.append({
                    "path": file["path"],
                    "operation": file.get("operation", "upsert"),
                    "content": content,
                })
                total_content_chars += len(content)

            payload["changes"] = {
                "summary": str(changes.get("summary", ""))[:300],
                "files": chosen,
            }
            payload["repair_instruction"] = (
                "Fix the specific reported errors, changing only necessary "
                "files provided in changes. Return COMPLETE replacement "
                "contents for each changed file. Return only planned, "
                "modifiable paths from allowed_file_plan. Every relative "
                "import must resolve to a path in existing_file_paths or "
                "to an allowed file already scheduled for creation. "
                "For a missing import outside the file plan, remove or "
                "replace that import and its usages in the importing file, "
                "rather than inventing an unplanned new path. "
                "Never fabricate missing modules or dependencies."
            )
            payload["output_contract"] = {
                "summary": "string",
                "files": [{
                    "path": "relative/path",
                    "content": "COMPLETE final file",
                    "operation": "upsert",
                }],
            }
            return payload
'''
    src = src[:start] + replacement + src[stop:]
    return src


def patch_context(src: str) -> str:
    if MARKER in src:
        return src
    anchor = '\n\n# ============================================================================\n# IMPLEMENTATION CONTRACT\n# ============================================================================\n'
    if src.count(anchor) != 1:
        raise ValueError('Implementation contract section not found; no files modified')

    helper = r'''

# ICOGON_SCOPED_REPAIR_V1: catch broken local React imports before Docker.
def _missing_relative_imports(changes: ChangeSet, context_files: list) -> list[str]:
    """Check only static relative imports; leave npm packages and aliases alone."""
    import posixpath

    sources = {
        change.path: change.content
        for change in context_files
        if change.operation == "upsert" and isinstance(change.content, str)
    }
    for change in changes.files:
        if change.operation == "delete":
            sources.pop(change.path, None)
        elif isinstance(change.content, str):
            sources[change.path] = change.content
    # Matching from/import/require avoids treating every quoted string as
    # an import. The resolver accepts extensionless and index imports.
    relative_import = re.compile(
        r"\bfrom\s*[\"'](\.{1,2}/[^\"'\n]+)[\"']"
        r"|\bimport\s*\(\s*[\"'](\.{1,2}/[^\"'\n]+)[\"']"
        r"|\bimport\s*[\"'](\.{1,2}/[^\"'\n]+)[\"']"
        r"|\brequire\s*\(\s*[\"'](\.{1,2}/[^\"'\n]+)[\"']"
    )
    extensions = (".tsx", ".ts", ".jsx", ".js", ".mjs", ".json", ".css", ".svg")
    missing: list[str] = []
    for importer, content in sources.items():
        if not importer.endswith((".tsx", ".ts", ".jsx", ".js", ".mjs")):
            continue
        for match in relative_import.finditer(content):
            specifier = next((value for value in match.groups() if value), None)
            if specifier is None:
                continue
            specifier = specifier.split("?", 1)[0].split("#", 1)[0]
            path = posixpath.normpath(posixpath.join(posixpath.dirname(importer), specifier))
            candidates = [path]
            if not posixpath.splitext(path)[1]:
                candidates += [path + ext for ext in extensions]
                candidates += [posixpath.join(path, "index" + ext) for ext in extensions]
            elif path.endswith(".js"):
                candidates += [path[:-3] + ext for ext in (".ts", ".tsx", ".jsx")]
            if not any(candidate in sources for candidate in candidates):
                message = f'Unresolved relative import "{specifier}" from "{importer}"'
                if message not in missing:
                    missing.append(message)
            if len(missing) >= 12:
                return missing
    return missing
'''
    # ChangeSet and re are imported in this module in the uploaded code.
    if 'import re' not in src or 'ChangeSet' not in src:
        raise ValueError('Required imports were not found in context.py')
    src = src.replace(anchor, helper + anchor, 1)
    old = '    return issues\n\n\n# ============================================================================\n# IMPLEMENTATION CONTEXT'
    new = ('    if require_complete:\n'
           '        issues.extend(_missing_relative_imports(changes, context_files))\n\n'
           '    return issues\n\n\n# ============================================================================\n# IMPLEMENTATION CONTEXT')
    if src.count(old) != 1:
        raise ValueError('Cannot find contract return anchor; no files modified')
    return src.replace(old, new, 1)


def main() -> None:
    files = {}
    for relative, transform in [(PROVIDER, patch_provider), (CONTEXT, patch_context)]:
        path = ROOT / relative
        if not path.is_file():
            raise SystemExit(f'Missing {relative}. Run from Icogon.AI root; no changes made.')
        raw = path.read_bytes()
        newline = line_endings(raw)
        original = raw.decode('utf-8').replace('\r\n', '\n')
        try:
            edited = transform(original)
            compile(edited, str(relative), 'exec')
        except (ValueError, SyntaxError) as exc:
            raise SystemExit(f'Patch stopped safely for {relative}: {exc}') from None
        files[path] = (raw, edited.replace('\n', newline).encode('utf-8'))

    for path, (old, new) in files.items():
        if old == new:
            print(f'Already patched: {path.relative_to(ROOT)}')
            continue
        backup = path.with_suffix(path.suffix + '.before-413-fix.bak')
        if not backup.exists():
            copy2(path, backup)
        path.write_bytes(new)
        print(f'Patched {path.relative_to(ROOT)} (backup: {backup.name})')
    print('Done. Restart worker; start a new run to use the new repair logic.')


if __name__ == '__main__':
    main()
