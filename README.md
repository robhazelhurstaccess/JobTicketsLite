# JobTicketsLite

A simple case logging system for managing tickets and notes. Built with Node.js and SQLite.

## Features

- Create, view, edit, and delete tickets
- Add notes to tickets
- User authentication
- Priority and status management
- Search and filtering
- Responsive web interface

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## Default Login

- Username: admin
- Password: admin123

## Project Structure

```
/backend
  /routes       - API endpoints
  /middleware   - Authentication and validation
  /models       - Database models and setup
  server.js     - Main server file

/frontend
  /css          - Stylesheets
  /js           - Client-side JavaScript
  *.html        - Web pages
```

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/user - Get current user

### Tickets
- GET /api/tickets - Get all tickets
- GET /api/tickets/:id - Get specific ticket
- POST /api/tickets - Create new ticket
- PUT /api/tickets/:id - Update ticket
- DELETE /api/tickets/:id - Delete ticket

### Notes
- GET /api/tickets/:id/notes - Get notes for ticket
- POST /api/tickets/:id/notes - Add note to ticket
- PUT /api/notes/:id - Update note
- DELETE /api/notes/:id - Delete note

## License

MIT
