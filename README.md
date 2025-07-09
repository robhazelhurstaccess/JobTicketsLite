# JobTickets Lite

A lightweight, responsive ticket management system built with Node.js, Express, and SQLite. Perfect for small teams and personal project management.

## Features

- 🎫 **Ticket Management** - Create, read, update, and delete tickets
- 📝 **Notes System** - Add notes to tickets for collaboration
- 📷 **Image Attachments** - Upload screenshots and images to notes with Ctrl+V paste support
- ⌨️ **Keyboard Shortcuts** - Ctrl+Enter for all forms and confirm actions
- 👥 **User Management** - User registration and authentication
- 🔍 **Advanced Search** - Filter tickets by status, priority, assignee, and search content
- 📊 **Dashboard** - Overview of ticket statistics and recent activity
- 🎨 **Dark Theme** - Professional GitHub-style dark interface
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Security** - Password hashing, session management, and rate limiting

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd JobTicketsLite
```

2. Install dependencies and set up the database:
```bash
npm run setup
```

3. Add attachments table for image uploads (if upgrading from earlier version):
```bash
npm run add-attachments
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

6. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

## Project Structure

```
JobTicketsLite/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── models/
│   │   └── database.js       # Database models and initialization
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── notes.js          # Note management routes
│   │   ├── tickets.js        # Ticket management routes
│   │   └── users.js          # User management routes
│   └── server.js             # Express server configuration
├── frontend/
│   ├── css/
│   │   └── styles.css        # Styling (dark theme)
│   ├── js/
│   │   └── common.js         # Client-side utilities and API calls
│   ├── create-ticket.html    # Create new ticket page
│   ├── index.html            # Dashboard
│   ├── login.html            # Login page
│   ├── register.html         # User registration page
│   ├── ticket-detail.html    # Individual ticket view
│   └── tickets.html          # All tickets view
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Tickets
- `GET /api/tickets` - Get all tickets (with filtering)
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Notes
- `GET /api/tickets/:id/notes` - Get notes for a ticket
- `POST /api/tickets/:id/notes` - Add note to ticket
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Users
- `GET /api/users` - Get all users

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
SESSION_SECRET=your-secret-key-change-this-in-production
DB_PATH=./tickets.db
NODE_ENV=development
```

### Database
The application uses SQLite for data storage. The database file (`tickets.db`) is automatically created when you run the setup script.

## Usage

### Creating Tickets
1. Navigate to the dashboard
2. Click "Create New Ticket" or use the "Create Ticket" link in the navigation
3. Fill in the ticket details:
   - Title (required)
   - Description
   - Priority (low, medium, high)
   - Status (open, in_progress, resolved, closed)
   - Assigned user
   - Due date
4. Click "Create Ticket"

### Managing Tickets
- View all tickets in the "All Tickets" page
- Use filters to find specific tickets
- Click on a ticket title to view details
- Add notes to tickets for collaboration
- Upload images and screenshots to notes
- **Paste screenshots directly using Ctrl+V** - Works in the notes textarea
- Drag and drop image files onto the upload area
- Create image-only notes without text content
- Update ticket status and other fields

### Keyboard Shortcuts
- **Ctrl+Enter** (or **Cmd+Enter** on Mac) - Submit any form or confirm action
- **Ctrl+V** - Paste screenshots directly into notes
- **Ctrl+B** - Bold text in scratchpad
- **Ctrl+I** - Italic text in scratchpad
- **Escape** - Close modals and dialogs

### User Management
- Register new users via the registration page
- Admin users can see all users in the system
- Tickets can be assigned to different users

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm run setup` - Install dependencies and initialize database
- `npm run init-db` - Initialize/reset database only
- `npm run add-attachments` - Add attachments table for image uploads

### Database Schema

#### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Hashed password
- `created_at` - Account creation timestamp

#### Tickets Table
- `id` - Primary key
- `title` - Ticket title
- `description` - Ticket description
- `priority` - Priority level (low, medium, high)
- `status` - Current status (open, in_progress, resolved, closed)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `due_date` - Due date (optional)
- `assigned_to` - Assigned user ID (foreign key)
- `created_by` - Creator user ID (foreign key)

#### Notes Table
- `id` - Primary key
- `ticket_id` - Associated ticket ID (foreign key)
- `content` - Note content
- `created_at` - Creation timestamp
- `created_by` - Creator user ID (foreign key)

#### Attachments Table
- `id` - Primary key
- `note_id` - Associated note ID (foreign key)
- `filename` - Stored filename
- `original_name` - Original filename
- `file_path` - File system path
- `file_size` - File size in bytes
- `mime_type` - MIME type
- `created_at` - Upload timestamp
- `created_by` - Uploader user ID (foreign key)

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CSRF protection via session tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the GitHub repository.

## Changelog

### v1.0.0
- Initial release with core ticket management features
- User authentication and registration
- Dashboard with statistics
- Advanced search and filtering
- Notes system
- Responsive dark theme
- SQLite database integration
