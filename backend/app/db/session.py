from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

# Create the Async Engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Create the Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for FastAPI Routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session