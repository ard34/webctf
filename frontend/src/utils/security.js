/**
 * Security Utilities
 * Handles secure token storage, input sanitization, and XSS protection
 */

// Secure token storage (using sessionStorage for better security)
export const tokenStorage = {
  get: () => {
    try {
      return sessionStorage.getItem('ctf_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  set: (token) => {
    try {
      sessionStorage.setItem('ctf_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  remove: () => {
    try {
      sessionStorage.removeItem('ctf_token');
      sessionStorage.removeItem('ctf_user');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  getUser: () => {
    try {
      const user = sessionStorage.getItem('ctf_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  setUser: (user) => {
    try {
      sessionStorage.setItem('ctf_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },
};

// XSS Protection - Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true, message: '' };
};

// Validate username
export const validateUsername = (username) => {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true, message: '' };
};

// Escape HTML to prevent XSS
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!tokenStorage.get();
};

// Check if user is admin
export const isAdmin = () => {
  const user = tokenStorage.getUser();
  return user?.role === 'admin';
};

// Rate limiting helper (client-side basic check)
let requestCount = 0;
let requestWindow = Date.now();

export const checkRateLimit = () => {
  const now = Date.now();
  if (now - requestWindow > 60000) {
    // Reset every minute
    requestCount = 0;
    requestWindow = now;
  }
  requestCount++;
  return requestCount <= 30; // Max 30 requests per minute
};

