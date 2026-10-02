# Add this immediately after the orchestrator materializes the generated
# ChangeSet into `project_root`, before marking the run completed.
import project_root

from app.orchestrator.provider import verify_generated_project

verification = verify_generated_project(project_root)

if not verification["passed"]:
    # Do NOT mark the run completed.
    # Convert verification["error"] and failed check stderr/stdout into
    # Repair Agent feedback, then re-run verification.
    failed_checks = [
        check for check in verification.get("checks", [])
        if not check.get("passed")
    ]
    repair_feedback = {
        "code": verification.get("error", "verification_failed"),
        "verification": verification,
        "failed_checks": failed_checks,
    }
    # pass repair_feedback to your existing repair_changes(...) path
else:
    # Only now can the run be considered build-verified.
    pass
