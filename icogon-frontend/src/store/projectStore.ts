/**
 * ICOGON.AI — Phase 2 / File 2
 * Project-management state for Dashboard, Projects and Search.
 *
 * Install at: src/stores/projectStore.ts
 *
 * Backend records remain authoritative. Never persist this store to localStorage:
 * a user switch must not reveal another account's cached project data.
 */

import { create } from "zustand";
import {
    projectLifecycle,
    normalizeProjectLifecycleError,
    type ProjectLifecycleError,
    type ProjectInput,
    type ProjectListOrder,
    type ProjectRecord,
} from "../services/projects/projectLifecycle";

export type ProjectOperation = "create" | "delete" | "rename" | "load";
export type ProjectLoadStatus = "idle" | "loading" | "ready" | "error";

export interface ProjectStoreState {
    /** Authenticated Supabase user ID; null means no account is active. */
    userId: string | null;
    /** Incremented for every account transition; used to reject stale results. */
    accountEpoch: number;
    projects: ProjectRecord[];
    selectedProjectId: string | null;
    searchQuery: string;
    sortOrder: ProjectListOrder;
    loadStatus: ProjectLoadStatus;
    error: string | null;
    /** Per-operation errors, separate from background list refresh errors. */
    operationError: string | null;
    pendingOperations: Readonly<Record<string, ProjectOperation>>;
    lastLoadedAt: string | null;

    /** Call when auth resolves, when the user switches accounts, and on logout. */
    setAccount: (userId: string | null | undefined) => void;
    reset: () => void;
    selectProject: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSortOrder: (order: ProjectListOrder) => void;
    clearErrors: () => void;

    /** Network actions: throw typed lifecycle errors to their callers. */
    refresh: (options?: { signal?: AbortSignal }) => Promise<ProjectRecord[]>;
    createProject: (input: ProjectInput) => Promise<ProjectRecord>;
    deleteProject: (id: string) => Promise<void>;
    renameProject: (id: string, name: string) => Promise<ProjectRecord>;
    /** Merge a known server response (e.g. after opening a project). */
    upsertProject: (project: ProjectRecord, scope: { userId: string; accountEpoch: number }) => void;
}

const emptyPending: Readonly<Record<string, ProjectOperation>> = {};
const canonicalUser = (id: string | null | undefined): string | null =>
    typeof id === "string" && id.trim() ? id.trim() : null;

const errorText = (error: unknown, fallback: string): string =>
    normalizeProjectLifecycleError(error, fallback).message;

function initialState() {
    return {
        userId: null as string | null,
        accountEpoch: 0,
        projects: [] as ProjectRecord[],
        selectedProjectId: null as string | null,
        searchQuery: "",
        sortOrder: "recently-edited" as ProjectListOrder,
        loadStatus: "idle" as ProjectLoadStatus,
        error: null as string | null,
        operationError: null as string | null,
        pendingOperations: emptyPending,
        lastLoadedAt: null as string | null,
    };
}

const hasProject = (state: ProjectStoreState, id: string): boolean =>
    state.projects.some((project) => project.id === id);

/**
 * Internal epoch/token handles requests that resolve after a newer refresh.
 * Clearing state on logout is synchronous; an old network response cannot undo it.
 */
let refreshToken = 0;

export const useProjectStore = create<ProjectStoreState>((set, get) => {
    function isCurrent(userId: string, epoch: number): boolean {
        const current = get();
        return current.userId === userId && current.accountEpoch === epoch;
    }

    function activeAccount(): { userId: string; epoch: number } {
        const { userId, accountEpoch } = get();
        if (!userId) {
            throw normalizeProjectLifecycleError(
                { response: { status: 401, data: { detail: "Sign in before managing projects." } } },
                "Authentication required.",
            );
        }
        return { userId, epoch: accountEpoch };
    }

    function markPending(key: string, operation: ProjectOperation): void {
        set((state) => ({
            pendingOperations: { ...state.pendingOperations, [key]: operation },
            operationError: null,
        }));
    }

    function clearPending(key: string, userId: string, epoch: number): void {
        if (!isCurrent(userId, epoch)) return;
        set((state) => {
            const next = { ...state.pendingOperations };
            delete next[key];
            return { pendingOperations: next };
        });
    }

    return {
        ...initialState(),

        setAccount(userId) {
            const normalized = canonicalUser(userId);
            if (get().userId === normalized) return;
            refreshToken += 1;
            set((state) => ({
                ...initialState(),
                userId: normalized,
                accountEpoch: state.accountEpoch + 1,
            }));
        },

        reset() {
            refreshToken += 1;
            set((state) => ({ ...initialState(), accountEpoch: state.accountEpoch + 1 }));
        },

        selectProject(id) {
            const normalized = typeof id === "string" ? id.trim() : null;
            set({ selectedProjectId: normalized || null });
        },

        setSearchQuery(query) {
            set({ searchQuery: query });
        },

        setSortOrder(order) {
            set({ sortOrder: order });
        },

        clearErrors() {
            set({ error: null, operationError: null });
        },

        async refresh(options = {}) {
            const { userId, epoch } = activeAccount();
            const token = ++refreshToken;
            set({ loadStatus: "loading", error: null });
            try {
                // Do not pass search: display filtering is local, so the list is complete.
                const projects = await projectLifecycle.list({ signal: options.signal });
                if (isCurrent(userId, epoch) && token === refreshToken) {
                    set((state) => ({
                        projects,
                        loadStatus: "ready",
                        lastLoadedAt: new Date().toISOString(),
                        selectedProjectId:
                            state.selectedProjectId && projects.some((p) => p.id === state.selectedProjectId)
                                ? state.selectedProjectId
                                : null,
                    }));
                }
                return projects;
            } catch (error) {
                const normalized = normalizeProjectLifecycleError(error, "Could not load projects.");
                if (isCurrent(userId, epoch) && token === refreshToken) {
                    set({
                        loadStatus: normalized.code === "ABORTED" ? (get().projects.length ? "ready" : "idle") : "error",
                        error: normalized.code === "ABORTED" ? null : normalized.message,
                    });
                }
                throw normalized;
            }
        },

        async createProject(input) {
            const { userId, epoch } = activeAccount();
            const key = "create";
            if (get().pendingOperations[key]) {
                throw normalizeProjectLifecycleError(
                    { response: { status: 409, data: { detail: "A project creation is already in progress." } } },
                    "Project creation in progress.",
                );
            }
            markPending(key, "create");
            try {
                const project = await projectLifecycle.create(input);
                if (isCurrent(userId, epoch)) {
                    // Any in-flight project list predates this mutation and must not overwrite it.
                    refreshToken += 1;
                    set((state) => ({
                        projects: [project, ...state.projects.filter((item) => item.id !== project.id)],
                        selectedProjectId: project.id,
                        loadStatus: "ready",
                    }));
                }
                return project;
            } catch (error) {
                if (isCurrent(userId, epoch)) set({ operationError: errorText(error, "Could not create project.") });
                throw normalizeProjectLifecycleError(error, "Could not create project.");
            } finally {
                clearPending(key, userId, epoch);
            }
        },

        async deleteProject(id) {
            const { userId, epoch } = activeAccount();
            const key = `project:${id}`;
            if (get().pendingOperations[key]) {
                throw normalizeProjectLifecycleError(
                    { response: { status: 409, data: { detail: "This project already has an operation in progress." } } },
                    "Project operation in progress.",
                );
            }
            markPending(key, "delete");
            try {
                // Do not remove optimistically: backend deletion is permanent and can fail.
                await projectLifecycle.delete(id);
                if (isCurrent(userId, epoch)) {
                    refreshToken += 1;
                    set((state) => ({
                        projects: state.projects.filter((project) => project.id !== id),
                        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
                    }));
                }
            } catch (error) {
                if (isCurrent(userId, epoch)) set({ operationError: errorText(error, "Could not delete project.") });
                throw normalizeProjectLifecycleError(error, "Could not delete project.");
            } finally {
                clearPending(key, userId, epoch);
            }
        },

        async renameProject(id, name) {
            const { userId, epoch } = activeAccount();
            const key = `project:${id}`;
            if (get().pendingOperations[key]) {
                throw normalizeProjectLifecycleError(
                    { response: { status: 409, data: { detail: "This project already has an operation in progress." } } },
                    "Project operation in progress.",
                );
            }
            markPending(key, "rename");
            try {
                // Phase 2 File 1 intentionally rejects this until PATCH is deployed.
                const project = await projectLifecycle.rename(id, name);
                if (isCurrent(userId, epoch)) {
                    refreshToken += 1;
                    set((state) => ({
                        projects: state.projects.map((item) => item.id === project.id ? project : item),
                    }));
                }
                return project;
            } catch (error) {
                if (isCurrent(userId, epoch)) set({ operationError: errorText(error, "Could not rename project.") });
                throw normalizeProjectLifecycleError(error, "Could not rename project.");
            } finally {
                clearPending(key, userId, epoch);
            }
        },

        upsertProject(project, scope) {
            if (!project.id || !isCurrent(scope.userId, scope.accountEpoch)) return;
            // Require the caller to pass its original account scope so a delayed
            // response cannot insert a project after logout or an account switch.
            const state = get();
            if (project.user_id && project.user_id !== state.userId) return;
            refreshToken += 1;
            set({
                projects: [project, ...state.projects.filter((item) => item.id !== project.id)],
            });
        },
    };
});

/** Use selectors for display; never rewrite project list state to filter it. */
export function selectVisibleProjects(state: ProjectStoreState): ProjectRecord[] {
    const query = state.searchQuery.trim().toLocaleLowerCase();
    const filtered = query
        ? state.projects.filter((p) => `${p.name} ${p.description ?? ""} ${p.prompt ?? ""}`.toLocaleLowerCase().includes(query))
        : state.projects;
    const result = [...filtered];
    const timestamp = (value: string | null | undefined) => {
        const ms = Date.parse(value || "");
        return Number.isFinite(ms) ? ms : 0;
    };
    const order = state.sortOrder;
    result.sort((a, b) => {
        if (order === "name") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) || a.id.localeCompare(b.id);
        if (order === "oldest") return timestamp(a.created_at) - timestamp(b.created_at) || a.id.localeCompare(b.id);
        if (order === "newest") return timestamp(b.created_at) - timestamp(a.created_at) || a.id.localeCompare(b.id);
        return timestamp(b.updated_at || b.created_at) - timestamp(a.updated_at || a.created_at) || a.id.localeCompare(b.id);
    });
    return result;
}

export const selectSelectedProject = (state: ProjectStoreState): ProjectRecord | null =>
    state.selectedProjectId && hasProject(state, state.selectedProjectId)
        ? state.projects.find((p) => p.id === state.selectedProjectId) ?? null
        : null;

export const projectStore = useProjectStore;
export type { ProjectLifecycleError };
