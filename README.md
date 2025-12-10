# Pair Programming Application

A real-time collaborative code editor where multiple users can code together in the same room with AI-powered autocomplete suggestions.

## What It Does

- **Create/Join Rooms**: Users can create new coding rooms or join existing ones with a room ID
- **Real-Time Collaboration**: Code changes are synchronized across all users in the same room via WebSocket
- **AI Autocomplete**: Provides code suggestions as you type (currently mocked)
- **Monaco Editor**: Full-featured code editor with syntax highlighting

## Architecture

- **Backend**: FastAPI (Python) - REST API + WebSocket server
- **Frontend**: React + TypeScript + Vite - User interface
- **Database**: PostgreSQL - Stores room data
- **Real-Time**: WebSocket - Synchronizes code changes between users

## Setup

### 1. Database (PostgreSQL)

Start PostgreSQL using Docker:

```bash
docker-compose up -d
```

Or manually:
```bash
docker run -d \
  --name pair-programming-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pair_programming \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend

```bash
cd backend

# Create virtual environment (if using uv)
uv venv

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate  # On Windows

# Install dependencies
uv pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pair_programming" > .env

# Run the server
uvicorn app.main:app --reload
```

Backend runs on: `http://127.0.0.1:8000`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## How It Works

1. **Room Creation**: Frontend calls `POST /rooms` → Backend creates room in database → Returns room ID
2. **Code Editing**: User types in Monaco Editor → Changes sent via WebSocket → Broadcasted to all users in room
3. **Autocomplete**: User stops typing → Frontend calls `POST /autocomplete` → Backend returns suggestion
4. **Real-Time Sync**: WebSocket connection (`/ws/{room_id}`) keeps all clients synchronized

## API Endpoints

- `POST /rooms` - Create a new room
- `POST /autocomplete` - Get AI code suggestion
- `WebSocket /ws/{room_id}` - Real-time code synchronization

## Testing

```bash
cd backend
pytest
```
