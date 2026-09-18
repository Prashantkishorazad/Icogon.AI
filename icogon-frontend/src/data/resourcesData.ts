import {
  BookOpen,
  Cable,
  Handshake,
  GraduationCap,
  LayoutTemplate,
  FileText,
  Compass,
  Users,
} from "lucide-react";

import type { ElementType } from "react";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: ElementType;
}

export const resourcesData: ResourceItem[] = [
  {
    id: "blog",
    title: "Blog",
    description: "Ideas, updates, stories.",
    path: "/blog",
    icon: BookOpen,
  },
  {
    id: "connectors",
    title: "Connectors",
    description: "Build from what you already use.",
    path: "/connectors",
    icon: Cable,
  },
  {
    id: "partners",
    title: "Partners",
    description: "Build more together.",
    path: "/partners",
    icon: Handshake,
  },
  {
    id: "academy",
    title: "Academy",
    description: "Learn to build with ICOGON.",
    path: "/academy",
    icon: GraduationCap,
  },
  {
    id: "templates",
    title: "Templates",
    description: "Begin with a template.",
    path: "/templates",
    icon: LayoutTemplate,
  },
  {
    id: "docs",
    title: "Docs",
    description: "Everything under the hood.",
    path: "/docs",
    icon: FileText,
  },
  {
    id: "guides",
    title: "Guides",
    description: "Learn as you build.",
    path: "/guides",
    icon: Compass,
  },
  {
    id: "customer-stories",
    title: "Customer stories",
    description: "See what teams have built.",
    path: "/customer-stories",
    icon: Users,
  },
];

export const announcementData = {
  label: "Announcement",
  title: "Introducing the ICOGON Partner Program",
  action: "Learn more",
  path: "/partners",
  image:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
};