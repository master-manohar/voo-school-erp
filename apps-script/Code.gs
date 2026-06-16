/**
 * ============================================================
 *  VOO SCHOOL ERP — Main Router (Code.gs)
 * ============================================================
 *  Entry points: doGet(e), doPost(e)
 *  Routes every request to the correct handler based on the
 *  "action" query/body parameter.
 *  All responses are JSON via ContentService.
 * ============================================================
 */

// ─── Global Constants ────────────────────────────────────────
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// Sheet name constants (emoji-prefixed as in the actual spreadsheet)
const SHEET = {
  ADMISSIONS:       '👥 ADMISSIONS',
  AY_PREFIX:        '📊 AY ',          // e.g. "📊 AY 2025-26"
  FEE_LEDGER:       '📒 FEE LEDGER',
  FEE_MASTER:       '📋 FEE MASTER',
  ENQUIRY:          '🎯 ENQUIRY',
  SETTINGS:         '⚙️ SETTINGS',
  AUDIT_LOG:        '📋 AUDIT LOG',
  TEMPLATES:        '💬 TEMPLATES',
  WA_REGISTRY:      '📱 WA REGISTRY',
  USERS:            '🔐 USERS',
  DAILY_ATTENDANCE: '📋 DAILY_ATTENDANCE',
  ANNOUNCEMENTS:    '📢 ANNOUNCEMENTS'
};

// Roles
const ROLE = {
  ADMIN:   'ADMIN',
  TEACHER: 'TEACHER',
  PARENT:  'PARENT',
  STUDENT: 'STUDENT'
};

// ─── doGet — handles GET requests ────────────────────────────
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';
    const token  = (e && e.parameter && e.parameter.token)  || '';

    // Public routes (no auth required)
    if (action === 'ping') {
      return jsonOk({ message: 'VOO School ERP API is alive', timestamp: new Date().toISOString() });
    }

    // ---------- Auth-protected GET routes ----------
    const authResult = validateToken(token);
    if (!authResult.valid) {
      return jsonError('Unauthorized: ' + authResult.error, 401);
    }
    const user = authResult.user;

    switch (action) {
      // --- Students ---
      case 'getStudents':
        return jsonOk(getStudents({
          classFilter:  e.parameter.class   || '',
          section:      e.parameter.section || '',
          status:       e.parameter.status  || '',
          search:       e.parameter.search  || ''
        }));

      case 'getStudent':
        return jsonOk(getStudent(e.parameter.admNo));

      case 'getStudentFees':
        return jsonOk(getStudentFees(e.parameter.admNo, e.parameter.ay));

      case 'getStudentAttendance':
        return jsonOk(getStudentAttendance(e.parameter.admNo, e.parameter.month));

      case 'getMyChild':
        requireRole(user, [ROLE.PARENT]);
        return jsonOk(getMyChild(user.phone));

      case 'getDashboardStats':
        requireRole(user, [ROLE.ADMIN, ROLE.TEACHER]);
        return jsonOk(getDashboardStats());

      // --- Fees ---
      case 'getFeeLedger':
        return jsonOk(getFeeLedger(e.parameter.admNo, e.parameter.ay));

      case 'getFeeSummary':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(getFeeSummary(e.parameter.ay));

      case 'getFeeMaster':
        return jsonOk(getFeeMaster(e.parameter.ay));

      // --- Settings ---
      case 'getSettings':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(getSettings());

      case 'getWhatsAppConfig':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(getWhatsAppConfig());

      // --- Users ---
      case 'getUserRole':
        return jsonOk({ role: getUserRole(e.parameter.phone) });

      default:
        return jsonError('Unknown GET action: ' + action, 400);
    }
  } catch (err) {
    return jsonError(err.message, 500);
  }
}

// ─── doPost — handles POST requests ─────────────────────────
function doPost(e) {
  try {
    // Parse body
    const body = e && e.postData ? JSON.parse(e.postData.contents) : {};
    const action = body.action || (e && e.parameter && e.parameter.action) || '';

    // ---------- Public POST routes (auth) ----------
    switch (action) {
      case 'loginWithPhone':
        return jsonOk(loginWithPhone(body.phone));

      case 'verifyOTP':
        return jsonOk(verifyOTP(body.phone, body.otp));

      case 'loginWithPassword':
        return jsonOk(loginWithPassword(body.email, body.password));
    }

    // ---------- Auth-protected POST routes ----------
    const token = body.token || (e && e.parameter && e.parameter.token) || '';
    const authResult = validateToken(token);
    if (!authResult.valid) {
      return jsonError('Unauthorized: ' + authResult.error, 401);
    }
    const user = authResult.user;

    switch (action) {
      // --- Fees ---
      case 'recordPayment':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(recordPayment(
          body.admNo, body.ay, body.feeType,
          body.amount, body.mode, user.name
        ));

      case 'generateFeeSchedule':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(generateFeeSchedule(body.admNo, body.ay));

      case 'sendFeeReminder':
        requireRole(user, [ROLE.ADMIN, ROLE.TEACHER]);
        return jsonOk(sendFeeReminder(body.admNo));

      // --- Settings ---
      case 'updateWhatsAppConfig':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(updateWhatsAppConfig(
          body.provider, body.apiKey, body.apiUrl, body.phoneNumber
        ));

      case 'testWhatsAppConnection':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(testWhatsAppConnection());

      case 'updateSchoolInfo':
        requireRole(user, [ROLE.ADMIN]);
        return jsonOk(updateSchoolInfo(
          body.name, body.address, body.phone, body.email, body.logo
        ));

      // --- Utility: send WhatsApp ---
      case 'sendWhatsApp':
        requireRole(user, [ROLE.ADMIN, ROLE.TEACHER]);
        return jsonOk(sendWhatsAppMessage(body.phone, body.templateName, body.params));

      // --- Init helpers (admin only) ---
      case 'initSheets':
        requireRole(user, [ROLE.ADMIN]);
        initUsersSheet();
        initDailyAttendanceSheet();
        initAnnouncementsSheet();
        return jsonOk({ message: 'All sheets initialised' });

      default:
        return jsonError('Unknown POST action: ' + action, 400);
    }
  } catch (err) {
    return jsonError(err.message, 500);
  }
}

// ─── JSON Response Helpers ───────────────────────────────────

/**
 * Return a success JSON response.
 * @param {Object} data — payload
 * @returns {TextOutput}
 */
function jsonOk(data) {
  const payload = JSON.stringify({ success: true, data: data, error: '' });
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Return an error JSON response.
 * @param {string} message
 * @param {number} code — HTTP-like status code (informational only)
 * @returns {TextOutput}
 */
function jsonError(message, code) {
  const payload = JSON.stringify({ success: false, data: null, error: message, code: code || 500 });
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Role Guard ──────────────────────────────────────────────
/**
 * Throws if the authenticated user does not have one of the
 * allowed roles.
 */
function requireRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden — role ' + user.role + ' cannot access this resource');
  }
}

// ─── One-time Setup ──────────────────────────────────────────
/**
 * Run once after deploying to set up the JWT secret and
 * create any missing sheets.
 */
function setupOnce() {
  // Generate a random JWT secret if none exists
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('JWT_SECRET')) {
    props.setProperty('JWT_SECRET', Utilities.getUuid() + '-' + Utilities.getUuid());
    Logger.log('JWT_SECRET generated and stored.');
  }

  // Ensure required sheets exist
  initUsersSheet();
  initDailyAttendanceSheet();
  initAnnouncementsSheet();

  Logger.log('Setup complete ✅');
}
