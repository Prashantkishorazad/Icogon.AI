from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.config import supabase

from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    ResetPasswordRequest,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

security = HTTPBearer(auto_error=True)


# ============================================================
# SIGN UP
# ============================================================

@router.post("/signup")
def signup(user: SignUpRequest):

    try:
        response = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password,
            }
        )

        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="User registration failed",
            )

        return {
            "message": "User created successfully",
            "user": response.user,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(user: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": user.email,
                "password": user.password,
            }
        )

        if not response.session:
            raise HTTPException(
                status_code=401,
                detail="Login failed. Invalid email or password.",
            )

        return {
            "message": "Login successful",

            "access_token": response.session.access_token,

            "refresh_token": response.session.refresh_token,

            "user": response.user,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get("/me")
def get_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
        )

    try:

        response = supabase.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired authentication token",
            )

        user = response.user

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "phone": getattr(user, "phone", None),
                "created_at": getattr(user, "created_at", None),
                "updated_at": getattr(user, "updated_at", None),
            }
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token",
        )


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
):

    try:

        supabase.auth.reset_password_email(
            request.email
        )

        return {
            "message": "Password reset email sent",
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    # IMPORTANT:
    # Do NOT call supabase.auth.sign_out() here.
    #
    # The backend uses a shared Supabase client.
    # Calling sign_out() here can modify the server-side
    # client's session rather than the browser's session.
    #
    # Frontend should call:
    # supabase.auth.signOut()

    return {
        "message": "Logout successful",
    }