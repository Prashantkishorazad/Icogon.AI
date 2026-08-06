from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.config import supabase

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    response = supabase.auth.get_user(token)

    if response.user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    return response.user