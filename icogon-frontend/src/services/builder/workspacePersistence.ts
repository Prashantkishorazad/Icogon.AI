import type {
    WorkspacePersistenceAdapter,
    WorkspaceRestoreResult,
    WorkspaceSessionScope,
    WorkspaceSessionSnapshot,
    WorkspaceWriteResult,
} from "../../pages/Builder/types";
import {
    deserializeWorkspaceSnapshot,
    getWorkspaceStorageKey,
    serializeWorkspaceSnapshot,
} from "../../utils/builder/workspaceSerializer";

/* ============================================================
   ICOGON BUILDER — WORKSPACE PERSISTENCE (PHASE 1 / FILE 12)

   - IndexedDB is the primary store for large Builder snapshots.
   - The existing v1 localStorage key is a migration source.
   - Never erase legacy data until a complete IndexedDB write.
   - Never treat corrupt data as an empty workspace.
   - Snapshots are scoped to an authenticated user and project.
   - No Supabase tokens, remote requests, or React hooks live here.

   IMPORTANT: This service is not yet wired into BuilderWorkspacePage.
   File 15 (the persistence hook) and the final integration will do so.
============================================================ */

export const WORKSPACE_DATABASE_NAME = "icogon-builder-workspaces";
export const WORKSPACE_DATABASE_VERSION = 1;
export const WORKSPACE_OBJECT_STORE = "sessions";

export type WorkspaceStorageBackend = "indexeddb" | "localStorage" | "unavailable";

export type WorkspaceStorageErrorCode =
    | "unavailable"
    | "blocked"
    | "quota"
    | "conflict"
    | "corrupted"
    | "transaction";

export class WorkspaceStorageError extends Error {
    readonly code: WorkspaceStorageErrorCode;

    constructor(code: WorkspaceStorageErrorCode, message: string) {
        super(message);
        this.name = "WorkspaceStorageError";
        this.code = code;
    }
}

interface StoredWorkspaceRecord {
    key: string;
    json: string;
    savedAt: string;
}

type LegacyRecord =
    | { status: "missing" }
    | { status: "restored"; raw: string; snapshot: WorkspaceSessionSnapshot }
    | { status: "invalid"; raw: string; reason: string }
    | { status: "error"; reason: string };

type DatabaseRecord =
    | { status: "missing" }
    | { status: "restored"; snapshot: WorkspaceSessionSnapshot }
    | { status: "invalid"; reason: string };

/* ============================================================
   ERRORS AND STORAGE AVAILABILITY
============================================================ */

function describeError(error: unknown, fallback: string): string {
    if (error instanceof WorkspaceStorageError) return error.message;
    if (error && typeof error === "object" && "name" in error) {
        const name = String((error as { name: unknown }).name);
        if (name === "QuotaExceededError") {
            return "Browser storage quota has been reached. Your existing workspace was not replaced. Export or free storage and retry.";
        }
        if (name === "SecurityError" || name === "NotSupportedError") {
            return "Browser storage is unavailable in this browsing context. Check browser privacy/storage settings.";
        }
    }
    return error instanceof Error && error.message ? error.message : fallback;
}

function storageError(error: unknown, fallback: string): WorkspaceStorageError {
    if (error instanceof WorkspaceStorageError) return error;
    const name = error && typeof error === "object" && "name" in error
        ? String((error as { name: unknown }).name)
        : "";
    const code: WorkspaceStorageErrorCode = name === "QuotaExceededError"
        ? "quota"
        : name === "SecurityError" || name === "NotSupportedError"
            ? "unavailable"
            : "transaction";
    return new WorkspaceStorageError(code, describeError(error, fallback));
}

function localStorageOrThrow(): Storage {
    try {
        if (typeof window === "undefined" || !window.localStorage) {
            throw new Error("localStorage is not available.");
        }
        return window.localStorage;
    } catch (error) {
        throw storageError(error, "Browser localStorage is unavailable.");
    }
}

function isIdbUnsupported(): boolean {
    return typeof indexedDB === "undefined";
}

/* ============================================================
   INDEXEDDB CONNECTION

   Cache the open connection, not data. A version-change request
   from another tab closes this connection so upgrades can proceed.
============================================================ */

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
    if (isIdbUnsupported()) {
        return Promise.reject(new WorkspaceStorageError("unavailable", "IndexedDB is not supported by this browser."));
    }
    if (databasePromise) return databasePromise;

    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        let request: IDBOpenDBRequest;
        try {
            request = indexedDB.open(WORKSPACE_DATABASE_NAME, WORKSPACE_DATABASE_VERSION);
        } catch (error) {
            reject(storageError(error, "Could not open the workspace database."));
            return;
        }

        let settled = false;
        const rejectOnce = (error: WorkspaceStorageError) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(WORKSPACE_OBJECT_STORE)) {
                db.createObjectStore(WORKSPACE_OBJECT_STORE, { keyPath: "key" });
            }
        };
        request.onblocked = () => {
            rejectOnce(new WorkspaceStorageError(
                "blocked",
                "Another ICOGON tab is blocking the workspace database upgrade. Close other ICOGON tabs and retry.",
            ));
        };
        request.onerror = () => {
            rejectOnce(storageError(request.error, "Could not open the workspace database."));
        };
        request.onsuccess = () => {
            const db = request.result;
            if (settled) {
                db.close();
                return;
            }
            settled = true;
            db.onversionchange = () => {
                db.close();
                databasePromise = null;
            };
            resolve(db);
        };
    }).catch((error: unknown) => {
        databasePromise = null;
        throw error;
    });

    return databasePromise;
}

/** A missing IndexedDB implementation may fall back to localStorage.
 * An actual blocked/failed transaction never falls back silently. */
async function getDatabaseOrFallback(): Promise<IDBDatabase | null> {
    if (isIdbUnsupported()) return null;
    try {
        return await openDatabase();
    } catch (error) {
        const converted = storageError(error, "Workspace database is unavailable.");
        if (converted.code === "unavailable") return null;
        throw converted;
    }
}

/* ============================================================
   TRANSACTION HELPERS

   Resolve only on transaction completion, never on request success.
   A successful put request can still roll back if the transaction
   aborts, e.g. because of quota or a browser shutdown.
============================================================ */

function readDatabaseValue(db: IDBDatabase, key: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        let transaction: IDBTransaction;
        try {
            transaction = db.transaction(WORKSPACE_OBJECT_STORE, "readonly");
            const request = transaction.objectStore(WORKSPACE_OBJECT_STORE).get(key);
            let value: unknown;
            request.onsuccess = () => { value = request.result; };
            request.onerror = () => {
                // The transaction will abort; its error handler rejects the promise.
            };
            transaction.oncomplete = () => resolve(value);
            transaction.onerror = () => reject(storageError(transaction.error, "Could not read the workspace database."));
            transaction.onabort = () => reject(storageError(transaction.error, "Workspace read was cancelled."));
        } catch (error) {
            reject(storageError(error, "Could not begin a workspace read."));
        }
    });
}

function removeDatabaseValue(db: IDBDatabase, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(WORKSPACE_OBJECT_STORE, "readwrite");
            transaction.objectStore(WORKSPACE_OBJECT_STORE).delete(key);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(storageError(transaction.error, "Could not remove the saved workspace."));
            transaction.onabort = () => reject(storageError(transaction.error, "Workspace removal was cancelled."));
        } catch (error) {
            reject(storageError(error, "Could not begin workspace removal."));
        }
    });
}

function decodeDatabaseRecord(value: unknown, key: string, scope: WorkspaceSessionScope): DatabaseRecord {
    if (value === undefined) return { status: "missing" };
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { status: "invalid", reason: "IndexedDB workspace record has an invalid structure. It was left untouched." };
    }
    const record = value as Partial<StoredWorkspaceRecord>;
    if (record.key !== key || typeof record.json !== "string" || typeof record.savedAt !== "string") {
        return { status: "invalid", reason: "IndexedDB workspace record has invalid metadata. It was left untouched." };
    }
    const result = deserializeWorkspaceSnapshot(record.json, scope);
    if (result.status === "restored" && result.snapshot.savedAt !== record.savedAt) {
        return { status: "invalid", reason: "IndexedDB workspace timestamp does not match its snapshot. It was left untouched." };
    }
    if (result.status === "restored") return result;
    return { status: "invalid", reason: result.status === "invalid" ? result.reason : "IndexedDB workspace record is unreadable." };
}

/** Atomically check the current record and write a newer or equal snapshot.
 * A corrupted existing record is NEVER silently overwritten. */
function putDatabaseValue(
    db: IDBDatabase,
    key: string,
    json: string,
    snapshot: WorkspaceSessionSnapshot,
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(WORKSPACE_OBJECT_STORE, "readwrite");
            const store = transaction.objectStore(WORKSPACE_OBJECT_STORE);
            const request = store.get(key);
            let abortReason: WorkspaceStorageError | null = null;
            let requestError: unknown;

            request.onsuccess = () => {
                const current = decodeDatabaseRecord(request.result, key, snapshot.scope);
                if (current.status === "invalid") {
                    abortReason = new WorkspaceStorageError("corrupted", current.reason);
                    transaction.abort();
                    return;
                }
                if (current.status === "restored" && Date.parse(current.snapshot.savedAt) > Date.parse(snapshot.savedAt)) {
                    abortReason = new WorkspaceStorageError(
                        "conflict",
                        "A newer workspace session is already saved. Reload the project before saving changes.",
                    );
                    transaction.abort();
                    return;
                }
                const record: StoredWorkspaceRecord = { key, json, savedAt: snapshot.savedAt };
                try {
                    const write = store.put(record);
                    write.onerror = () => { requestError = write.error; };
                } catch (error) {
                    abortReason = storageError(error, "Could not write the workspace session.");
                    transaction.abort();
                }
            };
            request.onerror = () => { requestError = request.error; };
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(storageError(requestError ?? transaction.error, "Workspace save failed."));
            transaction.onabort = () => reject(abortReason ?? storageError(requestError ?? transaction.error, "Workspace save was rolled back."));
        } catch (error) {
            reject(storageError(error, "Could not begin workspace save."));
        }
    });
}

/* ============================================================
   EXISTING v1 LOCALSTORAGE MIGRATION
============================================================ */

function readLegacy(key: string, scope: WorkspaceSessionScope): LegacyRecord {
    let raw: string | null;
    try {
        raw = localStorageOrThrow().getItem(key);
    } catch (error) {
        return { status: "error", reason: describeError(error, "Could not read the previous browser workspace.") };
    }
    if (raw === null) return { status: "missing" };
    const result = deserializeWorkspaceSnapshot(raw, scope);
    if (result.status === "restored") return { status: "restored", snapshot: result.snapshot, raw };
    return {
        status: "invalid",
        raw,
        reason: result.status === "invalid" ? result.reason : "The previous browser workspace could not be restored.",
    };
}

/** Never remove the old copy if another tab has modified it since reading. */
function removeLegacyIfUnchanged(key: string, observedRaw: string): void {
    try {
        const storage = localStorageOrThrow();
        if (storage.getItem(key) === observedRaw) storage.removeItem(key);
    } catch {
        // The IndexedDB transaction already committed. Preserve the copy and
        // retry cleanup on a later load rather than reporting a false save failure.
    }
}

function preferNewer(a: WorkspaceSessionSnapshot, b: WorkspaceSessionSnapshot): boolean {
    return Date.parse(a.savedAt) > Date.parse(b.savedAt);
}

/* ============================================================
   PER-WORKSPACE TASK QUEUE

   Prevent a save/load/remove in this tab from racing another
   operation on the same user and project. IndexedDB readwrite
   transactions also serialize changes across browser tabs.
============================================================ */

const taskQueues = new Map<string, Promise<void>>();

function queueForWorkspace<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = taskQueues.get(key) ?? Promise.resolve();
    const result = previous.then(operation, operation);
    const finished = result.then(() => undefined, () => undefined);
    taskQueues.set(key, finished);
    void finished.then(() => {
        if (taskQueues.get(key) === finished) taskQueues.delete(key);
    });
    return result;
}

/* ============================================================
   PUBLIC ADAPTER API
============================================================ */

/** Choose the newest valid source and migrate v1 data only after a
 * durable IndexedDB commit. A broken IndexedDB record is not erased. */
async function loadSession(scope: WorkspaceSessionScope): Promise<WorkspaceRestoreResult> {
    let key: string;
    try {
        key = getWorkspaceStorageKey(scope);
    } catch (error) {
        return { status: "invalid", reason: describeError(error, "Invalid workspace scope.") };
    }

    return queueForWorkspace(key, async () => {
        try {
            const db = await getDatabaseOrFallback();
            const legacy = readLegacy(key, scope);
            if (!db) {
                if (legacy.status === "restored") return { status: "restored", snapshot: legacy.snapshot };
                if (legacy.status === "invalid") return { status: "invalid", reason: legacy.reason };
                if (legacy.status === "error") return { status: "error", reason: legacy.reason };
                return { status: "missing" };
            }

            const stored = decodeDatabaseRecord(await readDatabaseValue(db, key), key, scope);
            if (stored.status === "invalid") {
                return { status: "invalid", reason: stored.reason };
            }
            if (legacy.status === "error" && stored.status === "missing") {
                return { status: "error", reason: legacy.reason };
            }
            if (legacy.status === "invalid" && stored.status === "missing") {
                return { status: "invalid", reason: legacy.reason };
            }
            if (legacy.status !== "restored") {
                return stored.status === "restored"
                    ? { status: "restored", snapshot: stored.snapshot }
                    : { status: "missing" };
            }

            // An older installed Builder may still write to localStorage until
            // the final integration. Prefer the newest committed snapshot.
            if (stored.status === "restored" && !preferNewer(legacy.snapshot, stored.snapshot)) {
                // Two different snapshots can share a millisecond timestamp. Never
                // discard one merely because its savedAt value happens to be equal.
                if (Date.parse(legacy.snapshot.savedAt) === Date.parse(stored.snapshot.savedAt) &&
                    serializeWorkspaceSnapshot(legacy.snapshot, scope) !== serializeWorkspaceSnapshot(stored.snapshot, scope)) {
                    return {
                        status: "error",
                        reason: "Conflicting workspace checkpoints have the same timestamp. Both were preserved; review them before continuing.",
                    };
                }
                removeLegacyIfUnchanged(key, legacy.raw);
                return { status: "restored", snapshot: stored.snapshot };
            }

            // No durable IndexedDB copy yet, or the legacy copy is newer.
            const json = serializeWorkspaceSnapshot(legacy.snapshot, scope);
            try {
                await putDatabaseValue(db, key, json, legacy.snapshot);
                removeLegacyIfUnchanged(key, legacy.raw);
                return { status: "restored", snapshot: legacy.snapshot };
            } catch (error) {
                if (error instanceof WorkspaceStorageError && error.code === "conflict") {
                    // A second tab saved a newer IndexedDB record during migration.
                    const concurrent = decodeDatabaseRecord(await readDatabaseValue(db, key), key, scope);
                    if (concurrent.status === "restored") return concurrent;
                }
                // Do not claim a successful migration if the commit failed. The
                // original localStorage data remains untouched for recovery.
                return { status: "error", reason: describeError(error, "Could not migrate the workspace to IndexedDB.") };
            }
        } catch (error) {
            return { status: "error", reason: describeError(error, "Unable to restore the workspace.") };
        }
    });
}

/** Save a validated JSON snapshot. Reject stale writes instead of
 * replacing a newer session from another tab or old Builder instance. */
async function saveSession(snapshot: WorkspaceSessionSnapshot): Promise<WorkspaceWriteResult> {
    let key: string;
    let json: string;
    try {
        key = getWorkspaceStorageKey(snapshot.scope);
        json = serializeWorkspaceSnapshot(snapshot);
    } catch (error) {
        return { status: "error", reason: describeError(error, "Workspace snapshot is invalid and was not saved.") };
    }

    return queueForWorkspace(key, async () => {
        try {
            const db = await getDatabaseOrFallback();
            const legacy = readLegacy(key, snapshot.scope);
            if (legacy.status === "error" && !db) {
                return { status: "error", reason: legacy.reason };
            }
            // IndexedDB remains usable even when localStorage is blocked. We do
            // not mutate the inaccessible legacy copy in that case.
            if (legacy.status === "invalid") {
                // Do not overwrite the only surviving legacy checkpoint until
                // a user explicitly chooses to discard/recover its invalid data.
                const existing = db
                    ? decodeDatabaseRecord(await readDatabaseValue(db, key), key, snapshot.scope)
                    : { status: "missing" as const };
                if (existing.status !== "restored") {
                    return { status: "error", reason: `Existing legacy checkpoint is invalid: ${legacy.reason}` };
                }
            }
            if (legacy.status === "restored" && preferNewer(legacy.snapshot, snapshot)) {
                return {
                    status: "error",
                    reason: "A newer local workspace exists. Reload the project before saving changes.",
                };
            }

            if (!db) {
                // Older/locked-down browsers: keep the same validated v1 key.
                // localStorage may reject large snapshots; surface that error.
                localStorageOrThrow().setItem(key, json);
                return { status: "saved" };
            }

            await putDatabaseValue(db, key, json, snapshot);
            if (legacy.status === "restored") removeLegacyIfUnchanged(key, legacy.raw);
            return { status: "saved" };
        } catch (error) {
            return { status: "error", reason: describeError(error, "Workspace could not be saved.") };
        }
    });
}

/** Explicit user-requested removal. Never called automatically on invalid
 * snapshots, so corrupted data remains available for manual recovery. */
async function removeSession(scope: WorkspaceSessionScope): Promise<void> {
    const key = getWorkspaceStorageKey(scope);
    await queueForWorkspace(key, async () => {
        const db = await getDatabaseOrFallback();
        if (db) await removeDatabaseValue(db, key);
        localStorageOrThrow().removeItem(key);
    });
}

/** Returns the current browser storage engine, not a guarantee of quota. */
export async function getWorkspaceStorageBackend(): Promise<WorkspaceStorageBackend> {
    try {
        const db = await getDatabaseOrFallback();
        if (db) return "indexeddb";
        localStorageOrThrow();
        return "localStorage";
    } catch {
        return "unavailable";
    }
}

/** Use this adapter in the forthcoming useWorkspacePersistence hook. */
export const workspacePersistence: WorkspacePersistenceAdapter = {
    load: loadSession,
    save: saveSession,
    remove: removeSession,
};

// Named helpers allow non-React consumers, migrations and tests to share
// exactly the same implementation without making a second store.
export const loadWorkspaceSession = loadSession;
export const saveWorkspaceSession = saveSession;
export const removeWorkspaceSession = removeSession;

export default workspacePersistence;
