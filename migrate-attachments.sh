#!/bin/bash

echo "Adding attachments table to database..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if database exists
if [ ! -f "tickets.db" ]; then
    echo "Database file not found. Please run 'npm run setup' first."
    exit 1
fi

# Run the migration
node add-attachments-table.js

echo "Migration completed. You can now restart the server."
