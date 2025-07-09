const express = require('express');
const bcrypt = require('bcryptjs');
const database = require('../models/database');
const { validateLogin, validateRegistration } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', validateRegistration, (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  database.getUserByUsername(username, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    database.createUser(username, email, password, function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('email')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ message: 'User created successfully' });
    });
  });
});

// Login
router.post('/login', validateLogin, (req, res) => {
  const { username, password } = req.body;

  database.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;
