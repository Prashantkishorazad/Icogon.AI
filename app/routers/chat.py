from fastapi import APIRouter, Depends
from app.middleware.jwtauth import get_current_user
from app.database.config import supabase

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.get("/history")
def get_chat_history(current_user=Depends(get_current_user)):

    response = (
        supabase.table("chat_history")
        .select("*")
        .eq("user_id", current_user.id)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data