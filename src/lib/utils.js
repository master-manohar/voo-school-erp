/**
 * VOO School ERP — Utility Functions
 */

/**
 * Format amount in Indian Rupee format
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Indian numbering system: 1,00,000 format
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];

  // Apply Indian grouping (last 3 digits, then groups of 2)
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const groups = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    intPart = groups.join(',') + ',' + last3;
  }

  const formatted = decPart === '00' ? intPart : `${intPart}.${decPart}`;
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format date to DD/MM/YYYY
 * @param {string|Date} date
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
}

/**
 * Get initials from a name (max 2 letters)
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Conditionally join CSS class names
 * @param  {...any} args - Strings, objects, or arrays of class names
 * @returns {string} Joined class names
 */
export function classNames(...args) {
  const classes = [];

  args.forEach((arg) => {
    if (!arg) return;

    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });

  return classes.join(' ');
}

/**
 * Get CSS class for a status value
 * @param {string} status
 * @returns {string} CSS class name
 */
export function getStatusColor(status) {
  if (!status) return 'badge-info';
  
  const s = status.toLowerCase().trim();

  const statusMap = {
    active: 'badge-active',
    enrolled: 'badge-active',
    present: 'badge-success',
    paid: 'badge-success',
    completed: 'badge-success',
    passed: 'badge-success',
    approved: 'badge-success',
    connected: 'badge-success',
    inactive: 'badge-inactive',
    suspended: 'badge-danger',
    absent: 'badge-danger',
    failed: 'badge-danger',
    overdue: 'badge-danger',
    rejected: 'badge-danger',
    disconnected: 'badge-danger',
    unpaid: 'badge-danger',
    pending: 'badge-pending',
    partial: 'badge-warning',
    late: 'badge-warning',
    processing: 'badge-warning',
    testing: 'badge-warning',
  };

  return statusMap[s] || 'badge-info';
}

/**
 * Truncate text to a specified length with ellipsis
 * @param {string} text
 * @param {number} len - Maximum length (default: 50)
 * @returns {string}
 */
export function truncateText(text, len = 50) {
  if (!text) return '';
  if (text.length <= len) return text;
  return text.substring(0, len).trimEnd() + '…';
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay - Delay in ms (default: 300)
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a random color from a name (for avatar backgrounds)
 * @param {string} name
 * @returns {string} HSL color string
 */
export function nameToColor(name) {
  if (!name) return 'hsl(240, 70%, 60%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${Math.abs(h)}, 65%, 55%)`;
}

/**
 * Format phone number for display
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Get academic year string (e.g., "2025-26")
 * @param {Date} date
 * @returns {string}
 */
export function getAcademicYear(date = new Date()) {
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  
  if (month >= 3) {
    // April onwards = current year - next year
    return `${year}-${String(year + 1).slice(2)}`;
  }
  // Jan-Mar = previous year - current year
  return `${year - 1}-${String(year).slice(2)}`;
}

/**
 * Simple percentage calculation
 * @param {number} value
 * @param {number} total
 * @returns {number} Percentage (0-100)
 */
export function calcPercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Sleep utility for async operations
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
