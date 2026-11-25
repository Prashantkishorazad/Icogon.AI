import {
    WORKSPACE_SESSION_VERSION,
    type ChatMessage,
    type GeneratedFile,
    type OrchestratorRunEvent,
    type OrchestratorRunStep,
    type PreviewState,
    type RunStage,
    type WorkspaceBuildSnapshot,
    type WorkspacePreferences,
    type WorkspaceRestoreResult,
    type WorkspaceRunRecovery,
    type WorkspaceSessionScope,
    type WorkspaceSessionSnapshot,
} from "../../pages/Builder/types";

/* ============================================================
   WORKSPACE SERIALIZER — PHASE 1

   Pure serialization and validation. No browser storage calls,
   network requests, auth initialization or execution of preview HTML.
   Keep the existing v1 format readable during storage migration.
============================================================ */

export const WORKSPACE_STORAGE_PREFIX = "icogon:builder-session:v1";

// Application safety limits, not a promise about browser storage quotas.
// Reject oversized snapshots rather than truncate source or chat history.
export const MAX_WORKSPACE_SNAPSHOT_BYTES = 32 * 1024 * 1024;
const MAX_JSON_DEPTH = 64;
const MAX_JSON_NODES = 1_000_000;

export type WorkspaceSerializationCode =
    | "invalid"
    | "scope_mismatch"
    | "unsupported_version"
    | "too_large"
    | "not_serializable";

export class WorkspaceSerializationError extends Error {
    readonly code: WorkspaceSerializationCode;

    constructor(code: WorkspaceSerializationCode, message: string) {
        super(message);
        this.name = "WorkspaceSerializationError";
        this.code = code;
    }
}

type RestoreValidation = Extract<WorkspaceRestoreResult,
    { status: "restored" | "invalid" }>;

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function fail(path: string, expected: string): never {
    throw new WorkspaceSerializationError("invalid", `${path}: ${expected}.`);
}

function object(value: unknown, path: string): Record<string, unknown> {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        return fail(path, "expected an object");
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        return fail(path, "expected a plain object");
    }
    return value as Record<string, unknown>;
}

function string(value: unknown, path: string): string {
    return typeof value === "string" ? value : fail(path, "expected a string");
}

function nonEmpty(value: unknown, path: string): string {
    const result = string(value, path);
    return result.trim() ? result : fail(path, "must not be empty");
}

function optionalString(value: unknown, path: string): string | undefined {
    return value === undefined ? undefined : string(value, path);
}

function optionalNullableString(value: unknown, path: string): string | null | undefined {
    return value === null ? null : optionalString(value, path);
}

function boolean(value: unknown, path: string): boolean {
    return typeof value === "boolean" ? value : fail(path, "expected a boolean");
}

function date(value: unknown, path: string): string {
    const text = nonEmpty(value, path);
    return Number.isFinite(Date.parse(text)) ? text : fail(path, "expected a valid timestamp");
}

function sequence(value: unknown, path: string): number {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
        ? value : fail(path, "expected a non-negative safe integer");
}

function choice<T extends string>(value: unknown, values: readonly T[], path: string): T {
    if (typeof value === "string" && values.includes(value as T)) return value as T;
    return fail(path, `expected one of ${values.join(", ")}`);
}

function list<T>(value: unknown, path: string, read: (item: unknown, path: string) => T): T[] {
    if (!Array.isArray(value)) return fail(path, "expected an array");
    return Array.from(value, (item, index) => read(item, `${path}[${index}]`));
}

const stages: readonly RunStage[] = [
    "idle", "queued", "analyzing", "designing", "planning", "generating",
    "reviewing", "repairing", "verifying", "completed", "failed", "cancelled",
];

/* ============================================================
   JSON SAFETY

   API payloads may contain extensible data. Preserve JSON values,
   reject cycles, class instances, sparse arrays and non-finite
   numbers, and omit undefined optional object fields as JSON does.
   Use own properties and never invoke toJSON hooks.
============================================================ */

function cloneJson(value: unknown): JsonValue {
    const ancestors = new Set<object>();
    let nodes = 0;
    const invalid = (path: string, reason: string): never => {
        throw new WorkspaceSerializationError("not_serializable", `${path}: ${reason}.`);
    };
    const visit = (item: unknown, path: string, depth: number): JsonValue => {
        if (++nodes > MAX_JSON_NODES || depth > MAX_JSON_DEPTH) {
            return invalid(path, "JSON structure exceeds safety limits");
        }
        if (item === null) return null;
        if (typeof item === "string" || typeof item === "boolean") return item;
        if (typeof item === "number") {
            return Number.isFinite(item) ? item : invalid(path, "non-finite number");
        }
        if (typeof item !== "object") return invalid(path, "unsupported JSON value");
        if (ancestors.has(item)) return invalid(path, "circular reference");
        ancestors.add(item);
        try {
            if (Array.isArray(item)) {
                if (item.length > MAX_JSON_NODES - nodes) return invalid(path, "array exceeds safety limits");
                const result: JsonValue[] = [];
                for (let index = 0; index < item.length; index++) {
                    const descriptor = Object.getOwnPropertyDescriptor(item, String(index));
                    if (!descriptor || !("value" in descriptor)) return invalid(path, "sparse array or accessor");
                    result.push(visit(descriptor.value, `${path}[${index}]`, depth + 1));
                }
                return result;
            }
            const prototype = Object.getPrototypeOf(item);
            if (prototype !== Object.prototype && prototype !== null) return invalid(path, "non-plain object");
            const result: { [key: string]: JsonValue } = Object.create(null);
            for (const key of Object.keys(item)) {
                const descriptor = Object.getOwnPropertyDescriptor(item, key);
                if (!descriptor || !("value" in descriptor)) return invalid(path, "accessor property");
                if (descriptor.value === undefined) continue;
                // A null-prototype result treats __proto__ as ordinary data.
                result[key] = visit(descriptor.value, `${path}.${key}`, depth + 1);
            }
            return result;
        } finally {
            ancestors.delete(item);
        }
    };
    return visit(value, "snapshot", 0);
}

/* ============================================================
   SCOPE & LEGACY STORAGE KEY
============================================================ */

function readScope(value: unknown, path: string): WorkspaceSessionScope {
    const record = object(value, path);
    return {
        userId: nonEmpty(record.userId, `${path}.userId`),
        projectId: nonEmpty(record.projectId, `${path}.projectId`),
    };
}

/** Matches the key currently used by BuilderWorkspacePage.tsx. */
export function getWorkspaceStorageKey(scope: WorkspaceSessionScope): string {
    const { userId, projectId } = readScope(scope, "scope");
    return `${WORKSPACE_STORAGE_PREFIX}:${encodeURIComponent(userId)}:${encodeURIComponent(projectId)}`;
}

/* ============================================================
   DURABLE WORKSPACE FIELDS
============================================================ */

function readFile(value: unknown, path: string): GeneratedFile {
    const record = object(value, path);
    return {
        path: nonEmpty(record.path, `${path}.path`),
        operation: optionalString(record.operation, `${path}.operation`),
        content: optionalNullableString(record.content, `${path}.content`),
    };
}

function readMessage(value: unknown, path: string): ChatMessage {
    const record = object(value, path);
    return {
        id: nonEmpty(record.id, `${path}.id`),
        role: choice(record.role, ["ai", "user", "system"], `${path}.role`),
        content: string(record.content, `${path}.content`),
        timestamp: record.timestamp === undefined ? undefined : date(record.timestamp, `${path}.timestamp`),
        stage: record.stage === undefined ? undefined : choice(record.stage, stages, `${path}.stage`),
        filesModified: record.filesModified === undefined ? undefined : list(record.filesModified, `${path}.filesModified`, string),
        planSummary: optionalString(record.planSummary, `${path}.planSummary`),
    };
}

function readPreferences(value: unknown, path: string): WorkspacePreferences {
    const record = object(value, path);
    return {
        activeTab: choice(record.activeTab, ["preview", "code"], `${path}.activeTab`),
        deviceMode: choice(record.deviceMode, ["desktop", "tablet", "mobile"], `${path}.deviceMode`),
        sidebarOpen: boolean(record.sidebarOpen, `${path}.sidebarOpen`),
        // The empty path is valid for a project that has no files yet.
        selectedFilePath: string(record.selectedFilePath, `${path}.selectedFilePath`),
    };
}

function readPreview(value: unknown, path: string): PreviewState {
    const record = object(value, path);
    return {
        available: boolean(record.available, `${path}.available`),
        html: optionalString(record.html, `${path}.html`),
        warnings: record.warnings === undefined ? undefined : list(record.warnings, `${path}.warnings`, string),
        compiler: optionalString(record.compiler, `${path}.compiler`),
        error: optionalString(record.error, `${path}.error`),
        // Already detached and JSON-validated by cloneJson. Kept for compatibility
        // with existing preview response metadata. HTML remains inert text here.
        data: record.data,
    };
}

function readBuild(value: unknown, path: string): WorkspaceBuildSnapshot | null {
    if (value === null) return null;
    const record = object(value, path);
    return {
        runId: nonEmpty(record.runId, `${path}.runId`),
        generatedFiles: list(record.generatedFiles, `${path}.generatedFiles`, readFile),
        previewState: readPreview(record.previewState, `${path}.previewState`),
        savedAt: date(record.savedAt, `${path}.savedAt`),
    };
}

/* ============================================================
   RUN RECOVERY CHECKPOINTS
============================================================ */

function readEvent(value: unknown, path: string): OrchestratorRunEvent {
    const record = object(value, path);
    return {
        sequence: sequence(record.sequence, `${path}.sequence`),
        run_id: nonEmpty(record.run_id, `${path}.run_id`),
        event_type: nonEmpty(record.event_type, `${path}.event_type`),
        payload: object(record.payload, `${path}.payload`),
        created_at: record.created_at === undefined ? undefined : date(record.created_at, `${path}.created_at`),
    };
}

function readStep(value: unknown, path: string): OrchestratorRunStep {
    const record = object(value, path);
    return {
        id: nonEmpty(record.id, `${path}.id`),
        name: nonEmpty(record.name, `${path}.name`),
        status: nonEmpty(record.status, `${path}.status`),
        started_at: optionalNullableString(record.started_at, `${path}.started_at`),
        finished_at: optionalNullableString(record.finished_at, `${path}.finished_at`),
        details: record.details === undefined ? undefined : object(record.details, `${path}.details`),
        error: optionalNullableString(record.error, `${path}.error`),
    };
}

function readRecovery(value: unknown, path: string): WorkspaceRunRecovery | null {
    if (value === null) return null;
    const record = object(value, path);
    if (record.kind === "submitting") {
        const key = nonEmpty(record.idempotencyKey, `${path}.idempotencyKey`);
        if (key.length < 8) return fail(`${path}.idempotencyKey`, "key is too short");
        return {
            kind: "submitting",
            prompt: nonEmpty(record.prompt, `${path}.prompt`),
            idempotencyKey: key,
            baseRunId: record.baseRunId === undefined ? undefined : nonEmpty(record.baseRunId, `${path}.baseRunId`),
            quality: choice(record.quality, ["fast", "balanced", "polished"], `${path}.quality`),
            submittedAt: date(record.submittedAt, `${path}.submittedAt`),
            messageId: nonEmpty(record.messageId, `${path}.messageId`),
        };
    }
    if (record.kind !== "tracking") return fail(`${path}.kind`, "unknown recovery state");
    const runId = nonEmpty(record.runId, `${path}.runId`);
    const lastEventSequence = sequence(record.lastEventSequence, `${path}.lastEventSequence`);
    const runEvents = list(record.runEvents, `${path}.runEvents`, readEvent);
    const seen = new Set<number>();
    for (const event of runEvents) {
        if (event.run_id !== runId) return fail(`${path}.runEvents`, "event belongs to a different run");
        if (event.sequence > lastEventSequence) return fail(`${path}.runEvents`, "event is beyond the saved cursor");
        if (seen.has(event.sequence)) return fail(`${path}.runEvents`, "duplicate event sequence");
        seen.add(event.sequence);
    }
    // Never advance the cursor from event data. The controller owns the
    // last applied sequence, including histories that have been compacted.
    return {
        kind: "tracking",
        runId,
        stage: choice(record.stage, stages, `${path}.stage`),
        lastEventSequence,
        runEvents: runEvents.sort((a, b) => a.sequence - b.sequence),
        runSteps: list(record.runSteps, `${path}.runSteps`, readStep),
        runError: string(record.runError, `${path}.runError`),
        updatedAt: date(record.updatedAt, `${path}.updatedAt`),
    };
}

/* ============================================================
   SCHEMA VERSIONING

   Version 1 is the original localStorage format. Add explicit,
   tested migration functions when a future schema is introduced.
   Never reinterpret an unknown version as an empty session.
============================================================ */

function normalizeSnapshot(value: unknown, expectedScope: WorkspaceSessionScope): WorkspaceSessionSnapshot {
    const expected = readScope(expectedScope, "expectedScope");
    const record = object(cloneJson(value), "snapshot");
    if (record.schemaVersion !== WORKSPACE_SESSION_VERSION) {
        throw new WorkspaceSerializationError("unsupported_version", "Unsupported workspace snapshot version. The saved data has not been modified.");
    }
    const scope = readScope(record.scope, "snapshot.scope");
    if (scope.userId !== expected.userId || scope.projectId !== expected.projectId) {
        throw new WorkspaceSerializationError("scope_mismatch", "Saved workspace belongs to a different user or project.");
    }
    // Explicit top-level projection: no user/session tokens, loading flags,
    // controllers, or UI methods from the store are copied into the snapshot.
    return {
        schemaVersion: WORKSPACE_SESSION_VERSION,
        scope,
        savedAt: date(record.savedAt, "snapshot.savedAt"),
        messages: list(record.messages, "snapshot.messages", readMessage),
        draftPrompt: string(record.draftPrompt, "snapshot.draftPrompt"),
        preferences: readPreferences(record.preferences, "snapshot.preferences"),
        generatedFiles: list(record.generatedFiles, "snapshot.generatedFiles", readFile),
        previewState: readPreview(record.previewState, "snapshot.previewState"),
        lastCompletedRunId: record.lastCompletedRunId === null ? null : nonEmpty(record.lastCompletedRunId, "snapshot.lastCompletedRunId"),
        lastSuccessfulBuild: readBuild(record.lastSuccessfulBuild, "snapshot.lastSuccessfulBuild"),
        recovery: readRecovery(record.recovery, "snapshot.recovery"),
    };
}

function assertSize(raw: string): void {
    // Early rejection avoids allocating a UTF-8 buffer for huge inputs.
    if (raw.length > MAX_WORKSPACE_SNAPSHOT_BYTES || new TextEncoder().encode(raw).byteLength > MAX_WORKSPACE_SNAPSHOT_BYTES) {
        throw new WorkspaceSerializationError("too_large", "Workspace snapshot exceeds the 32 MiB serialization limit. No data was truncated.");
    }
}

function encode(snapshot: WorkspaceSessionSnapshot): string {
    const raw = JSON.stringify(snapshot);
    assertSize(raw);
    return raw;
}

function invalidResult(error: unknown): Extract<WorkspaceRestoreResult, { status: "invalid" }> {
    return {
        status: "invalid",
        reason: error instanceof WorkspaceSerializationError ? error.message : "Workspace snapshot could not be validated.",
    };
}

/** Validate a structured snapshot, e.g. a record loaded from IndexedDB. */
export function validateWorkspaceSnapshot(value: unknown, scope: WorkspaceSessionScope): RestoreValidation {
    try {
        const snapshot = normalizeSnapshot(value, scope);
        encode(snapshot);
        return { status: "restored", snapshot };
    } catch (error) {
        return invalidResult(error);
    }
}

/** Validate and encode a snapshot before writing; throws on invalid input. */
export function serializeWorkspaceSnapshot(snapshot: WorkspaceSessionSnapshot, scope: WorkspaceSessionScope = snapshot.scope): string {
    return encode(normalizeSnapshot(snapshot, scope));
}

/** Decode existing v1 localStorage JSON. Only a null record is missing. */
export function deserializeWorkspaceSnapshot(raw: string | null, scope: WorkspaceSessionScope): WorkspaceRestoreResult {
    try {
        readScope(scope, "expectedScope");
        if (raw === null) return { status: "missing" };
        assertSize(raw);
        let value: unknown;
        try {
            value = JSON.parse(raw);
        } catch {
            throw new WorkspaceSerializationError("invalid", "Saved workspace contains invalid JSON. The saved data has not been modified.");
        }
        return validateWorkspaceSnapshot(value, scope);
    } catch (error) {
        return invalidResult(error);
    }
}
