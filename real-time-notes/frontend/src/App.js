// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoteEditor from './pages/NoteEditor';
import NavBar from './components/NavBar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes/:roomId" element={<NoteEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;