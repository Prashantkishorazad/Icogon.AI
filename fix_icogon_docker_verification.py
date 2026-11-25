"""Distinguish Docker infrastructure outages from application build failures.
Place in Icogon.AI repository root and run: python fix_icogon_docker_verification.py
This does NOT start Docker; run `docker desktop start` first.
"""
from pathlib import Path
from shutil import copy2
import ast

root = Path.cwd()
verifier = root / 'app/sandbox/verifier.py'
service = root / 'app/orchestrator/service.py'

for f in (verifier, service):
    if not f.is_file():
        raise SystemExit(f'Missing {f}. Run this script in Icogon.AI root.')

v_old = verifier.read_text(encoding='utf-8')
s_old = service.read_text(encoding='utf-8')
v = v_old
s = s_old

exception_decl = '''class VerificationInfrastructureError(RuntimeError):
    """Verification could not run because its infrastructure is unavailable."""
    pass


'''

if 'class VerificationInfrastructureError(' not in v:
    marker = 'class SandboxChangeVerifier:'
    if v.count(marker) != 1:
        raise SystemExit('Could not identify SandboxChangeVerifier; no files changed.')
    v = v.replace(marker, exception_decl + marker, 1)

old = '                result = await self._sandbox.execute(workspace, command, self._limits)\n                passed = result.exit_code == 0 and not result.timed_out'
new = '''                try:
                    result = await self._sandbox.execute(workspace, command, self._limits)
                except FileNotFoundError as exc:
                    raise VerificationInfrastructureError(
                        "Docker executable was not found. Check Docker Desktop installation and PATH."
                    ) from exc
                # A missing Docker daemon is not a problem in generated application code.
                output = (result.stderr + "\\n" + result.stdout).lower()
                docker_unavailable = any(marker in output for marker in (
                    "dockerdesktoplinuxengine",
                    "cannot connect to the docker daemon",
                    "failed to connect to the docker api",
                    "is the docker daemon running",
                ))
                if result.exit_code != 0 and docker_unavailable:
                    raise VerificationInfrastructureError(
                        "Docker Engine is unavailable. Start Docker Desktop, confirm "
                        "`docker info` works, then submit a new run. "
                        "Generated code was not verified."
                    )
                passed = result.exit_code == 0 and not result.timed_out'''
if 'docker_unavailable = any(marker in output' not in v:
    if v.count(old) != 1:
        raise SystemExit('Verifier structure changed; no files changed. Patch manually.')
    v = v.replace(old, new, 1)

import_stmt = 'from app.sandbox.verifier import VerificationInfrastructureError\n'
anchor = 'from app.orchestrator.ports import AgentProvider, ChangeVerifier, RunRepository\n'
if import_stmt not in s:
    if s.count(anchor) != 1:
        raise SystemExit('Service import block changed; no files changed.')
    s = s.replace(anchor, anchor + import_stmt, 1)

old = '''        except Exception as exc:
            await self._fail(
                run,
                "orchestration_error",
                str(exc),
                retryable=True,
            )'''
new = '''        except VerificationInfrastructureError as exc:
            await self._fail(
                run,
                "verification_infrastructure_unavailable",
                str(exc),
                retryable=True,
            )

''' + old
if '"verification_infrastructure_unavailable"' not in s:
    if s.count(old) != 1:
        raise SystemExit('Service error handler changed; no files changed.')
    s = s.replace(old, new, 1)

# Validate both sources before touching either file.
for path, contents in ((verifier, v), (service, s)):
    ast.parse(contents, filename=str(path))

for path, old_text, updated in ((verifier, v_old, v), (service, s_old, s)):
    if old_text == updated:
        print(f'Unchanged (already patched): {path.relative_to(root)}')
        continue
    backup = path.with_suffix('.py.bak')
    if not backup.exists():
        copy2(path, backup)
    path.write_text(updated, encoding='utf-8')
    print(f'Updated: {path.relative_to(root)} (backup: {backup.name})')
print('Done. Docker still needs to be running for actual build verification.')
