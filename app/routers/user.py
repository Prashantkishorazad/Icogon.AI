from fastapi import APIRouter, HTTPException, Depends

from app.database.config import supabase
from app.schemas.user import UserCreate, UserUpdate
from app.middleware.jwtauth import get_current_user

router = APIRouter(
    prefix="/user",
    tags=["User"]
)


@router.post("/")
def create_user(
    user: UserCreate,
    current_user=Depends(get_current_user)
):
    response = supabase.table("user").insert({
        "name": user.name,
        "email": user.email
    }).execute()

    return response.data


@router.get("/")
def get_users(
    current_user=Depends(get_current_user)
):
    response = supabase.table("user").select("*").execute()

    return response.data


@router.get("/{user_id}")
def get_user(
    user_id: int,
    current_user=Depends(get_current_user)
):
    response = (
        supabase
        .table("user")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return response.data[0]


@router.put("/{user_id}")
def update_user(
    user_id: int,
    user: UserUpdate,
    current_user=Depends(get_current_user)
):
    response = (
        supabase
        .table("user")
        .update({
            "name": user.name,
            "email": user.email
        })
        .eq("id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return response.data[0]


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(get_current_user)
):
    response = (
        supabase
        .table("user")
        .delete()
        .eq("id", user_id)
        .execute()
    )

    return {
        "message": "User deleted successfully",
        "data": response.data
    }