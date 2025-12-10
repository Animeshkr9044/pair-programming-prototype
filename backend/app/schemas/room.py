from pydantic import BaseModel

class RoomCreateResponse(BaseModel):
    room_id: str

class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str

class AutocompleteResponse(BaseModel):
    suggestion: str