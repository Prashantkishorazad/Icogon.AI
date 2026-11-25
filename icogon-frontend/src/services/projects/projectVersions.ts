/**
 * ICOGON.AI — Phase 2 / File 6: Project Version History
 * Install at src/services/projects/projectVersions.ts
 *
 * Browser-local, account-scoped immutable workspace checkpoints.
 * This module never modifies the active Builder store or live autosave data.
 * A prepared restore must be applied by the future UI controller only after
 * it pauses autosave, verifies the active scope, and obtains confirmation.
 * No cross-device sync, background screenshots or server version API implied.
 */

import type {
    WorkspaceSessionScope,
    WorkspaceSessionSnapshot,
} from "../../pages/Builder/types";
import {
    deserializeWorkspaceSnapshot,
    serializeWorkspaceSnapshot,
} from "../../utils/builder/workspaceSerializer";

export const PROJECT_VERSIONS_DATABASE = "icogon-project-versions";
export const PROJECT_VERSIONS_STORE = "versions";
export const PROJECT_VERSIONS_DATABASE_VERSION = 1;
export const DEFAULT_MAX_PROJECT_VERSIONS = 12;

export type ProjectVersionReason = "manual" | "before-restore" | "milestone";

export interface ProjectVersionInfo {
    id: string;
    projectId: string;
    createdAt: string;
    label: string;
    reason: ProjectVersionReason;
    fileCount: number;
    messageCount: number;
    hasPreview: boolean;
    /** Snapshot bytes as encoded UTF-8 JSON. */
    sizeBytes: number;
}

interface VersionRecord extends ProjectVersionInfo {
    key: string;
    scopeKey: string;
    json: string;
}

export interface SaveProjectVersionOptions {
    label?: string;
    reason?: ProjectVersionReason;
    /** Limits versions retained for this user/project only. Default: 12. */
    maxVersions?: number;
}

export interface PreparedProjectVersionRestore {
    version: ProjectVersionInfo;
    /** Validated data, not yet applied to the active workspace. */
    snapshot: WorkspaceSessionSnapshot;
    /** New safety version containing the caller's current snapshot. */
    safetyVersion: ProjectVersionInfo;
}

export class ProjectVersionError extends Error {
    readonly code: "invalid" | "unavailable" | "not_found" | "storage" | "scope_mismatch";
    constructor(
        code: "invalid" | "unavailable" | "not_found" | "storage" | "scope_mismatch",
        message: string,
    ) {
        super(message);
        this.name = "ProjectVersionError";
        this.code = code;
    }
}

const encoder = new TextEncoder();
const MAX_LABEL_LENGTH = 100;

function requireScope(scope: WorkspaceSessionScope): WorkspaceSessionScope {
    const userId = typeof scope?.userId === "string" ? scope.userId.trim() : "";
    const projectId = typeof scope?.projectId === "string" ? scope.projectId.trim() : "";
    if (!userId || !projectId) {
        throw new ProjectVersionError("invalid", "A user ID and project ID are required.");
    }
    return { userId, projectId };
}

function scopeKey(scope: WorkspaceSessionScope): string {
    const { userId, projectId } = requireScope(scope);
    return `${userId.length}:${userId}${projectId.length}:${projectId}`;
}

function normalizeLabel(label?: string): string {
    if (label === undefined) return "Saved version";
    if (typeof label !== "string") throw new ProjectVersionError("invalid", "Version label must be text.");
    const cleaned = label.trim();
    if (!cleaned || cleaned.length > MAX_LABEL_LENGTH) {
        throw new ProjectVersionError("invalid", "Version label must be 1–100 characters.");
    }
    return cleaned;
}

function versionId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    // This ID is for local record uniqueness, not an authorization token.
    return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function toInfo(record: VersionRecord): ProjectVersionInfo {
    const { id, projectId, createdAt, label, reason, fileCount, messageCount, hasPreview, sizeBytes } = record;
    return { id, projectId, createdAt, label, reason, fileCount, messageCount, hasPreview, sizeBytes };
}

function ensureIndexedDB(): void {
    if (typeof indexedDB === "undefined") {
        throw new ProjectVersionError("unavailable", "IndexedDB is unavailable. Project versions cannot be saved in this browser.");
    }
}

let openPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
    ensureIndexedDB();
    if (openPromise) return openPromise;
    openPromise = new Promise<IDBDatabase>((resolve, reject) => {
        let request: IDBOpenDBRequest;
        try {
            request = indexedDB.open(PROJECT_VERSIONS_DATABASE, PROJECT_VERSIONS_DATABASE_VERSION);
        } catch (error) {
            reject(error);
            return;
        }
        let settled = false;
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(PROJECT_VERSIONS_STORE)) {
                db.createObjectStore(PROJECT_VERSIONS_STORE, { keyPath: "key" });
            }
        };
        request.onerror = () => {
            if (!settled) { settled = true; reject(request.error); }
        };
        request.onblocked = () => {
            if (!settled) { settled = true; reject(new Error("Version storage upgrade blocked by another tab.")); }
        };
        request.onsuccess = () => {
            const db = request.result;
            if (settled) { db.close(); return; }
            settled = true;
            db.onversionchange = () => { db.close(); openPromise = null; };
            resolve(db);
        };
    }).catch((error: unknown) => {
        openPromise = null;
        throw error instanceof ProjectVersionError
            ? error
            : new ProjectVersionError("storage", error instanceof Error ? error.message : "Cannot open project version storage.");
    });
    return openPromise;
}

/** Complete a transaction before reporting success; request success can still roll back. */
function transactionRequest<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let tx: IDBTransaction;
        try {
            tx = db.transaction(PROJECT_VERSIONS_STORE, mode);
            const request = operation(tx.objectStore(PROJECT_VERSIONS_STORE));
            let result!: T;
            request.onsuccess = () => { result = request.result; };
            tx.oncomplete = () => resolve(result);
            tx.onerror = () => reject(new ProjectVersionError("storage", tx.error?.message || "Project version transaction failed."));
            tx.onabort = () => reject(new ProjectVersionError("storage", tx.error?.message || "Project version transaction was aborted."));
        } catch (error) {
            reject(new ProjectVersionError("storage", error instanceof Error ? error.message : "Cannot access project version storage."));
        }
    });
}

function scopedRange(scope: WorkspaceSessionScope): IDBKeyRange {
    const prefix = `${scopeKey(scope)}|`;
    return IDBKeyRange.bound(prefix, `${prefix}\uffff`);
}

async function getRecords(scope: WorkspaceSessionScope): Promise<VersionRecord[]> {
    const db = await openDatabase();
    const records = await transactionRequest(db, "readonly", (store) => store.getAll(scopedRange(scope)));
    return (records as VersionRecord[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

function validatedJSON(snapshot: WorkspaceSessionSnapshot, scope: WorkspaceSessionScope): string {
    try {
        return serializeWorkspaceSnapshot(snapshot, scope);
    } catch (error) {
        throw new ProjectVersionError("invalid", error instanceof Error ? error.message : "Invalid workspace snapshot.");
    }
}

/** List this account's versions for this project, newest first. */
export async function listProjectVersions(scope: WorkspaceSessionScope): Promise<ProjectVersionInfo[]> {
    return (await getRecords(requireScope(scope))).map(toInfo);
}

/** Persist an immutable copy of one validated workspace snapshot. */
export async function saveProjectVersion(
    snapshot: WorkspaceSessionSnapshot,
    options: SaveProjectVersionOptions = {},
): Promise<ProjectVersionInfo> {
    if (!snapshot || typeof snapshot !== "object") {
        throw new ProjectVersionError("invalid", "A workspace snapshot is required.");
    }
    const scope = requireScope(snapshot.scope);
    const json = validatedJSON(snapshot, scope);
    const maxVersions = options.maxVersions ?? DEFAULT_MAX_PROJECT_VERSIONS;
    if (!Number.isInteger(maxVersions) || maxVersions < 1 || maxVersions > 100) {
        throw new ProjectVersionError("invalid", "maxVersions must be between 1 and 100.");
    }
    const reason = options.reason ?? "manual";
    if (reason !== "manual" && reason !== "milestone" && reason !== "before-restore") {
        throw new ProjectVersionError("invalid", "Unknown project version reason.");
    }
    const id = versionId();
    const createdAt = new Date().toISOString();
    const prefix = scopeKey(scope);
    const record: VersionRecord = {
        id,
        key: `${prefix}|${id}`,
        scopeKey: prefix,
        projectId: scope.projectId,
        createdAt,
        label: normalizeLabel(options.label),
        reason,
        fileCount: snapshot.generatedFiles.length,
        messageCount: snapshot.messages.length,
        hasPreview: snapshot.previewState.available,
        sizeBytes: encoder.encode(json).byteLength,
        json,
    };
    const db = await openDatabase();
    await transactionRequest(db, "readwrite", (store) => store.add(record));
    // Prune only AFTER successful insertion. Failure to prune does not erase the new version.
    const versions = await getRecords(scope);
    const extra = versions.slice(maxVersions);
    for (const old of extra) {
        // Keep manual delete failures visible; never claim the quota was enforced if not.
        await transactionRequest(db, "readwrite", (store) => store.delete(old.key));
    }
    return toInfo(record);
}

/** Load and validate a saved version. Corrupted versions are never auto-deleted. */
export async function getProjectVersion(
    scope: WorkspaceSessionScope,
    id: string,
): Promise<{ version: ProjectVersionInfo; snapshot: WorkspaceSessionSnapshot }> {
    const normalized = requireScope(scope);
    if (typeof id !== "string" || !id.trim()) throw new ProjectVersionError("invalid", "Version ID is required.");
    const db = await openDatabase();
    const key = `${scopeKey(normalized)}|${id}`;
    const record = await transactionRequest(db, "readonly", (store) => store.get(key)) as VersionRecord | undefined;
    if (!record) throw new ProjectVersionError("not_found", "Project version not found for this account and project.");
    if (record.scopeKey !== scopeKey(normalized)) {
        throw new ProjectVersionError("scope_mismatch", "Saved version belongs to another workspace.");
    }
    const result = deserializeWorkspaceSnapshot(record.json, normalized);
    if (result.status !== "restored") {
        throw new ProjectVersionError("invalid", "Saved version cannot be restored: " + (result.status === "invalid" ? result.reason : "snapshot missing."));
    }
    return { version: toInfo(record), snapshot: result.snapshot };
}

/** Remove exactly one version. Never deletes the live workspace. */
export async function deleteProjectVersion(scope: WorkspaceSessionScope, id: string): Promise<void> {
    const normalized = requireScope(scope);
    if (typeof id !== "string" || !id.trim()) throw new ProjectVersionError("invalid", "Version ID is required.");
    const db = await openDatabase();
    await transactionRequest(db, "readwrite", (store) => store.delete(`${scopeKey(normalized)}|${id}`));
}

/**
 * Prepare a restore without modifying the live workspace.
 *
 * The caller MUST stop in-flight generation and pause autosave before applying
 * the returned snapshot. It should verify the same user/project remains active,
 * obtain explicit user confirmation, and atomically coordinate its store restore
 * with workspacePersistence.save. Never blindly apply to another open project.
 *
 * The caller supplies its latest workspace snapshot, which is saved as a safety
 * version before returning the older version. If the safety write fails, this
 * method rejects and no restore is prepared.
 */
export async function prepareProjectVersionRestore(
    scope: WorkspaceSessionScope,
    targetVersionId: string,
    currentSnapshot: WorkspaceSessionSnapshot,
): Promise<PreparedProjectVersionRestore> {
    const normalized = requireScope(scope);
    const currentJSON = validatedJSON(currentSnapshot, normalized);
    const currentResult = deserializeWorkspaceSnapshot(currentJSON, normalized);
    if (currentResult.status !== "restored") {
        throw new ProjectVersionError("invalid", "Current workspace could not be backed up.");
    }
    const { version, snapshot } = await getProjectVersion(normalized, targetVersionId);
    const safetyVersion = await saveProjectVersion(currentResult.snapshot, {
        label: `Before restoring ${version.label}`.slice(0, MAX_LABEL_LENGTH),
        reason: "before-restore",
        // Preserve larger histories during a restore; the UI can prune later.
        maxVersions: 100,
    });
    return { version, snapshot, safetyVersion };
}

export const projectVersions = {
    list: listProjectVersions,
    save: saveProjectVersion,
    get: getProjectVersion,
    delete: deleteProjectVersion,
    prepareRestore: prepareProjectVersionRestore,
};

export default projectVersions;
