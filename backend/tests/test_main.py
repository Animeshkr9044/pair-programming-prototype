from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_room():
    """Test POST /rooms returns a valid ID."""
    response = client.post("/rooms")
    assert response.status_code == 200
    data = response.json()
    assert "room_id" in data
    assert len(data["room_id"]) > 0

def test_autocomplete():
    """Test POST /autocomplete returns mocked suggestion."""
    payload = {
        "code": "def my_func",
        "cursorPosition": 10,
        "language": "python"
    }
    response = client.post("/autocomplete", json=payload)
    assert response.status_code == 200
    assert response.json() == {"suggestion": " # mocked AI suggestion"}

def test_websocket_broadcast():
    """
    Test Real-Time Sync:
    User A sends code -> User B should receive it.
    User A should NOT receive their own echo.
    """
    room_id = "test-room"
    
    # Open two connections to the same room
    with client.websocket_connect(f"/ws/{room_id}") as websocket_a:
        with client.websocket_connect(f"/ws/{room_id}") as websocket_b:
            
            # User A types "print('Hello')"
            websocket_a.send_text("print('Hello')")
            
            # User B should receive it
            data_b = websocket_b.receive_text()
            assert data_b == "print('Hello')"
            
            # User B types "New Line"
            websocket_b.send_text("New Line")
            
            # User A should receive it
            data_a = websocket_a.receive_text()
            assert data_a == "New Line"