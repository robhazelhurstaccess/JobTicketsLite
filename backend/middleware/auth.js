const bcrypt = require('bcryptjs');

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

function requireAuthWeb(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect('/login.html');
  }
}

function validateTicket(req, res, next) {
  const { title } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (title.length > 200) {
    return res.status(400).json({ error: 'Title must be less than 200 characters' });
  }

  next();
}

function validateNote(req, res, next) {
  const { content } = req.body;
  const hasFile = req.file && req.file.filename;
  
  // Allow note if it has either content or a file attachment
  const hasContent = content && content.trim().length > 0;
  
  if (!hasContent && !hasFile) {
    return res.status(400).json({ error: 'Note must contain either text content or an image' });
  }

  if (hasContent && content.length > 1000) {
    return res.status(400).json({ error: 'Note content must be less than 1000 characters' });
  }

  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  next();
}

function validateRegistration(req, res, next) {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAuthWeb,
  validateTicket,
  validateNote,
  validateLogin,
  validateRegistration
};
