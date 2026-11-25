import type { ProjectResponse } from "../../api/projectApi";

export type DiscoveryTab = "projects" | "recent" | "templates";
export type DiscoveryMode = "browse" | "search";
export interface DiscoveryTabItem { id: DiscoveryTab; label: string }
export type ProjectVisibility = "private" | "public" | "workspace";
export type ProjectStatus = "draft" | "generating" | "ready" | "published" | "failed" | "archived";
export interface DiscoveryProject extends ProjectResponse {
    preview_url?: string | null;
    preview_image_url?: string | null;
    thumbnail_url?: string | null;
    screenshot_url?: string | null;
    owner_name?: string | null;
    owner_avatar_url?: string | null;
    status?: string | null;
    visibility?: string | null;
    is_public?: boolean | null;
    last_opened_at?: string | null;
    last_opened?: string | null;
    is_favorite?: boolean;
    tags?: string[];
}
export type ProjectActivityType = "created" | "edited" | "viewed";
export interface ProjectHistoryEntry { projectId: string; viewedAt: string }
export type ProjectHistory = Record<string, ProjectHistoryEntry>;
export type ProjectSortBy = "updated" | "created" | "viewed" | "name";
export type SortDirection = "asc" | "desc";
export interface ProjectSortOptions { sortBy: ProjectSortBy; direction: SortDirection }
export type TemplateCategory = "saas" | "landing-page" | "portfolio" | "ecommerce" | "dashboard" | "ai-app" | "crm" | "internal-tool" | "productivity" | "business" | "education" | "finance" | "creative" | "healthcare" | "social" | "other";
export type TemplateDifficulty = "beginner" | "intermediate" | "advanced";
export interface DiscoveryTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    difficulty?: TemplateDifficulty;
    thumbnail?: string;
    previewUrl?: string;
    prompt: string;
    starterFiles?: Record<string, string>;
    tags: string[];
    technologies?: string[];
    featured?: boolean;
    popular?: boolean;
    isNew?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type TemplateCategoryFilter = "all" | TemplateCategory;
export interface TemplateFilters { query: string; category: TemplateCategoryFilter; featuredOnly?: boolean }
export interface DiscoveryState {
    activeTab: DiscoveryTab;
    mode: DiscoveryMode;
    query: string;
    sortBy: ProjectSortBy;
    sortDirection: SortDirection;
    templateCategory: TemplateCategoryFilter;
}
export interface DiscoveryAsyncState { loading: boolean; error: string | null }
export interface UseProjectDiscoveryResult extends DiscoveryAsyncState {
    projects: DiscoveryProject[];
    recentProjects: DiscoveryProject[];
    filteredProjects: DiscoveryProject[];
    filteredRecentProjects: DiscoveryProject[];
    history: ProjectHistory;
    refreshProjects: () => Promise<void>;
    recordProjectView: (projectId: string) => void;
}
export interface DiscoveryProjectCardProps {
    project: DiscoveryProject;
    isDark: boolean;
    ownerName: string;
    activityType?: ProjectActivityType;
    viewedAt?: string | null;
    onOpen: (project: DiscoveryProject) => void;
}
export interface ProjectGridProps {
    projects: DiscoveryProject[];
    isDark: boolean;
    ownerName: string;
    loading?: boolean;
    activityType?: ProjectActivityType;
    history?: ProjectHistory;
    onOpenProject: (project: DiscoveryProject) => void;
}
export interface ProjectThumbnailProps { project: DiscoveryProject; isDark: boolean; className?: string }
export interface TemplateCardProps { template: DiscoveryTemplate; isDark: boolean; onSelect: (template: DiscoveryTemplate) => void }
export interface TemplateGridProps { templates: DiscoveryTemplate[]; isDark: boolean; onSelectTemplate: (template: DiscoveryTemplate) => void }
export type DiscoveryEmptyStateType = "projects" | "recent" | "search" | "templates" | "error";
export interface DiscoveryEmptyStateProps {
    type: DiscoveryEmptyStateType;
    isDark: boolean;
    query?: string;
    error?: string | null;
    onCreateProject?: () => void;
    onClearSearch?: () => void;
    onRetry?: () => void;
}
export const DISCOVERY_TABS: DiscoveryTabItem[] = [
    { id: "projects", label: "My projects" },
    { id: "recent", label: "Recently viewed" },
    { id: "templates", label: "Icogon templates" },
];
export const DEFAULT_DISCOVERY_STATE: DiscoveryState = {
    activeTab: "projects", mode: "browse", query: "", sortBy: "updated", sortDirection: "desc", templateCategory: "all",
};
export const DISCOVERY_HISTORY_PREFIX = "icogon:project-history:v1";
export const MAX_RECENT_PROJECTS = 50;
