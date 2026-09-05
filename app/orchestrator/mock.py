from __future__ import annotations

from html import escape
from pathlib import PurePosixPath

from app.agents.contracts import ArchitectureProposal, ProjectBrief
from app.agents.design import design_context
from app.orchestrator.models import (
    ChangeResponse,
    ChangeSet,
    FileChange,
    GenerationPlan,
    PlanResponse,
    PlanTask,
    ProviderUsage,
    RunRequest,
    VerificationResult,
)


class MockAgentProvider:
    async def create_plan(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
    ) -> PlanResponse:
        from app.agents.templates import scene_blueprint

        three_d = (
            "three_d"
            in design_context(request.prompt, request.context_files)["project_signals"]
        )
        plan = GenerationPlan(
            blueprint=scene_blueprint() if three_d else None,
            summary=f"Create a minimal implementation for: {request.prompt}",
            assumptions=[
                "The project uses the existing repository conventions.",
                "Generated code must be verified before it is published.",
            ],
            tasks=[
                PlanTask(
                    id="task-1",
                    title="Generate project change",
                    description=request.prompt,
                    target_files=["src/App.tsx"] if three_d else ["index.html"],
                )
            ],
        )
        return PlanResponse(
            plan=plan,
            usage=ProviderUsage(input_tokens=30, output_tokens=80),
        )

    async def generate_changes(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
    ) -> ChangeResponse:
        if plan.blueprint and plan.blueprint.template == "react-three":
            from app.agents.templates import scene_snapshot

            return ChangeResponse(
                changes=scene_snapshot(),
                usage=ProviderUsage(input_tokens=90, output_tokens=120),
            )
        content = demo_html(request.prompt)
        return ChangeResponse(
            changes=ChangeSet(
                summary="Offline task-board demo (not model-generated)",
                files=[FileChange(path="index.html", content=content)],
            ),
            usage=ProviderUsage(input_tokens=90, output_tokens=120),
        )

    async def repair_changes(
        self,
        request: RunRequest,
        brief: ProjectBrief,
        architecture: ArchitectureProposal,
        plan: GenerationPlan,
        changes: ChangeSet,
        feedback: list[str],
    ) -> ChangeResponse:
        repaired = changes.model_copy(deep=True)
        repaired.summary = "Repair generated output after verification feedback"
        if repaired.files:
            repaired.files[0].content += "\nVerification feedback addressed.\n"
        return ChangeResponse(
            changes=repaired,
            usage=ProviderUsage(input_tokens=100, output_tokens=60),
        )


class StaticChangeVerifier:
    async def verify(
        self,
        project_id: str,
        changes: ChangeSet,
    ) -> VerificationResult:
        has_files = bool(changes.files)
        paths_are_relative = all(
            self._is_safe_project_path(change.path) for change in changes.files
        )
        passed = has_files and paths_are_relative
        feedback: list[str] = []
        if not has_files:
            feedback.append("The change set must contain at least one file.")
        if not paths_are_relative:
            feedback.append(
                "All generated paths must stay inside the project workspace."
            )
        return VerificationResult(
            passed=passed,
            checks={"has_files": has_files, "safe_relative_paths": paths_are_relative},
            feedback=feedback,
        )

    @staticmethod
    def _is_safe_project_path(path: str) -> bool:
        if not path or "\\" in path or "\x00" in path:
            return False
        candidate = PurePosixPath(path)
        return (
            not candidate.is_absolute()
            and candidate.parts not in {(), (".",)}
            and ".." not in candidate.parts
            and ":" not in candidate.parts[0]
        )


def demo_html(prompt: str) -> str:
    return (
        """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Team task board</title><style>
body{font-family:system-ui,sans-serif;margin:0;background:#f5f5f7;color:#222;padding:clamp(20px,5vw,64px)}main{max-width:760px;margin:auto}small{color:#645477}h1{font-size:36px;letter-spacing:-1px}p{color:#62626f;line-height:1.7}form{display:flex;gap:10px;margin:30px 0}input{flex:1;min-width:0;padding:13px;border:1px solid #bbb;border-radius:6px;font:inherit}button{padding:12px 18px;background:#544278;color:white;border:0;border-radius:6px;cursor:pointer}li{list-style:none;padding:18px;background:white;margin:10px 0;border-radius:8px;display:flex;align-items:center;gap:12px}li input{flex:0}ul{padding:0}li:has(input:checked) span{text-decoration:line-through;color:#777}button:focus-visible,input:focus-visible{outline:3px solid #8b5cf6;outline-offset:3px}
</style></head><body><main><small>ICOGON / OFFLINE DEMO</small><h1>Make room for your best work.</h1><p>A sample task board. This fixed demo tests orchestration and preview; connect a model for custom applications.</p><p>Requested: """
        + escape(prompt)
        + """</p><form id="task-form"><input id="task" aria-label="New task" placeholder="What needs to get done?" required maxlength="200"><button>Add task</button></form><ul id="tasks"><li><input type="checkbox" aria-label="Complete Define the first user flow"><span>Define the first user flow</span></li><li><input type="checkbox" aria-label="Complete Review the prototype"><span>Review the prototype</span></li></ul><p id="status" role="status">Changes stay in this preview and reset when it reloads.</p></main><script>
document.getElementById('task-form').addEventListener('submit',function(event){event.preventDefault();const input=document.getElementById('task');if(!input.value.trim())return;const row=document.createElement('li');const check=document.createElement('input');check.type='checkbox';check.setAttribute('aria-label','Complete '+input.value);const label=document.createElement('span');label.textContent=input.value;row.append(check,label);document.getElementById('tasks').append(row);input.value='';input.focus();document.getElementById('status').textContent='Task added to this preview.'});
</script></body></html>"""
    )
