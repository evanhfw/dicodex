from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid
from sqlmodel import Field, SQLModel
from sqlalchemy import text


def get_wib_now():
    """Get current time in WIB (UTC+7) but return naive datetime for Postgres TIMESTAMP"""
    # Get aware datetime
    now_aware = datetime.now(timezone(timedelta(hours=7)))
    # Return naive datetime representing the same wall clock time
    return now_aware.replace(tzinfo=None)


import os

class RequestLog(SQLModel, table=True):
    """Log of scraping requests"""
    __tablename__ = os.getenv("POSTGRES_TABLE_NAME", "requestlog")
    id: Optional[uuid.UUID] = Field(
        default=None, 
        primary_key=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")}
    )
    timestamp: datetime = Field(default_factory=get_wib_now)
    facilitator_name: str
    class_name: str  # e.g., CAC, CDC, CFC
    status: str  # started, completed, failed
    message: Optional[str] = None
