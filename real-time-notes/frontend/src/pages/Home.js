import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notes`);
      setNotes(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notes');
      setLoading(false);
      console.error('Error fetching notes:', err);
    }
  };

  const createNewNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/notes`, {
        title: newNoteTitle,
        content: ''
      });
      
      // Navigate to the new note
      navigate(`/notes/${response.data.data.roomId}`);
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
    }
  };

  const joinRoom = (roomId) => {
    navigate(`/notes/${roomId}`);
  };

  const copyRoomLink = (roomId, e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/notes/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="home-container">
      <h1>Real-Time Collaborative Notes</h1>
      
      <div className="create-note-form">
        <form onSubmit={createNewNote}>
          <input
            type="text"
            placeholder="Enter note title..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            required
          />
          <button type="submit">Create New Note</button>
        </form>
      </div>
      
      <div className="notes-divider">
        <h2>Your Notes</h2>
      </div>
      
      {loading ? (
        <p>Loading notes...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="notes-grid">
          {notes.length === 0 ? (
            <p>No notes yet. Create your first note!</p>
          ) : (
            notes.map((note) => (
              <div 
                key={note._id} 
                className="note-card" 
                onClick={() => joinRoom(note.roomId)}
              >
                <h3>{note.title}</h3>
                <p className="note-preview">
                  {note.content.substring(0, 100) || "Empty note..."}
                </p>
                <div className="note-footer">
                  <span className="note-date">
                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <button 
                    className="copy-link-btn"
                    onClick={(e) => copyRoomLink(note.roomId, e)}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;