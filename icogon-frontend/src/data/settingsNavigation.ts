import {
  Activity,
  AppWindow,
  Bell,
  BookOpen,
  Brain,
  Building2,
  CalendarClock,
  CreditCard,
  Database,
  FileKey,
  GitBranch,
  Globe,
  KeyRound,
  LockKeyhole,
  Network,
  Plug,
  Radio,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export interface SettingsNavigationItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  keywords: string[];
  premium?: boolean;
}

export interface SettingsNavigationGroup {
  title: string;
  items: SettingsNavigationItem[];
}

export const settingsNavigationGroups: SettingsNavigationGroup[] = [
  {
    title: "Workspace",
    items: [
      {
        id: "workspace",
        label: "Workspace",
        description: "Manage workspace details and defaults.",
        path: "/settings/workspace",
        icon: Building2,
        keywords: ["organization", "name", "general", "team"],
      },
      {
        id: "plans",
        label: "Plans & credit usage",
        description: "Review your plan, usage and available credits.",
        path: "/settings/plans",
        icon: CreditCard,
        keywords: ["billing", "subscription", "credits", "usage"],
      },
      {
        id: "slack",
        label: "Slack",
        description: "Connect Slack to bring conversations into ICOGON.",
        path: "/settings/slack",
        icon: Radio,
        keywords: ["messaging", "chat", "integration", "connector"],
      },
    ],
  },
  {
    title: "Access",
    items: [
      {
        id: "people",
        label: "People",
        description: "Invite and manage workspace members.",
        path: "/settings/people",
        icon: UserRound,
        keywords: ["members", "invite", "users"],
      },
      {
        id: "groups",
        label: "Groups",
        description: "Organize members into access groups.",
        path: "/settings/groups",
        icon: Users,
        keywords: ["teams", "roles", "permissions"],
        premium: true,
      },
      {
        id: "identity",
        label: "Identity",
        description: "Configure workspace identity and sign-in policies.",
        path: "/settings/identity",
        icon: ShieldCheck,
        keywords: ["sso", "authentication", "scim"],
        premium: true,
      },
      {
        id: "api-keys",
        label: "API keys & OAuth",
        description: "Manage API credentials and OAuth applications.",
        path: "/settings/api-keys",
        icon: KeyRound,
        keywords: ["developer", "tokens", "oauth", "credentials"],
      },
    ],
  },
  {
    title: "Customization",
    items: [
      {
        id: "instructions",
        label: "Instructions",
        description: "Set workspace-wide guidance for ICOGON AI.",
        path: "/settings/instructions",
        icon: BookOpen,
        keywords: ["prompt", "system instructions", "rules"],
      },
      {
        id: "memory",
        label: "Memory",
        description: "Control workspace memory and retained context.",
        path: "/settings/memory",
        icon: Brain,
        keywords: ["context", "knowledge", "retention"],
      },
      {
        id: "skills",
        label: "Skills",
        description: "Manage reusable AI capabilities.",
        path: "/settings/skills",
        icon: Sparkles,
        keywords: ["tools", "capabilities", "agents"],
      },
      {
        id: "templates",
        label: "Templates",
        description: "Manage shared project and prompt templates.",
        path: "/settings/templates",
        icon: AppWindow,
        keywords: ["website", "starter", "blueprint"],
        premium: true,
      },
      {
        id: "announcements",
        label: "Announcements",
        description: "Publish updates for workspace members.",
        path: "/settings/announcements",
        icon: Bell,
        keywords: ["updates", "notices"],
        premium: true,
      },
      {
        id: "events-hooks",
        label: "Events & Hooks",
        description: "Configure event subscriptions and outgoing hooks.",
        path: "/settings/events-hooks",
        icon: Webhook,
        keywords: ["webhooks", "events", "automation"],
        premium: true,
      },
      {
        id: "connector-settings",
        label: "Connector settings",
        description: "Control which integrations are available and how they behave.",
        path: "/settings/connector-settings",
        icon: Plug,
        keywords: ["integrations", "apps", "providers", "mcp"],
      },
    ],
  },
  {
    title: "Build & deploy",
    items: [
      {
        id: "git",
        label: "Git",
        description: "Connect source control repositories.",
        path: "/settings/git",
        icon: GitBranch,
        keywords: ["github", "repository", "version control"],
      },
      {
        id: "build-secrets",
        label: "Build secrets",
        description: "Store environment variables for builds securely.",
        path: "/settings/build-secrets",
        icon: FileKey,
        keywords: ["environment", "variables", "env", "secret"],
      },
      {
        id: "managed-registry",
        label: "Managed registry",
        description: "Configure private package registries.",
        path: "/settings/managed-registry",
        icon: Database,
        keywords: ["packages", "npm", "container"],
        premium: true,
      },
      {
        id: "mcp-server",
        label: "MCP server",
        description: "Register and manage Model Context Protocol servers.",
        path: "/settings/mcp-server",
        icon: Network,
        keywords: ["mcp", "tools", "registry", "model context protocol"],
      },
      {
        id: "workspace-domains",
        label: "Workspace domains",
        description: "Manage verified domains for your workspace.",
        path: "/settings/workspace-domains",
        icon: Globe,
        keywords: ["domain", "custom url", "dns"],
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        id: "privacy-security",
        label: "Privacy & security",
        description: "Manage privacy controls and workspace security settings.",
        path: "/settings/privacy-security",
        icon: LockKeyhole,
        keywords: ["privacy", "protection", "access"],
      },
      {
        id: "security-center",
        label: "Security center",
        description: "Review security posture and recommendations.",
        path: "/settings/security-center",
        icon: Shield,
        keywords: ["risk", "posture", "alerts"],
        premium: true,
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        description: "Review administrative and workspace activity.",
        path: "/settings/audit-logs",
        icon: Activity,
        keywords: ["history", "events", "activity"],
        premium: true,
      },
      {
        id: "data-exports",
        label: "Data exports",
        description: "Request an export of workspace data.",
        path: "/settings/data-exports",
        icon: CalendarClock,
        keywords: ["download", "backup", "portability"],
        premium: true,
      },
    ],
  },
];

export const allSettingsItems = settingsNavigationGroups.flatMap((group) => group.items);

export const settingsNavigation = allSettingsItems.map((item) => ({
  ...item,
  title: item.label,
  category: "Settings",
  type: "settings" as const,
}));

export const findSettingsItem = (id: string) =>
  allSettingsItems.find((item) => item.id === id);
