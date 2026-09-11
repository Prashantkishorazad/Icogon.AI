import {
  GitBranch,
  Mail,
  Calendar,
  BarChart3,
  MessageSquare,
  CreditCard,
  Database,
  ShoppingBag,
  Zap,
} from "lucide-react";

import type { SearchNavigationItem } from "./searchNavigation";

export const connectorData: SearchNavigationItem[] = [
  {
    id: "github",
    title: "GitHub",
    category: "Connectors",
    type: "connector",
    icon: GitBranch,
    path: "/connectors",
    keywords: [
      "github",
      "git",
      "repository",
      "code",
    ],
    description: "Connect your GitHub account",
  },

  {
    id: "gmail",
    title: "Gmail",
    category: "Connectors",
    type: "connector",
    icon: Mail,
    path: "/connectors",
    keywords: [
      "gmail",
      "google",
      "email",
      "mail",
    ],
    description: "Connect Gmail",
  },

  {
    id: "google-calendar",
    title: "Google Calendar",
    category: "Connectors",
    type: "connector",
    icon: Calendar,
    path: "/connectors",
    keywords: [
      "google",
      "calendar",
      "events",
      "schedule",
    ],
    description: "Connect Google Calendar",
  },

  {
    id: "google-analytics",
    title: "Google Analytics",
    category: "Connectors",
    type: "connector",
    icon: BarChart3,
    path: "/connectors",
    keywords: [
      "google",
      "analytics",
      "tracking",
      "website",
    ],
    description: "Connect Google Analytics",
  },

  {
    id: "slack",
    title: "Slack",
    category: "Connectors",
    type: "connector",
    icon: MessageSquare,
    path: "/connectors",
    keywords: [
      "slack",
      "chat",
      "messaging",
      "team",
    ],
    description: "Connect Slack",
  },

  {
    id: "stripe",
    title: "Stripe",
    category: "Connectors",
    type: "connector",
    icon: CreditCard,
    path: "/connectors",
    keywords: [
      "stripe",
      "payment",
      "payments",
      "checkout",
    ],
    description: "Connect Stripe payments",
  },

  {
    id: "supabase",
    title: "Supabase",
    category: "Connectors",
    type: "connector",
    icon: Database,
    path: "/connectors",
    keywords: [
      "supabase",
      "database",
      "auth",
      "backend",
    ],
    description: "Connect Supabase",
  },

  {
    id: "shopify",
    title: "Shopify",
    category: "Connectors",
    type: "connector",
    icon: ShoppingBag,
    path: "/connectors",
    keywords: [
      "shopify",
      "ecommerce",
      "store",
      "products",
    ],
    description: "Connect Shopify",
  },

  {
    id: "zapier",
    title: "Zapier",
    category: "Connectors",
    type: "connector",
    icon: Zap,
    path: "/connectors",
    keywords: [
      "zapier",
      "automation",
      "workflow",
    ],
    description: "Connect Zapier",
  },
];