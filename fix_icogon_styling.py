"""Patch the ICOGON preview compiler to preserve CSS and compile Tailwind v4.
Run from the Icogon.AI repository root: python fix_icogon_styling_v2.py
The script preserves edited frontend code and makes backups.
"""
from pathlib import Path
from shutil import copy2

PATCHES = [('icogon-frontend/scripts/compile-preview.mjs', [('import path from "node:path";\nimport { fileURLToPath } from "node:url";\n\nconst root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");\n', 'import path from "node:path";\nimport { fileURLToPath } from "node:url";\nimport { compile as compileTailwind } from "tailwindcss";\nimport { Scanner } from "@tailwindcss/oxide";\nimport { readFile } from "node:fs/promises";\n\nconst root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");\n'), ('  ".svg": "dataurl",\n};\nlet input = "";\nprocess.stdin.setEncoding("utf8");\n', '  ".svg": "dataurl",\n};\n\n// ICOGON STYLING FIX: compile ALL stylesheet files from the generated snapshot.\n// An LLM may omit the CSS import in main.tsx, and esbuild alone does not\n// transform Tailwind v4 directives into real utility rules.\n// Load styles only from the trusted local Tailwind package. Never execute\n// generated Vite plugins, JS config, or arbitrary CSS plugins.\nasync function compileSnapshotStyles(files) {\n  const styles = [...files.entries()]\n    .filter(([name]) => name.endsWith(".css"))\n    .map(([name, contents]) => `/* ${name} */\\n${contents}`);\n  if (!styles.length) {\n    const hasClassNames = [...files.entries()].some(([name, contents]) =>\n      /\\.(?:tsx|jsx|ts|js)$/.test(name) && /\\bclassName\\s*=/.test(contents),\n    );\n    return {\n      css: "",\n      warnings: hasClassNames\n        ? ["Generated app contains className attributes but no CSS file. Add src/styles.css and import it in src/main.tsx."]\n        : [],\n    };\n  }\n\n  const inputCss = styles.join("\\n");\n  const tailwind = /@import\\s*["\']tailwindcss(?:\\/[^"\']*)?["\']|@tailwind\\s+(?:utilities|base|components)/.test(inputCss);\n  if (!tailwind) return { css: inputCss, warnings: [] };\n\n  // File reads and arbitrary extensions/config must not be delegated to\n  // untrusted generated CSS. Utility compilation is permitted.\n  if (/@(?:plugin|config|source|reference)\\b/i.test(inputCss)) {\n    throw new Error("Preview does not support Tailwind @plugin, @config, @source or @reference; use inline @theme and standard utilities.");\n  }\n  const packageRoot = path.join(root, "node_modules", "tailwindcss");\n  const compiler = await compileTailwind(inputCss, {\n    loadStylesheet: async (id, base) => {\n      const target = id === "tailwindcss"\n        ? path.join(packageRoot, "index.css")\n        : id.startsWith("tailwindcss/")\n          ? path.join(packageRoot, id.slice("tailwindcss/".length))\n          : id.startsWith("./") &&\n            (base === packageRoot || base.startsWith(packageRoot + path.sep))\n            ? path.resolve(base, id)\n            : null;\n      if (!target || !(target.startsWith(packageRoot + path.sep))) {\n        throw new Error(`Disallowed stylesheet import in generated CSS: ${id}`);\n      }\n      return {\n        path: target,\n        base: path.dirname(target),\n        content: await readFile(target, "utf8"),\n      };\n    },\n  });\n\n  // Tailwind\'s own scanner handles variants, arbitrary values and TSX.\n  // scanFiles accepts in-memory content, so generated files are never\n  // written to disk or executed in order to build the preview.\n  const inputs = [...files.entries()]\n    .filter(([name]) => /\\.(?:html|js|jsx|ts|tsx)$/.test(name))\n    .map(([name, content]) => ({\n      content,\n      extension: path.extname(name).slice(1),\n    }));\n  const scanner = new Scanner({ sources: [] });\n  const candidates = scanner.scanFiles(inputs);\n  return {\n    css: compiler.build(candidates),\n    warnings: candidates.length === 0\n      ? ["Tailwind stylesheet found, but no utility candidates were detected in generated source."]\n      : [],\n  };\n}\n\nlet input = "";\nprocess.stdin.setEncoding("utf8");\n'), ('            const loader = loaders[path.posix.extname(args.path)];\n            if (!loader) throw new Error("Unsupported source type");\n            return { contents: files.get(args.path), loader };\n          });\n', '            const loader = loaders[path.posix.extname(args.path)];\n            if (!loader) throw new Error("Unsupported source type");\n            // All CSS gets compiled once from the complete snapshot below.\n            // Emptying import-side CSS avoids duplicate or raw @import rules.\n            if (loader === "css") return { contents: "", loader };\n            return { contents: files.get(args.path), loader };\n          });\n'), ('  const script =\n    result.outputFiles.find((file) => file.path.endsWith(".js"))?.text || "";\n  const css =\n    result.outputFiles.find((file) => file.path.endsWith(".css"))?.text || "";\n  if (script.length + css.length > 8000000)\n    throw new Error("Preview bundle exceeds 8 MB");\n', '  const script =\n    result.outputFiles.find((file) => file.path.endsWith(".js"))?.text || "";\n  const { css, warnings: stylesheetWarnings } = await compileSnapshotStyles(files);\n  if (script.length + css.length > 8000000)\n    throw new Error("Preview bundle exceeds 8 MB");\n'), ('  if (script.length + css.length > 8000000)\n    throw new Error("Preview bundle exceeds 8 MB");\n  const diagnostics = result.warnings.map((item) => item.text).slice(0, 10);\n  const runtimeErrors = `addEventListener(\'error\',function(e){var p=document.createElement(\'pre\');p.setAttribute(\'role\',\'alert\');p.style.cssText=\'position:fixed;bottom:0;left:0;right:0;margin:0;background:#391b24;color:#ffd5df;padding:16px;white-space:pre-wrap;z-index:1000\';p.textContent=\'Preview runtime error: \'+e.message;document.body.append(p)});`;\n  const html =\n', '  if (script.length + css.length > 8000000)\n    throw new Error("Preview bundle exceeds 8 MB");\n  const diagnostics = [\n    ...result.warnings.map((item) => item.text),\n    ...stylesheetWarnings,\n  ].slice(0, 10);\n  const runtimeErrors = `addEventListener(\'error\',function(e){var p=document.createElement(\'pre\');p.setAttribute(\'role\',\'alert\');p.style.cssText=\'position:fixed;bottom:0;left:0;right:0;margin:0;background:#391b24;color:#ffd5df;padding:16px;white-space:pre-wrap;z-index:1000\';p.textContent=\'Preview runtime error: \'+e.message;document.body.append(p)});`;\n  const html =\n'), ('  const runtimeErrors = `addEventListener(\'error\',function(e){var p=document.createElement(\'pre\');p.setAttribute(\'role\',\'alert\');p.style.cssText=\'position:fixed;bottom:0;left:0;right:0;margin:0;background:#391b24;color:#ffd5df;padding:16px;white-space:pre-wrap;z-index:1000\';p.textContent=\'Preview runtime error: \'+e.message;document.body.append(p)});`;\n  const html =\n    \'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICOGON preview</title><style>\' +\n    css.replace(/<\\/style/gi, "<\\\\/style") +\n    \'</style></head><body><div id="root"></div><script>\' +\n', '  const runtimeErrors = `addEventListener(\'error\',function(e){var p=document.createElement(\'pre\');p.setAttribute(\'role\',\'alert\');p.style.cssText=\'position:fixed;bottom:0;left:0;right:0;margin:0;background:#391b24;color:#ffd5df;padding:16px;white-space:pre-wrap;z-index:1000\';p.textContent=\'Preview runtime error: \'+e.message;document.body.append(p)});`;\n  const html =\n    \'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICOGON preview</title><style data-icogon-compiled-css="true">\' +\n    css.replace(/<\\/style/gi, "<\\\\/style") +\n    \'</style></head><body><div id="root"></div><script>\' +\n')]), ('icogon-frontend/src/pages/Builder/components/WorkspacePreview.tsx', [('      );\n\n      if (cssFiles.length > 0) {\n        const firstSample = cssFiles[0].content!.trim().slice(0, 30);\n        if (!rawHtml.includes(firstSample)) {\n', '      );\n\n      // The backend preview compiler already bundled and processed these styles.\n      // Re-inserting raw CSS can introduce unprocessed Tailwind @imports.\n      if (cssFiles.length > 0 && !rawHtml.includes(\'data-icogon-compiled-css="true"\')) {\n        const firstSample = cssFiles[0].content!.trim().slice(0, 30);\n        if (!rawHtml.includes(firstSample)) {\n')])]



import re

COMPILER_FILE = Path("icogon-frontend/scripts/compile-preview.mjs")
PREVIEW_FILE = Path("icogon-frontend/src/pages/Builder/components/WorkspacePreview.tsx")
CSS_MARKER = 'data-icogon-compiled-css="true"'


def prepare_compiler(path: Path) -> tuple[Path, str, str]:
    if not path.is_file():
        raise RuntimeError(f"Missing {path}. Run from the Icogon.AI root directory.")
    original = path.read_text(encoding="utf-8")
    after = original.replace("\r\n", "\n")
    patches = PATCHES[0][1]
    for index, (before_text, after_text) in enumerate(patches, 1):
        if before_text in after:
            after = after.replace(before_text, after_text, 1)
        elif after_text in after:
            pass
        else:
            raise RuntimeError(
                f"Compiler differs from the uploaded version near patch {index}. "
                "No files have been modified."
            )
    return path, original, after


def prepare_preview(path: Path) -> tuple[Path, str, str, str]:
    if not path.is_file():
        raise RuntimeError(f"Missing {path}. Run from the Icogon.AI root directory.")
    original = path.read_text(encoding="utf-8")
    after = original.replace("\r\n", "\n")
    if CSS_MARKER in after:
        return path, original, after, "Already protected against duplicate CSS injection"

    # Match the structural condition, not several neighboring lines or exact
    # indentation. Local component edits should remain untouched.
    condition = re.compile(r"\bif\s*\(\s*cssFiles\s*\.\s*length\s*>\s*0\s*\)\s*\{")
    replacement = 'if (cssFiles.length > 0 && !rawHtml.includes(\'data-icogon-compiled-css="true"\')) {'
    if condition.search(after):
        after, count = condition.subn(lambda match: replacement, after, count=1)
        assert count == 1
        return path, original, after, "Added compiled-CSS check to stylesheet insertion"

    # Support a component that has inlined the guard into a different block.
    inner = re.compile(r"\bif\s*\(\s*!\s*rawHtml\.includes\(\s*firstSample\s*\)\s*\)\s*\{")
    inner_replacement = 'if (!rawHtml.includes(firstSample) && !rawHtml.includes(\'data-icogon-compiled-css="true"\')) {'
    if inner.search(after):
        after, count = inner.subn(lambda match: inner_replacement, after, count=1)
        assert count == 1
        return path, original, after, "Added compiled-CSS check to stylesheet injection guard"

    # New versions may already trust compiler output and not inject raw CSS.
    if "combinedCss" not in after and "cssFiles" not in after:
        return path, original, after, "No raw CSS injection detected: component unchanged"

    # Do not throw away newer user code just to force a stale source patch.
    return path, original, after, (
        "WARNING: Unrecognized stylesheet injection logic. Component unchanged. "
        "Check whether it inserts raw generated CSS into compiled preview HTML."
    )


def main() -> None:
    compiler = prepare_compiler(COMPILER_FILE)
    preview_path, preview_before, preview_after, preview_note = prepare_preview(PREVIEW_FILE)
    updates = [compiler, (preview_path, preview_before, preview_after)]
    # Both files are checked before any file is written.
    for path, before, after in updates:
        if before.replace("\r\n", "\n") == after:
            print(f"Unchanged: {path}")
            continue
        backup = path.with_name(path.name + ".before_styling_fix.bak")
        if not backup.exists():
            copy2(path, backup)
        path.write_text(after, encoding="utf-8")
        print(f"Patched: {path} (backup: {backup})")
    print(preview_note)
    print("Done. Restart FastAPI to clear the preview cache, restart frontend, then Retry Preview.")


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as exc:
        raise SystemExit(str(exc)) from None
