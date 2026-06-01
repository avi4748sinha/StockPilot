import base64
import hashlib
import hmac
import json
import time
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings


security = HTTPBearer()


def create_token(email: str) -> str:
    settings = get_settings()
    payload = {
        "sub": email,
        "exp": int(time.time()) + 60 * 60 * 12,
    }
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode()
    encoded_payload = base64.urlsafe_b64encode(payload_bytes).decode().rstrip("=")
    signature = _sign(encoded_payload, settings.auth_secret)
    return f"{encoded_payload}.{signature}"


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict[str, Any]:
    settings = get_settings()
    token = credentials.credentials
    try:
        encoded_payload, signature = token.split(".", 1)
    except ValueError as exc:
        raise _auth_error() from exc

    expected_signature = _sign(encoded_payload, settings.auth_secret)
    if not hmac.compare_digest(signature, expected_signature):
        raise _auth_error()

    padded = encoded_payload + "=" * (-len(encoded_payload) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(padded.encode()))
    except (ValueError, json.JSONDecodeError) as exc:
        raise _auth_error() from exc

    if payload.get("exp", 0) < int(time.time()):
        raise _auth_error("Session expired")

    return payload


def _sign(value: str, secret: str) -> str:
    digest = hmac.new(secret.encode(), value.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def _auth_error(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
