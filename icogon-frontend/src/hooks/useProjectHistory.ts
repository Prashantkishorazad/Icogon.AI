
import {
    useCallback,
    useMemo,
    useSyncExternalStore,
} from "react";

const DISCOVERY_HISTORY_PREFIX = "icogon:discovery-history";
const MAX_RECENT_PROJECTS = 10;

interface ProjectHistoryEntry {
    projectId: string;
    viewedAt: string;
}

type ProjectHistory = Record<string, ProjectHistoryEntry>;

/* =========================================================
   TYPES
========================================================= */

interface UseProjectHistoryResult {
    history: ProjectHistory;
    recentEntries: ProjectHistoryEntry[];

    recordProjectView: (
        projectId: string,
    ) => void;

    removeProjectHistory: (
        projectId: string,
    ) => void;

    clearHistory: () => void;

    getLastViewedAt: (
        projectId: string,
    ) => string | null;

    hasViewedProject: (
        projectId: string,
    ) => boolean;
}

/* =========================================================
   CONSTANTS
========================================================= */

const HISTORY_EVENT =
    "icogon:project-history-updated";

const EMPTY_SNAPSHOT = "{}";

// In-memory fallback when localStorage is unavailable.
const memoryHistory = new Map<string, string>();

/* =========================================================
   USER-SPECIFIC STORAGE KEY
========================================================= */

const getStorageKey = (
    userId?: string | null,
): string | null => {
    if (!userId?.trim()) return null;

    return `${DISCOVERY_HISTORY_PREFIX}:${encodeURIComponent(
        userId.trim(),
    )}`;
};

/* =========================================================
   READ STORAGE SNAPSHOT
========================================================= */

const readSnapshot = (
    key: string | null,
): string => {
    if (!key || typeof window === "undefined") {
        return EMPTY_SNAPSHOT;
    }

    const fallback = memoryHistory.get(key);

    if (fallback !== undefined) {
        return fallback;
    }

    try {
        return (
            window.localStorage.getItem(key) ??
            EMPTY_SNAPSHOT
        );
    } catch {
        return EMPTY_SNAPSHOT;
    }
};

/* =========================================================
   SORT AND LIMIT HISTORY
========================================================= */

const normalizeHistory = (
    entries: ProjectHistoryEntry[],
): ProjectHistory => {
    const unique = new Map<
        string,
        ProjectHistoryEntry
    >();

    for (const entry of entries) {
        const existing = unique.get(entry.projectId);

        if (
            !existing ||
            Date.parse(entry.viewedAt) >
            Date.parse(existing.viewedAt)
        ) {
            unique.set(entry.projectId, entry);
        }
    }

    return Object.fromEntries(
        Array.from(unique.values())
            .sort(
                (first, second) =>
                    Date.parse(second.viewedAt) -
                    Date.parse(first.viewedAt),
            )
            .slice(0, MAX_RECENT_PROJECTS)
            .map((entry) => [
                entry.projectId,
                entry,
            ]),
    );
};

/* =========================================================
   SAFE HISTORY PARSER
========================================================= */

const parseHistory = (
    snapshot: string,
): ProjectHistory => {
    try {
        const parsed: unknown =
            JSON.parse(snapshot);

        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        const entries: ProjectHistoryEntry[] = [];

        for (const value of Object.values(parsed)) {
            if (
                !value ||
                typeof value !== "object"
            ) {
                continue;
            }

            const entry =
                value as Partial<ProjectHistoryEntry>;

            if (
                typeof entry.projectId !== "string" ||
                !entry.projectId.trim() ||
                typeof entry.viewedAt !== "string" ||
                !Number.isFinite(
                    Date.parse(entry.viewedAt),
                )
            ) {
                continue;
            }

            entries.push({
                projectId: entry.projectId.trim(),
                viewedAt: new Date(
                    entry.viewedAt,
                ).toISOString(),
            });
        }

        return normalizeHistory(entries);
    } catch {
        return {};
    }
};

/* =========================================================
   SAVE HISTORY
========================================================= */

const saveHistory = (
    key: string,
    history: ProjectHistory,
): void => {
    if (typeof window === "undefined") {
        return;
    }

    const snapshot = JSON.stringify(history);

    try {
        window.localStorage.setItem(
            key,
            snapshot,
        );

        memoryHistory.delete(key);
    } catch {
        // Continue working during the current session
        // even if browser storage is blocked or full.
        memoryHistory.set(key, snapshot);
    }

    // Synchronize components in the same browser tab.
    window.dispatchEvent(
        new CustomEvent(HISTORY_EVENT, {
            detail: { key },
        }),
    );
};

/* =========================================================
   MAIN HOOK
========================================================= */

export const useProjectHistory = (
    userId?: string | null,
): UseProjectHistoryResult => {
    const storageKey = getStorageKey(userId);

    /* =======================================================
       STORAGE SUBSCRIPTION
    ======================================================= */

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            if (
                !storageKey ||
                typeof window === "undefined"
            ) {
                return () => { };
            }

            // Synchronize multiple browser tabs.
            const handleStorage = (
                event: StorageEvent,
            ) => {
                if (
                    event.key === storageKey ||
                    event.key === null
                ) {
                    memoryHistory.delete(storageKey);
                    onStoreChange();
                }
            };

            // Synchronize multiple hook instances.
            const handleHistoryUpdate = (
                event: Event,
            ) => {
                const customEvent =
                    event as CustomEvent<{
                        key: string;
                    }>;

                if (
                    customEvent.detail?.key === storageKey
                ) {
                    onStoreChange();
                }
            };

            window.addEventListener(
                "storage",
                handleStorage,
            );

            window.addEventListener(
                HISTORY_EVENT,
                handleHistoryUpdate,
            );

            return () => {
                window.removeEventListener(
                    "storage",
                    handleStorage,
                );

                window.removeEventListener(
                    HISTORY_EVENT,
                    handleHistoryUpdate,
                );
            };
        },
        [storageKey],
    );

    const getSnapshot = useCallback(
        () => readSnapshot(storageKey),
        [storageKey],
    );

    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => EMPTY_SNAPSHOT,
    );

    /* =======================================================
       HISTORY STATE
    ======================================================= */

    const history = useMemo(
        () => parseHistory(snapshot),
        [snapshot],
    );

    /* =======================================================
       RECENT ENTRIES
    ======================================================= */

    const recentEntries = useMemo(
        () =>
            Object.values(history).sort(
                (first, second) =>
                    Date.parse(second.viewedAt) -
                    Date.parse(first.viewedAt),
            ),
        [history],
    );

    /* =======================================================
       RECORD PROJECT VIEW
    ======================================================= */

    const recordProjectView = useCallback(
        (projectId: string) => {
            if (!storageKey || !projectId.trim()) {
                return;
            }

            const id = projectId.trim();

            const currentHistory = parseHistory(
                readSnapshot(storageKey),
            );

            const nextHistory = normalizeHistory([
                ...Object.values(currentHistory),
                {
                    projectId: id,
                    viewedAt: new Date().toISOString(),
                },
            ]);

            saveHistory(
                storageKey,
                nextHistory,
            );
        },
        [storageKey],
    );

    /* =======================================================
       REMOVE INDIVIDUAL PROJECT
    ======================================================= */

    const removeProjectHistory = useCallback(
        (projectId: string) => {
            if (!storageKey) return;

            const currentHistory = parseHistory(
                readSnapshot(storageKey),
            );

            const nextHistory = normalizeHistory(
                Object.values(currentHistory).filter(
                    (entry) =>
                        entry.projectId !== projectId.trim(),
                ),
            );

            saveHistory(
                storageKey,
                nextHistory,
            );
        },
        [storageKey],
    );

    /* =======================================================
       CLEAR VIEWING HISTORY
    ======================================================= */

    const clearHistory = useCallback(() => {
        if (!storageKey) return;

        saveHistory(storageKey, {});
    }, [storageKey]);

    /* =======================================================
       GET LAST VIEWED DATE
    ======================================================= */

    const getLastViewedAt = useCallback(
        (projectId: string): string | null => {
            const entry = history[projectId.trim()];

            return entry?.viewedAt ?? null;
        },
        [history],
    );

    /* =======================================================
       CHECK VIEWING STATUS
    ======================================================= */

    const hasViewedProject = useCallback(
        (projectId: string): boolean => {
            return Object.prototype.hasOwnProperty.call(
                history,
                projectId.trim(),
            );
        },
        [history],
    );

    /* =======================================================
       RETURN
    ======================================================= */

    return {
        history,
        recentEntries,

        recordProjectView,

        removeProjectHistory,
        clearHistory,

        getLastViewedAt,
        hasViewedProject,
    };
};

export default useProjectHistory;
