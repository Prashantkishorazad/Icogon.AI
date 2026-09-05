// Trusted compiler only: generated code/config/plugins are never executed here.
import { build, stop } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowedPackages = new Set([
  "react",
  "react-dom",
  "three",
  "lucide-react",
]);
const loaders = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".jsx": "jsx",
  ".js": "js",
  ".css": "css",
  ".json": "json",
  ".svg": "dataurl",
};
let input = "";
process.stdin.setEncoding("utf8");
try {
  for await (const chunk of process.stdin) {
    input += chunk;
    if (Buffer.byteLength(input) > 1000000)
      throw new Error("Source exceeds the 1 MB preview limit");
  }
  const payload = JSON.parse(input);
  const files = new Map();
  if (!Array.isArray(payload.files) || payload.files.length > 100)
    throw new Error("Invalid source snapshot");
  for (const file of payload.files) {
    if (file.operation === "delete") continue;
    if (
      !/^[a-zA-Z0-9_./-]+$/.test(file.path) ||
      file.path.split("/").includes("..") ||
      file.path.startsWith("/")
    )
      throw new Error("Invalid project path");
    const normalized = path.posix.normalize(file.path);
    if (files.has(normalized) || typeof file.content !== "string")
      throw new Error("Invalid or duplicate file");
    files.set(normalized, file.content);
  }
  const entry = ["src/main.tsx", "src/main.jsx", "src/main.js"].find((name) =>
    files.has(name),
  );
  if (!entry)
    throw new Error(
      "React preview requires src/main.tsx, src/main.jsx or src/main.js",
    );
  function projectFile(candidate) {
    if (candidate.startsWith("../") || candidate.startsWith("/"))
      throw new Error("Import escapes the project");
    const found = [
      candidate,
      ...[".tsx", ".ts", ".jsx", ".js", ".css", ".json"].map(
        (ext) => candidate + ext,
      ),
      ...["/index.tsx", "/index.ts", "/index.jsx", "/index.js"].map(
        (ext) => candidate + ext,
      ),
    ].find((name) => files.has(name));
    if (!found) throw new Error(`Missing project module: ${candidate}`);
    return { path: found, namespace: "project" };
  }
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    outfile: "preview.js",
    platform: "browser",
    format: "iife",
    target: "es2022",
    jsx: "automatic",
    minify: true,
    logLevel: "silent",
    sourcemap: false,
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "owned-snapshot",
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, async (args) => {
            if (args.kind === "entry-point") return projectFile(args.path);
            if (args.namespace !== "project") return;
            if (
              args.path.includes("\\") ||
              args.path.includes(":") ||
              args.path.includes("\0")
            )
              throw new Error("Unsupported import");
            if (args.path.startsWith("."))
              return projectFile(
                path.posix.normalize(
                  path.posix.join(path.posix.dirname(args.importer), args.path),
                ),
              );
            if (args.path.startsWith("@/"))
              return projectFile("src/" + args.path.slice(2));
            const packageName = args.path.split("/")[0];
            if (
              !allowedPackages.has(packageName) ||
              args.path.split("/").includes("..") ||
              !/^[a-zA-Z0-9_./-]+$/.test(args.path)
            )
              throw new Error(
                `Package is not available in preview: ${args.path}`,
              );
            // Resolve only allowlisted, already-installed packages from the trusted root.
            return builder.resolve(args.path, {
              resolveDir: root,
              kind: args.kind,
            });
          });
          builder.onLoad({ filter: /.*/, namespace: "project" }, (args) => {
            const loader = loaders[path.posix.extname(args.path)];
            if (!loader) throw new Error("Unsupported source type");
            return { contents: files.get(args.path), loader };
          });
        },
      },
    ],
  });
  const script =
    result.outputFiles.find((file) => file.path.endsWith(".js"))?.text || "";
  const css =
    result.outputFiles.find((file) => file.path.endsWith(".css"))?.text || "";
  if (script.length + css.length > 8000000)
    throw new Error("Preview bundle exceeds 8 MB");
  const diagnostics = result.warnings.map((item) => item.text).slice(0, 10);
  const runtimeErrors = `addEventListener('error',function(e){var p=document.createElement('pre');p.setAttribute('role','alert');p.style.cssText='position:fixed;bottom:0;left:0;right:0;margin:0;background:#391b24;color:#ffd5df;padding:16px;white-space:pre-wrap;z-index:1000';p.textContent='Preview runtime error: '+e.message;document.body.append(p)});`;
  const html =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICOGON preview</title><style>' +
    css.replaceAll("</style", "<\\/style") +
    '</style></head><body><div id="root"></div><script>' +
    runtimeErrors +
    script.replaceAll("</script", "<\\/script") +
    "</script></body></html>";
  process.stdout.write(JSON.stringify({ html, warnings: diagnostics }));
} catch (error) {
  const messages = error.errors?.map(
    (item) =>
      `${item.location ? item.location.file + ":" + item.location.line + ": " : ""}${item.text}`,
  ) || [error.message];
  process.stdout.write(JSON.stringify({ errors: messages.slice(0, 8) }));
  process.exitCode = 1;
} finally {
  stop();
}
