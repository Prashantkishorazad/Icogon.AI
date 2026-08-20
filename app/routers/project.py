import os
import httpx

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel

from app.routers.user import get_current_user


load_dotenv()

router = APIRouter()
security = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv(
    "SUPABASE_PUBLISHABLE_KEY"
)


# ============================================================
# PROJECT SCHEMAS
# ============================================================

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    prompt: str
    type: str = "website"


# ============================================================
# CREATE PROJECT
# ============================================================

@router.post("/projects")
async def create_project(
    project: ProjectCreate,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    token = current_user["access_token"]

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "user_id": user_id,
        "name": project.name,
        "description": project.description,
        "prompt": project.prompt,
        "type": project.type,
        "status": "draft",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/projects",
                headers=headers,
                json=payload,
            )

        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text,
            )

        data = response.json()

        return {
            "success": True,
            "message": "Project created successfully",
            "project": data[0] if isinstance(data, list) else data,
        }

    except HTTPException:
        raise

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Project service unavailable",
        )


# ============================================================
# GET MY PROJECTS
# ============================================================

@router.get("/projects")
async def get_my_projects(
    current_user=Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    token = current_user["access_token"]

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/projects",
                params={
                    "user_id": f"eq.{user_id}",
                    "select": "*",
                    "order": "created_at.desc",
                },
                headers=headers,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text,
            )

        return {
            "success": True,
            "projects": response.json(),
        }

    except HTTPException:
        raise

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Project service unavailable",
        )


# ============================================================
# GET SINGLE PROJECT
# ============================================================

@router.get("/projects/{project_id}")
async def get_project(
    project_id: str,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    token = current_user["access_token"]

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/projects",
                params={
                    "id": f"eq.{project_id}",
                    "user_id": f"eq.{user_id}",
                    "select": "*",
                },
                headers=headers,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text,
            )

        projects = response.json()

        if not projects:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        return {
            "success": True,
            "project": projects[0],
        }

    except HTTPException:
        raise

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Project service unavailable",
        )


# ============================================================
# DELETE PROJECT
# ============================================================

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    token = current_user["access_token"]

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/projects",
                params={
                    "id": f"eq.{project_id}",
                    "user_id": f"eq.{user_id}",
                },
                headers=headers,
            )

        if response.status_code not in [200, 204]:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text,
            )

        return {
            "success": True,
            "message": "Project deleted successfully",
        }

    except HTTPException:
        raise

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Project service unavailable",
        )