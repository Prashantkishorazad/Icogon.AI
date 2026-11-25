import { useCallback, useSyncExternalStore } from "react";
import type { ProjectResponse } from "../api/projectApi";

/**
 * ICOGON thumbnail store, v1.
 *
 * Uses the SAME localStorage keys as the Projects page's existing uploader.
 * Previously saved screenshots continue to work; no migration is necessary.
 *
 * This is browser-local storage, not a substitute for Supabase Storage.
 */
const KEY_PREFIX = "icogon:project-thumbnail:v1:";
const CHANGE_EVENT = "icogon:project-thumbnail-changed";

type ProjectWithImages = ProjectResponse & {
    thumbnail_url?: string | null;
    screenshot_url?: string | null;
    preview_image_url?: string | null;
};

type ChangeDetail = {
    userId: string;
    projectId: string;
};

export function projectThumbnailKey(userId: string, projectId: string): string {
    return `${KEY_PREFIX}${userId}:${projectId}`;
}

/** Read the existing, manually uploaded preview (if available). */
export function readLocalProjectThumbnail(
    userId: string | null | undefined,
    projectId: string | null | undefined,
): string | null {
    if (!userId || !projectId || typeof window === "undefined") return null;
    try {
        const value = window.localStorage.getItem(projectThumbnailKey(userId, projectId));
        // Only image data URLs were written by ICOGON's existing upload flow.
        return value && /^data:image\/(?:jpeg|jpg|png|webp|gif|avif);base64,/i.test(value)
            ? value
            : null;
    } catch {
        return null;
    }
}

/** Accept a normal image URL from the API, never an executable URL. */
function safeRemoteImage(value: unknown): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    const src = value.trim();
    if (src.startsWith("/") && !src.startsWith("//")) return src;
    try {
        const url = new URL(src);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
}

/** Prefer a user's uploaded image over backend-provided screenshot metadata. */
export function getProjectThumbnail(
    project: ProjectResponse,
    userId: string | null | undefined,
): string | null {
    const local = readLocalProjectThumbnail(userId, project.id);
    if (local) return local;
    const p = project as ProjectWithImages;
    return (
        safeRemoteImage(p.thumbnail_url) ||
        safeRemoteImage(p.screenshot_url) ||
        safeRemoteImage(p.preview_image_url)
    );
}

/**
 * Save using the existing key, and notify React components in THIS tab.
 * Storage events alone only fire in other browser tabs.
 * Throws on a quota/storage failure so the uploader can show an error.
 */
export function saveProjectThumbnail(
    userId: string,
    projectId: string,
    dataUrl: string,
): void {
    if (!/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(dataUrl)) {
        throw new Error("Expected a base64 image data URL.");
    }
    window.localStorage.setItem(projectThumbnailKey(userId, projectId), dataUrl);
    window.dispatchEvent(
        new CustomEvent<ChangeDetail>(CHANGE_EVENT, { detail: { userId, projectId } }),
    );
}

/** Delete a manually uploaded image when its project is deleted. */
export function removeProjectThumbnail(userId: string, projectId: string): void {
    window.localStorage.removeItem(projectThumbnailKey(userId, projectId));
    window.dispatchEvent(
        new CustomEvent<ChangeDetail>(CHANGE_EVENT, { detail: { userId, projectId } }),
    );
}

/**
 * Subscribe to upload/removal updates from this tab AND other tabs.
 * useSyncExternalStore keeps snapshots consistent with React rendering.
 */
export function useProjectThumbnail(
    project: ProjectResponse,
    userId: string | null | undefined,
): string | null {
    const subscribe = useCallback((notify: () => void) => {
        if (typeof window === "undefined" || !userId) return () => undefined;
        const key = projectThumbnailKey(userId, project.id);

        const onStorage = (event: StorageEvent) => {
            if (event.key === key || event.key === null) notify();
        };
        const onLocalChange = (event: Event) => {
            const detail = (event as CustomEvent<ChangeDetail>).detail;
            if (detail?.userId === userId && detail.projectId === project.id) notify();
        };
        window.addEventListener("storage", onStorage);
        window.addEventListener(CHANGE_EVENT, onLocalChange);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener(CHANGE_EVENT, onLocalChange);
        };
    }, [project.id, userId]);

    const getSnapshot = useCallback(
        () => getProjectThumbnail(project, userId),
        [project, userId],
    );
    const getServerSnapshot = useCallback(() => null, []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
