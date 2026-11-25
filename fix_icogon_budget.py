"""Safely increase default Icogon run budget without replacing modified source files.
Run from repository root: python fix_icogon_budget.py
"""
from pathlib import Path
import re
from shutil import copy2

path = Path('app/orchestrator/models.py')
if not path.is_file():
    raise SystemExit(f'Cannot find {path}; run from Icogon.AI repository root')
source = path.read_text(encoding='utf-8')
start = source.find('class RunBudget(BaseModel):')
end = source.find('\nclass RunRequest(BaseModel):', start)
if start < 0 or end < 0:
    raise SystemExit('RunBudget or RunRequest section not found. No changes made.')
section = source[start:end]
changes = [('max_model_calls', 12), ('max_output_tokens', 100_000)]
for name, target in changes:
    pattern = rf'({name}:\s*int\s*=\s*Field\(\s*default\s*=\s*)[\d_,]+'
    section, count = re.subn(pattern, lambda m: m.group(1) + f'{target:,}'.replace(',', '_'), section, count=1)
    if count != 1:
        raise SystemExit(f'Could not locate exactly one {name} default. No changes made.')
updated = source[:start] + section + source[end:]
backup = path.with_suffix('.py.bak')
copy2(path, backup)
path.write_text(updated, encoding='utf-8')
frontend = Path('icogon-frontend/src/api/builderApi.ts')
if not frontend.is_file():
    print(f'WARNING: {frontend} missing; frontend may still send the 20,000-token limit')
else:
    text = frontend.read_text(encoding='utf-8')
    old = 'max_model_calls: 6,\n              max_repair_attempts: 2,\n              max_output_tokens: 20000,'
    new = 'max_model_calls: 12,\n              max_repair_attempts: 2,\n              max_output_tokens: 100000,'
    if old not in text:
        raise SystemExit('Frontend budget block was not found. Check it manually.')
    copy2(frontend, frontend.with_suffix('.ts.bak'))
    frontend.write_text(text.replace(old, new, 1), encoding='utf-8')
    print(f'Patched {frontend}: max_model_calls=12, max_output_tokens=100000')
print(f'Patched {path}: max_model_calls=12, max_output_tokens=100_000')
print(f'Backup saved to {backup}')
    