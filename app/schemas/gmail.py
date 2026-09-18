from typing import Any

from pydantic import BaseModel


class GmailStatusResponse(BaseModel):
    connected: bool
    email: str | None = None
    provider: str = "gmail"


class GmailProfileResponse(BaseModel):
    email_address: str
    messages_total: int | None = None
    threads_total: int | None = None
    history_id: str | None = None


class GmailMessageListResponse(BaseModel):
    messages: list[dict[str, Any]]
    next_page_token: str | None = None
    result_size_estimate: int | None = None