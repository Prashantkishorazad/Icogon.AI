from fastapi import APIRouter, Depends, HTTPException

from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
)

from app.middleware.jwtauth import (
    get_current_user,
    get_supabase,
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


# ============================================================
# GET ALL PROJECTS
# ============================================================

@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    current_user=Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    response = (
        supabase
        .table("projects")
        .select("*")
        .eq("user_id", current_user.id)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data


# ============================================================
# CREATE PROJECT
# ============================================================

@router.post(
    "",
    response_model=ProjectResponse,
)
def create_project(
    project: ProjectCreate,
    current_user=Depends(get_current_user),
    supabase=Depends(get_supabase),
):

    # --------------------------------------------------------
    # IMPORTANT:
    # Supabase projects table has prompt NOT NULL.
    # So prompt must ALWAYS be supplied.
    # --------------------------------------------------------

    clean_name = project.name.strip()
    clean_description = (
        project.description.strip()
        if project.description
        else ""
    )

    if not clean_name:
        raise HTTPException(
            status_code=400,
            detail="Project name is required.",
        )

    if not clean_description:
        raise HTTPException(
            status_code=400,
            detail="Project description is required.",
        )

    data = {
        "user_id": current_user.id,
        "name": clean_name,
        "description": clean_description,

        # REQUIRED BY SUPABASE TABLE
        "prompt": clean_description,
    }

    response = (
        supabase
        .table("projects")
        .insert(data)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Project creation failed.",
        )

    return response.data[0]


# ============================================================
# GET SINGLE PROJECT
# ============================================================

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_supabase),
):

    response = (
        supabase
        .table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    return response.data


# ============================================================
# DELETE PROJECT
# ============================================================

@router.delete(
    "/{project_id}",
)
def delete_project(
    project_id: str,
    current_user=Depends(get_current_user),
    supabase=Depends(get_supabase),
):

    response = (
        supabase
        .table("projects")
        .delete()
        .eq("id", project_id)
        .eq("user_id", current_user.id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    return {
        "message": "Project deleted successfully",
    }