const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'tickets.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.init();
      }
    });
  }

  init() {
    this.db.serialize(() => {
      // Create users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create tickets table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          due_date DATE,
          assigned_to INTEGER,
          created_by INTEGER NOT NULL,
          FOREIGN KEY (assigned_to) REFERENCES users (id),
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create notes table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER NOT NULL,
          FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create default admin user if not exists
      this.createDefaultUser();
    });
  }

  createDefaultUser() {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const robPassword = bcrypt.hashSync('password123', 10);
    
    // Create admin user
    this.db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash) 
      VALUES (?, ?, ?)
    `, ['admin', 'admin@example.com', adminPassword], (err) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('Default admin user created (admin/admin123)');
      }
    });
    
    // Create Rob user
    this.db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash) 
      VALUES (?, ?, ?)
    `, ['Rob', 'rob@example.com', robPassword], (err) => {
      if (err) {
        console.error('Error creating Rob user:', err);
      } else {
        console.log('Default Rob user created (Rob/password123)');
      }
    });
  }

  // User methods
  createUser(username, email, password, callback) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    this.db.run(`
      INSERT INTO users (username, email, password_hash) 
      VALUES (?, ?, ?)
    `, [username, email, hashedPassword], callback);
  }

  getUserByUsername(username, callback) {
    this.db.get(`
      SELECT * FROM users WHERE username = ?
    `, [username], callback);
  }

  getUserById(id, callback) {
    this.db.get(`
      SELECT id, username, email, created_at FROM users WHERE id = ?
    `, [id], callback);
  }

  getAllUsers(callback) {
    this.db.all(`
      SELECT id, username, email FROM users ORDER BY username
    `, [], callback);
  }

  // Ticket methods
  createTicket(ticketData, callback) {
    const { title, description, priority, status, due_date, assigned_to, created_by } = ticketData;
    this.db.run(`
      INSERT INTO tickets (title, description, priority, status, due_date, assigned_to, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, priority, status, due_date, assigned_to, created_by], callback);
  }

  getTickets(filters, callback) {
    let query = `
      SELECT t.*, 
             u1.username as created_by_username,
             u2.username as assigned_to_username
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.status) {
      query += ` AND t.status = ?`;
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ` AND t.priority = ?`;
      params.push(filters.priority);
    }

    if (filters.assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(filters.assigned_to);
    }

    if (filters.search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY t.created_at DESC`;

    this.db.all(query, params, callback);
  }

  getTicketById(id, callback) {
    this.db.get(`
      SELECT t.*, 
             u1.username as created_by_username,
             u2.username as assigned_to_username
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `, [id], callback);
  }

  updateTicket(id, updates, callback) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      return callback(new Error('No fields to update'));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`;
    this.db.run(query, values, callback);
  }

  deleteTicket(id, callback) {
    this.db.run(`DELETE FROM tickets WHERE id = ?`, [id], callback);
  }

  // Note methods
  createNote(noteData, callback) {
    const { ticket_id, content, created_by } = noteData;
    this.db.run(`
      INSERT INTO notes (ticket_id, content, created_by)
      VALUES (?, ?, ?)
    `, [ticket_id, content, created_by], callback);
  }

  getNotesByTicketId(ticketId, callback) {
    this.db.all(`
      SELECT n.*, u.username as created_by_username
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.ticket_id = ?
      ORDER BY n.created_at ASC
    `, [ticketId], callback);
  }

  updateNote(id, content, callback) {
    this.db.run(`
      UPDATE notes SET content = ? WHERE id = ?
    `, [content, id], callback);
  }

  deleteNote(id, callback) {
    this.db.run(`DELETE FROM notes WHERE id = ?`, [id], callback);
  }

  close() {
    this.db.close();
  }
}

// Initialize database when this module is required
const database = new Database();

module.exports = database;

// If run directly, just initialize the database
if (require.main === module) {
  console.log('Database initialized successfully');
  setTimeout(() => {
    database.close();
  }, 1000);
}
