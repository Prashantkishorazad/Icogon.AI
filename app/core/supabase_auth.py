import os

import httpx

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer


security = HTTPBearer()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv(
    "SUPABASE_PUBLISHABLE_KEY"
)


async def get_current_user(
    credentials=Depends(security)
):
    token = credentials.credentials

    if not SUPABASE_URL:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_URL is not configured"
        )

    if not SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_PUBLISHABLE_KEY is not configured"
        )

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {token}",
    }

    try:

        async with httpx.AsyncClient(
            timeout=10
        ) as client:

            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers=headers,
            )

        if response.status_code != 200:

            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        return {
            "user": response.json(),
            "access_token": token,
        }

    except httpx.RequestError:

        raise HTTPException(
            status_code=503,
            detail="Supabase authentication service unavailable"
        )