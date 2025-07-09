const express = require('express');
const database = require('../models/database');
const { requireAuth, validateTask } = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', requireAuth, (req, res) => {
  const filters = {
    status: req.query.status,
    priority: req.query.priority,
    assigned_to: req.query.assigned_to,
    search: req.query.search
  };

  database.getTasks(filters, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tasks);
  });
});

// Get specific task
router.get('/:id', requireAuth, (req, res) => {
  const taskId = req.params.id;

  database.getTaskById(taskId, (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  });
});

// Create new task
router.post('/', requireAuth, validateTask, (req, res) => {
  const taskData = {
    title: req.body.title,
    description: req.body.description || '',
    priority: req.body.priority || 'medium',
    status: req.body.status || 'open',
    due_date: req.body.due_date || null,
    assigned_to: req.body.assigned_to || null,
    created_by: req.session.user.id
  };

  database.createTask(taskData, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    database.getTaskById(this.lastID, (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(task);
    });
  });
});

// Update task
router.put('/:id', requireAuth, (req, res) => {
  const taskId = req.params.id;
  const updates = {};

  // Only include fields that are provided
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.priority !== undefined) updates.priority = req.body.priority;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.due_date !== undefined) updates.due_date = req.body.due_date;
  if (req.body.assigned_to !== undefined) updates.assigned_to = req.body.assigned_to;

  database.updateTask(taskId, updates, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    database.getTaskById(taskId, (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    });
  });
});

// Delete task
router.delete('/:id', requireAuth, (req, res) => {
  const taskId = req.params.id;

  database.deleteTask(taskId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;
