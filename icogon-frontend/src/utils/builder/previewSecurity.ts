/**
 * Shared security boundary for AI-generated ICOGON previews.
 *
 * This module handles document-level defense-in-depth only. It does NOT turn
 * arbitrary generated JavaScript into trusted code. Always render the returned
 * HTML inside an iframe with an opaque origin (no `allow-same-origin`).
 *
 * Intended consumers:
 *   src/pages/Builder/components/WorkspacePreview.tsx
 *   src/pages/Builder/GeneratedPreview.tsx
 */

/**
 * Permissions deliberately exclude allow-same-origin, allow-top-navigation,
 * allow-popups, allow-downloads, and allow-storage-access-by-user-activation.
 *
 * Forms can be rendered, but CSP prevents them from submitting anywhere.
 * `allow-modals` retains existing WorkspacePreview behavior.
 */
export const WORKSPACE_PREVIEW_SANDBOX = "allow-scripts allow-forms allow-modals" as const;
export const GENERATED_PREVIEW_SANDBOX = "allow-scripts" as const;

/**
 * Baseline policy for a compiled, self-contained preview.
 *
 * The backend compiler should inline application assets. Script `blob:` and
 * `data:` are allowed for generated bundles; outbound fetch/XHR, form submits,
 * embedded frames, plugins, and workers are intentionally denied. HTTPS images,
 * styles and fonts are permitted so static mockups can still render.
 *
 * This is *not* a production website's CSP. Publishing should use an isolated
 * domain and a separate permissions model appropriate for the deployed app.
 */
export const PREVIEW_CONTENT_SECURITY_POLICY = [
    "default-src 'none'",
    "script-src 'unsafe-inline' blob: data:",
    "style-src 'unsafe-inline' https: data: blob:",
    "img-src https: data: blob:",
    "font-src https: data: blob:",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "child-src 'none'",
    "worker-src 'none'",
].join("; ");

/** A script-free outer document for opening a preview in another browser tab. */
const DETACHED_PREVIEW_CSP = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "frame-src 'self' about: blob:",
    "script-src 'none'",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "object-src 'none'",
].join("; ");

export interface PreviewSecurityOptions {
    /** Override only for a **trusted** caller, never using generated HTML. */
    policy?: string;
}

/**
 * Escape generated content when embedding it in an HTML *attribute*.
 * Without this, `srcdoc="..."` can break out of the iframe element.
 */
export function escapePreviewHtmlAttribute(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#39;");
}

/**
 * Install a CSP meta as the first element *inside* the document head.
 *
 * It is important not to prepend a meta tag before <html>/<head>: doing so
 * can make malformed documents render differently. Existing generated CSP
 * tags are retained: browsers intersect them with this stricter policy.
 * A leading BOM/doctype is handled without duplicating the doctype.
 *
 * This is a lightweight HTML normalizer, not a sanitizer or HTML parser.
 * The iframe sandbox remains mandatory for hostile/malformed documents.
 */
export function applyPreviewSecurityPolicy(
    html: string,
    options: PreviewSecurityOptions = {},
): string {
    if (typeof html !== "string" || !html.trim()) return "";

    const policy = options.policy ?? PREVIEW_CONTENT_SECURITY_POLICY;
    const policyTag = `<meta http-equiv="Content-Security-Policy" content="${escapePreviewHtmlAttribute(policy)}">`;
    const source = html.replace(/^\uFEFF/, "");

    // Normal HTML document: put policy before generated head contents/scripts.
    if (/<head(?:\s[^>]*)?>/i.test(source)) {
        return source.replace(/<head(?:\s[^>]*)?>/i, head => `${head}\n${policyTag}`);
    }

    // An HTML document with <html> but no explicit head.
    if (/<html(?:\s[^>]*)?>/i.test(source)) {
        return source.replace(/<html(?:\s[^>]*)?>/i, tag => `${tag}\n<head>${policyTag}</head>`);
    }

    // Fragments and malformed outputs: preserve any leading doctype, then wrap.
    const doctypeMatch = /^\s*(<!doctype[^>]*>)/i.exec(source);
    const body = doctypeMatch ? source.slice(doctypeMatch[0].length) : source;
    const doctype = doctypeMatch ? doctypeMatch[1] : "<!doctype html>";
    return `${doctype}\n<html><head><meta charset="utf-8">${policyTag}</head><body>${body}</body></html>`;
}

export interface DetachedPreviewOptions {
    title?: string;
    /** Only use one of the predefined sandbox permission sets. */
    sandbox?: typeof WORKSPACE_PREVIEW_SANDBOX | typeof GENERATED_PREVIEW_SANDBOX;
    /** If true, content has already been protected with applyPreviewSecurityPolicy. */
    alreadySecured?: boolean;
}

/**
 * Build a standalone outer page containing a SANDBOXED iframe.
 *
 * Never open raw generated HTML directly with window.open(blobURL): blob
 * pages can inherit the opener's origin, so running generated JS at top level
 * is unsafe. Instead, open this inert wrapper and let the iframe use an opaque
 * origin, exactly as it does inside the Builder workspace.
 *
 * The caller is responsible for creating/revoking the Blob object URL and
 * opening it with `noopener,noreferrer` (or an equivalent rel attribute).
 */
export function createDetachedPreviewDocument(
    html: string,
    options: DetachedPreviewOptions = {},
): string {
    const secured = options.alreadySecured ? html : applyPreviewSecurityPolicy(html);
    const title = escapePreviewHtmlAttribute(options.title ?? "ICOGON Sandbox Preview");
    const sandbox = options.sandbox ?? WORKSPACE_PREVIEW_SANDBOX;
    const outerPolicy = escapePreviewHtmlAttribute(DETACHED_PREVIEW_CSP);
    const srcdoc = escapePreviewHtmlAttribute(secured);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${outerPolicy}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; background: #090a0f; }
    iframe { display: block; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe title="Generated application" sandbox="${sandbox}"
    referrerpolicy="no-referrer" srcdoc="${srcdoc}"></iframe>
</body>
</html>`;
}

/** Confirm the trusted renderer has not accidentally enabled same-origin. */
export function isOpaqueOriginSandbox(sandbox: string): boolean {
    const flags = sandbox.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return !flags.includes("allow-same-origin") && !flags.includes("allow-top-navigation") &&
        !flags.includes("allow-top-navigation-by-user-activation");
}
