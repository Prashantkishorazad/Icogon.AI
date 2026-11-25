import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { getProjectsApi } from "../api/projectApi";

import { useAuthStore } from "../store/authStore";

import { useProjectHistory } from "./useProjectHistory";

import {
    getProjectLastViewedAt,
    parseProjectDate,
    sortProjectsByViewed,
} from "../utils/projectDates";

type DiscoveryProject = Parameters<
    typeof getProjectLastViewedAt
>[0] & {
    user_id?: string | null;
    name?: string;
    description?: string | null;
    prompt?: string | null;
    owner_name?: string;
    status?: string;
    visibility?: string;
    tags?: string[];
};

type ProjectHistory = Parameters<
    typeof getProjectLastViewedAt
>[1];

type ProjectSortBy = "created" | "viewed" | "updated" | "name";

type SortDirection = "asc" | "desc";

interface UseProjectDiscoveryResult {
    projects: DiscoveryProject[];
    recentProjects: DiscoveryProject[];
    filteredProjects: DiscoveryProject[];
    filteredRecentProjects: DiscoveryProject[];
    history: ProjectHistory;
    loading: boolean;
    error: string | null;
    refreshProjects: () => Promise<void>;
    recordProjectView: ReturnType<
        typeof useProjectHistory
    >["recordProjectView"];
}

/* =========================================================
   TYPES
========================================================= */

export interface UseProjectDiscoveryOptions {
    query?: string;
    sortBy?: ProjectSortBy;
    sortDirection?: SortDirection;
}

interface ProjectSnapshot {
    userId: string;
    projects: DiscoveryProject[];
    loading: boolean;
    error: string | null;
}

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_PROJECTS: DiscoveryProject[] = [];

/* =========================================================
   NORMALIZE PROJECTS
   Remove invalid and duplicate project records.
========================================================= */

const normalizeProjects = (
    projects: DiscoveryProject[],
): DiscoveryProject[] => {
    const unique = new Map<string, DiscoveryProject>();

    for (const project of projects) {
        if (
            !project ||
            typeof project.id !== "string" ||
            !project.id.trim() ||
            typeof project.name !== "string"
        ) {
            continue;
        }

        unique.set(project.id, project);
    }

    return Array.from(unique.values());
};

/* =========================================================
   NORMALIZE SEARCH TEXT
========================================================= */

const normalizeSearchText = (
    value: string,
): string =>
    value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .trim();

/* =========================================================
   PROJECT SEARCH ENGINE
========================================================= */

const filterProjects = (
    projects: DiscoveryProject[],
    query: string,
): DiscoveryProject[] => {
    const normalizedQuery =
        normalizeSearchText(query);

    if (!normalizedQuery) {
        return projects;
    }

    const searchWords =
        normalizedQuery.split(/\s+/);

    return projects.filter((project) => {
        const searchableText =
            normalizeSearchText(
                [
                    project.name,
                    project.description,
                    project.prompt,
                    project.owner_name,
                    project.status,
                    project.visibility,
                    ...(project.tags || []),
                ]
                    .filter(Boolean)
                    .join(" "),
            );

        return searchWords.every((word) =>
            searchableText.includes(word),
        );
    });
};

/* =========================================================
   PROJECT SORT TIMESTAMP
========================================================= */

const getSortTimestamp = (
    project: DiscoveryProject,
    sortBy: ProjectSortBy,
    history: ProjectHistory,
): number | null => {
    switch (sortBy) {
        case "created":
            return (
                parseProjectDate(project.created_at)
                    ?.getTime() ?? null
            );

        case "viewed":
            return (
                parseProjectDate(
                    getProjectLastViewedAt(
                        project,
                        history,
                    ),
                )?.getTime() ?? null
            );

        case "updated":
            return (
                parseProjectDate(project.updated_at)
                    ?.getTime() ??
                parseProjectDate(project.created_at)
                    ?.getTime() ??
                null
            );

        default:
            return null;
    }
};

/* =========================================================
   PROJECT SORTING ENGINE
========================================================= */

const sortProjects = (
    projects: DiscoveryProject[],
    sortBy: ProjectSortBy,
    sortDirection: SortDirection,
    history: ProjectHistory,
): DiscoveryProject[] => {
    const direction =
        sortDirection === "asc" ? 1 : -1;

    return [...projects].sort((first, second) => {
        if (sortBy === "name") {
            return (
                (first.name ?? "").localeCompare(
                    second.name ?? "",
                    undefined,
                    {
                        sensitivity: "base",
                        numeric: true,
                    },
                ) * direction
            );
        }

        const firstTimestamp =
            getSortTimestamp(
                first,
                sortBy,
                history,
            );

        const secondTimestamp =
            getSortTimestamp(
                second,
                sortBy,
                history,
            );

        // Projects without timestamps always appear last.
        if (firstTimestamp === null) {
            if (secondTimestamp !== null) {
                return 1;
            }
        } else if (secondTimestamp === null) {
            return -1;
        } else if (
            firstTimestamp !== secondTimestamp
        ) {
            return (
                (firstTimestamp - secondTimestamp) *
                direction
            );
        }

        // Deterministic fallback when timestamps match.
        return (first.name ?? "").localeCompare(
            second.name ?? "",
            undefined,
            {
                sensitivity: "base",
                numeric: true,
            },
        );
    });
};

/* =========================================================
   MAIN PROJECT DISCOVERY HOOK
========================================================= */

export const useProjectDiscovery = ({
    query = "",
    sortBy = "updated",
    sortDirection = "desc",
}: UseProjectDiscoveryOptions = {}): UseProjectDiscoveryResult => {
    /* =======================================================
       AUTHENTICATION
    ======================================================= */

    const user = useAuthStore(
        (state) => state.user,
    );

    const userId = user?.id ?? null;

    /* =======================================================
       PROJECT HISTORY
    ======================================================= */

    const {
        history,
        recordProjectView,
    } = useProjectHistory(userId);

    /* =======================================================
       PROJECT STATE
    ======================================================= */

    const [snapshot, setSnapshot] =
        useState<ProjectSnapshot | null>(null);

    // Prevent outdated API requests from replacing newer data.
    const requestIdRef = useRef(0);

    /* =======================================================
       FETCH PROJECTS
    ======================================================= */

    const refreshProjects = useCallback(
        async (): Promise<void> => {
            const requestId =
                ++requestIdRef.current;

            if (!userId) {
                setSnapshot(null);
                return;
            }

            setSnapshot((previous) => ({
                userId,

                projects:
                    previous?.userId === userId
                        ? previous.projects
                        : [],

                loading: true,
                error: null,
            }));

            try {
                const response =
                    await getProjectsApi();

                if (
                    requestId !== requestIdRef.current
                ) {
                    return;
                }

                if (!Array.isArray(response)) {
                    throw new Error(
                        "Invalid project response received.",
                    );
                }

                const normalizedProjects =
                    normalizeProjects(response);

                setSnapshot({
                    userId,
                    projects: normalizedProjects,
                    loading: false,
                    error: null,
                });
            } catch (error: unknown) {
                if (
                    requestId !== requestIdRef.current
                ) {
                    return;
                }

                const message =
                    error instanceof Error &&
                    error.message.trim()
                        ? error.message
                        : "Unable to load your projects.";

                // Preserve existing projects if refreshing fails.
                setSnapshot((previous) => ({
                    userId,

                    projects:
                        previous?.userId === userId
                            ? previous.projects
                            : [],

                    loading: false,
                    error: message,
                }));
            }
        },
        [userId],
    );

    /* =======================================================
       INITIAL LOAD AND ACCOUNT CHANGES
    ======================================================= */

    useEffect(() => {
        let active = true;

        void Promise.resolve().then(() => {
            if (active) {
                void refreshProjects();
            }
        });

        return () => {
            active = false;

            // Invalidate pending responses on unmount
            // or when the authenticated account changes.
            requestIdRef.current += 1;
        };
    }, [refreshProjects]);

    /* =======================================================
       ACCOUNT ISOLATION
       Never display another account's cached projects.
    ======================================================= */

    const accountMatches =
        Boolean(userId) &&
        snapshot?.userId === userId;

    const allProjects = accountMatches
        ? snapshot!.projects
        : EMPTY_PROJECTS;

    const loading = Boolean(
        userId &&
        (!accountMatches || snapshot?.loading),
    );

    const error = accountMatches
        ? snapshot?.error ?? null
        : null;

    /* =======================================================
       MY PROJECTS
    ======================================================= */

    const projects = useMemo(() => {
        const ownedProjects = allProjects.filter(
            (project) =>
                !project.user_id ||
                project.user_id === userId,
        );

        return sortProjects(
            ownedProjects,
            sortBy,
            sortDirection,
            history,
        );
    }, [
        allProjects,
        userId,
        sortBy,
        sortDirection,
        history,
    ]);

    /* =======================================================
       RECENTLY VIEWED PROJECTS
  
       Only projects which have genuine viewing timestamps
       are included. Deleted or inaccessible projects are
       automatically excluded from the gallery.
    ======================================================= */

    const recentProjects = useMemo(
        () =>
            sortProjectsByViewed(
                allProjects,
                history,
            ),
        [allProjects, history],
    );

    /* =======================================================
       FILTERED MY PROJECTS
    ======================================================= */

    const filteredProjects = useMemo(
        () =>
            filterProjects(
                projects,
                query,
            ),
        [projects, query],
    );

    /* =======================================================
       FILTERED RECENTLY VIEWED PROJECTS
    ======================================================= */

    const filteredRecentProjects = useMemo(
        () =>
            filterProjects(
                recentProjects,
                query,
            ),
        [recentProjects, query],
    );

    /* =======================================================
       RETURN
    ======================================================= */

    return {
        projects,
        recentProjects,

        filteredProjects,
        filteredRecentProjects,

        history,

        loading,
        error,

        refreshProjects,
        recordProjectView,
    };
};

export default useProjectDiscovery;
