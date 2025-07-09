#!/usr/bin/env node

// AccessTasks Rebranding Script
// This script updates all references from "tickets" to "tasks" and "JobTickets Lite" to "AccessTasks"

const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = process.cwd();

// Files to update with their replacements
const replacements = [
  // App name changes
  { from: 'JobTickets Lite', to: 'AccessTasks' },
  { from: 'job-tickets-lite', to: 'access-tasks' },
  
  // Ticket to Task terminology
  { from: 'tickets', to: 'tasks' },
  { from: 'Tickets', to: 'Tasks' },
  { from: 'ticket', to: 'task' },
  { from: 'Ticket', to: 'Task' },
  
  // API endpoint changes
  { from: '/api/tickets', to: '/api/tasks' },
  { from: '/tickets.html', to: '/tasks.html' },
  { from: '/ticket-detail.html', to: '/task-detail.html' },
  { from: '/create-ticket.html', to: '/create-task.html' },
  
  // Variable name changes
  { from: 'ticketId', to: 'taskId' },
  { from: 'ticketData', to: 'taskData' },
  { from: 'currentTicket', to: 'currentTask' },
  { from: 'currentTickets', to: 'currentTasks' },
  { from: 'recentTickets', to: 'recentTasks' },
  { from: 'ticketsBody', to: 'tasksBody' },
  { from: 'ticketsData', to: 'tasksData' },
  { from: 'ticketRoutes', to: 'taskRoutes' },
  { from: 'ticketsList', to: 'tasksList' },
  { from: 'ticketsTable', to: 'tasksTable' },
  { from: 'ticketsGrid', to: 'tasksGrid' },
  
  // Function name changes
  { from: 'getTickets', to: 'getTasks' },
  { from: 'getTicket', to: 'getTask' },
  { from: 'createTicket', to: 'createTask' },
  { from: 'updateTicket', to: 'updateTask' },
  { from: 'deleteTicket', to: 'deleteTask' },
  { from: 'loadTickets', to: 'loadTasks' },
  { from: 'loadTicket', to: 'loadTask' },
  { from: 'displayTickets', to: 'displayTasks' },
  { from: 'sortTickets', to: 'sortTasks' },
  { from: 'updateTicketCount', to: 'updateTaskCount' },
  { from: 'updateTicketField', to: 'updateTaskField' },
  { from: 'getTicketNotes', to: 'getTaskNotes' },
  { from: 'validateTicket', to: 'validateTask' },
  { from: 'getNotesByTicketId', to: 'getNotesByTaskId' },
  
  // Database method changes
  { from: 'createTicket', to: 'createTask' },
  { from: 'getTickets', to: 'getTasks' },
  { from: 'getTicketById', to: 'getTaskById' },
  { from: 'updateTicket', to: 'updateTask' },
  { from: 'deleteTicket', to: 'deleteTask' },
  
  // Form and element ID changes
  { from: 'createTicketForm', to: 'createTaskForm' },
  { from: 'updateTicketForm', to: 'updateTaskForm' },
  { from: 'editTicketForm', to: 'editTaskForm' },
  { from: 'editTicketBtn', to: 'editTaskBtn' },
  { from: 'deleteTicketBtn', to: 'deleteTaskBtn' },
  { from: 'ticketDetails', to: 'taskDetails' },
  { from: 'ticketTitle', to: 'taskTitle' },
  { from: 'ticketSubtitle', to: 'taskSubtitle' },
  
  // Navigation and links
  { from: 'All Tickets', to: 'All Tasks' },
  { from: 'Create Ticket', to: 'Create Task' },
  { from: 'Create New Ticket', to: 'Create New Task' },
  { from: 'Edit Ticket', to: 'Edit Task' },
  { from: 'Update Ticket', to: 'Update Task' },
  { from: 'Delete Ticket', to: 'Delete Task' },
  { from: 'Recent Tickets', to: 'Recent Tasks' },
  { from: 'View All Tickets', to: 'View All Tasks' },
  
  // Messages and labels
  { from: 'ticket created successfully', to: 'task created successfully' },
  { from: 'ticket updated successfully', to: 'task updated successfully' },
  { from: 'ticket deleted successfully', to: 'task deleted successfully' },
  { from: 'Failed to create ticket', to: 'Failed to create task' },
  { from: 'Failed to update ticket', to: 'Failed to update task' },
  { from: 'Failed to delete ticket', to: 'Failed to delete task' },
  { from: 'Failed to load ticket', to: 'Failed to load task' },
  { from: 'Failed to load tickets', to: 'Failed to load tasks' },
  { from: 'No tickets found', to: 'No tasks found' },
  { from: 'No tickets yet', to: 'No tasks yet' },
  { from: 'Ticket not found', to: 'Task not found' },
  { from: 'No ticket ID provided', to: 'No task ID provided' },
  { from: 'Total Tickets', to: 'Total Tasks' },
  { from: 'Open Tickets', to: 'Open Tasks' },
  { from: 'tickets', to: 'tasks' },
  { from: 'ticket', to: 'task' },
  
  // Page titles
  { from: 'All Tickets - JobTickets Lite', to: 'All Tasks - AccessTasks' },
  { from: 'Create Ticket - JobTickets Lite', to: 'Create Task - AccessTasks' },
  { from: 'Ticket Detail - JobTickets Lite', to: 'Task Detail - AccessTasks' },
  { from: 'Dashboard - JobTickets Lite', to: 'Dashboard - AccessTasks' },
  
  // Comments
  { from: '// Ticket methods', to: '// Task methods' },
  { from: '// Get all tickets', to: '// Get all tasks' },
  { from: '// Get specific ticket', to: '// Get specific task' },
  { from: '// Create new ticket', to: '// Create new task' },
  { from: '// Update ticket', to: '// Update task' },
  { from: '// Delete ticket', to: '// Delete task' },
  { from: '// Load tickets', to: '// Load tasks' },
  { from: '// Display tickets', to: '// Display tasks' },
  
  // Placeholders and descriptions
  { from: 'Search tickets...', to: 'Search tasks...' },
  { from: 'managing tickets', to: 'managing tasks' },
  { from: 'Create a new ticket', to: 'Create a new task' },
  { from: 'Ticket details', to: 'Task details' },
  { from: 'Ticket Information', to: 'Task Information' },
  { from: 'for tracking tasks', to: 'for tracking tasks' }, // This one stays the same
];

// Function to recursively get all files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(filePath, fileList);
      }
    } else {
      // Only process certain file types
      if (file.match(/\.(js|html|css|json|md|bat|sh)$/)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Function to update a file with all replacements
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(replacement => {
      const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(replacement.from)) {
        content = content.replace(regex, replacement.to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${path.relative(projectRoot, filePath)}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔄 Starting AccessTasks rebranding...\n');

// Get all files to update
const allFiles = getAllFiles(projectRoot);

// Update each file
allFiles.forEach(updateFile);

console.log('\n✅ AccessTasks rebranding completed!');
console.log('\n📝 Summary of changes:');
console.log('- App name changed from "JobTickets Lite" to "AccessTasks"');
console.log('- All "ticket" references changed to "task"');
console.log('- API endpoints updated (/api/tickets → /api/tasks)');
console.log('- File names updated (tickets.html → tasks.html, etc.)');
console.log('- Function names updated (getTickets → getTasks, etc.)');
console.log('- Variable names updated (ticketId → taskId, etc.)');
console.log('- UI text updated (Create Ticket → Create Task, etc.)');
console.log('\n🚀 Your AccessTasks application is ready!');
