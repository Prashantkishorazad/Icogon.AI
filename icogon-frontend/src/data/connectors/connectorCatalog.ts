import type { ElementType } from "react";
import { MessageSquare } from "lucide-react";
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

export type ConnectorConnectionType = "app_chat" | "chat_mcp" | "app_user";

export interface ConnectorDefinition {
  id: string;
  /** Stable URL identifier. Gmail intentionally uses google_mail. */
  slug: string;
  name: string;
  description: string;
  category: string;
  /** React component: Lucide icons or colored provider brand icons. */
  icon: ElementType;
  brandColor: string;
  keywords: string[];
  connectionTypes: ConnectorConnectionType[];
  availability: "available" | "planned";
}

export const connectorCatalog: ConnectorDefinition[] = [
  { id: "github", slug: "github", name: "GitHub", description: "Bring repositories, issues, and code context into your workflows.", category: "Development", icon: SiGithub, brandColor: "#171717", keywords: ["git", "repository", "code", "pull request"], connectionTypes: ["app_chat", "chat_mcp"], availability: "planned" },
  { id: "gmail", slug: "google_mail", name: "Gmail", description: "Read, send, and manage your emails.", category: "Google", icon: SiGmail, brandColor: "#EA4335", keywords: ["google", "email", "mail", "inbox"], connectionTypes: ["app_chat"], availability: "available" },
  { id: "google-calendar", slug: "google_calendar", name: "Google Calendar", description: "Create and manage calendar events and scheduling context.", category: "Google", icon: SiGooglecalendar, brandColor: "#4285F4", keywords: ["google", "events", "schedule"], connectionTypes: ["app_chat"], availability: "planned" },
  { id: "google-analytics", slug: "google_analytics", name: "Google Analytics", description: "Bring website measurement and reporting context into your workflows.", category: "Google", icon: SiGoogleanalytics, brandColor: "#E37400", keywords: ["google", "analytics", "tracking", "metrics"], connectionTypes: ["app_chat"], availability: "planned" },
  { id: "slack", slug: "slack", name: "Slack", description: "Connect team conversations and workspace context.", category: "Messaging", icon: MessageSquare, brandColor: "#611F69", keywords: ["chat", "messaging", "team"], connectionTypes: ["app_chat", "app_user"], availability: "planned" },
  { id: "stripe", slug: "stripe", name: "Stripe", description: "Use payment and subscription data in authorized workflows.", category: "Commerce", icon: SiStripe, brandColor: "#635BFF", keywords: ["payments", "checkout", "billing"], connectionTypes: ["app_chat", "app_user"], availability: "planned" },
  { id: "supabase", slug: "supabase", name: "Supabase", description: "Connect database and authentication context for your projects.", category: "Development", icon: SiSupabase, brandColor: "#3ECF8E", keywords: ["database", "auth", "backend", "postgres"], connectionTypes: ["app_chat", "chat_mcp"], availability: "planned" },
  { id: "shopify", slug: "shopify", name: "Shopify", description: "Bring store, product, and commerce context into your workflows.", category: "Commerce", icon: SiShopify, brandColor: "#7AB55C", keywords: ["ecommerce", "store", "products"], connectionTypes: ["app_chat", "app_user"], availability: "planned" },
  { id: "zapier", slug: "zapier", name: "Zapier", description: "Connect automations and workflow triggers across your tools.", category: "Automation", icon: SiZapier, brandColor: "#FF4A00", keywords: ["automation", "workflow", "integration"], connectionTypes: ["app_chat"], availability: "planned" },
];

export const connectorCategories = [...new Set(connectorCatalog.map((item) => item.category))];

export const connectorConnections = [...new Set(connectorCatalog.flatMap((item) => item.connectionTypes))];