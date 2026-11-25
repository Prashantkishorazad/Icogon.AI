/**
 * ICOGON.AI — Phase 2 / File 3
 * Hook connecting Supabase auth to the project management Zustand store.
 *
 * Install at: src/hooks/projects/useProjectManagement.ts
 * Use once in a shared Dashboard/Projects controller; children can use the
 * project store for display. Does not persist user-specific project lists.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    projectStore,
    selectVisibleProjects,
    type ProjectLoadStatus,
    type ProjectOperation,
} from "../../store/projectStore";
import { useProjectStore } from "../../store/projectStore";
import {
    PROJECT_LIFECYCLE_CAPABILITIES,
    type ProjectInput,
    type ProjectListOrder,
    type ProjectRecord,
} from "../../services/projects/projectLifecycle";

export interface UseProjectManagementOptions {
    /** Disable initial fetch when a parent already manages the project list. */
    autoLoad?: boolean;
}

export interface UseProjectManagementResult {
    userId: string | null;
    isAuthLoading: boolean;
    isReady: boolean;
    projects: ProjectRecord[];
    visibleProjects: ProjectRecord[];
    selectedProject: ProjectRecord | null;
    selectedProjectId: string | null;
    searchQuery: string;
    sortOrder: ProjectListOrder;
    loadStatus: ProjectLoadStatus;
    isLoading: boolean;
    error: string | null;
    operationError: string | null;
    pendingOperations: Readonly<Record<string, ProjectOperation>>;
    lastLoadedAt: string | null;
    capabilities: typeof PROJECT_LIFECYCLE_CAPABILITIES;
    setSearchQuery: (query: string) => void;
    setSortOrder: (order: ProjectListOrder) => void;
    selectProject: (id: string | null) => void;
    clearErrors: () => void;
    /** Fetch fresh records. Superseded fetches are cancelled. */
    refresh: () => Promise<ProjectRecord[]>;
    createProject: (input: ProjectInput) => Promise<ProjectRecord>;
    deleteProject: (id: string) => Promise<void>;
    /** Requires the server-side PATCH route before it will succeed. */
    renameProject: (id: string, name: string) => Promise<ProjectRecord>;
}

const normalizeId = (value: string | null | undefined): string | null =>
    typeof value === "string" && value.trim() ? value.trim() : null;

/**
 * Never start network work before Supabase has resolved the user's session.
 * A changed identity resets the global project store and aborts old requests.
 * StrictMode re-mounts are safe: their aborted fetch cannot overwrite a later
 * fetch, because the project store validates both account epoch and token.
 */
export function useProjectManagement(
    { autoLoad = true }: UseProjectManagementOptions = {},
): UseProjectManagementResult {
    const authUserId = useAuthStore((state) => state.user?.id ?? null);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const userId = normalizeId(authUserId);

    const storedUserId = useProjectStore((state) => state.userId);
    const projects = useProjectStore((state) => state.projects);
    const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
    const searchQuery = useProjectStore((state) => state.searchQuery);
    const sortOrder = useProjectStore((state) => state.sortOrder);
    const loadStatus = useProjectStore((state) => state.loadStatus);
    const error = useProjectStore((state) => state.error);
    const operationError = useProjectStore((state) => state.operationError);
    const pendingOperations = useProjectStore((state) => state.pendingOperations);
    const lastLoadedAt = useProjectStore((state) => state.lastLoadedAt);

    // One current list request per hook instance. Never abort a mutation here.
    const activeRequest = useRef<AbortController | null>(null);

    const refresh = useCallback(async (): Promise<ProjectRecord[]> => {
        if (isAuthLoading || !userId) return [];
        const store = projectStore.getState();
        // Do not fetch against the previous account while auth transition effects
        // have not run. Calling refresh manually still reconciles the active scope.
        if (store.userId !== userId) store.setAccount(userId);

        activeRequest.current?.abort();
        const controller = new AbortController();
        activeRequest.current = controller;
        try {
            return await projectStore.getState().refresh({ signal: controller.signal });
        } finally {
            if (activeRequest.current === controller) activeRequest.current = null;
        }
    }, [isAuthLoading, userId]);

    useEffect(() => {
        if (isAuthLoading) return;
        const store = projectStore.getState();
        store.setAccount(userId);

        if (userId && autoLoad) {
            // Background fetch errors are displayed through store.error; they must
            // not become unhandled rejected promises in a React effect.
            void refresh().catch(() => undefined);
        }

        return () => {
            activeRequest.current?.abort();
            activeRequest.current = null;
        };
    }, [userId, isAuthLoading, autoLoad, refresh]);

    // On logout, clear account-scoped records via setAccount(null). No extra
    // localStorage cache is maintained by this hook.
    const visibleProjects = useMemo(
        () => selectVisibleProjects({
            projects,
            searchQuery,
            sortOrder,
        } as Parameters<typeof selectVisibleProjects>[0]),
        [projects, searchQuery, sortOrder],
    );

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) ?? null,
        [projects, selectedProjectId],
    );

    const isReady = !isAuthLoading && Boolean(userId) && storedUserId === userId;

    const createProject = useCallback((input: ProjectInput) => {
        if (isAuthLoading || !userId) return Promise.reject(new Error("Sign in before creating a project."));
        if (projectStore.getState().userId !== userId) return Promise.reject(new Error("Project account is changing."));
        return projectStore.getState().createProject(input);
    }, [isAuthLoading, userId]);

    const deleteProject = useCallback((id: string) => {
        if (isAuthLoading || !userId) return Promise.reject(new Error("Sign in before deleting a project."));
        if (projectStore.getState().userId !== userId) return Promise.reject(new Error("Project account is changing."));
        return projectStore.getState().deleteProject(id);
    }, [isAuthLoading, userId]);

    const renameProject = useCallback((id: string, name: string) => {
        if (isAuthLoading || !userId) return Promise.reject(new Error("Sign in before renaming a project."));
        if (projectStore.getState().userId !== userId) return Promise.reject(new Error("Project account is changing."));
        return projectStore.getState().renameProject(id, name);
    }, [isAuthLoading, userId]);

    return {
        userId,
        isAuthLoading,
        isReady,
        projects,
        visibleProjects,
        selectedProject,
        selectedProjectId,
        searchQuery,
        sortOrder,
        loadStatus,
        isLoading: loadStatus === "loading",
        error,
        operationError,
        pendingOperations,
        lastLoadedAt,
        capabilities: PROJECT_LIFECYCLE_CAPABILITIES,
        setSearchQuery: projectStore.getState().setSearchQuery,
        setSortOrder: projectStore.getState().setSortOrder,
        selectProject: projectStore.getState().selectProject,
        clearErrors: projectStore.getState().clearErrors,
        refresh,
        createProject,
        deleteProject,
        renameProject,
    };
}

export default useProjectManagement;
