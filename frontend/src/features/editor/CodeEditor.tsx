import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../../services/api';

const CodeEditor: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [code, setCode] = useState<string>("// Start coding...");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs for WebSocket and Debounce Timer
  const socketRef = useRef<WebSocket | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  
  // Prevent infinite loops: "Remote update" vs "User typing"
  const isRemoteUpdate = useRef(false);

  // --- 1. WebSocket Connection Setup ---
  useEffect(() => {
    if (!roomId) return;

    // Connect to Backend WebSocket
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Room:', roomId);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      // Received code from another user
      const newCode = event.data;
      
      // Mark as remote update so we don't send it back
      isRemoteUpdate.current = true;
      setCode(newCode);
      
      // Reset flag after render cycle
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 50);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  // --- 2. AI Autocomplete Logic ---
  const fetchAutocomplete = async (currentCode: string) => {
    try {
      // Simple mock: assume cursor is at end of file for now
      const result = await api.getAutocomplete(currentCode, currentCode.length);
      if (result.suggestion) {
        setSuggestion(result.suggestion);
      }
    } catch (error) {
      console.error("AI Fetch Error:", error);
    }
  };

  // --- 3. Handle Editor Changes ---
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    // If change came from WebSocket, do nothing
    if (isRemoteUpdate.current) return;

    // A. Broadcast to other users
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(newCode);
    }

    // B. Clear previous AI timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      setSuggestion(null); // Hide old suggestion while typing
    }

    // C. Set new AI timer (600ms delay)
    debounceTimerRef.current = window.setTimeout(() => {
      fetchAutocomplete(newCode);
    }, 600);
  };

  // --- 4. Apply AI Suggestion ---
  const applySuggestion = () => {
    if (!suggestion) return;
    const newCode = code + "\n" + suggestion;
    setCode(newCode);
    
    // Broadcast the accepted suggestion
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(newCode);
    }
    setSuggestion(null);
  };

  return (
    <div style={styles.container}>
      {/* Header / Status Bar */}
      <div style={styles.header}>
        <h3>Room: <span style={styles.roomId}>{roomId}</span></h3>
        <div style={styles.status}>
          Status: 
          <span style={{ 
            color: isConnected ? '#28a745' : '#dc3545', 
            fontWeight: 'bold', 
            marginLeft: '5px' 
          }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Editor Area */}
      <div style={styles.editorWrapper}>
        <Editor
          height="85vh"
          defaultLanguage="python"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
        
        {/* AI Suggestion Overlay (Simple implementation) */}
        {suggestion && (
          <div style={styles.suggestionBox}>
            <strong>🤖 AI Suggestion:</strong>
            <pre style={styles.suggestionText}>{suggestion}</pre>
            <div style={styles.suggestionActions}>
              <button onClick={applySuggestion} style={styles.acceptButton}>
                Tab to Accept
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// CSS Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e1e1e',
    color: 'white',
  },
  header: {
    padding: '10px 20px',
    backgroundColor: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #444',
  },
  roomId: {
    color: '#61dafb',
    fontFamily: 'monospace',
  },
  status: {
    fontSize: '14px',
  },
  editorWrapper: {
    flex: 1,
    position: 'relative',
  },
  suggestionBox: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#252526',
    border: '1px solid #007acc',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    maxWidth: '300px',
    zIndex: 10,
  },
  suggestionText: {
    backgroundColor: '#1e1e1e',
    padding: '8px',
    borderRadius: '4px',
    color: '#9cdcfe',
    overflowX: 'auto',
    margin: '10px 0',
  },
  suggestionActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  acceptButton: {
    backgroundColor: '#007acc',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default CodeEditor;