// import { useMemo, useState } from "react";
// import {
//   AlertCircle,
//   CheckCircle2,
//   Code2,
//   Maximize2,
//   Monitor,
//   RefreshCw,
//   Smartphone,
//   Tablet,
// } from "lucide-react";

// type PreviewPayload = {
//   html?: unknown;
//   warnings?: unknown;
//   compiler?: unknown;
// };

// type DeviceMode = "desktop" | "tablet" | "mobile";

// type BuilderPreviewPanelProps = {
//   projectName: string;
//   preview: unknown;
//   available: boolean;
//   error: string | null;
//   runStatus: string;
//   isRefreshing: boolean;
//   isFullscreen: boolean;
//   onRefresh: () => void;
//   onToggleFullscreen: () => void;
//   onViewCode: () => void;
// };

// const previewPolicy =
//   '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; font-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'">';

// function injectPreviewPolicy(source: string): string {
//   if (/<head(?:\s[^>]*)?>/i.test(source)) {
//     return source.replace(
//       /<head(?:\s[^>]*)?>/i,
//       (head) => `${head}${previewPolicy}`,
//     );
//   }

//   return `<!doctype html><html><head>${previewPolicy}</head><body>${source}</body></html>`;
// }

// function readPreview(preview: unknown): {
//   html: string;
//   warnings: string[];
//   compiler: string;
// } {
//   if (!preview || typeof preview !== "object") {
//     return { html: "", warnings: [], compiler: "" };
//   }

//   const payload = preview as PreviewPayload;
//   const html = typeof payload.html === "string" ? payload.html : "";
//   const warnings = Array.isArray(payload.warnings)
//     ? payload.warnings.filter(
//         (item): item is string => typeof item === "string",
//       )
//     : [];
//   const compiler =
//     typeof payload.compiler === "string" ? payload.compiler : "";

//   return { html, warnings, compiler };
// }

// const deviceWidths: Record<DeviceMode, string> = {
//   desktop: "100%",
//   tablet: "768px",
//   mobile: "390px",
// };

// export default function BuilderPreviewPanel({
//   projectName,
//   preview,
//   available,
//   error,
//   runStatus,
//   isRefreshing,
//   isFullscreen,
//   onRefresh,
//   onToggleFullscreen,
//   onViewCode,
// }: BuilderPreviewPanelProps) {
//   const [device, setDevice] = useState<DeviceMode>("desktop");
//   const result = useMemo(() => readPreview(preview), [preview]);
//   const hasHtml = available && Boolean(result.html);

//   return (
//     <section className="icogon-preview-panel" aria-label="Application preview">
//       <div className="icogon-preview-toolbar">
//         <div className="icogon-preview-project">
//           <span className="icogon-preview-window-dots" aria-hidden="true">
//             <i />
//             <i />
//             <i />
//           </span>
//           <span className="icogon-preview-project-name" title={projectName}>
//             {projectName || "Untitled project"}
//           </span>
//           {hasHtml ? (
//             <span className="icogon-preview-ready">
//               <CheckCircle2 size={12} />
//               Preview ready
//             </span>
//           ) : null}
//         </div>

//         <div className="icogon-preview-actions">
//           <div className="icogon-device-switcher" role="group" aria-label="Preview device">
//             <button
//               type="button"
//               className={device === "desktop" ? "is-active" : ""}
//               onClick={() => setDevice("desktop")}
//               aria-label="Desktop preview"
//               aria-pressed={device === "desktop"}
//               title="Desktop"
//             >
//               <Monitor size={15} />
//             </button>
//             <button
//               type="button"
//               className={device === "tablet" ? "is-active" : ""}
//               onClick={() => setDevice("tablet")}
//               aria-label="Tablet preview"
//               aria-pressed={device === "tablet"}
//               title="Tablet"
//             >
//               <Tablet size={15} />
//             </button>
//             <button
//               type="button"
//               className={device === "mobile" ? "is-active" : ""}
//               onClick={() => setDevice("mobile")}
//               aria-label="Mobile preview"
//               aria-pressed={device === "mobile"}
//               title="Mobile"
//             >
//               <Smartphone size={15} />
//             </button>
//           </div>

//           <button
//             type="button"
//             className="icogon-preview-icon-button"
//             onClick={onRefresh}
//             disabled={!available || isRefreshing}
//             aria-label="Refresh preview"
//             title="Refresh preview"
//           >
//             <RefreshCw size={15} className={isRefreshing ? "is-spinning" : ""} />
//           </button>
//           <button
//             type="button"
//             className="icogon-preview-icon-button"
//             onClick={onToggleFullscreen}
//             aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
//             title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
//           >
//             <Maximize2 size={15} />
//           </button>
//         </div>
//       </div>

//       {result.warnings.length > 0 ? (
//         <details className="icogon-preview-warnings">
//           <summary>Compiler notes ({result.warnings.length})</summary>
//           <ul>
//             {result.warnings.map((warning, index) => (
//               <li key={`${index}-${warning}`}>{warning}</li>
//             ))}
//           </ul>
//         </details>
//       ) : null}

//       <div className="icogon-preview-canvas">
//         {hasHtml ? (
//           <div
//             className={`icogon-preview-device is-${device}`}
//             style={{ width: deviceWidths[device] }}
//           >
//             <iframe
//               key={`${device}-${result.compiler}-${result.html.length}`}
//               title={`${projectName || "Project"} live preview`}
//               className="icogon-preview-iframe"
//               sandbox="allow-scripts"
//               referrerPolicy="no-referrer"
//               srcDoc={injectPreviewPolicy(result.html)}
//             />
//           </div>
//         ) : (
//           <div className="icogon-preview-empty" role="status">
//             <div className="icogon-preview-empty-icon">
//               {error ? <AlertCircle size={23} /> : <Code2 size={23} />}
//             </div>
//             <h2>
//               {error
//                 ? "Preview could not be prepared"
//                 : runStatus === "completed"
//                   ? "Preview output is unavailable"
//                   : runStatus === "failed"
//                     ? "Generation needs attention"
//                     : runStatus === "cancelled"
//                       ? "Generation was cancelled"
//                       : runStatus === "idle"
//                         ? "Your workspace is ready"
//                         : "Building your preview"}
//             </h2>
//             <p>
//               {error ||
//                 (runStatus === "idle"
//                   ? "Start by describing the application you want to create in the AI panel."
//                   : runStatus === "completed"
//                     ? "The run completed, but the preview response did not contain renderable HTML."
//                     : runStatus === "failed"
//                       ? "Review the generation details in the AI panel, then try another request."
//                       : runStatus === "cancelled"
//                         ? "You can start a new request whenever you are ready."
//                         : "ICOGON is processing the project. The generated application will appear here when the run is complete.")}
//             </p>
//             {runStatus === "completed" ? (
//               <button type="button" onClick={onViewCode}>
//                 View generated files
//               </button>
//             ) : null}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
