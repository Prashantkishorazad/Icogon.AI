from typing import Any

import httpx


GMAIL_API_BASE = (
    "https://gmail.googleapis.com/gmail/v1"
)


async def gmail_request(
    access_token: str,
    method: str,
    endpoint: str,
    *,
    params: dict[str, Any] | None = None,
    json: dict[str, Any] | None = None,
) -> dict[str, Any]:

    url = (
        f"{GMAIL_API_BASE}"
        f"{endpoint}"
    )

    headers = {
        "Authorization": (
            f"Bearer {access_token}"
        ),
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.request(
            method,
            url,
            headers=headers,
            params=params,
            json=json,
        )

    if response.status_code >= 400:

        raise RuntimeError(
            f"Gmail API error "
            f"{response.status_code}: "
            f"{response.text}"
        )

    if not response.content:
        return {}

    return response.json()


# ============================================================
# PROFILE
# ============================================================

async def get_gmail_profile(
    access_token: str,
) -> dict[str, Any]:

    return await gmail_request(
        access_token,
        "GET",
        "/users/me/profile",
    )


# ============================================================
# LIST MESSAGES
# ============================================================

async def list_gmail_messages(
    access_token: str,
    *,
    query: str | None = None,
    max_results: int = 20,
    page_token: str | None = None,
) -> dict[str, Any]:

    params: dict[str, Any] = {
        "maxResults": min(
            max_results,
            100,
        )
    }

    if query:
        params["q"] = query

    if page_token:
        params["pageToken"] = page_token

    return await gmail_request(
        access_token,
        "GET",
        "/users/me/messages",
        params=params,
    )


# ============================================================
# MESSAGE
# ============================================================

async def get_gmail_message(
    access_token: str,
    message_id: str,
) -> dict[str, Any]:

    return await gmail_request(
        access_token,
        "GET",
        f"/users/me/messages/{message_id}",
        params={
            "format": "full",
        },
    )


# ============================================================
# LABELS
# ============================================================

async def get_gmail_labels(
    access_token: str,
) -> dict[str, Any]:

    return await gmail_request(
        access_token,
        "GET",
        "/users/me/labels",
    )