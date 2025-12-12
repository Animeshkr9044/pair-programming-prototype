# Pair Programming Application

A real-time collaborative code editor allowing multiple users to code together in the same room. Featured with rudimentary AI autocomplete mocking and code execution capabilities.

## 🚀 How to Run

### Prerequisites
- **Docker** and **Docker Compose** installed.
- **Node.js** (for local frontend dev, optional).
- **Python 3.10+** (for local backend dev, optional).

### Method 1: Automated Script (Recommended)
This requires **Docker** to be running. It handles verification and startup for you.

```bash
# Give execution permission
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Method 2: Docker Compose (Manual)
If you prefer running the commands yourself:

```bash
docker-compose up --build -d
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Method 3: Manual Setup

#### 1. Database
Start a PostgreSQL instance (or use Docker for just the DB):
```bash
docker run -d --name pair-programming-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pair_prog_db \
  -p 5432:5432 \
  postgres:13
```

#### 2. Backend
```bash
cd backend
# Create and activate venv
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server (ensure DATABASE_URL env var is set if not using default)
export DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/pair_prog_db"
uvicorn app.main:app --reload
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Access at http://localhost:5173 (usually).

---

## 🏗 Architecture & Design Choices

### Core Components
1.  **Backend (FastAPI)**:
    *   Selected for its high performance and native support for asynchronous programming, which is crucial for handling multiple WebSocket connections efficiently.
    *   **WebSockets**: Used for real-time bidirectional communication. When a user types, changes are broadcast to all other users in the room immediately.
    *   **SQLAlchemy (Async)**: Used for non-blocking database operations.

2.  **Frontend (React + Vite)**:
    *   **Vite**: Chosen for lightning-fast build times and hot module replacement (HMR).
    *   **Monaco Editor**: The industry-standard web code editor (VS Code's core), providing rich syntax highlighting and editing features.
    *   **WebSocket Integration**: The frontend maintains a persistent socket connection to sync state.

3.  **Database (PostgreSQL)**:
    *   Reliable implementation for storing persistent data (Rooms).

### Design Decisions
*   **Room-Based Collaboration**: No mandatory user accounts allowed for quick, friction-less sessions. Users just join a "room".
*   **Mocked AI**: The autocomplete endpoint (`/autocomplete`) is defined but currently returns hardcoded suggestions. This allows the frontend UI to be built and tested without a heavy GPU dependency on the backend.
*   **Code Execution Strategy**: 
    *   **Current Prototype**: Implemented using `subprocess` for immediate feedback.
    *   **Target Architecture**: Client-side execution via **WebAssembly (Pyodide)**.
        *   *Scalability*: Code runs in the user's browser, meaning 0% load on our backend servers regardless of user count.
        *   *Privacy*: Code execution happens locally; sensitive logic never leaves the user's machine.
        *   *Security*: Browsers provide a hardened sandbox, unlike running arbitrary code on a backend container.
---

## 🔌 API Reference

### 1. Create a Room
Creates a new session and returns a unique `room_id`.

**Request:**
```bash
curl -X POST http://localhost:8000/rooms
```

**Response:**
```json
{
  "room_id": "a1b2c3d4"
}
```

### 2. Autocomplete (Mocked)
Get a code suggestion based on current input.

**Request:**
```bash
curl -X POST http://localhost:8000/autocomplete \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def my_func",
    "cursorPosition": 11,
    "language": "python"
  }'
```

**Response:**
```json
{
  "suggestion": "tion():\n    pass"
}
```

### 3. Execute Code (Unsafe & Unused)
Executes Python code and returns output.
> **Note**: This endpoint is currently **unused** by the frontend. The application now uses **WebAssembly (Pyodide)** to run code directly in the browser for better performance and security. This endpoint remains only for testing or fallback purposes.

**Request:**
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(1 + 1)"
  }'
```

**Response:**
```json
{
  "stdout": "2\n",
  "stderr": "",
  "exit_code": 0
}
```
---

## 🔮 Future Improvements

1.  **Real AI Integration**: Replace the mock implementation in `rooms.py` with a real call to an LLM provider (e.g., OpenAI API or local model) to provide context-aware code completions.
2.  **Client-Side Execution (WebAssembly)**: Move execution from the backend to the frontend using **Pyodide**. 
    *   This eliminates the risk of malicious server-side code execution.
    *   Allows for "always-on" availability even without internet for the execution engine.
    *   Reduces infrastructure costs to near zero for compure.
3.  **User Authentication**: Add persistent user profiles to track history and permissions within rooms.
4.  **Operational Transformation (OT) / CRDTs**: Currently, the collaboration relies on basic broadcasting. Implementing OT (like Yjs) would handle conflict resolution much better during high-concurrency editing.

---

## ⚠️ Limitations

*   **Security Risk**: The `/execute` endpoint runs code directly on the host/container shell. **Do not run malicious code** (e.g., `rm -rf /`).
*   **Mocked Features**: `AutoComplete` is currently a placeholder and does not generate real code.
*   **No Persistence**: If the container/database volume is destroyed, room history is lost (unless volumes are properly mapped).
