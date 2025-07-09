const database = require('./backend/models/database');

console.log('Adding Rob user to the database...');

// Add Rob user
database.createUser('Rob', 'rob@example.com', 'password123', function(err) {
    if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.log('✅ Rob user already exists');
        } else {
            console.error('❌ Error creating Rob user:', err);
        }
    } else {
        console.log('✅ Rob user created successfully');
        console.log('   Username: Rob');
        console.log('   Email: rob@example.com');
        console.log('   Password: password123');
    }
    
    // Close the database connection
    database.close();
});
