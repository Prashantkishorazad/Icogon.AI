import {
  SiGithub,
  SiGmail,
  SiGooglecalendar,
  SiGoogleanalytics,
  SiStripe,
  SiSupabase,
  SiShopify,
  SiZapier,
} from "react-icons/si";
import { FaSlack } from "react-icons/fa";
import type { SearchNavigationItem } from "./searchNavigation";

export interface ConnectorDefinition extends SearchNavigationItem {
  brandColor: string;
  availability: "available" | "coming-soon";
  integration: "gmail" | "none";
}

/**
 * Official brand-mark components are rendered as crisp vectors (not emoji or
 * generic Lucide substitutes). Only Gmail currently has a working OAuth flow.
 */
export const connectorData: ConnectorDefinition[] = [
  { id: "github", title: "GitHub", category: "Connectors", type: "connector", icon: SiGithub, path: "/connectors", keywords: ["github", "git", "repository", "code", "source control"], description: "Bring your repositories and development workflow into ICOGON.", brandColor: "#181717", availability: "coming-soon", integration: "none" },
  { id: "gmail", title: "Gmail", category: "Connectors", type: "connector", icon: SiGmail, path: "/connectors", keywords: ["gmail", "google", "email", "mail", "inbox"], description: "Connect Gmail to securely use email context in your AI workflows.", brandColor: "#EA4335", availability: "available", integration: "gmail" },
  { id: "google-calendar", title: "Google Calendar", category: "Connectors", type: "connector", icon: SiGooglecalendar, path: "/connectors", keywords: ["google", "calendar", "events", "schedule"], description: "Bring your schedule and events into your workflows.", brandColor: "#4285F4", availability: "coming-soon", integration: "none" },
  { id: "google-analytics", title: "Google Analytics", category: "Connectors", type: "connector", icon: SiGoogleanalytics, path: "/connectors", keywords: ["google", "analytics", "tracking", "website", "metrics"], description: "Connect website analytics and performance insights.", brandColor: "#E37400", availability: "coming-soon", integration: "none" },
  { id: "slack", title: "Slack", category: "Connectors", type: "connector", icon: FaSlack, path: "/connectors", keywords: ["slack", "chat", "messaging", "team"], description: "Bring team conversations and collaboration into ICOGON.", brandColor: "#4A154B", availability: "coming-soon", integration: "none" },
  { id: "stripe", title: "Stripe", category: "Connectors", type: "connector", icon: SiStripe, path: "/connectors", keywords: ["stripe", "payment", "payments", "checkout"], description: "Connect payment workflows and transaction data.", brandColor: "#635BFF", availability: "coming-soon", integration: "none" },
  { id: "supabase", title: "Supabase", category: "Connectors", type: "connector", icon: SiSupabase, path: "/connectors", keywords: ["supabase", "database", "auth", "backend"], description: "Connect your Supabase backend and database.", brandColor: "#3ECF8E", availability: "coming-soon", integration: "none" },
  { id: "shopify", title: "Shopify", category: "Connectors", type: "connector", icon: SiShopify, path: "/connectors", keywords: ["shopify", "ecommerce", "store", "products"], description: "Connect your store, products, and commerce workflows.", brandColor: "#7AB55C", availability: "coming-soon", integration: "none" },
  { id: "zapier", title: "Zapier", category: "Connectors", type: "connector", icon: SiZapier, path: "/connectors", keywords: ["zapier", "automation", "workflow", "integrations"], description: "Connect automation workflows across your favorite apps.", brandColor: "#FF4A00", availability: "coming-soon", integration: "none" },
];
