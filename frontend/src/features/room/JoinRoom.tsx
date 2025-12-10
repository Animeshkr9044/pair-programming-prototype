import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const JoinRoom: React.FC = () => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handler for creating a NEW room
  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const data = await api.createRoom();
      navigate(`/room/${data.room_id}`); // Redirect to the new room
    } catch (err) {
      setError('Failed to create room. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for joining an EXISTING room
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      navigate(`/room/${roomIdInput}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pair Programming</h1>
        <p style={styles.subtitle}>Real-time collaboration made simple.</p>

        {/* Create Room Section */}
        <button 
          onClick={handleCreateRoom} 
          disabled={loading}
          style={styles.createButton}
        >
          {loading ? 'Creating...' : '🚀 Create New Room'}
        </button>

        <div style={styles.divider}>OR</div>

        {/* Join Room Section */}
        <form onSubmit={handleJoinRoom} style={styles.form}>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.joinButton}>
            Join Room
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

// Simple inline styles for a clean look
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    margin: '0 0 0.5rem 0',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem',
  },
  createButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  divider: {
    margin: '1.5rem 0',
    color: '#aaa',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
  },
  joinButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
    fontSize: '14px',
  },
};

export default JoinRoom;