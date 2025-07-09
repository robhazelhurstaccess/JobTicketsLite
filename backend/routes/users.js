const express = require('express');
const database = require('../models/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', requireAuth, (req, res) => {
  database.getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

module.exports = router;
