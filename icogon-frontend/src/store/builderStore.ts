import { create } from "zustand";
import type {
    ChatMessage,
    DeviceMode,
    GeneratedFile,
    OrchestratorRunEvent,
    OrchestratorRunStep,
    PreviewState,
    RunStage,
    WorkspaceBuildSnapshot,
    WorkspaceHydrationStatus,
    WorkspacePreferences,
    WorkspaceRunRecovery,
    WorkspaceSaveStatus,
    WorkspaceSessionScope,
    WorkspaceSessionSnapshot,
    WorkspaceTab,
} from "../pages/Builder/types";
import { WORKSPACE_SESSION_VERSION } from "../pages/Builder/types";
import { validateWorkspaceSnapshot } from "../utils/builder/workspaceSerializer";

/**
 * Phase 1 / File 14 — Builder state store.
 *
 * This store is deliberately *in-memory*. Supabase owns authentication,
 * workspacePersistence owns durable storage, and runRecovery owns networking.
 * The future persistence hook will connect those services to this store.
 *
 * Only one project is active at a time. `activateScope` clears the previous
 * project synchronously so account and project transitions cannot show stale
 * code, chat, previews or checkpoints while the next project loads.
 */

export interface BuilderWorkspaceData {
    messages: ChatMessage[];
    draftPrompt: string;
    preferences: WorkspacePreferences;
    generatedFiles: GeneratedFile[];
    previewState: PreviewState;
    lastCompletedRunId: string | null;
    lastSuccessfulBuild: WorkspaceBuildSnapshot | null;
    recovery: WorkspaceRunRecovery | null;
}

export interface BuilderRuntimeState {
    activeRunId: string | null;
    runStage: RunStage;
    runEvents: OrchestratorRunEvent[];
    runSteps: OrchestratorRunStep[];
    runError: string;
    isSending: boolean;
    isCancelling: boolean;
    isRefreshing: boolean;
    isFullscreen: boolean;
}

export interface BuilderSessionStatus {
    hydrationStatus: WorkspaceHydrationStatus;
    saveStatus: WorkspaceSaveStatus;
    storageError: string;
    dirty: boolean;
    revision: number;
    lastSavedAt: string | null;
}

export interface BuilderStoreState
    extends BuilderWorkspaceData, BuilderRuntimeState, BuilderSessionStatus {
    scope: WorkspaceSessionScope | null;
    /** Incremented on every scope switch; async effects can compare this. */
    scopeEpoch: number;

    activateScope: (scope: WorkspaceSessionScope) => number;
    clearScope: () => void;
    restoreSnapshot: (snapshot: WorkspaceSessionSnapshot, epoch?: number) => boolean;
    createSnapshot: () => WorkspaceSessionSnapshot | null;

    setMessages: (messages: ChatMessage[], scope?: WorkspaceSessionScope) => void;
    appendMessage: (message: ChatMessage, scope?: WorkspaceSessionScope) => void;
    setDraftPrompt: (value: string, scope?: WorkspaceSessionScope) => void;
    updatePreferences: (patch: Partial<WorkspacePreferences>, scope?: WorkspaceSessionScope) => void;
    setActiveTab: (tab: WorkspaceTab, scope?: WorkspaceSessionScope) => void;
    setDeviceMode: (mode: DeviceMode, scope?: WorkspaceSessionScope) => void;
    setSidebarOpen: (open: boolean, scope?: WorkspaceSessionScope) => void;
    setSelectedFilePath: (path: string, scope?: WorkspaceSessionScope) => void;
    setGeneratedFiles: (files: GeneratedFile[], scope?: WorkspaceSessionScope) => void;
    setPreviewState: (preview: PreviewState, scope?: WorkspaceSessionScope) => void;
    setLastCompletedRunId: (runId: string | null, scope?: WorkspaceSessionScope) => void;
    setLastSuccessfulBuild: (build: WorkspaceBuildSnapshot | null, scope?: WorkspaceSessionScope) => void;
    setRecovery: (checkpoint: WorkspaceRunRecovery | null, scope?: WorkspaceSessionScope) => void;

    updateRuntime: (patch: Partial<BuilderRuntimeState>, scope?: WorkspaceSessionScope) => void;
    setHydrationStatus: (status: WorkspaceHydrationStatus, epoch?: number) => void;
    setSaveStatus: (status: WorkspaceSaveStatus, error?: string, epoch?: number) => void;
    acknowledgeSaved: (savedRevision: number, savedAt?: string, epoch?: number) => void;
    reportStorageError: (error: string, epoch?: number) => void;
}

const defaultPreferences = (): WorkspacePreferences => ({
    activeTab: "preview",
    deviceMode: "desktop",
    sidebarOpen: true,
    selectedFilePath: "src/App.tsx",
});

const defaultWorkspace = (): BuilderWorkspaceData => ({
    messages: [],
    draftPrompt: "",
    preferences: defaultPreferences(),
    generatedFiles: [],
    previewState: { available: false, data: null },
    lastCompletedRunId: null,
    lastSuccessfulBuild: null,
    recovery: null,
});

const defaultRuntime = (): BuilderRuntimeState => ({
    activeRunId: null,
    runStage: "idle",
    runEvents: [],
    runSteps: [],
    runError: "",
    isSending: false,
    isCancelling: false,
    isRefreshing: false,
    isFullscreen: false,
});

const defaultStatus = (): BuilderSessionStatus => ({
    hydrationStatus: "idle",
    saveStatus: "idle",
    storageError: "",
    dirty: false,
    revision: 0,
    lastSavedAt: null,
});

const matchesScope = (
    active: WorkspaceSessionScope | null,
    expected?: WorkspaceSessionScope,
): boolean =>
    active !== null &&
    (!expected || (active.userId === expected.userId && active.projectId === expected.projectId));

const isSameScope = (a: WorkspaceSessionScope | null, b: WorkspaceSessionScope): boolean =>
    a !== null && a.userId === b.userId && a.projectId === b.projectId;

/** Updates to durable fields advance revision, allowing saves to ignore stale acknowledgements. */
const changed = (state: BuilderStoreState) => ({
    dirty: true,
    revision: state.revision + 1,
    saveStatus: "idle" as const,
});

/** Independent copies prevent external callers from mutating store arrays in place. */
const copyFiles = (files: GeneratedFile[]): GeneratedFile[] => files.map((file) => ({ ...file }));
const copyMessages = (messages: ChatMessage[]): ChatMessage[] =>
    messages.map((message) => ({
        ...message,
        filesModified: message.filesModified?.slice(),
    }));

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
    scope: null,
    scopeEpoch: 0,
    ...defaultWorkspace(),
    ...defaultRuntime(),
    ...defaultStatus(),

    activateScope: (scope) => {
        if (!scope.userId.trim() || !scope.projectId.trim()) {
            throw new Error("A Builder session requires a user ID and project ID.");
        }
        if (isSameScope(get().scope, scope)) return get().scopeEpoch;
        const nextEpoch = get().scopeEpoch + 1;
        set({
            scope: { userId: scope.userId, projectId: scope.projectId },
            scopeEpoch: nextEpoch,
            ...defaultWorkspace(),
            ...defaultRuntime(),
            ...defaultStatus(),
            hydrationStatus: "restoring",
        });
        return nextEpoch;
    },

    clearScope: () => {
        set((state) => ({
            scope: null,
            scopeEpoch: state.scopeEpoch + 1,
            ...defaultWorkspace(),
            ...defaultRuntime(),
            ...defaultStatus(),
        }));
    },

    restoreSnapshot: (snapshot, epoch) => {
        const state = get();
        if (!state.scope || (epoch !== undefined && epoch !== state.scopeEpoch)) return false;
        const result = validateWorkspaceSnapshot(snapshot, state.scope);
        if (result.status !== "restored") {
            set({ hydrationStatus: "error", storageError: result.reason });
            return false;
        }
        const restored = result.snapshot;
        set({
            messages: restored.messages,
            draftPrompt: restored.draftPrompt,
            preferences: restored.preferences,
            generatedFiles: restored.generatedFiles,
            previewState: restored.previewState,
            lastCompletedRunId: restored.lastCompletedRunId,
            lastSuccessfulBuild: restored.lastSuccessfulBuild,
            recovery: restored.recovery,
            // UI transient flags do not survive a refresh; run recovery decides
            // whether a saved checkpoint is genuinely still active.
            ...defaultRuntime(),
            activeRunId: restored.recovery?.kind === "tracking" ? restored.recovery.runId : null,
            runStage: restored.recovery?.kind === "tracking" ? restored.recovery.stage : "idle",
            runEvents: restored.recovery?.kind === "tracking" ? restored.recovery.runEvents : [],
            runSteps: restored.recovery?.kind === "tracking" ? restored.recovery.runSteps : [],
            runError: restored.recovery?.kind === "tracking" ? restored.recovery.runError : "",
            hydrationStatus: "ready",
            saveStatus: "saved",
            storageError: "",
            dirty: false,
            revision: 0,
            lastSavedAt: restored.savedAt,
        });
        return true;
    },

    createSnapshot: () => {
        const state = get();
        if (!state.scope) return null;
        const snapshot: WorkspaceSessionSnapshot = {
            schemaVersion: WORKSPACE_SESSION_VERSION,
            scope: { ...state.scope },
            savedAt: new Date().toISOString(),
            messages: copyMessages(state.messages),
            draftPrompt: state.draftPrompt,
            preferences: { ...state.preferences },
            generatedFiles: copyFiles(state.generatedFiles),
            previewState: { ...state.previewState },
            lastCompletedRunId: state.lastCompletedRunId,
            lastSuccessfulBuild: state.lastSuccessfulBuild
                ? { ...state.lastSuccessfulBuild, generatedFiles: copyFiles(state.lastSuccessfulBuild.generatedFiles), previewState: { ...state.lastSuccessfulBuild.previewState } }
                : null,
            recovery: state.recovery,
        };
        const result = validateWorkspaceSnapshot(snapshot, state.scope);
        if (result.status !== "restored") {
            get().reportStorageError(result.reason);
            return null;
        }
        return result.snapshot;
    },

    setMessages: (messages, scope) => set((state) =>
        matchesScope(state.scope, scope) ? { messages: copyMessages(messages), ...changed(state) } : state),

    appendMessage: (message, scope) => set((state) =>
        matchesScope(state.scope, scope) && !state.messages.some((item) => item.id === message.id)
            ? { messages: [...state.messages, ...copyMessages([message])], ...changed(state) }
            : state),

    setDraftPrompt: (value, scope) => set((state) =>
        matchesScope(state.scope, scope) && state.draftPrompt !== value
            ? { draftPrompt: value, ...changed(state) } : state),

    updatePreferences: (patch, scope) => set((state) => {
        if (!matchesScope(state.scope, scope)) return state;
        const preferences = { ...state.preferences, ...patch };
        return Object.keys(patch).some((key) =>
            preferences[key as keyof WorkspacePreferences] !== state.preferences[key as keyof WorkspacePreferences])
            ? { preferences, ...changed(state) } : state;
    }),

    setActiveTab: (tab, scope) => get().updatePreferences({ activeTab: tab }, scope),
    setDeviceMode: (mode, scope) => get().updatePreferences({ deviceMode: mode }, scope),
    setSidebarOpen: (open, scope) => get().updatePreferences({ sidebarOpen: open }, scope),
    setSelectedFilePath: (path, scope) => get().updatePreferences({ selectedFilePath: path }, scope),

    setGeneratedFiles: (files, scope) => set((state) =>
        matchesScope(state.scope, scope) ? { generatedFiles: copyFiles(files), ...changed(state) } : state),

    setPreviewState: (preview, scope) => set((state) =>
        matchesScope(state.scope, scope) ? { previewState: { ...preview }, ...changed(state) } : state),

    setLastCompletedRunId: (runId, scope) => set((state) =>
        matchesScope(state.scope, scope) && state.lastCompletedRunId !== runId
            ? { lastCompletedRunId: runId, ...changed(state) } : state),

    setLastSuccessfulBuild: (build, scope) => set((state) =>
        matchesScope(state.scope, scope)
            ? { lastSuccessfulBuild: build ? { ...build, generatedFiles: copyFiles(build.generatedFiles), previewState: { ...build.previewState } } : null, ...changed(state) }
            : state),

    setRecovery: (checkpoint, scope) => set((state) =>
        matchesScope(state.scope, scope) ? { recovery: checkpoint, ...changed(state) } : state),

    updateRuntime: (patch, scope) => set((state) =>
        matchesScope(state.scope, scope) ? { ...patch } : state),

    setHydrationStatus: (status, epoch) => set((state) =>
        epoch !== undefined && epoch !== state.scopeEpoch ? state : { hydrationStatus: status }),

    setSaveStatus: (status, error = "", epoch) => set((state) =>
        epoch !== undefined && epoch !== state.scopeEpoch ? state : {
            saveStatus: status,
            storageError: error,
        }),

    acknowledgeSaved: (savedRevision, savedAt, epoch) => set((state) => {
        if (epoch !== undefined && epoch !== state.scopeEpoch) return state;
        // A successful write of an old revision must not clear a newer dirty state.
        if (savedRevision !== state.revision) return state;
        return {
            dirty: false,
            saveStatus: "saved",
            storageError: "",
            lastSavedAt: savedAt ?? new Date().toISOString(),
        };
    }),

    reportStorageError: (error, epoch) => set((state) =>
        epoch !== undefined && epoch !== state.scopeEpoch ? state : {
            saveStatus: "error",
            storageError: error,
        }),
}));

/** Non-hook access for persistence services and external event handlers. */
export const builderStore = useBuilderStore;

export const selectBuilderScope = (state: BuilderStoreState) => state.scope;
export const selectBuilderPreferences = (state: BuilderStoreState) => state.preferences;
export const selectBuilderMessages = (state: BuilderStoreState) => state.messages;
export const selectBuilderPreview = (state: BuilderStoreState) => state.previewState;
export const selectBuilderGeneratedFiles = (state: BuilderStoreState) => state.generatedFiles;
export const selectBuilderRecovery = (state: BuilderStoreState) => state.recovery;
