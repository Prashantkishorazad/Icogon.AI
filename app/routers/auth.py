from app.database.config import supabase
from fastapi import APIRouter
from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(user: SignUpRequest):

    response = supabase.auth.sign_up(
        {
            "email": user.email,
            "password": user.password,
        }
    )

    return {
        "message": "User created successfully",
        "user": response.user,
    }


@router.post("/login")
def login(user: LoginRequest):

    response = supabase.auth.sign_in_with_password(
        {
            "email": user.email,
            "password": user.password,
        }
    )

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user": response.user,
    }


@router.get("/me")
def get_user():

    user = supabase.auth.get_user()

    return user


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):

    supabase.auth.reset_password_email(request.email)

    return {
        "message": "Password reset email sent"
    }


@router.post("/logout")
def logout():

    supabase.auth.sign_out()

    return {
        "message":"Logged out successfully"
    }

@router.get("/me")
def get_user():

    user = supabase.auth.get_user()

    return user

