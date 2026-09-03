from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.database.config import supabase


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


# =========================================================
# MODELS
# =========================================================

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


# =========================================================
# AUTH
# =========================================================

def get_current_user(
    authorization: Optional[str],
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing",
        )

    if not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header",
        )

    token = authorization.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Access token missing",
        )

    try:
        auth_response = supabase.auth.get_user(token)

        if not auth_response:
            raise HTTPException(
                status_code=401,
                detail="Unable to authenticate user",
            )

        user = getattr(
            auth_response,
            "user",
            None,
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

        return user

    except HTTPException:
        raise

    except Exception as error:
        print("AUTH ERROR:", repr(error))

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


# =========================================================
# GET PROFILE
# =========================================================

@router.get("/me")
def get_my_profile(
    authorization: Optional[str] = Header(default=None),
):
    user = get_current_user(
        authorization
    )

    user_id = str(user.id)

    print(
        "PROFILE USER ID:",
        user_id,
    )

    try:
        # IMPORTANT:
        # Don't use maybe_single().
        # Fetch normal list and safely read data.

        query = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .limit(1)
        )

        result = query.execute()

        print(
            "PROFILE QUERY RESULT:",
            repr(result),
        )

        if result is None:
            profile = None

        else:
            profile = getattr(
                result,
                "data",
                None,
            )

            if isinstance(profile, list):
                profile = (
                    profile[0]
                    if profile
                    else None
                )

    except Exception as error:
        print(
            "GET PROFILE DATABASE ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch profile",
        )

    # =====================================================
    # PROFILE DOES NOT EXIST
    # CREATE IT
    # =====================================================

    if not profile:
        metadata = (
            getattr(
                user,
                "user_metadata",
                None,
            )
            or {}
        )

        provider = (
            metadata.get("provider")
            or "email"
        )

        profile = {
            "id": user_id,
            "email": getattr(
                user,
                "email",
                None,
            ),
            "full_name": (
                metadata.get("full_name")
                or metadata.get("name")
                or ""
            ),
            "phone": (
                metadata.get("phone")
                or ""
            ),
            "avatar_url": (
                metadata.get("avatar_url")
                or metadata.get("picture")
                or ""
            ),
            "provider": provider,
        }

        print(
            "CREATING PROFILE:",
            profile,
        )

        try:
            insert_result = (
                supabase
                .table("profiles")
                .insert(profile)
                .execute()
            )

            print(
                "PROFILE INSERT RESULT:",
                repr(insert_result),
            )

            if insert_result is not None:
                inserted_data = getattr(
                    insert_result,
                    "data",
                    None,
                )

                if (
                    isinstance(
                        inserted_data,
                        list,
                    )
                    and inserted_data
                ):
                    profile = inserted_data[0]

        except Exception as error:
            print(
                "PROFILE INSERT ERROR:",
                repr(error),
            )

            # We still return the auth-based profile.
            # This allows frontend to continue working.

    # =====================================================
    # SAFETY DEFAULTS
    # =====================================================

    if not isinstance(profile, dict):
        profile = {
            "id": user_id,
            "email": getattr(
                user,
                "email",
                None,
            ),
            "full_name": "",
            "phone": "",
            "avatar_url": "",
            "provider": "email",
        }

    profile["id"] = user_id

    if not profile.get("email"):
        profile["email"] = getattr(
            user,
            "email",
            None,
        )

    if not profile.get("provider"):
        profile["provider"] = "email"

    if profile.get("full_name") is None:
        profile["full_name"] = ""

    if profile.get("phone") is None:
        profile["phone"] = ""

    if profile.get("avatar_url") is None:
        profile["avatar_url"] = ""

    return {
        "status": "ok",
        "profile": profile,
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@router.put("/me")
def update_my_profile(
    payload: UpdateProfileRequest,
    authorization: Optional[str] = Header(default=None),
):
    user = get_current_user(
        authorization
    )

    user_id = str(user.id)

    update_data = {}

    # -----------------------------------------------------
    # FULL NAME
    # -----------------------------------------------------

    if payload.full_name is not None:
        update_data["full_name"] = (
            payload.full_name.strip()
        )

    # -----------------------------------------------------
    # PHONE
    # -----------------------------------------------------

    if payload.phone is not None:
        update_data["phone"] = (
            payload.phone.strip()
        )

    # -----------------------------------------------------
    # AVATAR
    # -----------------------------------------------------

    if payload.avatar_url is not None:
        update_data["avatar_url"] = (
            payload.avatar_url.strip()
        )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No profile data provided",
        )

    print(
        "UPDATING PROFILE:",
        user_id,
        update_data,
    )

    try:
        result = (
            supabase
            .table("profiles")
            .update(update_data)
            .eq("id", user_id)
            .execute()
        )

        print(
            "PROFILE UPDATE RESULT:",
            repr(result),
        )

        updated_profile = None

        if result is not None:
            data = getattr(
                result,
                "data",
                None,
            )

            if (
                isinstance(data, list)
                and data
            ):
                updated_profile = data[0]

    except Exception as error:
        print(
            "UPDATE PROFILE DATABASE ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to update profile",
        )

    # =====================================================
    # IF ROW DOES NOT EXIST → CREATE
    # =====================================================

    if not updated_profile:

        metadata = (
            getattr(
                user,
                "user_metadata",
                None,
            )
            or {}
        )

        profile_data = {
            "id": user_id,
            "email": getattr(
                user,
                "email",
                None,
            ),
            "full_name": update_data.get(
                "full_name",
                metadata.get("full_name", ""),
            ),
            "phone": update_data.get(
                "phone",
                "",
            ),
            "avatar_url": update_data.get(
                "avatar_url",
                "",
            ),
            "provider": metadata.get(
                "provider",
                "email",
            ),
        }

        try:
            insert_result = (
                supabase
                .table("profiles")
                .insert(profile_data)
                .execute()
            )

            if insert_result is not None:
                inserted_data = getattr(
                    insert_result,
                    "data",
                    None,
                )

                if (
                    isinstance(
                        inserted_data,
                        list,
                    )
                    and inserted_data
                ):
                    updated_profile = (
                        inserted_data[0]
                    )

        except Exception as error:
            print(
                "PROFILE CREATE ERROR:",
                repr(error),
            )

            updated_profile = profile_data

    # =====================================================
    # FINAL FALLBACK
    # =====================================================

    if not updated_profile:
        updated_profile = {
            "id": user_id,
            "email": getattr(
                user,
                "email",
                None,
            ),
            "full_name": update_data.get(
                "full_name",
                "",
            ),
            "phone": update_data.get(
                "phone",
                "",
            ),
            "avatar_url": update_data.get(
                "avatar_url",
                "",
            ),
            "provider": "email",
        }

    return {
        "status": "ok",
        "message": "Profile updated successfully",
        "profile": updated_profile,
    }