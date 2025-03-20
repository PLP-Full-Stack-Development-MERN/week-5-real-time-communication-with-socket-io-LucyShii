# Real-Time Collaborative Notes Application

A full-stack MERN application that allows multiple users to create, edit, and view notes in real-time using Socket.io.

## Features

- **Real-time collaboration**: Multiple users can edit notes simultaneously
- **Room-based communication**: Users can join specific rooms to collaborate
- **Live cursor tracking**: See where other users are editing in real-time
- **Persistent storage**: Notes are saved to MongoDB
- **Responsive design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: React, Socket.io-client, React Router
- **Backend**: Express.js, Socket.io, MongoDB/Mongoose
- **Deployment**: Render (backend), Vercel (frontend)

## Key Real-Time Concepts

### WebSockets
This application uses WebSockets via Socket.io to establish a persistent, two-way connection between the client and server. This allows for real-time updates without the need for constant HTTP requests.

### Rooms
Socket.io's room feature is used to group users who are working on the same note. This ensures that updates are only sent to relevant users, improving performance and reducing unnecessary network traffic.

### Event-Based Communication
The application uses an event-based architecture where:
- Clients emit events like `join-room`, `note-update`, and `cursor-position`
- The server listens for these events and broadcasts them to other clients in the same room
- Clients listen for events like `user-joined`, `note-updated`, and `cursor-moved` to update their UI accordingly

## Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB (local or Atlas)

### Backend Setup
1. Clone the repository
   ```
   git clone https://github.com/yourusername/real-time-notes.git
   cd real-time-notes/backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd ../frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   REACT_