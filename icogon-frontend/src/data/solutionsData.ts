import type { ElementType } from "react";
import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Code2,
  Compass,
  Globe2,
  Megaphone,
  Palette,
  Settings2,
  Users,
  Wrench,
} from "lucide-react";

export interface SolutionData {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  path: string;
  icon: ElementType;

  heroTitle: string;
  heroDescription: string;

  useCases: string[];
  features: string[];

  examples: {
    title: string;
    description: string;
  }[];
}

export const solutionsData: SolutionData[] = [
  {
    id: "founders",
    title: "For Founders",
    shortTitle: "Founders",
    description: "Turn ideas into working products faster.",
    path: "/solutions/founders",
    icon: BriefcaseBusiness,

    heroTitle: "Turn your idea into a real product.",
    heroDescription:
      "Move from idea to prototype to production with an AI-powered development workflow built for founders.",

    useCases: [
      "Validate product ideas",
      "Build MVPs",
      "Create internal tools",
      "Launch customer-facing products",
    ],

    features: [
      "Natural-language app building",
      "Rapid prototyping",
      "AI-assisted development",
      "Production-ready project workflow",
    ],

    examples: [
      {
        title: "Build your MVP",
        description:
          "Describe the product you have in mind and start turning the idea into a working application.",
      },
      {
        title: "Validate faster",
        description:
          "Create functional prototypes that can help you explore product ideas before committing to a large build.",
      },
      {
        title: "Keep building",
        description:
          "Continue iterating on your application as your product and requirements evolve.",
      },
    ],
  },

  {
    id: "product-managers",
    title: "For Product Managers",
    shortTitle: "Product Managers",
    description: "Turn product ideas into working prototypes.",
    path: "/solutions/product-managers",
    icon: Compass,

    heroTitle: "From product idea to working prototype.",
    heroDescription:
      "Give product teams a faster way to explore ideas, communicate requirements, and create functional experiences.",

    useCases: [
      "Prototype new features",
      "Test product concepts",
      "Build internal workflows",
      "Create functional demos",
    ],

    features: [
      "Rapid prototyping",
      "Prompt-driven development",
      "Interactive product experiences",
      "Fast iteration",
    ],

    examples: [
      {
        title: "Prototype a feature",
        description:
          "Turn a product requirement into an interactive experience without starting from a blank codebase.",
      },
      {
        title: "Explore alternatives",
        description:
          "Build different versions of an idea and compare how each workflow behaves.",
      },
      {
        title: "Communicate with working software",
        description:
          "Use functional prototypes to make product discussions more concrete.",
      },
    ],
  },

  {
    id: "designers",
    title: "For Designers",
    shortTitle: "Designers",
    description: "Turn designs and ideas into functional products.",
    path: "/solutions/designers",
    icon: Palette,

    heroTitle: "Design it. Build it. See it work.",
    heroDescription:
      "Bring your product ideas beyond static screens and turn them into functional web experiences.",

    useCases: [
      "Create interactive prototypes",
      "Explore product concepts",
      "Build design experiments",
      "Create polished websites",
    ],

    features: [
      "Visual-first workflows",
      "AI-assisted implementation",
      "Responsive interfaces",
      "Fast design iteration",
    ],

    examples: [
      {
        title: "Bring designs to life",
        description:
          "Move from visual concepts to interactive experiences that users can actually explore.",
      },
      {
        title: "Experiment freely",
        description:
          "Test layouts, interactions, and product concepts without lengthy development cycles.",
      },
      {
        title: "Ship polished experiences",
        description:
          "Use AI to help transform your ideas into responsive interfaces.",
      },
    ],
  },

  {
    id: "marketers",
    title: "For Marketers",
    shortTitle: "Marketers",
    description: "Build campaigns, tools, and experiences with AI.",
    path: "/solutions/marketers",
    icon: Megaphone,

    heroTitle: "Build marketing tools without the bottleneck.",
    heroDescription:
      "Create campaign experiences, landing pages, dashboards, and internal marketing tools with AI.",

    useCases: [
      "Marketing websites",
      "Campaign dashboards",
      "Lead-generation tools",
      "Interactive experiences",
    ],

    features: [
      "Landing page generation",
      "Campaign workflows",
      "Data-driven dashboards",
      "Rapid experimentation",
    ],

    examples: [
      {
        title: "Launch campaign pages",
        description:
          "Create campaign-focused web experiences from a simple description.",
      },
      {
        title: "Build marketing dashboards",
        description:
          "Turn marketing data into custom interfaces your team can actually use.",
      },
      {
        title: "Experiment with ideas",
        description:
          "Quickly create and iterate on new marketing experiences.",
      },
    ],
  },

  {
    id: "sales",
    title: "For Sales",
    shortTitle: "Sales",
    description: "Build tools that help sales teams move faster.",
    path: "/solutions/sales",
    icon: ChartNoAxesCombined,

    heroTitle: "Build better tools for your sales team.",
    heroDescription:
      "Create custom sales workflows, dashboards, lead tools, and internal applications with AI.",

    useCases: [
      "Sales dashboards",
      "Lead management",
      "Internal sales tools",
      "Reporting workflows",
    ],

    features: [
      "Custom dashboards",
      "Data integrations",
      "Workflow automation",
      "AI-assisted development",
    ],

    examples: [
      {
        title: "Create sales dashboards",
        description:
          "Build interfaces around the sales metrics your team needs to see.",
      },
      {
        title: "Manage leads",
        description:
          "Create lightweight applications tailored to your sales process.",
      },
      {
        title: "Automate repetitive work",
        description:
          "Connect your tools and create workflows around your existing process.",
      },
    ],
  },

  {
    id: "ops",
    title: "For Operations",
    shortTitle: "Ops",
    description: "Build custom operational tools for your business.",
    path: "/solutions/ops",
    icon: Settings2,

    heroTitle: "Build the operational tools your business needs.",
    heroDescription:
      "Create dashboards, workflows, admin tools, and custom applications around the way your business actually operates.",

    useCases: [
      "Operations dashboards",
      "Admin tools",
      "Workflow management",
      "Data management",
    ],

    features: [
      "Custom business tools",
      "Database-connected applications",
      "Workflow automation",
      "Internal dashboards",
    ],

    examples: [
      {
        title: "Build an operations dashboard",
        description:
          "Bring important operational information into one custom interface.",
      },
      {
        title: "Create internal workflows",
        description:
          "Build tools around processes that don't fit standard software.",
      },
      {
        title: "Connect your existing stack",
        description:
          "Use connectors to bring data and services into your workflows.",
      },
    ],
  },

  {
    id: "people",
    title: "For People Teams",
    shortTitle: "People",
    description: "Create better employee experiences.",
    path: "/solutions/people",
    icon: Users,

    heroTitle: "Build better tools for your people.",
    heroDescription:
      "Create employee portals, onboarding tools, resource hubs, and internal applications with AI.",

    useCases: [
      "Employee onboarding",
      "Internal resource hubs",
      "People dashboards",
      "Employee workflows",
    ],

    features: [
      "Internal applications",
      "Employee portals",
      "Custom workflows",
      "Connected data",
    ],

    examples: [
      {
        title: "Employee onboarding",
        description:
          "Create an onboarding experience tailored to your organization.",
      },
      {
        title: "Build a resource hub",
        description:
          "Bring important employee resources and information into one place.",
      },
      {
        title: "Create people tools",
        description:
          "Build custom applications around your team's processes.",
      },
    ],
  },

  {
    id: "websites",
    title: "Websites",
    shortTitle: "Websites",
    description: "Build modern websites with AI.",
    path: "/solutions/websites",
    icon: Globe2,

    heroTitle: "Build your website with AI.",
    heroDescription:
      "Start with a simple description and create a polished, responsive website without starting from scratch.",

    useCases: [
      "Business websites",
      "Landing pages",
      "Marketing sites",
      "Product websites",
    ],

    features: [
      "AI website generation",
      "Responsive layouts",
      "Reusable components",
      "Fast iteration",
    ],

    examples: [
      {
        title: "Start from an idea",
        description:
          "Describe your business or website and let ICOGON create the starting point.",
      },
      {
        title: "Customize everything",
        description:
          "Continue iterating until the experience matches your brand and requirements.",
      },
      {
        title: "Launch your site",
        description:
          "Move from an initial concept toward a complete web experience.",
      },
    ],
  },

  {
    id: "prototyping",
    title: "Prototyping",
    shortTitle: "Prototyping",
    description: "Go from concept to functional prototype.",
    path: "/solutions/prototyping",
    icon: Wrench,

    heroTitle: "Prototype at the speed of thought.",
    heroDescription:
      "Turn product concepts into functional prototypes and explore ideas before investing in a full implementation.",

    useCases: [
      "Product prototypes",
      "Feature experiments",
      "Proof of concepts",
      "Interactive demos",
    ],

    features: [
      "Prompt-to-prototype",
      "Rapid iteration",
      "Functional interfaces",
      "AI-assisted development",
    ],

    examples: [
      {
        title: "Explore an idea",
        description:
          "Turn a rough concept into something you can interact with.",
      },
      {
        title: "Test a workflow",
        description:
          "Build enough of an experience to understand how the workflow feels.",
      },
      {
        title: "Share a functional demo",
        description:
          "Use a working prototype to communicate an idea with your team.",
      },
    ],
  },

  {
    id: "internal-tools",
    title: "Internal Tools",
    shortTitle: "Internal Tools",
    description: "Build custom software for the way your team works.",
    path: "/solutions/internal-tools",
    icon: Code2,

    heroTitle: "Build the internal tools you wish you had.",
    heroDescription:
      "Create custom dashboards, admin panels, workflows, and business applications around your team's unique needs.",

    useCases: [
      "Admin panels",
      "Internal dashboards",
      "Employee tools",
      "Business workflows",
    ],

    features: [
      "Custom interfaces",
      "Database integrations",
      "Role-based workflows",
      "AI-assisted development",
    ],

    examples: [
      {
        title: "Replace spreadsheets",
        description:
          "Turn repetitive spreadsheet-based workflows into purpose-built applications.",
      },
      {
        title: "Build admin tools",
        description:
          "Create custom interfaces for managing your business operations.",
      },
      {
        title: "Connect your systems",
        description:
          "Bring existing data and services together into one workflow.",
      },
    ],
  },
];

export const solutionGroups = [
  {
    title: "For Teams",
    items: solutionsData.filter((solution) =>
      [
        "founders",
        "product-managers",
        "designers",
        "marketers",
        "sales",
        "ops",
        "people",
      ].includes(solution.id),
    ),
  },
  {
    title: "What You Can Build",
    items: solutionsData.filter((solution) =>
      ["websites", "prototyping", "internal-tools"].includes(
        solution.id,
      ),
    ),
  },
];
