
type TemplateCategory =
    | "saas"
    | "landing-page"
    | "portfolio"
    | "ecommerce"
    | "dashboard"
    | "ai-app"
    | "crm"
    | "internal-tool"
    | "productivity"
    | "business"
    | "education"
    | "finance"
    | "creative"
    | "healthcare"
    | "social"
    | "other";

type TemplateCategoryFilter = TemplateCategory | "all";

type DiscoveryTemplate = {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    difficulty: "beginner" | "intermediate" | "advanced";
    featured?: boolean;
    tags: string[];
    technologies?: string[];
    prompt: string;
};

type TemplateFilters = {
    query: string;
    category: TemplateCategoryFilter;
    featuredOnly?: boolean;
};

/* =========================================================
   TEMPLATE CATEGORY LABELS
========================================================= */

export const TEMPLATE_CATEGORY_LABELS: Record<
    TemplateCategory,
    string
> = {
    saas: "SaaS",
    "landing-page": "Landing pages",
    portfolio: "Portfolios",
    ecommerce: "E-commerce",
    dashboard: "Dashboards",
    "ai-app": "AI applications",
    crm: "CRM",
    "internal-tool": "Internal tools",
    productivity: "Productivity",
    business: "Business",
    education: "Education",
    finance: "Finance",
    creative: "Creative",
    healthcare: "Healthcare",
    social: "Social",
    other: "Other",
};

/* =========================================================
   ICOGON TEMPLATE CATALOG
========================================================= */

export const TEMPLATE_DATA: DiscoveryTemplate[] = [
    /* =======================================================
       01. SAAS STARTER
    ======================================================= */

    {
        id: "saas-starter",
        name: "SaaS Starter",
        description:
            "A modern SaaS platform with authentication, pricing, dashboards and subscription management.",

        category: "saas",
        difficulty: "intermediate",

        featured: true,

        tags: [
            "saas",
            "startup",
            "subscription",
            "dashboard",
            "authentication",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Supabase",
        ],

        prompt: `
Build a premium SaaS web application.

Include:
- Modern responsive landing page
- Authentication screens
- User onboarding
- Application dashboard
- Subscription pricing pages
- Account and workspace settings
- Billing interface
- Notification center
- Light and dark themes

Design direction:
Use a sophisticated blue and neutral color palette,
clean typography, subtle gradients, rounded cards,
and polished micro-interactions.

Create reusable components with a scalable architecture.
Include loading, empty, success and error states.
Ensure accessibility and mobile responsiveness.

Use demo data where backend services are unavailable.
Do not represent simulated payments or authentication
as production-ready functionality.
    `.trim(),
    },

    /* =======================================================
       02. AI WORKSPACE
    ======================================================= */

    {
        id: "ai-workspace",
        name: "AI Workspace",
        description:
            "An intelligent workspace featuring AI conversations, model selection and organized chat history.",

        category: "ai-app",
        difficulty: "advanced",

        featured: true,

        tags: [
            "ai",
            "chat",
            "assistant",
            "llm",
            "workspace",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "FastAPI",
        ],

        prompt: `
Build a modern AI assistant workspace.

Include:
- Collapsible conversation sidebar
- Chat interface with message streaming support
- Markdown and code block rendering
- Conversation search
- Model selection
- File attachment interface
- Conversation management
- Usage dashboard
- User settings
- Responsive mobile layout

Design a distraction-free interface with premium dark
surfaces, subtle blue accents and smooth transitions.

Separate the UI from the AI provider integration.
Never expose provider API keys in frontend code.
Clearly label simulated AI responses until a real
AI backend is connected.
    `.trim(),
    },

    /* =======================================================
       03. ANALYTICS STUDIO
    ======================================================= */

    {
        id: "analytics-studio",
        name: "Analytics Studio",
        description:
            "A data-driven business dashboard with interactive charts, KPI cards and reporting tools.",

        category: "dashboard",
        difficulty: "intermediate",

        featured: true,

        tags: [
            "analytics",
            "data",
            "charts",
            "metrics",
            "reporting",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Recharts",
        ],

        prompt: `
Build a professional analytics dashboard.

Include:
- Revenue and growth metrics
- Interactive line, bar and pie charts
- Date range filters
- KPI comparison cards
- Traffic source analytics
- Searchable data tables
- Report export functionality
- Responsive sidebar
- Light and dark themes

Use clean typography, consistent chart colors,
accessible data visualizations and thoughtful spacing.

Provide realistic, clearly labeled demonstration data.
Make all filters and chart interactions functional.
    `.trim(),
    },

    /* =======================================================
       04. MODERN STORE
    ======================================================= */

    {
        id: "modern-store",
        name: "Modern Store",
        description:
            "An elegant online shopping experience with product collections, cart and checkout.",

        category: "ecommerce",
        difficulty: "advanced",

        featured: true,

        tags: [
            "store",
            "shopping",
            "products",
            "checkout",
            "retail",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
        ],

        prompt: `
Build a premium e-commerce website.

Include:
- Responsive storefront
- Product collections
- Product search and filtering
- Product detail pages
- Shopping cart
- Wishlist
- Checkout interface
- Order history
- Customer account pages
- Inventory administration dashboard

Use editorial product layouts, elegant typography
and a clean, minimal color palette.

Implement functional cart calculations and validation.
Clearly distinguish demo checkout from real payments.
    `.trim(),
    },

    /* =======================================================
       05. CREATIVE PORTFOLIO
    ======================================================= */

    {
        id: "creative-portfolio",
        name: "Creative Portfolio",
        description:
            "A visually expressive portfolio for designers, developers and creative professionals.",

        category: "portfolio",
        difficulty: "beginner",

        tags: [
            "portfolio",
            "designer",
            "developer",
            "personal",
            "creative",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Framer Motion",
        ],

        prompt: `
Build a visually stunning personal portfolio.

Include:
- Strong typographic hero
- Featured project gallery
- Individual case studies
- About section
- Skills and experience
- Services section
- Contact form
- Social links
- Responsive navigation

Use expressive typography, editorial compositions,
generous whitespace and subtle entrance animations.

Keep animations smooth and accessible.
Respect reduced-motion preferences.
Clearly label placeholder portfolio content.
    `.trim(),
    },

    /* =======================================================
       06. AGENCY PRO
    ======================================================= */

    {
        id: "agency-pro",
        name: "Agency Pro",
        description:
            "A premium agency website designed to showcase services, work and client success stories.",

        category: "business",
        difficulty: "beginner",

        tags: [
            "agency",
            "business",
            "marketing",
            "services",
            "website",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Framer Motion",
        ],

        prompt: `
Build a premium digital agency website.

Include:
- Bold hero section
- Service offerings
- Featured client projects
- Process and methodology
- Team section
- Case studies
- Contact and inquiry forms
- Responsive navigation and footer

Use a sophisticated monochrome design with a vibrant
accent color, large typography and strong visual hierarchy.

Create reusable layouts for future case studies.
Use clearly labeled example testimonials and client data.
    `.trim(),
    },

    /* =======================================================
       07. CRM WORKSPACE
    ======================================================= */

    {
        id: "crm-workspace",
        name: "CRM Workspace",
        description:
            "Manage customers, sales opportunities, pipelines and team activities in one workspace.",

        category: "crm",
        difficulty: "advanced",

        tags: [
            "crm",
            "sales",
            "customers",
            "pipeline",
            "leads",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Supabase",
        ],

        prompt: `
Build a professional customer relationship management app.

Include:
- Sales dashboard
- Kanban deal pipeline
- Contact management
- Lead management
- Customer detail pages
- Activity timeline
- Follow-up task management
- Sales analytics
- Team settings

Support searchable tables, status filters,
form validation and drag-and-drop pipeline management.

Design a compact, responsive enterprise interface.
Separate mock services from production data integrations.
    `.trim(),
    },

    /* =======================================================
       08. TASKFLOW
    ======================================================= */

    {
        id: "taskflow",
        name: "TaskFlow",
        description:
            "A collaborative productivity workspace with tasks, boards, calendars and project tracking.",

        category: "productivity",
        difficulty: "intermediate",

        tags: [
            "task",
            "kanban",
            "productivity",
            "management",
            "team",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
        ],

        prompt: `
Build a modern project management application.

Include:
- Project overview
- Kanban boards
- Task lists
- Calendar view
- Task detail modal
- Priority and status management
- Project search
- Team member interface
- Progress analytics

Support creating, editing, completing and deleting tasks.
Implement sorting and filtering.

Use a clean workspace layout with keyboard-friendly
interactions and consistent visual feedback.
    `.trim(),
    },

    /* =======================================================
       09. LAUNCHPAD
    ======================================================= */

    {
        id: "launchpad",
        name: "Launchpad",
        description:
            "A conversion-focused landing page for startups, products and upcoming launches.",

        category: "landing-page",
        difficulty: "beginner",

        tags: [
            "landing",
            "startup",
            "launch",
            "marketing",
            "waitlist",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Framer Motion",
        ],

        prompt: `
Build a high-quality startup product landing page.

Include:
- Attention-grabbing hero
- Product preview section
- Features and benefits
- How it works
- Pricing plans
- FAQ accordion
- Waitlist signup form
- Call-to-action sections
- Responsive footer

Use modern gradients, strong typography,
thoughtful whitespace and subtle animations.

Optimize accessibility, performance and SEO metadata.
Validate forms and clearly identify demo submissions.
    `.trim(),
    },

    /* =======================================================
       10. ADMIN CONTROL CENTER
    ======================================================= */

    {
        id: "admin-control-center",
        name: "Admin Control Center",
        description:
            "A scalable administration interface for users, permissions, reporting and system management.",

        category: "internal-tool",
        difficulty: "advanced",

        tags: [
            "admin",
            "internal",
            "management",
            "permissions",
            "users",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Supabase",
        ],

        prompt: `
Build an enterprise administration dashboard.

Include:
- System overview
- User management table
- Role and permission management interface
- Audit log interface
- Reports and analytics
- Notification management
- Application settings
- Search and filtering
- Responsive navigation

Support pagination, confirmation dialogs,
form validation and accessible controls.

Administrative authorization must be enforced by
the backend when connected to production services.
Clearly label simulated administrator functionality.
    `.trim(),
    },

    /* =======================================================
       11. FINANCE TRACKER
    ======================================================= */

    {
        id: "finance-tracker",
        name: "Finance Tracker",
        description:
            "A personal finance dashboard with budgets, expenses and financial insights.",

        category: "finance",
        difficulty: "intermediate",

        tags: [
            "finance",
            "budget",
            "expenses",
            "money",
            "analytics",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Recharts",
        ],

        prompt: `
Build a personal finance management dashboard.

Include:
- Income and expense overview
- Transaction management
- Monthly budget planning
- Spending categories
- Savings goals
- Financial analytics
- Date and category filters
- CSV export

Use clear financial visualizations and accurate
calculations with appropriate currency formatting.

Use demonstration financial data.
Do not request banking credentials or simulate
a successful connection to a real bank.
    `.trim(),
    },

    /* =======================================================
       12. LEARNING HUB
    ======================================================= */

    {
        id: "learning-hub",
        name: "Learning Hub",
        description:
            "A modern learning platform with courses, lessons, quizzes and student progress.",

        category: "education",
        difficulty: "intermediate",

        tags: [
            "education",
            "courses",
            "learning",
            "students",
            "lms",
        ],

        technologies: [
            "React",
            "TypeScript",
            "Tailwind CSS",
        ],

        prompt: `
Build a modern online learning platform.

Include:
- Course discovery gallery
- Course detail pages
- Lesson navigation
- Video lesson interface
- Progress tracking
- Interactive quizzes
- Student dashboard
- Bookmarked lessons
- Instructor profiles

Create an engaging, accessible learning experience
with responsive layouts and clear educational hierarchy.

Use original demonstration course content.
Make quiz scoring and progress tracking functional.
    `.trim(),
    },
];

/* =========================================================
   AVAILABLE TEMPLATE CATEGORIES
========================================================= */

export const TEMPLATE_CATEGORIES: {
    id: TemplateCategoryFilter;
    label: string;
}[] = [
        {
            id: "all",
            label: "All templates",
        },

        ...Array.from(
            new Set(
                TEMPLATE_DATA.map(
                    (template) => template.category,
                ),
            ),
        ).map((category) => ({
            id: category,
            label: TEMPLATE_CATEGORY_LABELS[category],
        })),
    ];

/* =========================================================
   FEATURED TEMPLATES
========================================================= */

export const FEATURED_TEMPLATES =
    TEMPLATE_DATA.filter(
        (template) => template.featured,
    );

/* =========================================================
   GET TEMPLATE BY ID
========================================================= */

export const getTemplateById = (
    id: string,
): DiscoveryTemplate | undefined => {
    return TEMPLATE_DATA.find(
        (template) => template.id === id,
    );
};

/* =========================================================
   SEARCH NORMALIZATION
========================================================= */

const normalizeSearchText = (
    value: string,
): string =>
    value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .trim();

/* =========================================================
   TEMPLATE FILTER ENGINE
========================================================= */

export const filterTemplates = (
    filters: TemplateFilters,
): DiscoveryTemplate[] => {
    const {
        query,
        category,
        featuredOnly = false,
    } = filters;

    const words = normalizeSearchText(query)
        .split(/\s+/)
        .filter(Boolean);

    return TEMPLATE_DATA.filter((template) => {
        if (
            category !== "all" &&
            template.category !== category
        ) {
            return false;
        }

        if (
            featuredOnly &&
            !template.featured
        ) {
            return false;
        }

        const searchableText =
            normalizeSearchText(
                [
                    template.name,
                    template.description,
                    template.category,
                    TEMPLATE_CATEGORY_LABELS[
                    template.category
                    ],
                    ...template.tags,
                    ...(template.technologies || []),
                ].join(" "),
            );

        return words.every((word) =>
            searchableText.includes(word),
        );
    });
};

/* =========================================================
   RELATED TEMPLATES
========================================================= */

export const getRelatedTemplates = (
    templateId: string,
    limit = 3,
): DiscoveryTemplate[] => {
    const currentTemplate =
        getTemplateById(templateId);

    if (!currentTemplate || limit <= 0) {
        return [];
    }

    const tags = new Set(
        currentTemplate.tags,
    );

    return TEMPLATE_DATA
        .filter(
            (template) =>
                template.id !== templateId,
        )
        .map((template) => {
            const categoryScore =
                template.category ===
                    currentTemplate.category
                    ? 5
                    : 0;

            const tagScore =
                template.tags.filter(
                    (tag) => tags.has(tag),
                ).length;

            return {
                template,
                score: categoryScore + tagScore,
            };
        })
        .filter((entry) => entry.score > 0)
        .sort(
            (first, second) =>
                second.score - first.score,
        )
        .slice(0, limit)
        .map((entry) => entry.template);
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default TEMPLATE_DATA;
