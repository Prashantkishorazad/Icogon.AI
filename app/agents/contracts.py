from enum import Enum

from pydantic import BaseModel, Field


class RequirementPriority(str, Enum):
    MUST = "must"
    SHOULD = "should"
    COULD = "could"


class Requirement(BaseModel):
    id: str
    statement: str = Field(min_length=3)
    priority: RequirementPriority = RequirementPriority.MUST


class ProjectBrief(BaseModel):
    summary: str = Field(min_length=3)
    application_type: str
    target_users: list[str] = Field(default_factory=list)
    requirements: list[Requirement] = Field(min_length=1)
    quality_attributes: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    acceptance_criteria: list[str] = Field(default_factory=list)
    open_questions: list[str] = Field(default_factory=list)


class ArchitectureModule(BaseModel):
    name: str
    responsibility: str
    dependencies: list[str] = Field(default_factory=list)


class ArchitectureDecision(BaseModel):
    id: str
    decision: str
    rationale: str


class ArchitectureProposal(BaseModel):
    style: str
    modules: list[ArchitectureModule] = Field(min_length=1)
    decisions: list[ArchitectureDecision] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    required_checks: list[str] = Field(default_factory=list)


class ReviewSeverity(str, Enum):
    BLOCKING = "blocking"
    WARNING = "warning"


class ReviewFinding(BaseModel):
    code: str
    message: str
    severity: ReviewSeverity
    path: str | None = None


class ChangeReview(BaseModel):
    approved: bool
    findings: list[ReviewFinding] = Field(default_factory=list)
    required_checks: list[str] = Field(default_factory=list)


class SecurityAssessment(BaseModel):
    approved: bool
    findings: list[ReviewFinding] = Field(default_factory=list)
