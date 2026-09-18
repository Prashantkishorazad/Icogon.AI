import hashlib
import hmac
import json
import os
import secrets
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:8000/api/connectors/gmail/callback",
)

GMAIL_SCOPES = os.getenv(
    "GMAIL_SCOPES",
    "https://www.googleapis.com/auth/gmail.readonly",
)

CONNECTOR_ENCRYPTION_KEY = os.getenv(
    "CONNECTOR_ENCRYPTION_KEY",
    "",
)


GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

GOOGLE_REVOKE_URL = (
    "https://oauth2.googleapis.com/revoke"
)


# ============================================================
# STATE SIGNING
# ============================================================

def _state_secret() -> bytes:
    secret = os.getenv("CONNECTOR_STATE_SECRET")

    if not secret:
        secret = CONNECTOR_ENCRYPTION_KEY

    if not secret:
        raise RuntimeError(
            "CONNECTOR_STATE_SECRET or "
            "CONNECTOR_ENCRYPTION_KEY is required."
        )

    return secret.encode()


def create_oauth_state(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "nonce": secrets.token_urlsafe(24),
        "created_at": int(time.time()),
    }

    raw = json.dumps(
        payload,
        separators=(",", ":"),
    ).encode()

    encoded = urlsafe_b64encode(raw).decode().rstrip("=")

    signature = hmac.new(
        _state_secret(),
        encoded.encode(),
        hashlib.sha256,
    ).hexdigest()

    return f"{encoded}.{signature}"


def verify_oauth_state(state: str) -> dict[str, Any]:
    try:
        encoded, signature = state.split(".", 1)

        expected_signature = hmac.new(
            _state_secret(),
            encoded.encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(
            signature,
            expected_signature,
        ):
            raise ValueError("Invalid OAuth state.")

        padding = "=" * (-len(encoded) % 4)

        raw = urlsafe_b64decode(
            encoded + padding
        )

        payload = json.loads(raw.decode())

        created_at = int(
            payload.get("created_at", 0)
        )

        # State valid for 10 minutes.
        if time.time() - created_at > 600:
            raise ValueError(
                "OAuth state has expired."
            )

        user_id = payload.get("user_id")

        if not user_id:
            raise ValueError(
                "OAuth state has no user."
            )

        return payload

    except Exception as exc:
        raise ValueError(
            f"Invalid OAuth state: {exc}"
        ) from exc


# ============================================================
# GOOGLE AUTHORIZATION URL
# ============================================================

def build_google_authorization_url(
    user_id: str,
) -> str:

    state = create_oauth_state(user_id)

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": GMAIL_SCOPES,
        "access_type": "offline",
        "include_granted_scopes": "true",
        "state": state,
        "prompt": "consent",
    }

    query = httpx.QueryParams(params)

    return (
        f"{GOOGLE_AUTH_URL}"
        f"?{query}"
    )


# ============================================================
# TOKEN EXCHANGE
# ============================================================

async def exchange_code_for_tokens(
    code: str,
) -> dict[str, Any]:

    payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.post(
            GOOGLE_TOKEN_URL,
            data=payload,
        )

    if response.status_code >= 400:
        raise RuntimeError(
            f"Google token exchange failed: "
            f"{response.text}"
        )

    return response.json()


# ============================================================
# REFRESH ACCESS TOKEN
# ============================================================

async def refresh_google_access_token(
    refresh_token: str,
) -> dict[str, Any]:

    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.post(
            GOOGLE_TOKEN_URL,
            data=payload,
        )

    if response.status_code >= 400:
        raise RuntimeError(
            f"Google token refresh failed: "
            f"{response.text}"
        )

    return response.json()


# ============================================================
# TOKEN ENCRYPTION
# ============================================================

def _get_fernet():
    if not CONNECTOR_ENCRYPTION_KEY:
        raise RuntimeError(
            "CONNECTOR_ENCRYPTION_KEY is missing."
        )

    from cryptography.fernet import Fernet

    return Fernet(
        CONNECTOR_ENCRYPTION_KEY.encode()
    )


def encrypt_token(token: str) -> str:
    fernet = _get_fernet()

    return fernet.encrypt(
        token.encode()
    ).decode()


def decrypt_token(token: str) -> str:
    fernet = _get_fernet()

    return fernet.decrypt(
        token.encode()
    ).decode()


# ============================================================
# REVOKE
# ============================================================

async def revoke_google_token(
    token: str,
) -> None:

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.post(
            GOOGLE_REVOKE_URL,
            params={
                "token": token
            },
        )

    if response.status_code >= 400:
        raise RuntimeError(
            f"Google token revoke failed: "
            f"{response.text}"
        )