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

  showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alerts');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.transition = 'opacity 0.3s ease-out';
    alert.style.opacity = '1';

    alertContainer.appendChild(alert);

    // Start fade out after the specified duration minus fade time
    setTimeout(() => {
      alert.style.opacity = '0';
      // Remove element after fade completes
      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
      }, 300);
    }, duration - 300);
  },

  showQuickAlert(message, type = 'success') {
    this.showAlert(message, type, 1000);
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

// Scratchpad functionality
function setupScratchpad() {
  const scratchpadBtn = document.getElementById('scratchpadBtn');
  const scratchpadModal = document.getElementById('scratchpadModal');
  
  // Only set up if elements exist on the page
  if (!scratchpadBtn || !scratchpadModal) return;
  
  const scratchpadModalContent = document.getElementById('scratchpadModalContent');
  const closeScratchpadBtn = document.getElementById('closeScratchpadBtn');
  const maximizeScratchpadBtn = document.getElementById('maximizeScratchpadBtn');
  const scratchpadContent = document.getElementById('scratchpadContent');
  const saveScratchpadBtn = document.getElementById('saveScratchpadBtn');
  const clearScratchpadBtn = document.getElementById('clearScratchpadBtn');
  const scratchpadStatus = document.getElementById('scratchpadStatus');
  
  let autoSaveTimeout;
  let isMaximized = false;
  let previousSize = { width: null, height: null };
  
  // Load saved content and size
  loadScratchpadContent();
  loadScratchpadSize();
  
  // Set up formatting toolbar
  setupFormattingToolbar();
  
  // Set up resize functionality
  setupResizeHandling();
  
  // Open scratchpad
  scratchpadBtn.addEventListener('click', () => {
    scratchpadModal.classList.remove('hidden');
    scratchpadContent.focus();
  });
  
  // Close scratchpad
  closeScratchpadBtn.addEventListener('click', () => {
    saveScratchpadSize();
    scratchpadModal.classList.add('hidden');
  });
  
  // Maximize/restore scratchpad
  maximizeScratchpadBtn.addEventListener('click', () => {
    toggleMaximize();
  });
  
  // Close on overlay click
  scratchpadModal.addEventListener('click', (e) => {
    if (e.target === scratchpadModal) {
      saveScratchpadSize();
      scratchpadModal.classList.add('hidden');
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !scratchpadModal.classList.contains('hidden')) {
      saveScratchpadSize();
      scratchpadModal.classList.add('hidden');
    }
  });
  
  // Auto-save functionality
  scratchpadContent.addEventListener('input', () => {
    clearTimeout(autoSaveTimeout);
    scratchpadStatus.textContent = 'Unsaved changes...';
    scratchpadStatus.style.color = '#f39c12';
    
    autoSaveTimeout = setTimeout(() => {
      saveScratchpadContent();
    }, 1000);
  });
  
  // Manual save
  saveScratchpadBtn.addEventListener('click', () => {
    saveScratchpadContent();
  });
  
  // Clear all
  clearScratchpadBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all scratchpad content?')) {
      scratchpadContent.value = '';
      saveScratchpadContent();
    }
  });
  
  // Keyboard shortcuts for formatting
  scratchpadContent.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
      }
    }
  });
  
  function setupFormattingToolbar() {
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        applyFormatting(format);
      });
    });
  }
  
  function applyFormatting(format) {
    const textarea = scratchpadContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'bullet':
        const bulletText = selectedText || 'New item';
        formattedText = `• ${bulletText}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 8); // Position after "New item"
        break;
      case 'number':
        const numberText = selectedText || 'New item';
        formattedText = `1. ${numberText}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 8); // Position after "New item"
        break;
      case 'h1':
        formattedText = `# ${selectedText || 'Heading 1'}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 9); // Position after "Heading 1"
        break;
      case 'h2':
        formattedText = `## ${selectedText || 'Heading 2'}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 9); // Position after "Heading 2"
        break;
    }
    
    textarea.value = beforeText + formattedText + afterText;
    
    // Set cursor position
    const newCursorPos = start + formattedText.length - cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // Trigger auto-save
    clearTimeout(autoSaveTimeout);
    scratchpadStatus.textContent = 'Unsaved changes...';
    scratchpadStatus.style.color = '#f39c12';
    
    autoSaveTimeout = setTimeout(() => {
      saveScratchpadContent();
    }, 1000);
  }
  
  function setupResizeHandling() {
    const resizeHandle = document.querySelector('.resize-handle');
    if (!resizeHandle) return;
    
    let isResizing = false;
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResize);
      e.preventDefault();
    });
    
    function handleResize(e) {
      if (!isResizing) return;
      
      const rect = scratchpadModalContent.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const newHeight = e.clientY - rect.top;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Allow resize up to 98% of viewport width and 95% of viewport height
      const maxWidth = viewportWidth * 0.98;
      const maxHeight = viewportHeight * 0.95;
      
      if (newWidth >= 400 && newWidth <= maxWidth) {
        scratchpadModalContent.style.width = newWidth + 'px';
      }
      if (newHeight >= 300 && newHeight <= maxHeight) {
        scratchpadModalContent.style.height = newHeight + 'px';
      }
    }
    
    function stopResize() {
      isResizing = false;
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
      saveScratchpadSize();
    }
  }
  
  function toggleMaximize() {
    if (isMaximized) {
      // Restore to previous size
      if (previousSize.width && previousSize.height) {
        scratchpadModalContent.style.width = previousSize.width;
        scratchpadModalContent.style.height = previousSize.height;
      } else {
        scratchpadModalContent.style.width = '90%';
        scratchpadModalContent.style.height = '80vh';
      }
      maximizeScratchpadBtn.textContent = '⛶';
      maximizeScratchpadBtn.title = 'Maximize';
      isMaximized = false;
    } else {
      // Store current size
      previousSize.width = scratchpadModalContent.style.width || '90%';
      previousSize.height = scratchpadModalContent.style.height || '80vh';
      
      // Maximize to full viewport
      scratchpadModalContent.style.width = '98vw';
      scratchpadModalContent.style.height = '95vh';
      maximizeScratchpadBtn.textContent = '⭳';
      maximizeScratchpadBtn.title = 'Restore';
      isMaximized = true;
    }
    
    saveScratchpadSize();
  }
}

function loadScratchpadContent() {
  const scratchpadContent = document.getElementById('scratchpadContent');
  if (!scratchpadContent) return;
  
  const saved = sessionStorage.getItem('scratchpad_content');
  if (saved) {
    scratchpadContent.value = saved;
  }
}

function saveScratchpadContent() {
  const scratchpadContent = document.getElementById('scratchpadContent');
  const scratchpadStatus = document.getElementById('scratchpadStatus');
  
  if (!scratchpadContent || !scratchpadStatus) return;
  
  sessionStorage.setItem('scratchpad_content', scratchpadContent.value);
  
  scratchpadStatus.textContent = 'Auto-saved';
  scratchpadStatus.style.color = '#8b949e';
  
  // Show quick save confirmation
  const originalText = scratchpadStatus.textContent;
  scratchpadStatus.textContent = 'Saved!';
  scratchpadStatus.style.color = '#56d364';
  
  setTimeout(() => {
    scratchpadStatus.textContent = originalText;
    scratchpadStatus.style.color = '#8b949e';
  }, 1000);
}

function loadScratchpadSize() {
  const scratchpadModalContent = document.getElementById('scratchpadModalContent');
  const maximizeScratchpadBtn = document.getElementById('maximizeScratchpadBtn');
  if (!scratchpadModalContent) return;
  
  const savedWidth = sessionStorage.getItem('scratchpad_width');
  const savedHeight = sessionStorage.getItem('scratchpad_height');
  const savedMaximized = sessionStorage.getItem('scratchpad_maximized') === 'true';
  
  if (savedWidth) {
    scratchpadModalContent.style.width = savedWidth;
  }
  if (savedHeight) {
    scratchpadModalContent.style.height = savedHeight;
  }
  
  // Update maximize button state if it exists
  if (maximizeScratchpadBtn) {
    if (savedMaximized) {
      maximizeScratchpadBtn.textContent = '⭳';
      maximizeScratchpadBtn.title = 'Restore';
    } else {
      maximizeScratchpadBtn.textContent = '⛶';
      maximizeScratchpadBtn.title = 'Maximize';
    }
  }
}

function saveScratchpadSize() {
  const scratchpadModalContent = document.getElementById('scratchpadModalContent');
  if (!scratchpadModalContent) return;
  
  const computedStyle = window.getComputedStyle(scratchpadModalContent);
  const width = computedStyle.width;
  const height = computedStyle.height;
  
  sessionStorage.setItem('scratchpad_width', width);
  sessionStorage.setItem('scratchpad_height', height);
  
  // Save maximized state
  const isMaximized = width === '98vw' || parseFloat(width) > window.innerWidth * 0.95;
  sessionStorage.setItem('scratchpad_maximized', isMaximized.toString());
}

// Export for use in other files
window.API = API;
window.Utils = Utils;
window.checkAuth = checkAuth;
window.logout = logout;
window.ready = ready;
window.setupScratchpad = setupScratchpad;
