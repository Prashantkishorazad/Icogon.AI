"""Fix a poll-timeout crash and widen the worker lease for slow verification.

Run from Icogon.AI root:  python fix_icogon_worker_lease.py
This does NOT remove lease ownership checks or suppress verification errors.
"""
from __future__ import annotations

import ast
import re
from pathlib import Path
from shutil import copy2

ROOT = Path.cwd()
WORKER = ROOT / "app/orchestrator/worker.py"
ENV = ROOT / ".env"
LEASE_SECONDS = 600

if not WORKER.is_file():
    raise SystemExit("Run this script from the Icogon.AI repository root; worker.py was not found.")
if not ENV.is_file():
    raise SystemExit(".env was not found. No files changed. Set ORCHESTRATOR_LEASE_SECONDS manually.")

original_worker = WORKER.read_text(encoding="utf-8")
original_env = ENV.read_text(encoding="utf-8")
tree = ast.parse(original_worker)
method = next((n for n in ast.walk(tree)
               if isinstance(n, ast.AsyncFunctionDef) and n.name == "_sleep_or_stop"), None)
if method is None:
    raise SystemExit("_sleep_or_stop() was not found; local worker differs from the traceback. No files changed.")
method_end_lineno = method.end_lineno
if method_end_lineno is None:
    raise SystemExit("Could not determine the end of _sleep_or_stop(). No files changed.")

lines = original_worker.splitlines(keepends=True)
function_lines = lines[method.lineno - 1 : method_end_lineno]
function_text = "".join(function_lines)

if re.search(r"except\s+(?:asyncio\.)?TimeoutError\b", function_text):
    updated_worker = original_worker
    worker_message = "Polling timeout is already explicitly handled; no worker.py changes."
else:
    line_pattern = re.compile(r"^(?P<indent>[ \t]*)await asyncio\.wait_for\(stop\.wait\(\),\s*timeout=seconds\)\s*$")
    matches = []
    for idx in range(method.lineno - 1, method_end_lineno):
        match = line_pattern.match(lines[idx].rstrip("\r\n"))
        if match:
            matches.append((idx, match.group("indent")))
    if len(matches) != 1:
        raise SystemExit("Could not safely identify one wait_for(stop.wait()) line. No files changed.")
    line_idx, indentation = matches[0]
    newline = "\r\n" if "\r\n" in original_worker else "\n"
    replacement = (
        f"{indentation}try:{newline}"
        f"{indentation}    await asyncio.wait_for(stop.wait(), timeout=seconds){newline}"
        f"{indentation}except asyncio.TimeoutError:{newline}"
        f"{indentation}    return{newline}"
    )
    lines[line_idx] = replacement
    updated_worker = "".join(lines)
    compile(updated_worker, str(WORKER), "exec")
    worker_message = "Patched worker.py: normal polling timeout no longer kills the worker."

# Replace only this known nonsecret config field; preserve all other .env lines.
key_pattern = re.compile(r"(?m)^[ \t]*ORCHESTRATOR_LEASE_SECONDS[ \t]*=[ \t]*([^\r\n#]*)[^\r\n]*$")
found = list(key_pattern.finditer(original_env))
if len(found) > 1:
    raise SystemExit("Duplicate lease settings in .env. No files changed; resolve duplicates first.")
if not found:
    sep = "\r\n" if "\r\n" in original_env else "\n"
    updated_env = original_env.rstrip("\r\n") + sep + f"ORCHESTRATOR_LEASE_SECONDS={LEASE_SECONDS}" + sep
    env_message = f"Added ORCHESTRATOR_LEASE_SECONDS={LEASE_SECONDS} to .env."
else:
    raw_value = found[0].group(1).strip().strip('"\'')
    try:
        current = int(raw_value)
    except ValueError:
        raise SystemExit("Noninteger lease setting found in .env. No files changed.")
    if current >= LEASE_SECONDS:
        updated_env = original_env
        env_message = f"Existing lease ({current}s) already meets the minimum; .env unchanged."
    else:
        updated_env = key_pattern.sub(f"ORCHESTRATOR_LEASE_SECONDS={LEASE_SECONDS}", original_env, count=1)
        env_message = f"Changed ORCHESTRATOR_LEASE_SECONDS from {current} to {LEASE_SECONDS}."

for path, before, after in ((WORKER, original_worker, updated_worker), (ENV, original_env, updated_env)):
    if before != after:
        copy2(path, path.with_name(path.name + ".bak"))
        path.write_text(after, encoding="utf-8")

print(worker_message)
print(env_message)
print("Backups: <file>.bak for each changed file.")
print("Restart the worker. An existing shell environment variable overrides the .env value.")
print("IMPORTANT: This increases lease tolerance; it does not fix a crashed heartbeat.")
