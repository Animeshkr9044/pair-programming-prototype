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

async def update_room_code(db: AsyncSession, room_id: str, code: str):
    """Updates the code content for a specific room."""
    # Find the room by room_id (string string, NOT primary key int)
    from sqlalchemy import select
    result = await db.execute(select(Room).where(Room.room_id == room_id))
    room = result.scalars().first()
    
    if room:
        room.code_content = code
        await db.commit()

async def get_room_code(db: AsyncSession, room_id: str) -> str:
    """Retrieves the current code content for a specific room."""
    from sqlalchemy import select
    result = await db.execute(select(Room).where(Room.room_id == room_id))
    room = result.scalars().first()
    return room.code_content if room else ""