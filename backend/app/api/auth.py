"""
API Key Authentication
Simple API key validation via X-API-Key header.
If API_KEY env var is not set, authentication is skipped (dev mode).
"""
import os

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

API_KEY = os.getenv("API_KEY", "")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(api_key: str = Security(api_key_header)) -> str | None:
    """
    FastAPI dependency that validates the API key.
    
    - If API_KEY env var is empty/not set: auth is disabled (returns None)
    - If API_KEY is set and header matches: returns the key
    - If API_KEY is set but header is missing/wrong: raises 403
    """
    # If no API_KEY configured, skip authentication (dev mode)
    if not API_KEY:
        return None
    
    if not api_key or api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API key. Provide X-API-Key header."
        )
    
    return api_key
