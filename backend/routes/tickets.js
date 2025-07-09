const express = require('express');
const database = require('../models/database');
const { requireAuth, validateTicket } = require('../middleware/auth');

const router = express.Router();

// Get all tickets
router.get('/', requireAuth, (req, res) => {
  const filters = {
    status: req.query.status,
    priority: req.query.priority,
    assigned_to: req.query.assigned_to,
    search: req.query.search
  };

  database.getTickets(filters, (err, tickets) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tickets);
  });
});

// Get specific ticket
router.get('/:id', requireAuth, (req, res) => {
  const ticketId = req.params.id;

  database.getTicketById(ticketId, (err, ticket) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  });
});

// Create new ticket
router.post('/', requireAuth, validateTicket, (req, res) => {
  const ticketData = {
    title: req.body.title,
    description: req.body.description || '',
    priority: req.body.priority || 'medium',
    status: req.body.status || 'open',
    due_date: req.body.due_date || null,
    assigned_to: req.body.assigned_to || null,
    created_by: req.session.user.id
  };

  database.createTicket(ticketData, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    database.getTicketById(this.lastID, (err, ticket) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(ticket);
    });
  });
});

// Update ticket
router.put('/:id', requireAuth, (req, res) => {
  const ticketId = req.params.id;
  const updates = {};

  // Only include fields that are provided
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.priority !== undefined) updates.priority = req.body.priority;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.due_date !== undefined) updates.due_date = req.body.due_date;
  if (req.body.assigned_to !== undefined) updates.assigned_to = req.body.assigned_to;

  database.updateTicket(ticketId, updates, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    database.getTicketById(ticketId, (err, ticket) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    });
  });
});

// Delete ticket
router.delete('/:id', requireAuth, (req, res) => {
  const ticketId = req.params.id;

  database.deleteTicket(ticketId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  });
});

module.exports = router;
