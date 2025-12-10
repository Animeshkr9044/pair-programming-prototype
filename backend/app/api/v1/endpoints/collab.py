from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.socket_manager import manager

router = APIRouter()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket Endpoint for Real-Time Collaboration.
    """
    await manager.connect(room_id, websocket)
    try:
        while True:
            # Receive code updates from client
            data = await websocket.receive_text()
            
            # Broadcast updates to other users in the room
            await manager.broadcast(room_id, data, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)