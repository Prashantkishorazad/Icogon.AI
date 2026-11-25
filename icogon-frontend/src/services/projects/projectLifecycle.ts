/**
 * ICOGON.AI — Phase 2 / File 1
 * Project lifecycle facade for the existing authenticated project API.
 *
 * Place at: src/services/projects/projectLifecycle.ts
 *
 * Deliberately DOES NOT invent archive, version, or cloning endpoints.
 * The archived FastAPI project router supports list/create/get/delete; its
 * PATCH rename endpoint is not yet implemented. Keep feature flags in sync
 * with the deployed backend before enabling additional UI actions.
 */

import {
    createProjectApi,
    deleteProjectApi,
    getProjectApi,
    getProjectsApi,
    updateProjectNameApi,
    type ProjectCreate,
    type ProjectResponse,
    type ProjectRequestOptions,
} from "../../api/projectApi";

export type ProjectRecord = ProjectResponse;
export type ProjectInput = ProjectCreate;
export type ProjectListOrder = "recently-edited" | "newest" | "oldest" | "name";

/** Describe deployed capabilities, not merely functions present in the client. */
export interface ProjectLifecycleCapabilities {
    readonly list: boolean;
    readonly create: boolean;
    readonly read: boolean;
    readonly delete: boolean;
    readonly rename: boolean;
    readonly duplicate: boolean;
    readonly archive: boolean;
    readonly restore: boolean;
}

/** Update only after the matching server routes and ownership checks ship. */
export const PROJECT_LIFECYCLE_CAPABILITIES: Readonly<ProjectLifecycleCapabilities> =
    Object.freeze({
        list: true,
        create: true,
        read: true,
        delete: true,
        rename: false,
        duplicate: false,
        archive: false,
        restore: false,
    });

export type ProjectLifecycleErrorCode =
    | "VALIDATION"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNSUPPORTED"
    | "ABORTED"
    | "NETWORK"
    | "UNKNOWN";

export class ProjectLifecycleError extends Error {
    readonly code: ProjectLifecycleErrorCode;
    readonly httpStatus?: number;

    constructor(code: ProjectLifecycleErrorCode, message: string, httpStatus?: number) {
        super(message);
        this.name = "ProjectLifecycleError";
        this.code = code;
        this.httpStatus = httpStatus;
    }
}

export interface ListProjectsOptions extends ProjectRequestOptions {
    order?: ProjectListOrder;
    search?: string;
}

export interface ProjectLifecycleDependencies {
    list: typeof getProjectsApi;
    get: typeof getProjectApi;
    create: typeof createProjectApi;
    remove: typeof deleteProjectApi;
    rename: typeof updateProjectNameApi;
}

const defaultDependencies: ProjectLifecycleDependencies = {
    list: getProjectsApi,
    get: getProjectApi,
    create: createProjectApi,
    remove: deleteProjectApi,
    rename: updateProjectNameApi,
};

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 20_000;

function normalizedId(id: string): string {
    if (typeof id !== "string" || !id.trim()) {
        throw new ProjectLifecycleError("VALIDATION", "Project ID is required.");
    }
    return id.trim();
}

function normalizedName(name: string): string {
    if (typeof name !== "string" || !name.trim()) {
        throw new ProjectLifecycleError("VALIDATION", "Project name is required.");
    }
    const normalized = name.trim();
    if (Array.from(normalized).length > MAX_NAME_LENGTH) {
        throw new ProjectLifecycleError("VALIDATION", `Project name must be ${MAX_NAME_LENGTH} characters or fewer.`);
    }
    return normalized;
}

function normalizedDescription(description: string): string {
    if (typeof description !== "string" || !description.trim()) {
        throw new ProjectLifecycleError("VALIDATION", "Project description is required.");
    }
    const normalized = description.trim();
    if (Array.from(normalized).length > MAX_DESCRIPTION_LENGTH) {
        throw new ProjectLifecycleError("VALIDATION", `Project description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
    }
    return normalized;
}

function normalizeError(error: unknown, fallback: string): ProjectLifecycleError {
    if (error instanceof ProjectLifecycleError) return error;

    if (error instanceof Error && (error.name === "AbortError" || error.name === "CanceledError")) {
        return new ProjectLifecycleError("ABORTED", "Project request was cancelled.");
    }

    const candidate = error as {
        code?: unknown;
        message?: unknown;
        response?: { status?: unknown; data?: { detail?: unknown; message?: unknown } };
    } | null;
    if (candidate?.code === "ERR_CANCELED") {
        return new ProjectLifecycleError("ABORTED", "Project request was cancelled.");
    }

    const status = candidate?.response?.status;
    const httpStatus = typeof status === "number" ? status : undefined;
    const detail = candidate?.response?.data?.detail;
    const apiMessage = candidate?.response?.data?.message;
    const message =
        (typeof detail === "string" && detail.trim()) ||
        (typeof apiMessage === "string" && apiMessage.trim()) ||
        (typeof candidate?.message === "string" && candidate.message.trim()) ||
        fallback;

    const code: ProjectLifecycleErrorCode =
        httpStatus === 401 ? "UNAUTHENTICATED" :
            httpStatus === 403 ? "FORBIDDEN" :
                httpStatus === 404 ? "NOT_FOUND" :
                    httpStatus === 409 ? "CONFLICT" :
                        httpStatus === undefined && (candidate?.code === "ERR_NETWORK" || candidate?.code === "ECONNABORTED") ? "NETWORK" :
                            "UNKNOWN";

    return new ProjectLifecycleError(code, message, httpStatus);
}

function readTimestamp(project: ProjectRecord): number {
    const raw = project.updated_at || project.created_at;
    if (!raw) return 0;
    const value = Date.parse(raw);
    return Number.isFinite(value) ? value : 0;
}

function sortProjects(projects: ProjectRecord[], order: ProjectListOrder): ProjectRecord[] {
    const sorted = [...projects];
    if (order === "name") {
        return sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) || a.id.localeCompare(b.id));
    }
    if (order === "oldest") {
        return sorted.sort((a, b) => Date.parse(a.created_at || "") - Date.parse(b.created_at || "") || a.id.localeCompare(b.id));
    }
    if (order === "newest") {
        return sorted.sort((a, b) => (Date.parse(b.created_at || "") || 0) - (Date.parse(a.created_at || "") || 0) || a.id.localeCompare(b.id));
    }
    return sorted.sort((a, b) => readTimestamp(b) - readTimestamp(a) || a.id.localeCompare(b.id));
}

function unsupported(operation: string): never {
    throw new ProjectLifecycleError(
        "UNSUPPORTED",
        `${operation} is not available in the current ICOGON backend. Implement and secure the server endpoint first.`,
    );
}

/**
 * Factory permits deterministic unit tests with mocked API functions.
 * No cached user/project data: the authenticated server is authoritative.
 */
export function createProjectLifecycleService(
    dependencies: ProjectLifecycleDependencies = defaultDependencies,
    capabilities: Readonly<ProjectLifecycleCapabilities> = PROJECT_LIFECYCLE_CAPABILITIES,
) {
    return {
        capabilities,

        async list(options: ListProjectsOptions = {}): Promise<ProjectRecord[]> {
            try {
                const records = await dependencies.list({ signal: options.signal });
                if (!Array.isArray(records)) {
                    throw new ProjectLifecycleError("UNKNOWN", "Project API returned an invalid project list.");
                }
                const query = options.search?.trim().toLocaleLowerCase();
                const filtered = query
                    ? records.filter((project) =>
                        `${project.name} ${project.description ?? ""} ${project.prompt ?? ""}`
                            .toLocaleLowerCase()
                            .includes(query),
                    )
                    : records;
                return sortProjects(filtered, options.order ?? "recently-edited");
            } catch (error) {
                throw normalizeError(error, "Failed to load projects.");
            }
        },

        async get(id: string, options: ProjectRequestOptions = {}): Promise<ProjectRecord> {
            const projectId = normalizedId(id);
            try {
                const project = await dependencies.get(projectId, options);
                if (!project || project.id !== projectId) {
                    throw new ProjectLifecycleError("UNKNOWN", "Project response does not match the requested ID.");
                }
                return project;
            } catch (error) {
                throw normalizeError(error, "Failed to load project.");
            }
        },

        async create(input: ProjectInput): Promise<ProjectRecord> {
            const payload = {
                name: normalizedName(input.name),
                description: normalizedDescription(input.description),
            };
            try {
                const project = await dependencies.create(payload);
                if (!project?.id || !project.name) {
                    throw new ProjectLifecycleError("UNKNOWN", "Project creation returned an invalid response.");
                }
                return project;
            } catch (error) {
                throw normalizeError(error, "Failed to create project.");
            }
        },

        /** Permanent server deletion; caller is responsible for UI confirmation. */
        async delete(id: string): Promise<void> {
            const projectId = normalizedId(id);
            try {
                await dependencies.remove(projectId);
            } catch (error) {
                throw normalizeError(error, "Failed to delete project.");
            }
        },

        /** Requires PATCH /projects/{id} on the deployed FastAPI backend. */
        async rename(id: string, name: string): Promise<ProjectRecord> {
            const projectId = normalizedId(id);
            const cleanName = normalizedName(name);
            if (!capabilities.rename) unsupported("Project rename");
            try {
                const project = await dependencies.rename(projectId, cleanName);
                if (!project || project.id !== projectId) {
                    throw new ProjectLifecycleError("UNKNOWN", "Rename response does not match the requested project.");
                }
                return project;
            } catch (error) {
                throw normalizeError(error, "Failed to rename project.");
            }
        },

        /** A complete duplicate must include generated files and version history. */
        duplicate(id: string): Promise<ProjectRecord> {
            void id;
            return Promise.reject(new ProjectLifecycleError("UNSUPPORTED", "Project duplication needs a server-side copy endpoint that also copies project assets."));
        },

        archive(id: string): Promise<ProjectRecord> {
            void id;
            return Promise.reject(new ProjectLifecycleError("UNSUPPORTED", "Project archiving needs a backend archive/status field and endpoint."));
        },

        restore(id: string): Promise<ProjectRecord> {
            void id
            return Promise.reject(new ProjectLifecycleError("UNSUPPORTED", "Project restoration needs a backend restore endpoint."));
        },
    };
}

export const projectLifecycle = createProjectLifecycleService();
export { normalizeError as normalizeProjectLifecycleError };
