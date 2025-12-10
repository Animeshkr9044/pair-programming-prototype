import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Room

async def create_new_room(db: AsyncSession) -> str:
    """Generates a UUID and saves a new room entry to Postgres."""
    unique_id = str(uuid.uuid4())[:8]  # Generate a short 8-char ID
    new_room = Room(room_id=unique_id, code_content="")
    db.add(new_room)
    await db.commit()
    return unique_id