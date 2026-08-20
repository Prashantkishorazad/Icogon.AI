import os
import httpx

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel


load_dotenv()


router = APIRouter()
security = HTTPBearer()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv(
    "SUPABASE_PUBLISHABLE_KEY"
)


# ============================================================
# PROFILE SCHEMA
# ============================================================

class ProfileCreate(BaseModel):
    full_name: str
    phone: str | None = None
    avatar_url: str | None = None


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


# ============================================================
# GET CURRENT USER
# ============================================================

async def get_current_user(
    credentials=Depends(security)
):
    token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authorization token missing"
        )

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
                detail="Invalid or expired Supabase token"
            )

        return {
            "user": response.json(),
            "access_token": token,
        }

    except HTTPException:
        raise

    except httpx.RequestError:

        raise HTTPException(
            status_code=503,
            detail="Supabase authentication service unavailable"
        )


# ============================================================
# GET MY PROFILE
# ============================================================

@router.get("/user/me")
async def get_my_profile(
    current_user=Depends(get_current_user)
):

    user = current_user["user"]

    user_id = user.get("id")

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID not found"
        )

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": (
            f"Bearer {current_user['access_token']}"
        ),
        "Content-Type": "application/json",
    }

    try:

        async with httpx.AsyncClient(
            timeout=10
        ) as client:

            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/profiles",
                params={
                    "id": f"eq.{user_id}",
                    "select": "*",
                },
                headers=headers,
            )

        if response.status_code != 200:

            raise HTTPException(
                status_code=500,
                detail="Unable to fetch user profile"
            )

        profiles = response.json()

        profile = profiles[0] if profiles else None

        return {
            "success": True,
            "user": user,
            "profile": profile,
        }

    except HTTPException:
        raise

    except httpx.RequestError:

        raise HTTPException(
            status_code=503,
            detail="Profile service unavailable"
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch user profile"
        )


# ============================================================
# CREATE PROFILE
# ============================================================

@router.post("/user/profile")
async def create_profile(
    profile_data: ProfileCreate,
    current_user=Depends(get_current_user)
):

    user = current_user["user"]

    user_id = user.get("id")
    email = user.get("email")

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID not found"
        )

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": (
            f"Bearer {current_user['access_token']}"
        ),
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "id": user_id,
        "full_name": profile_data.full_name,
        "email": email,
        "phone": profile_data.phone,
        "avatar_url": profile_data.avatar_url,
        "provider": user.get(
            "app_metadata",
            {}
        ).get(
            "provider",
            "email"
        ),
    }

    try:

        async with httpx.AsyncClient(
            timeout=10
        ) as client:

            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/profiles",
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
            "message": "Profile created successfully",
            "profile": (
                data[0]
                if isinstance(data, list) and data
                else data
            ),
        }

    except HTTPException:
        raise

    except httpx.RequestError:

        raise HTTPException(
            status_code=503,
            detail="Profile service unavailable"
        )

    except Exception as error:

        print(
            "CREATE PROFILE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create profile"
        )


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/user/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]
    user_id = user.get("id")

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID not found"
        )

    update_data = profile_data.model_dump(
        exclude_none=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No profile data provided"
        )

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {current_user['access_token']}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:

            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles",
                params={
                    "id": f"eq.{user_id}",
                },
                headers=headers,
                json=update_data,
            )

        print("================================")
        print("PROFILE UPDATE")
        print("User ID:", user_id)
        print("Update Data:", update_data)
        print("Supabase Status:", response.status_code)
        print("Supabase Response:", response.text)
        print("================================")

        if response.status_code not in [200, 201, 204]:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

        data = response.json() if response.text else None

        profile = None

        if isinstance(data, list) and data:
            profile = data[0]
        elif isinstance(data, dict):
            profile = data

        return {
            "success": True,
            "message": "Profile updated successfully",
            "profile": profile,
        }

    except HTTPException:
        raise

    except httpx.RequestError as error:
        print("PROFILE REQUEST ERROR:", repr(error))

        raise HTTPException(
            status_code=503,
            detail="Profile service unavailable"
        )

    except Exception as error:
        print("PROFILE UPDATE ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to update profile"
        )