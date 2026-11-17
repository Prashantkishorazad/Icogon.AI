from datetime import datetime, timezone
from secrets import token_urlsafe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.middleware.jwtauth import get_current_user, get_supabase

router = APIRouter(prefix="/projects", tags=["Project sharing"])

class ShareCreate(BaseModel):
    permission: str = Field(default="view", pattern="^(view|edit)$")
    expires_at: datetime | None = None

@router.post("/{project_id}/shares")
def create_project_share(project_id: str, body: ShareCreate, current_user=Depends(get_current_user), supabase=Depends(get_supabase)):
    owned = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", current_user.id).execute()
    if not owned.data:
        raise HTTPException(status_code=404, detail="Project not found")
    token = token_urlsafe(32)
    row = {"project_id": project_id, "created_by": current_user.id, "token": token, "permission": body.permission, "expires_at": body.expires_at.isoformat() if body.expires_at else None}
    result = supabase.table("project_shares").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Unable to create share link")
    return {"id": result.data[0]["id"], "token": token, "permission": body.permission, "expires_at": row["expires_at"]}

@router.get("/{project_id}/shares")
def list_project_shares(project_id: str, current_user=Depends(get_current_user), supabase=Depends(get_supabase)):
    owned = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", current_user.id).execute()
    if not owned.data:
        raise HTTPException(status_code=404, detail="Project not found")
    result = supabase.table("project_shares").select("id,permission,created_at,expires_at,revoked_at").eq("project_id", project_id).order("created_at", desc=True).execute()
    return result.data or []

@router.delete("/{project_id}/shares/{share_id}")
def revoke_project_share(project_id: str, share_id: str, current_user=Depends(get_current_user), supabase=Depends(get_supabase)):
    owned = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", current_user.id).execute()
    if not owned.data:
        raise HTTPException(status_code=404, detail="Project not found")
    result = supabase.table("project_shares").update({"revoked_at": datetime.now(timezone.utc).isoformat()}).eq("id", share_id).eq("project_id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Share link not found")
    return {"revoked": True}

@router.get("/shared/{token}")
def resolve_project_share(token: str, supabase=Depends(get_supabase)):
    result = supabase.table("project_shares").select("project_id,permission,expires_at,revoked_at").eq("token", token).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Share link not found")
    share = result.data[0]
    if share.get("revoked_at"):
        raise HTTPException(status_code=410, detail="Share link has been revoked")
    if share.get("expires_at") and datetime.fromisoformat(share["expires_at"].replace("Z", "+00:00")) <= datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Share link has expired")
    project = supabase.table("projects").select("id,name,description,created_at,updated_at").eq("id", share["project_id"]).single().execute()
    return {"project": project.data, "permission": share["permission"]}
