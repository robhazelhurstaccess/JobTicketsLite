const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const database = require('../models/database');
const { requireAuth, validateNote } = require('../middleware/auth');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'screenshots');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created upload directory:', uploadDir);
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'screenshot-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all notes for a ticket
router.get('/tickets/:ticketId/notes', requireAuth, (req, res) => {
  const ticketId = req.params.ticketId;

  database.getNotesByTicketId(ticketId, (err, notes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get attachments for each note
    let processedNotes = 0;
    const notesWithAttachments = [];

    if (notes.length === 0) {
      return res.json([]);
    }

    notes.forEach((note, index) => {
      database.getAttachmentsByNoteId(note.id, (err, attachments) => {
        if (err) {
          console.error('Error loading attachments:', err);
          attachments = [];
        }
        
        notesWithAttachments[index] = {
          ...note,
          attachments: attachments || []
        };
        
        processedNotes++;
        if (processedNotes === notes.length) {
          res.json(notesWithAttachments);
        }
      });
    });
  });
});

// Add note to ticket
router.post('/tickets/:ticketId/notes', requireAuth, upload.single('screenshot'), (req, res) => {
  const ticketId = req.params.ticketId;
  const { content } = req.body;
  const file = req.file;

  // Validate that either content or file is provided
  const hasContent = content && content.trim().length > 0;
  const hasFile = file && file.filename;
  
  if (!hasContent && !hasFile) {
    return res.status(400).json({ error: 'Note must contain either text content or an image' });
  }

  if (hasContent && content.length > 1000) {
    return res.status(400).json({ error: 'Note content must be less than 1000 characters' });
  }

  const noteData = {
    ticket_id: ticketId,
    content: hasContent ? content.trim() : '[Image only]', // Use placeholder when only image
    created_by: req.session.user.id
  };

  database.createNote(noteData, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const noteId = this.lastID;
    
    // If file was uploaded, create attachment record
    if (file) {
      const attachmentData = {
        note_id: noteId,
        filename: file.filename,
        original_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        created_by: req.session.user.id
      };

      database.createAttachment(attachmentData, (err) => {
        if (err) {
          console.error('Error creating attachment:', err);
        }
        
        // Get the created note with user info and attachments
        database.db.get(`
          SELECT n.*, u.username as created_by_username
          FROM notes n
          LEFT JOIN users u ON n.created_by = u.id
          WHERE n.id = ?
        `, [noteId], (err, note) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Add attachment info to response
          if (file && !err) {
            note.attachments = [{
              filename: file.filename,
              original_name: file.originalname,
              file_size: file.size,
              mime_type: file.mimetype
            }];
          } else {
            note.attachments = [];
          }
          
          res.status(201).json(note);
        });
      });
    } else {
      // Get the created note with user info
      database.db.get(`
        SELECT n.*, u.username as created_by_username
        FROM notes n
        LEFT JOIN users u ON n.created_by = u.id
        WHERE n.id = ?
      `, [noteId], (err, note) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        note.attachments = [];
        res.status(201).json(note);
      });
    }
  });
});

// Update note
router.put('/notes/:id', requireAuth, (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  if (content.length > 1000) {
    return res.status(400).json({ error: 'Note content must be less than 1000 characters' });
  }
  
  const noteId = req.params.id;

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

// Serve uploaded screenshots
router.get('/attachments/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'screenshots', filename);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Send the file
    res.sendFile(filePath);
  });
});

module.exports = router;
