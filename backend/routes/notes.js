const express = require('express');
const database = require('../models/database');
const { requireAuth, validateNote } = require('../middleware/auth');

const router = express.Router();

// Get all notes for a ticket
router.get('/tickets/:ticketId/notes', requireAuth, (req, res) => {
  const ticketId = req.params.ticketId;

  database.getNotesByTicketId(ticketId, (err, notes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notes);
  });
});

// Add note to ticket
router.post('/tickets/:ticketId/notes', requireAuth, validateNote, (req, res) => {
  const noteData = {
    ticket_id: req.params.ticketId,
    content: req.body.content,
    created_by: req.session.user.id
  };

  database.createNote(noteData, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get the created note with user info
    database.db.get(`
      SELECT n.*, u.username as created_by_username
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = ?
    `, [this.lastID], (err, note) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(note);
    });
  });
});

// Update note
router.put('/notes/:id', requireAuth, validateNote, (req, res) => {
  const noteId = req.params.id;
  const content = req.body.content;

  database.updateNote(noteId, content, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get the updated note with user info
    database.db.get(`
      SELECT n.*, u.username as created_by_username
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = ?
    `, [noteId], (err, note) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json(note);
    });
  });
});

// Delete note
router.delete('/notes/:id', requireAuth, (req, res) => {
  const noteId = req.params.id;

  database.deleteNote(noteId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

module.exports = router;
