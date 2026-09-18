import os
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import httpx
from fastapi import (
    APIRouter,
    Header,
    HTTPException,
    Query,
)
from fastapi.responses import RedirectResponse
from supabase import create_client

from app.services.gmail_oauth import (
    build_google_authorization_url,
    decrypt_token,
    encrypt_token,
    exchange_code_for_tokens,
    refresh_google_access_token,
    revoke_google_token,
    verify_oauth_state,
)

from app.services.gmail_service import (
    get_gmail_labels,
    get_gmail_message,
    get_gmail_profile,
    list_gmail_messages,
)

from app.schemas.gmail import (
    GmailMessageListResponse,
    GmailProfileResponse,
    GmailStatusResponse,
)


router = APIRouter(
    prefix="/api/connectors/gmail",
    tags=["Gmail Connector"],
)


# ============================================================
# ENV
# ============================================================

SUPABASE_URL = os.getenv(
    "SUPABASE_URL",
    "",
)

SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "",
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)


# ============================================================
# SUPABASE
# ============================================================

def get_supabase_admin():

    if not SUPABASE_URL:
        raise RuntimeError(
            "SUPABASE_URL is missing."
        )

    if not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_SERVICE_ROLE_KEY is missing."
        )

    return create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
    )


# ============================================================
# CURRENT USER
# ============================================================

async def get_current_user_id(
    authorization: str | None,
) -> str:

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required.",
        )

    if not authorization.lower().startswith(
        "bearer "
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header.",
        )

    access_token = authorization.split(
        " ",
        1,
    )[1].strip()

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Missing access token.",
        )

    try:

        supabase = get_supabase_admin()

        result = supabase.auth.get_user(
            access_token
        )

        user = getattr(
            result,
            "user",
            None,
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid Supabase session.",
            )

        return user.id

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=401,
            detail="Unable to authenticate user.",
        ) from exc


# ============================================================
# CONNECT
# ============================================================

@router.get("/connect")
async def connect_gmail(
    authorization: str | None = Header(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    authorization_url = (
        build_google_authorization_url(
            user_id
        )
    )

    return {
        "authorization_url": authorization_url
    }


# ============================================================
# CALLBACK
# ============================================================

@router.get("/callback")
async def gmail_callback(
    code: str | None = Query(
        default=None
    ),
    state: str | None = Query(
        default=None
    ),
    error: str | None = Query(
        default=None
    ),
):

    # User cancelled Google consent.
    if error:
        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                f"/connectors?"
                f"gmail=cancelled"
            )
        )

    if not code or not state:

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                f"/connectors?"
                f"gmail=error"
                f"&message="
                f"{quote('Missing OAuth parameters')}"
            )
        )

    try:

        state_data = verify_oauth_state(
            state
        )

        user_id = state_data["user_id"]

        # ----------------------------------------------------
        # EXCHANGE CODE
        # ----------------------------------------------------

        tokens = await exchange_code_for_tokens(
            code
        )

        access_token = tokens.get(
            "access_token"
        )

        refresh_token = tokens.get(
            "refresh_token"
        )

        expires_in = int(
            tokens.get(
                "expires_in",
                3600,
            )
        )

        if not access_token:

            raise RuntimeError(
                "Google did not return an access token."
            )

        # ----------------------------------------------------
        # GET GMAIL PROFILE
        # ----------------------------------------------------

        profile = await get_gmail_profile(
            access_token
        )

        email = profile.get(
            "emailAddress"
        )

        history_id = profile.get(
            "historyId"
        )

        if not email:

            raise RuntimeError(
                "Unable to determine Gmail address."
            )

        # ----------------------------------------------------
        # SUPABASE
        # ----------------------------------------------------

        supabase = get_supabase_admin()

        # If Google doesn't return a refresh token
        # during a reconnect, preserve the existing one.
        existing = (
            supabase
            .table("connected_accounts")
            .select(
                "refresh_token_encrypted"
            )
            .eq(
                "user_id",
                user_id,
            )
            .eq(
                "provider",
                "gmail",
            )
            .maybe_single()
            .execute()
        )

        old_refresh_token = None

        if existing.data:

            encrypted_old_refresh = (
                existing.data.get(
                    "refresh_token_encrypted"
                )
            )

            if encrypted_old_refresh:

                try:
                    old_refresh_token = (
                        decrypt_token(
                            encrypted_old_refresh
                        )
                    )
                except Exception:
                    old_refresh_token = None

        final_refresh_token = (
            refresh_token
            or old_refresh_token
        )

        if not final_refresh_token:

            raise RuntimeError(
                "Google did not return a refresh token. "
                "Reconnect Gmail with consent."
            )

        expires_at = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=expires_in
            )
        ).isoformat()

        row = {
            "user_id": user_id,
            "provider": "gmail",
            "provider_account_id": email,
            "email": email,

            "access_token_encrypted":
                encrypt_token(
                    access_token
                ),

            "refresh_token_encrypted":
                encrypt_token(
                    final_refresh_token
                ),

            "token_expires_at":
                expires_at,

            "scopes": [
                scope.strip()
                for scope in os.getenv(
                    "GMAIL_SCOPES",
                    "https://www.googleapis.com/auth/gmail.readonly",
                ).split()
                if scope.strip()
            ],

            "status": "connected",
        }

        supabase.table(
            "connected_accounts"
        ).upsert(
            row,
            on_conflict="user_id,provider",
        ).execute()

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                f"/connectors?"
                f"gmail=connected"
                f"&email={quote(email)}"
            )
        )

    except Exception as exc:

        print(
            "GMAIL CALLBACK ERROR:",
            repr(exc),
        )

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                f"/connectors?"
                f"gmail=error"
                f"&message="
                f"{quote(str(exc))}"
            )
        )


# ============================================================
# GET ACCOUNT
# ============================================================

async def get_gmail_account(
    user_id: str,
):

    supabase = get_supabase_admin()

    result = (
        supabase
        .table("connected_accounts")
        .select("*")
        .eq(
            "user_id",
            user_id,
        )
        .eq(
            "provider",
            "gmail",
        )
        .maybe_single()
        .execute()
    )

    if not result.data:

        raise HTTPException(
            status_code=404,
            detail="Gmail account is not connected.",
        )

    return result.data


# ============================================================
# ACCESS TOKEN
# ============================================================

async def get_valid_gmail_access_token(
    user_id: str,
) -> str:

    account = await get_gmail_account(
        user_id
    )

    encrypted_access = account.get(
        "access_token_encrypted"
    )

    encrypted_refresh = account.get(
        "refresh_token_encrypted"
    )

    if not encrypted_access:

        raise HTTPException(
            status_code=401,
            detail="Gmail access token is missing.",
        )

    access_token = decrypt_token(
        encrypted_access
    )

    # --------------------------------------------------------
    # Check expiry
    # --------------------------------------------------------

    expires_at_raw = account.get(
        "token_expires_at"
    )

    should_refresh = True

    if expires_at_raw:

        try:

            expires_at = datetime.fromisoformat(
                expires_at_raw.replace(
                    "Z",
                    "+00:00",
                )
            )

            should_refresh = (
                datetime.now(
                    timezone.utc
                )
                >= expires_at
                - timedelta(
                    minutes=2
                )
            )

        except Exception:
            should_refresh = True

    if not should_refresh:

        return access_token

    if not encrypted_refresh:

        raise HTTPException(
            status_code=401,
            detail="Gmail refresh token is missing.",
        )

    refresh_token = decrypt_token(
        encrypted_refresh
    )

    tokens = await refresh_google_access_token(
        refresh_token
    )

    new_access_token = tokens.get(
        "access_token"
    )

    expires_in = int(
        tokens.get(
            "expires_in",
            3600,
        )
    )

    if not new_access_token:

        raise HTTPException(
            status_code=401,
            detail="Unable to refresh Gmail access token.",
        )

    new_expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            seconds=expires_in
        )
    ).isoformat()

    supabase = get_supabase_admin()

    supabase.table(
        "connected_accounts"
    ).update(
        {
            "access_token_encrypted":
                encrypt_token(
                    new_access_token
                ),

            "token_expires_at":
                new_expires_at,

            "updated_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        }
    ).eq(
        "user_id",
        user_id,
    ).eq(
        "provider",
        "gmail",
    ).execute()

    return new_access_token


# ============================================================
# STATUS
# ============================================================

@router.get(
    "/status",
    response_model=GmailStatusResponse,
)
async def gmail_status(
    authorization: str | None = Header(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    try:

        account = await get_gmail_account(
            user_id
        )

        return GmailStatusResponse(
            connected=(
                account.get(
                    "status"
                )
                == "connected"
            ),
            email=account.get(
                "email"
            ),
        )

    except HTTPException as exc:

        if exc.status_code == 404:

            return GmailStatusResponse(
                connected=False,
                email=None,
            )

        raise


# ============================================================
# PROFILE
# ============================================================

@router.get(
    "/profile",
    response_model=GmailProfileResponse,
)
async def gmail_profile(
    authorization: str | None = Header(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    access_token = (
        await get_valid_gmail_access_token(
            user_id
        )
    )

    profile = await get_gmail_profile(
        access_token
    )

    return GmailProfileResponse(
        email_address=profile.get(
            "emailAddress",
            "",
        ),
        messages_total=profile.get(
            "messagesTotal"
        ),
        threads_total=profile.get(
            "threadsTotal"
        ),
        history_id=profile.get(
            "historyId"
        ),
    )


# ============================================================
# MESSAGES
# ============================================================

@router.get(
    "/messages",
    response_model=GmailMessageListResponse,
)
async def gmail_messages(
    authorization: str | None = Header(
        default=None
    ),
    q: str | None = Query(
        default=None
    ),
    max_results: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    page_token: str | None = Query(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    access_token = (
        await get_valid_gmail_access_token(
            user_id
        )
    )

    result = await list_gmail_messages(
        access_token,
        query=q,
        max_results=max_results,
        page_token=page_token,
    )

    return GmailMessageListResponse(
        messages=result.get(
            "messages",
            [],
        ),
        next_page_token=result.get(
            "nextPageToken"
        ),
        result_size_estimate=result.get(
            "resultSizeEstimate"
        ),
    )


# ============================================================
# SINGLE MESSAGE
# ============================================================

@router.get(
    "/messages/{message_id}"
)
async def gmail_message(
    message_id: str,
    authorization: str | None = Header(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    access_token = (
        await get_valid_gmail_access_token(
            user_id
        )
    )

    return await get_gmail_message(
        access_token,
        message_id,
    )


# ============================================================
# LABELS
# ============================================================

@router.get(
    "/labels"
)
async def gmail_labels(
    authorization: str | None = Header(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    access_token = (
        await get_valid_gmail_access_token(
            user_id
        )
    )

    return await get_gmail_labels(
        access_token
    )


# ============================================================
# DISCONNECT
# ============================================================

@router.delete(
    "/disconnect"
)
async def disconnect_gmail(
    authorization: str | None = Header(
        default=None
    ),
):

    user_id = await get_current_user_id(
        authorization
    )

    account = await get_gmail_account(
        user_id
    )

    encrypted_refresh = account.get(
        "refresh_token_encrypted"
    )

    if encrypted_refresh:

        try:

            refresh_token = decrypt_token(
                encrypted_refresh
            )

            await revoke_google_token(
                refresh_token
            )

        except Exception as exc:

            print(
                "GOOGLE REVOKE WARNING:",
                repr(exc),
            )

    supabase = get_supabase_admin()

    supabase.table(
        "connected_accounts"
    ).update(
        {
            "status": "disconnected",
            "updated_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }
    ).eq(
        "user_id",
        user_id,
    ).eq(
        "provider",
        "gmail",
    ).execute()

    return {
        "success": True,
        "message": "Gmail disconnected.",
    }