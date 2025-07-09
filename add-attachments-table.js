const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');

console.log('Adding attachments table if it doesn\\'t exist...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database');
  
  // Check if attachments table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='attachments'", (err, row) => {
    if (err) {
      console.error('Error checking table:', err);
      process.exit(1);
    }
    
    if (row) {
      console.log('Attachments table already exists');
      db.close();
      return;
    }
    
    console.log('Creating attachments table...');
    
    db.run(`
      CREATE TABLE attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating attachments table:', err);
        process.exit(1);
      }
      
      console.log('Attachments table created successfully!');
      db.close();
    });
  });
});
