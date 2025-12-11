from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.room import RoomCreateResponse, AutocompleteRequest, AutocompleteResponse
from app.services import room_service

router = APIRouter()

@router.post("/rooms", response_model=RoomCreateResponse)
async def create_room_endpoint(db: AsyncSession = Depends(get_db)):
    """
    POST /rooms
    Creates a new room in the database and returns the room_id.
    """
    room_id = await room_service.create_new_room(db)
    return {"room_id": room_id}

from pydantic import BaseModel

class SaveCodeRequest(BaseModel):
    code: str

@router.put("/rooms/{room_id}/code")
async def save_room_code_endpoint(room_id: str, payload: SaveCodeRequest, db: AsyncSession = Depends(get_db)):
    """
    PUT /rooms/{room_id}/code
    Explicitly saves the code content for a room.
    """
    await room_service.update_room_code(db, room_id, payload.code)
    return {"message": "Code saved successfully"}

@router.post("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete_endpoint(payload: AutocompleteRequest):
    """
    POST /autocomplete
    Returns a mocked AI suggestion based on the input code.
    """
    # Simple Mock Logic per requirements
    suggestion = ""
    stripped_code = payload.code.strip()
    
    if stripped_code.endswith("def"):
        suggestion = " my_function():\n    pass"
    elif stripped_code.endswith("print"):
        suggestion = "('Hello World')"
    else:
        suggestion = " # mocked AI suggestion"

    return {"suggestion": suggestion}