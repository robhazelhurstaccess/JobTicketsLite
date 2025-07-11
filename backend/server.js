const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const userRoutes = require('./routes/users');
const { requireAuthWeb } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Apply rate limiting only to API routes, not static files
app.use('/api', limiter);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', noteRoutes);
app.use('/api/users', userRoutes);

// Protected routes for HTML pages
app.get('/', requireAuthWeb, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/tasks.html', requireAuthWeb, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'tasks.html'));
});

app.get('/task-detail.html', requireAuthWeb, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'task-detail.html'));
});

app.get('/create-task.html', requireAuthWeb, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'create-task.html'));
});

// Legacy routes for backward compatibility
app.get('/tickets.html', requireAuthWeb, (req, res) => {
  res.redirect('/tasks.html');
});

app.get('/ticket-detail.html', requireAuthWeb, (req, res) => {
  res.redirect('/task-detail.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
});

app.get('/create-ticket.html', requireAuthWeb, (req, res) => {
  res.redirect('/create-task.html');
});

// Public routes (no auth required)
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API documentation: http://localhost:${PORT}/api/health`);
});

module.exports = app;
