from fastapi import APIRouter, Depends, HTTPException
from app.middleware.jwtauth import get_current_user, get_supabase

router = APIRouter(prefix="/projects", tags=["Project publishing"])

@router.post("/{project_id}/publish")
def publish_project(project_id: str, current_user=Depends(get_current_user), supabase=Depends(get_supabase)):
    """Safe provider gate. Replace with a real deployment adapter before enabling Publish in the UI."""
    owned = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", current_user.id).execute()
    if not owned.data:
        raise HTTPException(status_code=404, detail="Project not found")
    raise HTTPException(status_code=501, detail="Publishing is not configured. Connect a deployment provider (for example, a managed build/deploy service) before enabling this endpoint.")
