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

  // Task methods (renamed from tickets)
  async getTasks(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/tasks?${params}`);
  },

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  },

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: taskData
    });
  },

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: updates
    });
  },

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  },

  // Legacy methods for backward compatibility
  async getTickets(filters = {}) {
    return this.getTasks(filters);
  },

  async getTicket(id) {
    return this.getTask(id);
  },

  async createTicket(ticketData) {
    return this.createTask(ticketData);
  },

  async updateTicket(id, updates) {
    return this.updateTask(id, updates);
  },

  async deleteTicket(id) {
    return this.deleteTask(id);
  },

  // Note methods
  async getTaskNotes(taskId) {
    return this.request(`/tasks/${taskId}/notes`);
  },

  async createNote(taskId, content) {
    return this.request(`/tasks/${taskId}/notes`, {
      method: 'POST',
      body: { content }
    });
  },

  // Legacy methods for backward compatibility
  async getTicketNotes(ticketId) {
    return this.getTaskNotes(ticketId);
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
  
  const scratchpadDropdown = document.getElementById('scratchpadDropdown');
  const scratchpadModalContent = document.getElementById('scratchpadModalContent');
  const closeScratchpadBtn = document.getElementById('closeScratchpadBtn');
  const maximizeScratchpadBtn = document.getElementById('maximizeScratchpadBtn');
  const scratchpadContent = document.getElementById('scratchpadContent');
  const saveScratchpadBtn = document.getElementById('saveScratchpadBtn');
  const clearScratchpadBtn = document.getElementById('clearScratchpadBtn');
  const scratchpadStatus = document.getElementById('scratchpadStatus');
  const scratchpadTitle = document.getElementById('scratchpadTitle');
  const renameScratchpadBtn = document.getElementById('renameScratchpadBtn');
  const deleteScratchpadBtn = document.getElementById('deleteScratchpadBtn');
  const newScratchpadName = document.getElementById('newScratchpadName');
  const createScratchpadBtn = document.getElementById('createScratchpadBtn');
  const scratchpadList = document.getElementById('scratchpadList');
  
  let autoSaveTimeout;
  let isMaximized = false;
  let previousSize = { width: null, height: null };
  let currentScratchpadId = null;
  
  // Initialize scratchpads
  initializeScratchpads();
  
  // Set up formatting toolbar
  setupFormattingToolbar();
  
  // Set up resize functionality
  setupResizeHandling();
  
  // Toggle dropdown on button click
  scratchpadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Position dropdown relative to button
    const buttonRect = scratchpadBtn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Position dropdown
    scratchpadDropdown.style.position = 'fixed';
    scratchpadDropdown.style.top = (buttonRect.bottom + 4) + 'px';
    
    // Check if dropdown would go off-screen on the right
    const dropdownWidth = 250; // min-width from CSS
    if (buttonRect.right - dropdownWidth < 0) {
      // Align to left edge of button
      scratchpadDropdown.style.left = buttonRect.left + 'px';
      scratchpadDropdown.style.right = 'auto';
    } else {
      // Align to right edge of button
      scratchpadDropdown.style.right = (viewportWidth - buttonRect.right) + 'px';
      scratchpadDropdown.style.left = 'auto';
    }
    
    scratchpadDropdown.classList.toggle('hidden');
  });
  
  // Prevent dropdown from closing when clicking inside it
  scratchpadDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!scratchpadBtn.contains(e.target) && !scratchpadDropdown.contains(e.target)) {
      scratchpadDropdown.classList.add('hidden');
    }
  });
  
  // Create new scratchpad
  createScratchpadBtn.addEventListener('click', () => {
    const name = newScratchpadName.value.trim();
    if (name) {
      createScratchpad(name);
      newScratchpadName.value = '';
      scratchpadDropdown.classList.add('hidden');
    }
  });
  
  // Enter key to create scratchpad
  newScratchpadName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createScratchpadBtn.click();
    }
  });
  
  // Close scratchpad modal
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
  
  // Clear current scratchpad
  clearScratchpadBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this scratchpad?')) {
      scratchpadContent.value = '';
      saveScratchpadContent();
    }
  });
  
  // Rename scratchpad
  renameScratchpadBtn.addEventListener('click', () => {
    if (currentScratchpadId) {
      const scratchpads = getScratchpads();
      const current = scratchpads.find(s => s.id === currentScratchpadId);
      if (current) {
        const newName = prompt('Enter new name:', current.name);
        if (newName && newName.trim()) {
          renameScratchpad(currentScratchpadId, newName.trim());
        }
      }
    }
  });
  
  // Delete scratchpad
  deleteScratchpadBtn.addEventListener('click', () => {
    if (currentScratchpadId) {
      const scratchpads = getScratchpads();
      const current = scratchpads.find(s => s.id === currentScratchpadId);
      if (current && confirm(`Are you sure you want to delete "${current.name}"?`)) {
        deleteScratchpad(currentScratchpadId);
      }
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
  
  // Initialize with default scratchpad or first available
  function initializeScratchpads() {
    let scratchpads = getScratchpads();
    
    // Create default scratchpad if none exist
    if (scratchpads.length === 0) {
      createScratchpad('Default');
      scratchpads = getScratchpads();
    }
    
    // Set current scratchpad to last used or first available
    const lastUsed = localStorage.getItem('scratchpad_last_used');
    const lastUsedScratchpad = scratchpads.find(s => s.id === lastUsed);
    
    if (lastUsedScratchpad) {
      currentScratchpadId = lastUsed;
    } else {
      currentScratchpadId = scratchpads[0].id;
    }
    
    updateScratchpadList();
    loadCurrentScratchpad();
    loadScratchpadSize();
  }
  
  function getScratchpads() {
    const saved = localStorage.getItem('scratchpads');
    return saved ? JSON.parse(saved) : [];
  }
  
  function saveScratchpads(scratchpads) {
    localStorage.setItem('scratchpads', JSON.stringify(scratchpads));
  }
  
  function createScratchpad(name) {
    const scratchpads = getScratchpads();
    const id = 'scratchpad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const newScratchpad = {
      id: id,
      name: name,
      content: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
    
    scratchpads.push(newScratchpad);
    saveScratchpads(scratchpads);
    
    currentScratchpadId = id;
    updateScratchpadList();
    loadCurrentScratchpad();
    
    // Open the scratchpad modal
    scratchpadModal.classList.remove('hidden');
    scratchpadContent.focus();
  }
  
  function renameScratchpad(id, newName) {
    const scratchpads = getScratchpads();
    const scratchpad = scratchpads.find(s => s.id === id);
    
    if (scratchpad) {
      scratchpad.name = newName;
      scratchpad.modified = new Date().toISOString();
      saveScratchpads(scratchpads);
      updateScratchpadList();
      
      if (currentScratchpadId === id) {
        scratchpadTitle.textContent = newName;
      }
    }
  }
  
  function deleteScratchpad(id) {
    const scratchpads = getScratchpads();
    const filteredScratchpads = scratchpads.filter(s => s.id !== id);
    
    // Don't allow deleting the last scratchpad
    if (filteredScratchpads.length === 0) {
      Utils.showAlert('Cannot delete the last scratchpad', 'error');
      return;
    }
    
    saveScratchpads(filteredScratchpads);
    
    // If we deleted the current scratchpad, switch to another
    if (currentScratchpadId === id) {
      currentScratchpadId = filteredScratchpads[0].id;
      loadCurrentScratchpad();
    }
    
    updateScratchpadList();
    scratchpadModal.classList.add('hidden');
  }
  
  function updateScratchpadList() {
    const scratchpads = getScratchpads();
    
    if (scratchpads.length === 0) {
      scratchpadList.innerHTML = '<div class="empty-scratchpads">No scratchpads yet</div>';
      return;
    }
    
    scratchpadList.innerHTML = scratchpads.map(scratchpad => `
      <button class="scratchpad-item ${scratchpad.id === currentScratchpadId ? 'active' : ''}" 
              onclick="selectScratchpad('${scratchpad.id}')">
        <span class="scratchpad-item-name">${scratchpad.name}</span>
        <div class="scratchpad-item-actions">
          <button class="scratchpad-item-action" onclick="event.stopPropagation(); renameScratchpadInline('${scratchpad.id}')" title="Rename">
            📝
          </button>
          <button class="scratchpad-item-action delete" onclick="event.stopPropagation(); deleteScratchpadInline('${scratchpad.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </button>
    `).join('');
  }
  
  function selectScratchpad(id) {
    currentScratchpadId = id;
    localStorage.setItem('scratchpad_last_used', id);
    updateScratchpadList();
    loadCurrentScratchpad();
    scratchpadDropdown.classList.add('hidden');
    scratchpadModal.classList.remove('hidden');
    scratchpadContent.focus();
  }
  
  function loadCurrentScratchpad() {
    const scratchpads = getScratchpads();
    const current = scratchpads.find(s => s.id === currentScratchpadId);
    
    if (current) {
      scratchpadContent.value = current.content;
      scratchpadTitle.textContent = current.name;
      scratchpadStatus.textContent = 'Loaded';
      scratchpadStatus.style.color = '#8b949e';
    }
  }
  
  function saveScratchpadContent() {
    if (!currentScratchpadId) return;
    
    const scratchpads = getScratchpads();
    const current = scratchpads.find(s => s.id === currentScratchpadId);
    
    if (current) {
      current.content = scratchpadContent.value;
      current.modified = new Date().toISOString();
      saveScratchpads(scratchpads);
      
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
  }
  
  // Global functions for inline actions
  window.selectScratchpad = selectScratchpad;
  
  window.renameScratchpadInline = function(id) {
    const scratchpads = getScratchpads();
    const scratchpad = scratchpads.find(s => s.id === id);
    if (scratchpad) {
      const newName = prompt('Enter new name:', scratchpad.name);
      if (newName && newName.trim()) {
        renameScratchpad(id, newName.trim());
      }
    }
  };
  
  window.deleteScratchpadInline = function(id) {
    const scratchpads = getScratchpads();
    const scratchpad = scratchpads.find(s => s.id === id);
    if (scratchpad && confirm(`Are you sure you want to delete "${scratchpad.name}"?`)) {
      deleteScratchpad(id);
    }
  };
  
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
        cursorOffset = selectedText ? 0 : (formattedText.length - 8);
        break;
      case 'number':
        const numberText = selectedText || 'New item';
        formattedText = `1. ${numberText}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 8);
        break;
      case 'h1':
        formattedText = `# ${selectedText || 'Heading 1'}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 9);
        break;
      case 'h2':
        formattedText = `## ${selectedText || 'Heading 2'}`;
        if (start === 0 || beforeText.endsWith('\n')) {
          formattedText = formattedText;
        } else {
          formattedText = `\n${formattedText}`;
        }
        cursorOffset = selectedText ? 0 : (formattedText.length - 9);
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
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
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
  
  function loadScratchpadSize() {
    const savedWidth = sessionStorage.getItem('scratchpad_width');
    const savedHeight = sessionStorage.getItem('scratchpad_height');
    const savedMaximized = sessionStorage.getItem('scratchpad_maximized') === 'true';
    
    if (savedWidth) {
      scratchpadModalContent.style.width = savedWidth;
    }
    if (savedHeight) {
      scratchpadModalContent.style.height = savedHeight;
    }
    
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
    const computedStyle = window.getComputedStyle(scratchpadModalContent);
    const width = computedStyle.width;
    const height = computedStyle.height;
    
    sessionStorage.setItem('scratchpad_width', width);
    sessionStorage.setItem('scratchpad_height', height);
    
    const isMaximized = width === '98vw' || parseFloat(width) > window.innerWidth * 0.95;
    sessionStorage.setItem('scratchpad_maximized', isMaximized.toString());
  }
}

// Clipboard paste handling for images
function setupClipboardPaste(textareaId, onImagePaste) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;
  
  textarea.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file && onImagePaste) {
          await onImagePaste(file);
        }
        break;
      }
    }
  });
}

// Enhanced image paste handling
async function handleImagePaste(file, textarea, onSuccess, onError) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      if (onError) onError('Please paste an image file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      if (onError) onError('Image size must be less than 5MB');
      return;
    }
    
    // Show uploading indicator
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    const uploadingText = '\n[📷 Uploading image...]\n';
    
    textarea.value = textBefore + uploadingText + textAfter;
    textarea.focus();
    
    // Call success callback with the file
    if (onSuccess) {
      await onSuccess(file, () => {
        // Remove uploading text on completion
        textarea.value = textarea.value.replace(uploadingText, '');
      });
    }
    
  } catch (error) {
    console.error('Image paste error:', error);
    if (onError) onError(error.message || 'Failed to process image');
  }
}

// File size formatter
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced keyboard shortcuts for forms
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter (or Cmd+Enter on Mac) for form submission
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      
      // Find the active form or the form containing the focused element
      let targetForm = null;
      let submitButton = null;
      
      // Check if we're in a specific context
      const activeElement = document.activeElement;
      
      // Priority 1: If focused element is in a form, use that form
      if (activeElement) {
        targetForm = activeElement.closest('form');
        if (targetForm) {
          submitButton = targetForm.querySelector('button[type="submit"]');
        }
      }
      
      // Priority 2: Check for visible modal forms
      if (!targetForm) {
        const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
        modals.forEach(modal => {
          const form = modal.querySelector('form');
          if (form) {
            targetForm = form;
            submitButton = form.querySelector('button[type="submit"]');
          }
        });
      }
      
      // Priority 3: Check for main page forms
      if (!targetForm) {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          if (!form.closest('.modal-overlay.hidden')) {
            targetForm = form;
            submitButton = form.querySelector('button[type="submit"]');
          }
        });
      }
      
      // Priority 4: Check for specific action buttons
      if (!submitButton) {
        // Look for common confirm buttons
        const confirmButtons = document.querySelectorAll(`
          button[onclick*="confirm"],
          button[class*="btn-primary"]:not([disabled]),
          button[class*="btn-success"]:not([disabled]),
          #submitNoteBtn:not([disabled]),
          #saveScratchpadBtn:not([disabled])
        `);
        
        confirmButtons.forEach(btn => {
          const isVisible = btn.offsetParent !== null;
          const isInVisibleModal = btn.closest('.modal-overlay:not(.hidden)');
          const isInHiddenModal = btn.closest('.modal-overlay.hidden');
          
          if (isVisible && !isInHiddenModal && !submitButton) {
            submitButton = btn;
          }
        });
      }
      
      // Execute the action
      if (submitButton && !submitButton.disabled) {
        // Add visual feedback
        submitButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
          submitButton.style.transform = '';
        }, 100);
        
        // Trigger the action
        if (targetForm) {
          targetForm.dispatchEvent(new Event('submit'));
        } else {
          submitButton.click();
        }
        
        // Show quick feedback
        showKeyboardShortcutFeedback('Ctrl+Enter triggered!');
      }
    }
  });
}

// Visual feedback for keyboard shortcuts
function showKeyboardShortcutFeedback(message) {
  const feedback = document.createElement('div');
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1f6feb;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.875rem;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(feedback);
  
  // Fade in
  setTimeout(() => {
    feedback.style.opacity = '1';
  }, 10);
  
  // Fade out and remove
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 300);
  }, 1500);
}

// Calendar functionality
function setupCalendar() {
  const calendarBtn = document.getElementById('calendarBtn');
  const calendarModal = document.getElementById('calendarModal');
  
  // Only set up if elements exist on the page
  if (!calendarBtn || !calendarModal) return;
  
  const closeCalendarBtn = document.getElementById('closeCalendarBtn');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const currentMonthSpan = document.getElementById('currentMonth');
  const calendarDays = document.getElementById('calendarDays');
  
  let currentDate = new Date();
  let ticketsData = [];
  
  // Open calendar
  calendarBtn.addEventListener('click', async () => {
    await loadCalendarData();
    renderCalendar();
    calendarModal.classList.remove('hidden');
  });
  
  // Close calendar
  closeCalendarBtn.addEventListener('click', () => {
    calendarModal.classList.add('hidden');
  });
  
  // Close on overlay click
  calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) {
      calendarModal.classList.add('hidden');
    }
  });
  
  // Navigation
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  
  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  
  // Load tasks data
  async function loadCalendarData() {
    try {
      const allTasks = await API.getTasks();
      // Filter out closed tasks from calendar view
      ticketsData = allTasks.filter(task => task.status !== 'closed');
    } catch (error) {
      console.error('Error loading calendar data:', error);
      ticketsData = [];
    }
  }
  
  // Render calendar
  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    currentMonthSpan.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Clear calendar
    calendarDays.innerHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarDays.appendChild(emptyDay);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = day;
      dayElement.appendChild(dayNumber);
      
      // Check if this day has tasks with due dates
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const tasksForDay = ticketsData.filter(task => task.due_date === dateString);
      
      if (tasksForDay.length > 0) {
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'day-tickets';
        
        tasksForDay.forEach(task => {
          const taskElement = document.createElement('div');
          taskElement.className = `ticket-indicator priority-${task.priority}`;
          taskElement.textContent = `#${task.id}`;
          taskElement.title = `${task.title} (${task.priority} priority)`;
          
          // Click to view task
          taskElement.addEventListener('click', () => {
            window.location.href = `/task-detail.html?id=${task.id}`;
          });
          
          tasksContainer.appendChild(taskElement);
        });
        
        dayElement.appendChild(tasksContainer);
        
        // Add hover tooltip
        dayElement.title = tasksForDay.map(t => `#${t.id}: ${t.title} (${t.priority})`).join('\n');
      }
      
      // Highlight today
      const today = new Date();
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayElement.classList.add('today');
      }
      
      calendarDays.appendChild(dayElement);
    }
  }
}

// Export for use in other files
window.API = API;
window.Utils = Utils;
window.checkAuth = checkAuth;
window.logout = logout;
window.ready = ready;
window.setupScratchpad = setupScratchpad;
window.setupClipboardPaste = setupClipboardPaste;
window.handleImagePaste = handleImagePaste;
window.formatFileSize = formatFileSize;
window.setupKeyboardShortcuts = setupKeyboardShortcuts;
window.showKeyboardShortcutFeedback = showKeyboardShortcutFeedback;
window.setupCalendar = setupCalendar;
