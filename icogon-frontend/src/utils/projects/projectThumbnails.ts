/**
 * ICOGON.AI — Phase 2 / File 5
 * Browser-local project thumbnail storage and deterministic SVG fallbacks.
 *
 * Install at: src/utils/projects/projectThumbnails.ts
 *
 * IMPORTANT: the current project API has no thumbnail URL/upload endpoint.
 * This module DOES NOT take screenshots, read cross-origin iframe pixels,
 * upload files, or imply that browser-local thumbnails sync across devices.
 * Callers must supply a genuine PNG/JPEG/WebP Blob after obtaining it from
 * an explicitly trusted capture/export workflow.
 */

import type { ProjectRecord } from "../../services/projects/projectLifecycle";

export interface ThumbnailScope {
    userId: string;
    projectId: string;
}

export type ThumbnailSource = "local" | "fallback";

export interface ProjectThumbnail {
    src: string;
    source: ThumbnailSource;
    /** Call when the thumbnail leaves the DOM; revokes local object URLs. */
    release: () => void;
}

interface StoredThumbnail {
    key: string;
    blob: Blob;
    savedAt: string;
}

export interface ProjectThumbnailOptions {
    width?: number;
    height?: number;
}

export class ThumbnailStorageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ThumbnailStorageError";
    }
}

const DB_NAME = "icogon-project-thumbnails";
const DB_VERSION = 1;
const STORE_NAME = "thumbnails";
export const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;
const MIN_SIZE = 64;
const MAX_SIZE = 2048;

function requireScope(scope: ThumbnailScope): ThumbnailScope {
    const userId = typeof scope?.userId === "string" ? scope.userId.trim() : "";
    const projectId = typeof scope?.projectId === "string" ? scope.projectId.trim() : "";
    if (!userId || !projectId) throw new ThumbnailStorageError("A user ID and project ID are required.");
    return { userId, projectId };
}

/** Prefix length ensures that different account/project pairs never collide. */
export function projectThumbnailKey(scope: ThumbnailScope): string {
    const { userId, projectId } = requireScope(scope);
    return `${userId.length}:${userId}${projectId.length}:${projectId}`;
}

function xmlEscape(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function size(value: number | undefined, defaultValue: number): number {
    return typeof value === "number" && Number.isFinite(value)
        ? Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(value)))
        : defaultValue;
}

/**
 * Deterministic, network-free fallback. User-controlled names are XML-escaped
 * and rendered as text, never interpreted as markup or script.
 */
export function createFallbackThumbnail(
    project: Pick<ProjectRecord, "id" | "name">,
    options: ProjectThumbnailOptions = {},
): string {
    const width = size(options.width, 640);
    const height = size(options.height, 360);
    const label = (project.name || "Untitled Project").trim().slice(0, 44) || "Untitled Project";
    const initial = Array.from(label)[0]?.toUpperCase() || "P";
    let hash = 2166136261;
    for (const character of project.id) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    const hue = (hash >>> 0) % 360;
    const background = `hsl(${hue} 27% 17%)`;
    const accent = `hsl(${hue} 65% 64%)`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Project thumbnail">` +
        `<rect width="100%" height="100%" fill="${background}"/>` +
        `<rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="18" fill="none" stroke="${accent}" stroke-opacity=".35"/>` +
        `<circle cx="${width / 2}" cy="${Math.round(height * .39)}" r="${Math.round(Math.min(width, height) * .145)}" fill="${accent}" fill-opacity=".17"/>` +
        `<text x="50%" y="${Math.round(height * .42)}" text-anchor="middle" dominant-baseline="middle" fill="${accent}" font-family="system-ui,sans-serif" font-weight="700" font-size="${Math.round(Math.min(width, height) * .16)}">${xmlEscape(initial)}</text>` +
        `<text x="50%" y="${Math.round(height * .73)}" text-anchor="middle" fill="#f7f7fa" font-family="system-ui,sans-serif" font-size="${Math.round(Math.min(width, height) * .055)}">${xmlEscape(label)}</text>` +
        `</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function browserDatabase(): IDBFactory {
    if (typeof indexedDB === "undefined") {
        throw new ThumbnailStorageError("Thumbnail storage requires browser IndexedDB support.");
    }
    return indexedDB;
}

function openDatabase(): Promise<IDBDatabase> {
    const factory = browserDatabase();
    return new Promise((resolve, reject) => {
        let request: IDBOpenDBRequest;
        try { request = factory.open(DB_NAME, DB_VERSION); }
        catch { reject(new ThumbnailStorageError("Unable to open thumbnail storage.")); return; }
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "key" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new ThumbnailStorageError("Unable to open thumbnail storage."));
        request.onblocked = () => reject(new ThumbnailStorageError("Thumbnail storage is blocked by another tab."));
    });
}

async function transactionRequest<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    const database = await openDatabase();
    try {
        return await new Promise<T>((resolve, reject) => {
            let transaction: IDBTransaction;
            try { transaction = database.transaction(STORE_NAME, mode); }
            catch { reject(new ThumbnailStorageError("Unable to start thumbnail storage transaction.")); return; }
            let value: T;
            let request: IDBRequest<T>;
            try { request = operation(transaction.objectStore(STORE_NAME)); }
            catch { reject(new ThumbnailStorageError("Thumbnail storage request failed.")); return; }
            request.onsuccess = () => { value = request.result; };
            transaction.oncomplete = () => resolve(value);
            transaction.onerror = () => reject(new ThumbnailStorageError("Thumbnail storage transaction failed."));
            transaction.onabort = () => reject(new ThumbnailStorageError("Thumbnail storage transaction was aborted."));
        });
    } finally {
        database.close();
    }
}

/** Check magic bytes as well as MIME: HTML renamed to .png is not accepted. */
export async function validateThumbnailImage(blob: Blob): Promise<void> {
    if (!(blob instanceof Blob)) throw new ThumbnailStorageError("Thumbnail must be an image Blob.");
    if (!blob.size || blob.size > MAX_THUMBNAIL_BYTES) {
        throw new ThumbnailStorageError("Thumbnail must be between 1 byte and 2 MB.");
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(blob.type)) {
        throw new ThumbnailStorageError("Only PNG, JPEG, and WebP thumbnails are supported.");
    }
    const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    const matches = blob.type === "image/png"
        ? bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
        : blob.type === "image/jpeg"
            ? bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (!matches) throw new ThumbnailStorageError("Thumbnail content does not match its declared image type.");
}

/** Save only a verified image produced by an authorized external capture. */
export async function saveProjectThumbnail(scope: ThumbnailScope, image: Blob): Promise<string> {
    const key = projectThumbnailKey(scope);
    await validateThumbnailImage(image);
    const savedAt = new Date().toISOString();
    await transactionRequest("readwrite", (store) => store.put({ key, blob: image, savedAt } satisfies StoredThumbnail));
    return savedAt;
}

export async function loadProjectThumbnailBlob(scope: ThumbnailScope): Promise<Blob | null> {
    const key = projectThumbnailKey(scope);
    const record = await transactionRequest<StoredThumbnail | undefined>("readonly", (store) => store.get(key));
    if (!record || !(record.blob instanceof Blob)) return null;
    try { await validateThumbnailImage(record.blob); }
    catch { return null; }
    return record.blob;
}

export async function deleteProjectThumbnail(scope: ThumbnailScope): Promise<void> {
    const key = projectThumbnailKey(scope);
    await transactionRequest("readwrite", (store) => store.delete(key));
}

/**
 * Resolve a safe src for <img>. Local results use an object URL that must be
 * released on component unmount/image replacement; no scriptable HTML URLs.
 * Storage errors fall back gracefully, but save/delete operations throw.
 */
export async function resolveProjectThumbnail(
    project: Pick<ProjectRecord, "id" | "name">,
    userId: string,
    options: ProjectThumbnailOptions = {},
): Promise<ProjectThumbnail> {
    const scope = requireScope({ userId, projectId: project.id });
    try {
        const blob = await loadProjectThumbnailBlob(scope);
        if (blob && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
            const src = URL.createObjectURL(blob);
            let released = false;
            return {
                src,
                source: "local",
                release: () => {
                    if (!released) { released = true; URL.revokeObjectURL(src); }
                },
            };
        }
    } catch { /* A disabled or unavailable IndexedDB should not blank project cards. */ }
    return { src: createFallbackThumbnail(project, options), source: "fallback", release: () => { } };
}
