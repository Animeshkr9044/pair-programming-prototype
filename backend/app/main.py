import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import rooms, collab
from app.db.session import engine
from app.db.base import Base

logger = logging.getLogger(__name__)

# Create Database Tables on Startup
# (For a production app, use Alembic migrations instead)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.warning(f"Could not connect to database during startup: {e}")
        logger.warning("Application will continue, but database operations may fail")
    
    yield
    
    # Shutdown (if needed)
    await engine.dispose()

app = FastAPI(title="Pair Programming API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(rooms.router, tags=["Rooms"])
app.include_router(collab.router, tags=["Collaboration"])

@app.get("/")
async def root():
    return {"message": "Pair Programming API is running"}