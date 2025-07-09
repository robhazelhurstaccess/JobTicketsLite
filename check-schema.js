const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');

console.log('Checking database schema...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database');
  
  // Check all tables
  db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error checking tables:', err);
      process.exit(1);
    }
    
    console.log('\nExisting tables:');
    tables.forEach(table => {
      console.log(`\n${table.name}:`);
      console.log(table.sql);
    });
    
    // Check if attachments table exists
    const attachmentsTable = tables.find(t => t.name === 'attachments');
    if (!attachmentsTable) {
      console.log('\nAttachments table does not exist, creating it...');
      
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
        } else {
          console.log('Attachments table created successfully');
        }
        
        db.close();
      });
    } else {
      console.log('\nAttachments table already exists');
      db.close();
    }
  });
});
