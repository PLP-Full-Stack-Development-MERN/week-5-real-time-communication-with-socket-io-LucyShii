// backend/controllers/noteController.js
const Note = require('../models/Note');

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    // Generate a unique roomId
    const roomId = Math.random().toString(36).substring(2, 15);
    
    const note = new Note({
      title,
      content,
      roomId
    });
    
    await note.save();
    
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get a note by roomId
exports.getNoteByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const note = await Note.findOne({ roomId });
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, title } = req.body;
    
    const note = await Note.findOne({ roomId });
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    if (title) note.title = title;
    if (content) note.content = content;
    note.updatedAt = Date.now();
    
    await note.save();
    
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({}).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};