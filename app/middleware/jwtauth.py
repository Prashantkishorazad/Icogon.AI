import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client


security = HTTPBearer()


# ==========================================
# SUPABASE CLIENT
# ==========================================

def get_supabase(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Client:

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

    if not url:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_URL is not configured"
        )

    if not key:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_PUBLISHABLE_KEY is not configured"
        )

    token = credentials.credentials

    supabase = create_client(
        url,
        key
    )

    # IMPORTANT:
    # Attach user's JWT to PostgREST request.
    # This makes auth.uid() work with RLS.
    supabase.postgrest.auth(token)

    return supabase


# ==========================================
# CURRENT USER
# ==========================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    token = credentials.credentials

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

    if not url:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_URL is not configured"
        )

    if not key:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_PUBLISHABLE_KEY is not configured"
        )

    supabase = create_client(
        url,
        key
    )

    try:

        response = supabase.auth.get_user(token)

    except Exception as e:

        print("SUPABASE AUTH ERROR:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    if not response or not response.user:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    return response.user