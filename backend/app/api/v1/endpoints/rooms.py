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

import subprocess
import sys

class ExecuteRequest(BaseModel):
    code: str

@router.post("/execute")
async def execute_code_endpoint(payload: ExecuteRequest):
    """
    POST /execute
    Executes the Python code and returns stdout/stderr.
    WARNING: This is a prototype and has security risks.
    """
    code = payload.code
    
    try:
        # Run the code in a subprocess
        # -c flag allows running a string as a script
        # capture_output=True captures stdout and stderr
        # text=True decodes bytes to string
        # timeout=5 prevents infinite loops
        result = subprocess.run(
            [sys.executable, "-c", code], 
            capture_output=True, 
            text=True, 
            timeout=5
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Error: Execution timed out (limit: 5 seconds)",
            "exit_code": 1
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Error: {str(e)}",
            "exit_code": 1
        }

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