import os
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

# Get DB connection string from env
DATABASE_URL = os.getenv("CONN_PSQL")

if not DATABASE_URL:
    raise ValueError("CONN_PSQL environment variable is not set")

# Ensure asyncpg driver is used
if DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Debug: Print connection info (masked)
try:
    from sqlalchemy.engine.url import make_url
    u = make_url(DATABASE_URL)
    print(f"DEBUG: Connecting to Host: {u.host}, Port: {u.port}, Database: {u.database}")
except Exception as e:
    print(f"DEBUG: Error parsing DATABASE_URL: {e}")

# Create Async Engine
engine = create_async_engine(
    DATABASE_URL, 
    echo=False, 
    future=True,
    connect_args={"statement_cache_size": 0}  # Required for Supabase Transaction Pooler (PgBouncer)
)


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # For dev only
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    """Dependency for getting async session"""
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
