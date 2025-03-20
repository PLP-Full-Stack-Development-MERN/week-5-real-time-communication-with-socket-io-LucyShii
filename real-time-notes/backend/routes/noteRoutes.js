// backend/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.post('/', noteController.createNote);
router.get('/', noteController.getAllNotes);
router.get('/:roomId', noteController.getNoteByRoomId);
router.put('/:roomId', noteController.updateNote);

module.exports = router;