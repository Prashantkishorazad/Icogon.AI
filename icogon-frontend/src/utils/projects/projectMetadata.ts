/**
 * ICOGON.AI — Phase 2 / File 4
 * Project metadata read model and server-authoritative synchronization.
 *
 * Install at: src/utils/projects/projectMetadata.ts
 *
 * The current FastAPI project router has no metadata update/rename route.
 * This file deliberately NEVER mutates names, descriptions, or timestamps
 * locally and calls no speculative PATCH endpoint. Workspace snapshot data
 * is scoped to the same user and project and is for DISPLAY only.
 */

import { projectLifecycle, type ProjectRecord } from "../../services/projects/projectLifecycle";
import { projectStore } from "../../store/projectStore";
import type { WorkspaceSessionSnapshot } from "../../pages/Builder/types";

export interface ProjectMetadata {
    id: string;
    name: string;
    description: string;
    prompt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    /** Always based on server timestamps, never local preview changes. */
    lastServerActivityAt: string | null;
    /** The server may omit user_id; this is NOT an ownership proof. */
    reportedOwnerId: string | null;
}

export interface WorkspaceMetadataSummary {
    projectId: string;
    userId: string;
    savedAt: string;
    fileCount: number;
    chatMessageCount: number;
    hasPreview: boolean;
    lastCompletedRunId: string | null;
    lastSuccessfulBuildAt: string | null;
}

export interface ProjectMetadataWithWorkspace {
    project: ProjectMetadata;
    workspace: WorkspaceMetadataSummary | null;
}

export type ProjectMetadataField = "name" | "description";

export interface ProjectMetadataChange {
    field: ProjectMetadataField;
    originalValue: string;
    requestedValue: string;
    changed: boolean;
    canSave: boolean;
    reason: string | null;
}

export interface MetadataSyncOptions {
    signal?: AbortSignal;
    /** Optional stricter protection when the caller already knows the account. */
    expectedUserId?: string;
}

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 20_000;

function normalizedTimestamp(input: string | null | undefined): string | null {
    if (typeof input !== "string" || !input.trim()) return null;
    const millis = Date.parse(input);
    return Number.isFinite(millis) ? new Date(millis).toISOString() : null;
}

function latestTimestamp(...values: (string | null)[]): string | null {
    let latest: string | null = null;
    for (const value of values) {
        if (value && (!latest || value > latest)) latest = value;
    }
    return latest;
}

function requiredProjectId(id: string): string {
    const normalized = typeof id === "string" ? id.trim() : "";
    if (!normalized) throw new Error("Project ID is required.");
    return normalized;
}

/** Convert a server record into immutable-friendly, display-ready metadata. */
export function readProjectMetadata(project: ProjectRecord): ProjectMetadata {
    const createdAt = normalizedTimestamp(project.created_at);
    const updatedAt = normalizedTimestamp(project.updated_at);
    return {
        id: requiredProjectId(project.id),
        name: project.name,
        description: project.description ?? "",
        prompt: project.prompt ?? null,
        createdAt,
        updatedAt,
        lastServerActivityAt: latestTimestamp(createdAt, updatedAt),
        reportedOwnerId: project.user_id ?? null,
    };
}

/**
 * Read snapshot-level data only after verifying exact account/project scope.
 * Saving browser state is NOT equivalent to updating the server's updated_at.
 */
export function readWorkspaceMetadata(
    snapshot: WorkspaceSessionSnapshot | null | undefined,
    scope: { userId: string; projectId: string },
): WorkspaceMetadataSummary | null {
    if (!snapshot || !scope.userId || !scope.projectId) return null;
    if (snapshot.scope.userId !== scope.userId || snapshot.scope.projectId !== scope.projectId) return null;
    const savedAt = normalizedTimestamp(snapshot.savedAt);
    if (!savedAt) return null;
    const preview = snapshot.previewState;
    const hasPreview = Boolean(
        snapshot.lastSuccessfulBuild ||
        (preview && typeof preview === "object" && Object.values(preview).some((value) =>
            typeof value === "string" && value.trim().length > 0,
        )),
    );
    return {
        projectId: scope.projectId,
        userId: scope.userId,
        savedAt,
        fileCount: snapshot.generatedFiles.length,
        chatMessageCount: snapshot.messages.length,
        hasPreview,
        lastCompletedRunId: snapshot.lastCompletedRunId,
        lastSuccessfulBuildAt: normalizedTimestamp(snapshot.lastSuccessfulBuild?.savedAt),
    };
}

/**
 * Assemble view data without rewriting server metadata or crossing scopes.
 * A missing server owner field is NOT proof of ownership; the backend must
 * enforce permissions when reading the project and its workspace data.
 */
export function combineProjectMetadata(
    project: ProjectRecord,
    snapshot: WorkspaceSessionSnapshot | null | undefined,
    userId: string,
): ProjectMetadataWithWorkspace {
    const metadata = readProjectMetadata(project);
    return {
        project: metadata,
        workspace:
            metadata.reportedOwnerId && metadata.reportedOwnerId !== userId
                ? null
                : readWorkspaceMetadata(snapshot, { userId, projectId: metadata.id }),
    };
}

/**
 * Prepare a UI form change without pretending it has been saved.
 * Name support stays disabled until the backend PATCH route is deployed;
 * description editing also requires a dedicated authenticated API endpoint.
 */
export function prepareMetadataChange(
    project: ProjectRecord,
    field: ProjectMetadataField,
    nextValue: string,
): ProjectMetadataChange {
    if (field !== "name" && field !== "description") {
        throw new Error("Unsupported metadata field.");
    }
    const requestedValue = typeof nextValue === "string" ? nextValue.trim() : "";
    const originalValue = (field === "name" ? project.name : project.description ?? "").trim();
    const limit = field === "name" ? MAX_NAME_LENGTH : MAX_DESCRIPTION_LENGTH;
    const changed = requestedValue !== originalValue;
    const reason = !requestedValue
        ? `${field === "name" ? "Name" : "Description"} cannot be empty.`
        : Array.from(requestedValue).length > limit
            ? `Maximum length is ${limit} characters.`
            : changed
                ? field === "name"
                    ? "Project rename requires PATCH /projects/{id} on the backend."
                    : "Project description updates require a backend endpoint."
                : null;
    return { field, originalValue, requestedValue, changed, canSave: false, reason };
}

/**
 * Reload metadata from the authenticated backend and reconcile the shared
 * project store ONLY if the original account remains active. No local edits.
 * A network cancellation propagates to the caller.
 */
export async function syncProjectMetadata(
    projectId: string,
    options: MetadataSyncOptions = {},
): Promise<ProjectMetadata> {
    const id = requiredProjectId(projectId);
    const before = projectStore.getState();
    const scope = { userId: before.userId, accountEpoch: before.accountEpoch };
    if (!scope.userId) throw new Error("Sign in before synchronizing project metadata.");
    if (options.expectedUserId && options.expectedUserId !== scope.userId) {
        throw new Error("The active account does not match the requested metadata scope.");
    }
    const project = await projectLifecycle.get(id, { signal: options.signal });
    const after = projectStore.getState();
    if (after.userId !== scope.userId || after.accountEpoch !== scope.accountEpoch) {
        throw new Error("Account changed during metadata synchronization; stale response was discarded.");
    }
    if (project.user_id && project.user_id !== scope.userId) {
        throw new Error("Project metadata belongs to another user; response was discarded.");
    }
    if (options.signal?.aborted) {
        throw new Error("Metadata synchronization was cancelled.");
    }
    projectStore.getState().upsertProject(project, {
        userId: scope.userId,
        accountEpoch: scope.accountEpoch,
    });
    return readProjectMetadata(project);
}

/** Format a known timestamp, returning a placeholder for missing data. */
export function formatProjectTimestamp(
    timestamp: string | null | undefined,
    locale?: string,
): string {
    const normalized = normalizedTimestamp(timestamp);
    return normalized
        ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(normalized))
        : "Not available";
}
