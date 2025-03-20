// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const noteRoutes = require('./routes/noteRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/notes', noteRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id);
  });
  
  // Leave a room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-left', socket.id);
  });
  
  // Handle note updates
  socket.on('note-update', (data) => {
    const { roomId, content } = data;
    // Broadcast to all clients in the room except sender
    socket.to(roomId).emit('note-updated', content);
  });
  
  // Handle cursor position updates
  socket.on('cursor-position', (data) => {
    const { roomId, position, userId } = data;
    socket.to(roomId).emit('cursor-moved', { position, userId });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});