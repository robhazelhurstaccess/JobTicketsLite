// API utility functions
const API = {
  baseURL: '/api',
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth methods
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
  },

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser() {
    return this.request('/auth/user');
  },

  // Ticket methods
  async getTickets(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/tickets?${params}`);
  },

  async getTicket(id) {
    return this.request(`/tickets/${id}`);
  },

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: ticketData
    });
  },

  async updateTicket(id, updates) {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: updates
    });
  },

  async deleteTicket(id) {
    return this.request(`/tickets/${id}`, { method: 'DELETE' });
  },

  // Note methods
  async getTicketNotes(ticketId) {
    return this.request(`/tickets/${ticketId}/notes`);
  },

  async createNote(ticketId, content) {
    return this.request(`/tickets/${ticketId}/notes`, {
      method: 'POST',
      body: { content }
    });
  },

  async updateNote(noteId, content) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: { content }
    });
  },

  async deleteNote(noteId) {
    return this.request(`/notes/${noteId}`, { method: 'DELETE' });
  },

  // User methods
  async getUsers() {
    return this.request('/users');
  }
};

// Utility functions
const Utils = {
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  },

  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
  },

  formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return this.formatDate(dateString);
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  getStatusColor(status) {
    const colors = {
      'open': '#27ae60',
      'in_progress': '#f39c12',
      'resolved': '#27ae60',
      'closed': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  },

  getPriorityColor(priority) {
    const colors = {
      'low': '#27ae60',
      'medium': '#f39c12',
      'high': '#e74c3c'
    };
    return colors[priority] || '#95a5a6';
  },

  showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alerts');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    alertContainer.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 5000);
  },

  showLoading(element) {
    element.innerHTML = '<div class="loading">Loading...</div>';
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Global auth check
async function checkAuth() {
  try {
    const response = await API.getCurrentUser();
    return response.user;
  } catch (error) {
    if (window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
    return null;
  }
}

// Global logout function
async function logout() {
  try {
    await API.logout();
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/login.html';
  }
}

// Common DOM ready function
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Export for use in other files
window.API = API;
window.Utils = Utils;
window.checkAuth = checkAuth;
window.logout = logout;
window.ready = ready;
