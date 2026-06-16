/**
 * VOO School ERP — API Client
 * Connects to Google Apps Script Web App backend
 */

const DEFAULT_BASE_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

/**
 * Get the configured API base URL
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('voo_api_url') || DEFAULT_BASE_URL;
  }
  return DEFAULT_BASE_URL;
}

/**
 * Set the API base URL
 * @param {string} url
 */
export function setBaseUrl(url) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('voo_api_url', url);
  }
}

/**
 * Get the stored auth token
 */
function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('voo_auth_token');
  }
  return null;
}

/**
 * Core request handler
 * @param {string} action - The API action/endpoint
 * @param {object} params - Request parameters
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>}
 */
async function request(action, params = {}, options = {}) {
  const baseUrl = getBaseUrl();
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body = {
    action,
    ...params,
  };

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      redirect: 'follow',
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    if (data.error) {
      throw new ApiError(data.error, data.code || 400);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request was cancelled', 0);
    }
    
    throw new ApiError(
      error.message || 'Network error. Please check your connection.',
      0
    );
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/* ============================================
   AUTH ENDPOINTS
   ============================================ */

/**
 * Send OTP to a phone number
 * @param {string} phone - 10-digit phone number
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendOTP(phone) {
  return request('sendOTP', { phone });
}

/**
 * Verify OTP and get auth token
 * @param {string} phone
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{success: boolean, token: string, user: object}>}
 */
export async function verifyOTP(phone, otp) {
  return request('verifyOTP', { phone, otp });
}

/**
 * Validate current token
 * @returns {Promise<{valid: boolean, user: object}>}
 */
export async function validateToken() {
  return request('validateToken');
}

/* ============================================
   DASHBOARD ENDPOINTS
   ============================================ */

/**
 * Get dashboard data (role-aware)
 * @returns {Promise<object>}
 */
export async function getDashboard() {
  return request('getDashboard');
}

/**
 * Get dashboard stats
 * @returns {Promise<object>}
 */
export async function getDashboardStats() {
  return request('getDashboardStats');
}

/* ============================================
   STUDENT ENDPOINTS
   ============================================ */

/**
 * Get list of students with optional filters
 * @param {object} filters - { class, section, status, search, page, limit }
 * @returns {Promise<{students: array, total: number, page: number}>}
 */
export async function getStudents(filters = {}) {
  return request('getStudents', { filters });
}

/**
 * Get a single student by admission number
 * @param {string} admNo
 * @returns {Promise<{student: object}>}
 */
export async function getStudent(admNo) {
  return request('getStudent', { admNo });
}

/**
 * Create a new student
 * @param {object} studentData
 * @returns {Promise<{success: boolean, student: object}>}
 */
export async function createStudent(studentData) {
  return request('createStudent', { student: studentData });
}

/**
 * Update an existing student
 * @param {string} admNo
 * @param {object} studentData
 * @returns {Promise<{success: boolean}>}
 */
export async function updateStudent(admNo, studentData) {
  return request('updateStudent', { admNo, student: studentData });
}

/* ============================================
   FEE ENDPOINTS
   ============================================ */

/**
 * Get fee dashboard/summary
 * @param {object} filters - { class, month, academicYear }
 * @returns {Promise<object>}
 */
export async function getFees(filters = {}) {
  return request('getFees', { filters });
}

/**
 * Get fee details for a specific student
 * @param {string} admNo
 * @returns {Promise<{fees: array, summary: object}>}
 */
export async function getStudentFees(admNo) {
  return request('getStudentFees', { admNo });
}

/**
 * Record a fee payment
 * @param {object} paymentData - { admNo, amount, mode, reference, date }
 * @returns {Promise<{success: boolean, receipt: object}>}
 */
export async function recordPayment(paymentData) {
  return request('recordPayment', { payment: paymentData });
}

/**
 * Send fee reminders via WhatsApp
 * @param {object} params - { class, studentIds, templateId }
 * @returns {Promise<{success: boolean, sent: number}>}
 */
export async function sendFeeReminders(params) {
  return request('sendFeeReminders', params);
}

/* ============================================
   ATTENDANCE ENDPOINTS
   ============================================ */

/**
 * Get attendance data
 * @param {object} filters - { class, section, date, month }
 * @returns {Promise<object>}
 */
export async function getAttendance(filters = {}) {
  return request('getAttendance', { filters });
}

/**
 * Mark attendance for a class
 * @param {object} data - { class, section, date, attendance: [{admNo, status}] }
 * @returns {Promise<{success: boolean}>}
 */
export async function markAttendance(data) {
  return request('markAttendance', data);
}

/**
 * Get attendance for a specific student
 * @param {string} admNo
 * @param {string} month
 * @returns {Promise<object>}
 */
export async function getStudentAttendance(admNo, month) {
  return request('getStudentAttendance', { admNo, month });
}

/* ============================================
   SETTINGS ENDPOINTS
   ============================================ */

/**
 * Get all settings
 * @returns {Promise<object>}
 */
export async function getSettings() {
  return request('getSettings');
}

/**
 * Update settings
 * @param {object} settings
 * @returns {Promise<{success: boolean}>}
 */
export async function updateSettings(settings) {
  return request('updateSettings', { settings });
}

/**
 * Test WhatsApp API connection
 * @param {object} config - { provider, apiKey, apiUrl, phone }
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testWhatsAppConnection(config) {
  return request('testWhatsAppConnection', { config });
}

/* ============================================
   PARENT ENDPOINTS
   ============================================ */

/**
 * Get parent's child data (authenticated parent only)
 * @returns {Promise<{child: object, attendance: object, fees: object, marks: array}>}
 */
export async function getMyChild() {
  return request('getMyChild');
}

/**
 * Get announcements
 * @param {object} filters - { class, limit }
 * @returns {Promise<{announcements: array}>}
 */
export async function getAnnouncements(filters = {}) {
  return request('getAnnouncements', { filters });
}

/* ============================================
   COMMUNICATION ENDPOINTS
   ============================================ */

/**
 * Send WhatsApp message
 * @param {object} data - { phone, templateId, params }
 * @returns {Promise<{success: boolean}>}
 */
export async function sendWhatsAppMessage(data) {
  return request('sendWhatsAppMessage', data);
}

/**
 * Send bulk WhatsApp messages
 * @param {object} data - { phones, templateId, params }
 * @returns {Promise<{success: boolean, sent: number, failed: number}>}
 */
export async function sendBulkWhatsApp(data) {
  return request('sendBulkWhatsApp', data);
}

/* ============================================
   USER MANAGEMENT ENDPOINTS
   ============================================ */

/**
 * Get list of users (admin only)
 * @returns {Promise<{users: array}>}
 */
export async function getUsers() {
  return request('getUsers');
}

/**
 * Create a new user (admin only)
 * @param {object} userData - { name, phone, role, classes }
 * @returns {Promise<{success: boolean, user: object}>}
 */
export async function createUser(userData) {
  return request('createUser', { user: userData });
}

/**
 * Delete a user (admin only)
 * @param {string} userId
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteUser(userId) {
  return request('deleteUser', { userId });
}

/* ============================================
   EXPORT ENDPOINT
   ============================================ */

/**
 * Export data (students, fees, attendance) as downloadable file
 * @param {string} type - 'students' | 'fees' | 'attendance'
 * @param {object} filters
 * @returns {Promise<{downloadUrl: string}>}
 */
export async function exportData(type, filters = {}) {
  return request('exportData', { type, filters });
}
