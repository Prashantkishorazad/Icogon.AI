/**
 * ICOGON.AI — Phase 2 / File 7
 * Project access preflight for project-specific routes and operations.
 *
 * Place at: src/services/projects/projectAccess.ts
 *
 * Important: this is a UX guard, NOT an authorization boundary. The FastAPI
 * /projects/{id} endpoint must check ownership on every request (and the
 * database must have appropriate access policies). Never use local project
 * lists or client-controlled user_id fields as proof of ownership.
 */

import { useAuthStore } from "../../store/authStore";
import {
    projectLifecycle,
    normalizeProjectLifecycleError,
    type ProjectRecord,
} from "./projectLifecycle";

/** The auth identity and epoch used to invalidate in-flight checks. */
export interface ProjectAccessIdentity {
    userId: string | null;
    sessionEpoch: number;
    isLoading: boolean;
    isAuthenticated: boolean;
    isSigningOut: boolean;
}

export type ProjectAccessResult =
    | { status: "allowed"; project: ProjectRecord; userId: string }
    | { status: "auth-loading" }
    | { status: "unauthenticated" }
    | { status: "invalid-project" }
    | { status: "forbidden" }
    | { status: "not-found" }
    | { status: "aborted" }
    | { status: "stale" }
    | { status: "error"; message: string };

export interface ProjectAccessOptions {
    /** Propagate cancellation from a route loader or component effect. */
    signal?: AbortSignal;
    /** The identity the caller expects to remain active during this check. */
    expectedUserId?: string;
}

export interface ProjectAccessDependencies {
    readIdentity: () => ProjectAccessIdentity;
    /** Must fetch from the ownership-enforcing backend, not from local cache. */
    fetchProject: (projectId: string, options: { signal?: AbortSignal }) => Promise<ProjectRecord>;
}

function readCurrentIdentity(): ProjectAccessIdentity {
    const state = useAuthStore.getState();
    return {
        userId: state.user?.id ?? null,
        sessionEpoch: state.sessionEpoch,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        isSigningOut: state.isSigningOut,
    };
}

const defaultDependencies: ProjectAccessDependencies = {
    readIdentity: readCurrentIdentity,
    fetchProject: (projectId, options) => projectLifecycle.get(projectId, options),
};

function normalizeId(value: string): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed && trimmed.length <= 256 ? trimmed : null;
}

function isSameIdentity(a: ProjectAccessIdentity, b: ProjectAccessIdentity): boolean {
    return a.userId === b.userId && a.sessionEpoch === b.sessionEpoch;
}

/**
 * Testable factory: the production instance uses the existing auth store and
 * project API. A check never grants access based on an unverified local record.
 */
export function createProjectAccessService(
    dependencies: ProjectAccessDependencies = defaultDependencies,
) {
    async function check(
        projectId: string,
        options: ProjectAccessOptions = {},
    ): Promise<ProjectAccessResult> {
        if (options.signal?.aborted) return { status: "aborted" };
        const id = normalizeId(projectId);
        if (!id) return { status: "invalid-project" };

        const startingIdentity = dependencies.readIdentity();
        if (startingIdentity.isLoading) return { status: "auth-loading" };
        if (
            startingIdentity.isSigningOut ||
            !startingIdentity.isAuthenticated ||
            !startingIdentity.userId
        ) {
            return { status: "unauthenticated" };
        }
        if (
            options.expectedUserId !== undefined &&
            options.expectedUserId !== startingIdentity.userId
        ) {
            return { status: "stale" };
        }

        try {
            const project = await dependencies.fetchProject(id, { signal: options.signal });
            if (options.signal?.aborted) return { status: "aborted" };

            const currentIdentity = dependencies.readIdentity();
            if (!isSameIdentity(startingIdentity, currentIdentity)) {
                return { status: "stale" };
            }
            if (currentIdentity.isLoading || currentIdentity.isSigningOut || !currentIdentity.isAuthenticated) {
                return { status: "stale" };
            }

            // Reject malformed/mismatched backend responses. If user_id is absent,
            // rely on the backend's authenticated, ownership-filtered GET endpoint.
            if (!project || project.id !== id) return { status: "error", message: "Project response did not match the requested project." };
            if (project.user_id != null && project.user_id !== currentIdentity.userId) {
                return { status: "forbidden" };
            }
            return { status: "allowed", project, userId: currentIdentity.userId! };
        } catch (error) {
            if (options.signal?.aborted) return { status: "aborted" };
            const currentIdentity = dependencies.readIdentity();
            if (!isSameIdentity(startingIdentity, currentIdentity) || currentIdentity.isSigningOut) {
                return { status: "stale" };
            }
            const normalized = normalizeProjectLifecycleError(error, "Unable to verify project access.");
            switch (normalized.code) {
                case "ABORTED": return { status: "aborted" };
                case "UNAUTHENTICATED": return { status: "unauthenticated" };
                case "FORBIDDEN": return { status: "forbidden" };
                case "NOT_FOUND": return { status: "not-found" };
                default: return { status: "error", message: normalized.message };
            }
        }
    }

    /**
     * Return a verified project, or throw a typed error for mutation handlers.
     * Route UIs should generally prefer `check()` for status-specific rendering.
     */
    async function requireAccess(
        projectId: string,
        options: ProjectAccessOptions = {},
    ): Promise<ProjectRecord> {
        const result = await check(projectId, options);
        if (result.status === "allowed") return result.project;
        throw new ProjectAccessError(result);
    }

    return { check, requireAccess };
}

export type ProjectAccessFailure = Exclude<ProjectAccessResult, { status: "allowed" }>;

export class ProjectAccessError extends Error {
    readonly status: ProjectAccessFailure["status"];

    constructor(result: ProjectAccessFailure) {
        const messages: Record<ProjectAccessFailure["status"], string> = {
            "auth-loading": "Authentication is still loading.",
            unauthenticated: "Sign in to open this project.",
            "invalid-project": "Invalid project ID.",
            forbidden: "You do not have access to this project.",
            "not-found": "Project not found or no longer accessible.",
            aborted: "Project access check was cancelled.",
            stale: "Your account changed while the project was loading.",
            error: "Unable to verify project access.",
        };
        super(result.status === "error" ? result.message : messages[result.status]);
        this.name = "ProjectAccessError";
        this.status = result.status;
    }
}

export const projectAccess = createProjectAccessService();
