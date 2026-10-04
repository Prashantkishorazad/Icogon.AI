import asyncio

from app.orchestrator.provider import build_provider
from app.orchestrator.models import RunRequest


async def main():
    provider = build_provider()

    print("Provider:", type(provider).__name__)
    print("Model:", provider.model)
    print("Planning:", provider.planning_model)

    request = RunRequest(
        user_id="groq-batch-test-user",
        project_id="groq-batch-test-project",
        idempotency_key="groq-batch-test-001",
        prompt="""
Build a production-quality modern SaaS landing page for an AI
website generator called ICOGON AI.

It should include:
- responsive navbar
- hero section
- AI website generation workflow
- feature section
- pricing section
- testimonials
- FAQ
- CTA
- footer
- responsive mobile navigation
- polished animations and interactions
- reusable React components
- separate files for components, pages, styles and configuration
""",
        quality="fast",
    )

    print("\n[1/2] Creating REAL Groq plan...")

    plan_response = await provider.create_plan(
        request,
        brief={
            "summary": "Modern SaaS landing page for an AI website generator called ICOGON AI.",
            "target_users": "Developers, startups and businesses.",
            "core_features": [
                "AI website generation",
                "Responsive landing page",
                "Pricing",
                "Testimonials",
                "FAQ",
                "Mobile navigation",
            ],
        },
        architecture={
            "frontend": "React",
            "language": "TypeScript",
            "styling": "CSS",
            "architecture": "Component-based multi-file frontend",
        },
    )

    plan = plan_response.plan

    actionable = [
        entry
        for entry in plan.file_plan
        if entry.action in {"create", "modify", "delete"}
    ]

    print("Planner SUCCESS")
    print("Total files:", len(plan.file_plan))
    print("Actionable files:", len(actionable))
    print("Tasks:", len(plan.tasks))

    print("\n[2/2] Generating REAL Groq implementation...")

    changes_response = await provider.generate_changes(
        request,
        {
            "summary": "Modern SaaS landing page for an AI website generator called ICOGON AI.",
            "target_users": "Developers, startups and businesses.",
            "core_features": [
                "AI website generation",
                "Responsive landing page",
                "Pricing",
                "Testimonials",
                "FAQ",
                "Mobile navigation",
            ],
        },
        {
            "frontend": "React",
            "language": "TypeScript",
            "styling": "CSS",
            "architecture": "Component-based multi-file frontend",
        },
        plan,
    )

    changes = changes_response.changes

    print("\nGROQ BATCH GENERATION SUCCESS")
    print("Generated files:", len(changes.files))
    print("Summary:", changes.summary)
    print(
        "Usage:",
        changes_response.usage.model_dump()
    )

    print("\nFiles:")

    for file in changes.files:
        print(
            f" - {file.path} "
            f"({file.operation}, {len(file.content)} chars)"
        )


asyncio.run(main())
