import { useCallback, useEffect, useRef } from "react";
import type {
    WorkspacePersistenceAdapter,
    WorkspaceSessionScope,
    WorkspaceSessionSnapshot,
} from "../../pages/Builder/types";
import { builderStore, useBuilderStore } from "../../store/builderStore";
import { workspacePersistence } from "../../services/builder/workspacePersistence";

/**
 * ICOGON Builder — Phase 1 / File 15
 *
 * One hook instance coordinates one authenticated user/project scope.
 * The Zustand store owns live state; the persistence adapter owns durable data.
 * This hook is intentionally not a second state store.
 *
 * Important: use the hook once in the workspace controller, not in individual
 * sidebar / preview / editor components.
 */

export interface UseWorkspacePersistenceOptions {
    /** Signed-in Supabase user ID. Null disables restoration and writing. */
    userId: string | null | undefined;
    /** Project ID from the authenticated Builder route. */
    projectId: string | null | undefined;
    /** Autosave delay in milliseconds (default 700, allowed 100–10,000). */
    debounceMs?: number;
    /** Override only for tests or alternative adapters. */
    adapter?: WorkspacePersistenceAdapter;
}

export interface UseWorkspacePersistenceResult {
    hydrationStatus: "idle" | "restoring" | "ready" | "error";
    saveStatus: "idle" | "saving" | "saved" | "error";
    storageError: string;
    dirty: boolean;
    lastSavedAt: string | null;
    /** Explicitly persist the latest revision, without waiting for debounce. */
    saveNow: () => Promise<boolean>;
    /** Retry a failed save, or restoration if it has not completed. */
    retry: () => Promise<boolean>;
}

type ActiveContext = {
    scope: WorkspaceSessionScope;
    epoch: number;
    disposed: boolean;
    hydrated: boolean;
    loadToken: number;
    timer: ReturnType<typeof setTimeout> | null;
    /** Serializes saves from this hook, including pagehide and manual saves. */
    pending: Promise<unknown>;
    save: () => Promise<boolean>;
    restore: () => Promise<boolean>;
};

function sameScope(a: WorkspaceSessionScope | null, b: WorkspaceSessionScope): boolean {
    return a?.userId === b.userId && a.projectId === b.projectId;
}

function errorText(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

function safeDebounce(value?: number): number {
    if (typeof value !== "number" || !Number.isFinite(value)) return 700;
    return Math.max(100, Math.min(10_000, Math.round(value)));
}

/**
 * Save a detached snapshot, even if its component is unmounting. This is used
 * for the previous project during a route change. It never updates the next
 * project's Zustand status.
 */
async function saveDetached(
    adapter: WorkspacePersistenceAdapter,
    snapshot: WorkspaceSessionSnapshot,
): Promise<void> {
    try {
        const result = await adapter.save(snapshot);
        if (result.status === "error") {
            console.error("ICOGON: previous workspace could not be persisted:", result.reason);
        }
    } catch (error) {
        console.error("ICOGON: previous workspace could not be persisted:", error);
    }
}

export function useWorkspacePersistence({
    userId,
    projectId,
    debounceMs = 700,
    adapter = workspacePersistence,
}: UseWorkspacePersistenceOptions): UseWorkspacePersistenceResult {
    const hydrationStatus = useBuilderStore((state) => state.hydrationStatus);
    const saveStatus = useBuilderStore((state) => state.saveStatus);
    const storageError = useBuilderStore((state) => state.storageError);
    const dirty = useBuilderStore((state) => state.dirty);
    const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);

    const contextRef = useRef<ActiveContext | null>(null);
    const delay = safeDebounce(debounceMs);
    const validUserId = userId?.trim() || "";
    const validProjectId = projectId?.trim() || "";

    useEffect(() => {
        if (!validUserId || !validProjectId) {
            // Do not expose another account's workspace after sign-out.
            builderStore.getState().clearScope();
            contextRef.current = null;
            return;
        }

        const scope: WorkspaceSessionScope = { userId: validUserId, projectId: validProjectId };
        const epoch = builderStore.getState().activateScope(scope);

        const context: ActiveContext = {
            scope,
            epoch,
            disposed: false,
            hydrated: false,
            loadToken: 0,
            timer: null,
            pending: Promise.resolve(),
            save: async () => false,
            restore: async () => false,
        };
        contextRef.current = context;

        const isCurrent = () => {
            const state = builderStore.getState();
            return !context.disposed && contextRef.current === context &&
                state.scopeEpoch === epoch && sameScope(state.scope, scope);
        };

        const clearTimer = () => {
            if (context.timer !== null) {
                clearTimeout(context.timer);
                context.timer = null;
            }
        };

        const save = async (): Promise<boolean> => {
            clearTimer();
            if (!context.hydrated || !isCurrent()) return false;
            const state = builderStore.getState();
            if (!state.dirty) return true;

            const revision = state.revision;
            const snapshot = state.createSnapshot();
            if (!snapshot || !isCurrent()) return false;

            builderStore.getState().setSaveStatus("saving", "", epoch);
            const work = async (): Promise<boolean> => {
                try {
                    const result = await adapter.save(snapshot);
                    if (result.status === "error") {
                        if (isCurrent()) builderStore.getState().reportStorageError(result.reason, epoch);
                        return false;
                    }
                    if (isCurrent()) {
                        builderStore.getState().acknowledgeSaved(revision, snapshot.savedAt, epoch);
                        // A later edit may have arrived while the write was pending.
                        // The subscriber schedules that newer revision separately.
                        if (builderStore.getState().dirty && builderStore.getState().revision !== revision) {
                            schedule();
                        }
                    }
                    return true;
                } catch (error) {
                    if (isCurrent()) {
                        builderStore.getState().reportStorageError(
                            errorText(error, "Unable to save the workspace."), epoch,
                        );
                    }
                    return false;
                }
            };
            const promise = context.pending.then(work, work);
            context.pending = promise;
            return promise;
        };

        const schedule = () => {
            if (!context.hydrated || !isCurrent()) return;
            clearTimer();
            context.timer = setTimeout(() => {
                context.timer = null;
                void save();
            }, delay);
        };

        const restore = async (): Promise<boolean> => {
            if (!isCurrent()) return false;
            // Never overwrite local user edits with a late restoration response.
            if (builderStore.getState().revision !== 0) {
                builderStore.getState().setHydrationStatus("error", epoch);
                builderStore.getState().reportStorageError(
                    "Workspace changed before restoration completed. Saved data was not overwritten. Reload to reconcile.",
                    epoch,
                );
                return false;
            }
            const token = ++context.loadToken;
            builderStore.getState().setHydrationStatus("restoring", epoch);
            try {
                const result = await adapter.load(scope);
                if (!isCurrent() || token !== context.loadToken) return false;
                if (builderStore.getState().revision !== 0) {
                    builderStore.getState().setHydrationStatus("error", epoch);
                    builderStore.getState().reportStorageError(
                        "Workspace changed while saved data was loading. No saved data was replaced.", epoch,
                    );
                    return false;
                }
                if (result.status === "restored") {
                    if (!builderStore.getState().restoreSnapshot(result.snapshot, epoch)) return false;
                } else if (result.status === "missing") {
                    builderStore.getState().setHydrationStatus("ready", epoch);
                } else {
                    builderStore.getState().setHydrationStatus("error", epoch);
                    builderStore.getState().reportStorageError(result.reason, epoch);
                    return false;
                }
                context.hydrated = true;
                if (builderStore.getState().dirty) schedule();
                return true;
            } catch (error) {
                if (isCurrent()) {
                    builderStore.getState().setHydrationStatus("error", epoch);
                    builderStore.getState().reportStorageError(
                        errorText(error, "Unable to restore the workspace."), epoch,
                    );
                }
                return false;
            }
        };

        context.save = save;
        context.restore = restore;

        const unsubscribe = builderStore.subscribe((state, previous) => {
            if (!isCurrent() || !context.hydrated) return;
            if (state.revision !== previous.revision && state.dirty) schedule();
        });

        // Flush on tab hide; pagehide is a best-effort fallback because browsers
        // do not guarantee that asynchronous IndexedDB work finishes on unload.
        const flushOnHide = () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                void save();
            }
        };
        const flushOnPageHide = () => { void save(); };
        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", flushOnHide);
        }
        if (typeof window !== "undefined") {
            window.addEventListener("pagehide", flushOnPageHide);
        }

        void restore();

        return () => {
            unsubscribe();
            if (typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", flushOnHide);
            }
            if (typeof window !== "undefined") {
                window.removeEventListener("pagehide", flushOnPageHide);
            }
            clearTimer();
            // Save a snapshot captured before scope changes. An in-flight save uses
            // its own previously captured snapshot and cannot mutate a new scope.
            const state = builderStore.getState();
            if (context.hydrated && state.dirty && state.scopeEpoch === epoch && sameScope(state.scope, scope)) {
                const snapshot = state.createSnapshot();
                if (snapshot) {
                    void context.pending.then(() => saveDetached(adapter, snapshot));
                }
            }
            context.disposed = true;
            if (contextRef.current === context) contextRef.current = null;
        };
    }, [adapter, delay, validUserId, validProjectId]);

    const saveNow = useCallback(async (): Promise<boolean> => {
        return contextRef.current?.save() ?? false;
    }, []);

    const retry = useCallback(async (): Promise<boolean> => {
        const context = contextRef.current;
        if (!context) return false;
        if (!context.hydrated) return context.restore();
        return context.save();
    }, []);

    return { hydrationStatus, saveStatus, storageError, dirty, lastSavedAt, saveNow, retry };
}

export default useWorkspacePersistence;
