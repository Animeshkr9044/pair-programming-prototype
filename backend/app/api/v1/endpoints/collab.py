from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.socket_manager import manager
from app.db.session import get_db
from app.services.room_service import update_room_code, get_room_code

router = APIRouter()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, db: AsyncSession = Depends(get_db)):
    """
    WebSocket Endpoint for Real-Time Collaboration.
    """
    await manager.connect(room_id, websocket)
    
    # Send existing code to the new user
    current_code = await get_room_code(db, room_id)
    if current_code:
        await websocket.send_text(current_code)
        
    try:
        while True:
            # Receive code updates from client
            data = await websocket.receive_text()
            
            # Broadcast updates to other users in the room
            await manager.broadcast(room_id, data, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)