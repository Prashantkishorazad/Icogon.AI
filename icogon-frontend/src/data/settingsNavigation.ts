import {
  Settings,
  User,
  Users,
  CreditCard,
  Brain,
  Sparkles,
  FileCode2,
  Plug,
  GitBranch,
  KeyRound,
  Globe,
  ShieldCheck,
} from "lucide-react";

import type { SearchNavigationItem } from "./searchNavigation";

export const settingsNavigation: SearchNavigationItem[] = [
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
    keywords: [
      "settings",
      "preferences",
      "configuration",
    ],
    description: "Manage ICOGON settings",
  },

  {
    id: "account-settings",
    title: "Account",
    category: "Settings",
    type: "settings",
    icon: User,
    path: "/profile",
    keywords: [
      "account",
      "profile",
      "user",
    ],
    description: "Manage your account",
  },

  {
    id: "workspace-settings",
    title: "Workspace",
    category: "Settings",
    type: "settings",
    icon: Users,
    path: "/workspace/settings",
    keywords: [
      "workspace",
      "team",
      "organization",
    ],
    description: "Manage workspace settings",
  },

  {
    id: "billing",
    title: "Plans & credit usage",
    category: "Settings",
    type: "settings",
    icon: CreditCard,
    path: "/billing",
    keywords: [
      "billing",
      "plan",
      "credits",
      "subscription",
      "payment",
    ],
    description: "Manage your plan and credits",
  },

  {
    id: "knowledge",
    title: "Knowledge",
    category: "Settings",
    type: "settings",
    icon: Brain,
    path: "/settings/knowledge",
    keywords: [
      "knowledge",
      "ai",
      "context",
    ],
    description: "Manage AI knowledge",
  },

  {
    id: "skills",
    title: "Skills",
    category: "Settings",
    type: "settings",
    icon: Sparkles,
    path: "/settings/skills",
    keywords: [
      "skills",
      "ai",
      "capabilities",
    ],
    description: "Manage AI skills",
  },

  {
    id: "templates",
    title: "Templates",
    category: "Settings",
    type: "settings",
    icon: FileCode2,
    path: "/settings/templates",
    keywords: [
      "templates",
      "website",
      "design",
    ],
    description: "Manage project templates",
  },

  {
    id: "connector-settings",
    title: "Connector settings",
    category: "Settings",
    type: "settings",
    icon: Plug,
    path: "/settings/connectors",
    keywords: [
      "connector",
      "integration",
      "settings",
    ],
    description: "Manage connector settings",
  },

  // =====================================================
  // BUILD & DEPLOY
  // =====================================================

  {
    id: "git-settings",
    title: "Git",
    category: "Build & deploy",
    type: "settings",
    icon: GitBranch,
    path: "/settings/git",
    keywords: [
      "git",
      "github",
      "repository",
      "deploy",
    ],
    description: "Manage Git integration",
  },

  {
    id: "build-secrets",
    title: "Build secrets",
    category: "Build & deploy",
    type: "settings",
    icon: KeyRound,
    path: "/settings/secrets",
    keywords: [
      "secret",
      "environment",
      "env",
      "key",
    ],
    description: "Manage build secrets",
  },

  {
    id: "workspace-domains",
    title: "Workspace domains",
    category: "Build & deploy",
    type: "settings",
    icon: Globe,
    path: "/settings/domains",
    keywords: [
      "domain",
      "custom domain",
      "url",
    ],
    description: "Manage workspace domains",
  },

  // =====================================================
  // ACCESS & SECURITY
  // =====================================================

  {
    id: "security",
    title: "Privacy & security",
    category: "Access & security",
    type: "settings",
    icon: ShieldCheck,
    path: "/settings/security",
    keywords: [
      "security",
      "privacy",
      "protection",
    ],
    description: "Manage privacy and security",
  },
];