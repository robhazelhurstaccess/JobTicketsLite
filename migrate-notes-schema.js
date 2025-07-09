const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');

console.log('Migrating notes schema to allow empty content...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database');
  
  // Check if the notes table exists and get its schema
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='notes'", (err, row) => {
    if (err) {
      console.error('Error checking table schema:', err);
      process.exit(1);
    }
    
    if (!row) {
      console.log('Notes table does not exist, no migration needed');
      db.close();
      return;
    }
    
    console.log('Current notes table schema:', row.sql);
    
    // Check if content column is already nullable
    if (row.sql.includes('content TEXT DEFAULT')) {
      console.log('Notes table already has correct schema');
      db.close();
      return;
    }
    
    // Create new table with correct schema
    db.serialize(() => {
      console.log('Creating backup of existing notes...');
      
      // Create backup table
      db.run(`CREATE TABLE notes_backup AS SELECT * FROM notes`, (err) => {
        if (err) {
          console.error('Error creating backup:', err);
          process.exit(1);
        }
        
        console.log('Backup created successfully');
        
        // Drop original table
        db.run(`DROP TABLE notes`, (err) => {
          if (err) {
            console.error('Error dropping original table:', err);
            process.exit(1);
          }
          
          console.log('Original table dropped');
          
          // Create new table with correct schema
          db.run(`
            CREATE TABLE notes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ticket_id INTEGER NOT NULL,
              content TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              created_by INTEGER NOT NULL,
              FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
              FOREIGN KEY (created_by) REFERENCES users (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating new table:', err);
              process.exit(1);
            }
            
            console.log('New table created with correct schema');
            
            // Restore data from backup
            db.run(`INSERT INTO notes SELECT * FROM notes_backup`, (err) => {
              if (err) {
                console.error('Error restoring data:', err);
                process.exit(1);
              }
              
              console.log('Data restored successfully');
              
              // Drop backup table
              db.run(`DROP TABLE notes_backup`, (err) => {
                if (err) {
                  console.error('Error dropping backup table:', err);
                  process.exit(1);
                }
                
                console.log('Backup table dropped');
                console.log('Migration completed successfully!');
                
                db.close();
              });
            });
          });
        });
      });
    });
  });
});
