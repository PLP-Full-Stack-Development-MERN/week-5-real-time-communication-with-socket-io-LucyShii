import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/NoteEditor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const NoteEditor = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: '', content: '' });
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [cursorPositions, setCursorPositions] = useState({});
  const editorRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const userId = useRef(`user-${Math.random().toString(36).substring(2, 8)}`);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Clean up socket connection on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Join room and set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Join the room
    socket.emit('join-room', roomId);

    // Set up socket event listeners
    socket.on('user-joined', (newUserId) => {
      setConnectedUsers((prevUsers) => [...prevUsers, newUserId]);
    });

    socket.on('user-left', (leftUserId) => {
      setConnectedUsers((prevUsers) => prevUsers.filter(id => id !== leftUserId));
    });

    socket.on('note-updated', (updatedContent) => {
      setNote(prev => ({ ...prev, content: updatedContent }));
    });

    socket.on('cursor-moved', ({ position, userId: cursorUserId }) => {
      setCursorPositions(prev => ({ ...prev, [cursorUserId]: position }));
    });

    // Leave room when component unmounts
    return () => {
      socket.emit('leave-room', roomId);
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('note-updated');
      socket.off('cursor-moved');
    };
  }, [socket, roomId]);

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/notes/${roomId}`);
        setNote(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch note');
        setLoading(false);
        console.error('Error fetching note:', err);
      }
    };

    fetchNote();
  }, [roomId]);

  // Handle content changes
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNote(prev => ({ ...prev, content: newContent }));
    
    // Debounce emitting updates
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('note-update', { roomId, content: newContent });
      }
      
      // Save to database
      saveNoteToDatabase(newContent);
    }, 500);
  };

  // Handle title changes
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setNote(prev => ({ ...prev, title: newTitle }));
    
    // Debounce saving title
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      saveNoteToDatabase(note.content, newTitle);
    }, 500);
  };

  // Save note to database
  const saveNoteToDatabase = async (content, title = note.title) => {
    try {
      await axios.put(`${API_URL}/notes/${roomId}`, {
        content,
        title
      });
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  // Handle cursor position
  const handleCursorPosition = (e) => {
    if (socket) {
      const position = e.target.selectionStart;
      socket.emit('cursor-position', { 
        roomId, 
        position, 
        userId: userId.current 
      });
    }
  };

  // Copy share link
  const copyShareLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="loading">Loading note...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="note-editor-container">
      <div className="note-header">
        <input
          type="text"
          className="note-title-input"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Note title..."
        />
        <div className="note-actions">
          <button onClick={copyShareLink} className="share-button">
            Share
          </button>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Notes
          </button>
        </div>
      </div>
      
      <div className="editor-container">
        <div className="editor-sidebar">
          <div className="users-panel">
            <h3>Connected Users</h3>
            <div className="user-list">
              <div className="user-item">You (Owner)</div>
              {connectedUsers.map((userId) => (
                <div key={userId} className="user-item">
                  User {userId.substring(0, 5)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="editor-main">
          <textarea
            ref={editorRef}
            className="note-content-editor"
            value={note.content}
            onChange={handleContentChange}
            onSelect={handleCursorPosition}
            placeholder="Start writing your note here..."
          />
          
          {/* Display remote cursors */}
          {Object.entries(cursorPositions).map(([cursorUserId, position]) => {
            if (cursorUserId === userId.current) return null;
            
            // Calculate cursor position
            const text = note.content.substring(0, position);
            const lines = text.split('\n');
            const lastLine = lines[lines.length - 1];
            
            return (
              <div 
                key={cursorUserId}
                className="remote-cursor"
                style={{
                  top: `${lines.length * 1.5}em`,
                  left: `${lastLine.length * 0.6}em`
                }}
              >
                <div className="cursor-label">
                  User {cursorUserId.substring(0, 5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;