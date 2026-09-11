import {
  Home,
  Plus,
  FolderKanban,
  Plug,
  User,
  Settings,
  Sun,
  Moon,
  Monitor,
  BookOpen,
  GitBranch,
  ShieldCheck,
  KeyRound,
  Globe,
  Brain,
  Sparkles,
  FileCode2,
  Users,
  CreditCard,
  Database,
  MessageSquare,
  BarChart3,
  Calendar,
  Mail,
  ShoppingBag,
  Zap,
} from "lucide-react";

export type SearchItemType =
  | "navigation"
  | "settings"
  | "theme"
  | "connector"
  | "action";

export interface SearchNavigationItem {
  id: string;
  title: string;
  category: string;
  type: SearchItemType;
  icon: React.ElementType;
  path?: string;
  keywords?: string[];
  description?: string;
}

export const searchNavigation: SearchNavigationItem[] = [
  // =====================================================
  // NAVIGATE TO
  // =====================================================

  {
    id: "dashboard",
    title: "Dashboard",
    category: "Navigate to",
    type: "navigation",
    icon: Home,
    path: "/dashboard",
    keywords: ["home", "workspace"],
    description: "Open your ICOGON dashboard",
  },

  {
    id: "create-project",
    title: "Create new project",
    category: "Navigate to",
    type: "action",
    icon: Plus,
    path: "/builder",
    keywords: ["new", "project", "build", "create"],
    description: "Start a new project with ICOGON AI",
  },

  {
    id: "projects",
    title: "Projects",
    category: "Navigate to",
    type: "navigation",
    icon: FolderKanban,
    path: "/projects",
    keywords: ["projects", "all projects"],
    description: "View all your projects",
  },

  {
    id: "connectors",
    title: "Connectors",
    category: "Navigate to",
    type: "navigation",
    icon: Plug,
    path: "/connectors",
    keywords: ["integrations", "apps", "tools"],
    description: "Manage your connected services",
  },

  {
    id: "resources",
    title: "Resources",
    category: "Navigate to",
    type: "navigation",
    icon: BookOpen,
    path: "/resources",
    keywords: ["docs", "documentation", "learning"],
    description: "Explore ICOGON resources",
  },

  {
    id: "profile",
    title: "Profile",
    category: "Navigate to",
    type: "navigation",
    icon: User,
    path: "/profile",
    keywords: ["account", "user", "personal"],
    description: "Manage your profile",
  },

  // =====================================================
  // SETTINGS
  // =====================================================

  {
    id: "settings",
    title: "Settings",
    category: "Settings",
    type: "settings",
    icon: Settings,
    path: "/settings",
    keywords: ["preferences", "configuration"],
    description: "Manage ICOGON settings",
  },

  {
    id: "account-settings",
    title: "Account",
    category: "Settings",
    type: "settings",
    icon: User,
    path: "/profile",
    keywords: ["account", "profile", "user"],
    description: "Manage your account",
  },

  {
    id: "workspace-settings",
    title: "Workspace",
    category: "Settings",
    type: "settings",
    icon: Users,
    path: "/workspace/settings",
    keywords: ["workspace", "team", "organization"],
    description: "Manage workspace settings",
  },

  {
    id: "billing",
    title: "Plans & credit usage",
    category: "Settings",
    type: "settings",
    icon: CreditCard,
    path: "/billing",
    keywords: ["billing", "plan", "credits", "subscription"],
    description: "Manage your plan and credits",
  },

  {
    id: "knowledge",
    title: "Knowledge",
    category: "Settings",
    type: "settings",
    icon: Brain,
    path: "/settings/knowledge",
    keywords: ["knowledge", "ai", "context"],
    description: "Manage AI knowledge",
  },

  {
    id: "skills",
    title: "Skills",
    category: "Settings",
    type: "settings",
    icon: Sparkles,
    path: "/settings/skills",
    keywords: ["skills", "ai", "capabilities"],
    description: "Manage AI skills",
  },

  {
    id: "templates",
    title: "Templates",
    category: "Settings",
    type: "settings",
    icon: FileCode2,
    path: "/settings/templates",
    keywords: ["templates", "website", "design"],
    description: "Manage project templates",
  },

  {
    id: "connector-settings",
    title: "Connector settings",
    category: "Settings",
    type: "settings",
    icon: Plug,
    path: "/settings/connectors",
    keywords: ["connector", "integration", "settings"],
    description: "Manage connector settings",
  },

  {
    id: "git-settings",
    title: "Git",
    category: "Build & deploy",
    type: "settings",
    icon: GitBranch,
    path: "/settings/git",
    keywords: ["git", "github", "repository", "deploy"],
    description: "Manage Git integration",
  },

  {
    id: "build-secrets",
    title: "Build secrets",
    category: "Build & deploy",
    type: "settings",
    icon: KeyRound,
    path: "/settings/secrets",
    keywords: ["secret", "environment", "env", "key"],
    description: "Manage build secrets",
  },

  {
    id: "workspace-domains",
    title: "Workspace domains",
    category: "Build & deploy",
    type: "settings",
    icon: Globe,
    path: "/settings/domains",
    keywords: ["domain", "custom domain", "url"],
    description: "Manage workspace domains",
  },

  {
    id: "security",
    title: "Privacy & security",
    category: "Access & security",
    type: "settings",
    icon: ShieldCheck,
    path: "/settings/security",
    keywords: ["security", "privacy", "protection"],
    description: "Manage privacy and security",
  },

  // =====================================================
  // THEME
  // =====================================================

  {
    id: "theme-light",
    title: "Light",
    category: "Theme",
    type: "theme",
    icon: Sun,
    keywords: ["light", "appearance", "theme"],
  },

  {
    id: "theme-dark",
    title: "Dark",
    category: "Theme",
    type: "theme",
    icon: Moon,
    keywords: ["dark", "appearance", "theme"],
  },

  {
    id: "theme-system",
    title: "System",
    category: "Theme",
    type: "theme",
    icon: Monitor,
    keywords: ["system", "automatic", "appearance", "theme"],
  },

  // =====================================================
  // CONNECTORS
  // =====================================================

  {
    id: "github",
    title: "GitHub",
    category: "Connectors",
    type: "connector",
    icon: GitBranch,
    path: "/connectors",
    keywords: ["github", "git", "repository", "code"],
    description: "Connect your GitHub account",
  },

  {
    id: "gmail",
    title: "Gmail",
    category: "Connectors",
    type: "connector",
    icon: Mail,
    path: "/connectors",
    keywords: ["gmail", "google", "email", "mail"],
    description: "Connect Gmail",
  },

  {
    id: "google-calendar",
    title: "Google Calendar",
    category: "Connectors",
    type: "connector",
    icon: Calendar,
    path: "/connectors",
    keywords: ["google", "calendar", "events", "schedule"],
    description: "Connect Google Calendar",
  },

  {
    id: "google-analytics",
    title: "Google Analytics",
    category: "Connectors",
    type: "connector",
    icon: BarChart3,
    path: "/connectors",
    keywords: ["google", "analytics", "tracking", "website"],
    description: "Connect Google Analytics",
  },

  {
    id: "slack",
    title: "Slack",
    category: "Connectors",
    type: "connector",
    icon: MessageSquare,
    path: "/connectors",
    keywords: ["slack", "chat", "messaging", "team"],
    description: "Connect Slack",
  },

  {
    id: "stripe",
    title: "Stripe",
    category: "Connectors",
    type: "connector",
    icon: CreditCard,
    path: "/connectors",
    keywords: ["stripe", "payment", "payments", "checkout"],
    description: "Connect Stripe payments",
  },

  {
    id: "supabase",
    title: "Supabase",
    category: "Connectors",
    type: "connector",
    icon: Database,
    path: "/connectors",
    keywords: ["supabase", "database", "auth", "backend"],
    description: "Connect Supabase",
  },

  {
    id: "shopify",
    title: "Shopify",
    category: "Connectors",
    type: "connector",
    icon: ShoppingBag,
    path: "/connectors",
    keywords: ["shopify", "ecommerce", "store", "products"],
    description: "Connect Shopify",
  },

  {
    id: "zapier",
    title: "Zapier",
    category: "Connectors",
    type: "connector",
    icon: Zap,
    path: "/connectors",
    keywords: ["zapier", "automation", "workflow"],
    description: "Connect Zapier",
  },
];