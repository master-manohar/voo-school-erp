/**
 * ============================================================
 *  VOO SCHOOL ERP — Authentication (Auth.gs)
 * ============================================================
 *  Handles:
 *    • Phone + OTP login (OTP sent via WhatsApp)
 *    • Email + Password login (admin / teacher)
 *    • JWT token creation & validation (HMAC-SHA256)
 *    • OTP storage via CacheService (5 min TTL)
 *    • USERS sheet auto-creation
 * ============================================================
 */

// ─── USERS Sheet Initialisation ──────────────────────────────
/**
 * Creates the 🔐 USERS sheet with headers if it doesn't exist.
 * Columns: UserID | Name | Phone | Email | PasswordHash | Role | AdmissionNo | Status | CreatedAt
 */
function initUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET.USERS);
  if (sheet) return sheet;

  sheet = ss.insertSheet(SHEET.USERS);
  const headers = [
    'UserID', 'Name', 'Phone', 'Email', 'PasswordHash',
    'Role', 'AdmissionNo', 'Status', 'CreatedAt'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  Logger.log('🔐 USERS sheet created.');
  return sheet;
}

// ─── Phone + OTP Login ───────────────────────────────────────

/**
 * Step 1: Send OTP to the given phone via WhatsApp.
 * Stores OTP in CacheService with 5-minute expiry.
 * @param {string} phone — e.g. "919876543210"
 * @returns {Object} { message, phone }
 */
function loginWithPhone(phone) {
  if (!phone) throw new Error('Phone number is required');

  // Normalise phone — strip +, spaces
  phone = String(phone).replace(/[\s\+\-]/g, '');

  // Check user exists
  const role = getUserRole(phone);
  if (!role) {
    throw new Error('No account found for this phone number');
  }

  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  // Store in CacheService (300 s = 5 min)
  const cache = CacheService.getScriptCache();
  cache.put('OTP_' + phone, otp, 300);

  // Send OTP via WhatsApp (reads config from SETTINGS every time)
  try {
    sendWhatsAppMessage(phone, 'otp_login', { otp: otp });
  } catch (waErr) {
    Logger.log('WhatsApp OTP send failed: ' + waErr.message);
    // Still return success — in dev, admin can read OTP from logs
  }

  logAudit('OTP_SENT', phone, 'OTP sent to ' + phone);
  return { message: 'OTP sent via WhatsApp', phone: phone };
}

/**
 * Step 2: Verify the OTP and return a JWT.
 * @param {string} phone
 * @param {string} otp
 * @returns {Object} { token, user }
 */
function verifyOTP(phone, otp) {
  if (!phone || !otp) throw new Error('Phone and OTP are required');

  phone = String(phone).replace(/[\s\+\-]/g, '');
  otp   = String(otp).trim();

  const cache     = CacheService.getScriptCache();
  const storedOTP = cache.get('OTP_' + phone);

  if (!storedOTP) {
    throw new Error('OTP expired or not found — please request a new one');
  }
  if (storedOTP !== otp) {
    throw new Error('Invalid OTP');
  }

  // OTP valid — remove from cache
  cache.remove('OTP_' + phone);

  // Build user object
  const userRow = getUserByPhone_(phone);
  const user = {
    userId: userRow.userId,
    name:   userRow.name,
    phone:  userRow.phone,
    email:  userRow.email,
    role:   userRow.role,
    admNo:  userRow.admissionNo
  };

  const token = createJWT_(user);
  logAudit('LOGIN_OTP', phone, user.name + ' logged in via OTP');

  return { token: token, user: user };
}

// ─── Email + Password Login (Admin / Teacher) ────────────────

/**
 * Authenticate with email and password (SHA-256 hashed).
 * @param {string} email
 * @param {string} password — plain text, will be hashed for comparison
 * @returns {Object} { token, user }
 */
function loginWithPassword(email, password) {
  if (!email || !password) throw new Error('Email and password are required');

  email = email.trim().toLowerCase();
  const hash = hashPassword(password);

  const sheet = getSheetByName(SHEET.USERS);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const colIdx = {};
  headers.forEach(function(h, i) { colIdx[h] = i; });

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[colIdx['Email']]).trim().toLowerCase() === email &&
        String(row[colIdx['PasswordHash']]).trim() === hash &&
        String(row[colIdx['Status']]).trim().toUpperCase() === 'ACTIVE') {

      var user = {
        userId: row[colIdx['UserID']],
        name:   row[colIdx['Name']],
        phone:  row[colIdx['Phone']],
        email:  row[colIdx['Email']],
        role:   row[colIdx['Role']],
        admNo:  row[colIdx['AdmissionNo']]
      };

      var token = createJWT_(user);
      logAudit('LOGIN_PASSWORD', email, user.name + ' logged in via password');
      return { token: token, user: user };
    }
  }

  throw new Error('Invalid email or password');
}

// ─── Token Validation ────────────────────────────────────────

/**
 * Validate a JWT and return the decoded user payload.
 * @param {string} token
 * @returns {Object} { valid: boolean, user?: Object, error?: string }
 */
function validateToken(token) {
  if (!token) return { valid: false, error: 'No token provided' };

  try {
    const user = verifyJWT_(token);
    return { valid: true, user: user };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// ─── Role Lookup ─────────────────────────────────────────────

/**
 * Look up the role for a phone number from the USERS sheet.
 * @param {string} phone
 * @returns {string|null} role or null
 */
function getUserRole(phone) {
  if (!phone) return null;
  phone = String(phone).replace(/[\s\+\-]/g, '');

  const sheet = getSheetByName(SHEET.USERS);
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const phoneCol = headers.indexOf('Phone');
  const roleCol  = headers.indexOf('Role');
  const statusCol = headers.indexOf('Status');

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][phoneCol]).replace(/[\s\+\-]/g, '') === phone &&
        String(data[i][statusCol]).toUpperCase() === 'ACTIVE') {
      return data[i][roleCol];
    }
  }
  return null;
}

// ─── Internal Helpers ────────────────────────────────────────

/**
 * Fetch the full user row from USERS sheet by phone.
 * @private
 */
function getUserByPhone_(phone) {
  const sheet = getSheetByName(SHEET.USERS);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const colIdx = {};
  headers.forEach(function(h, i) { colIdx[h] = i; });

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colIdx['Phone']]).replace(/[\s\+\-]/g, '') === phone &&
        String(data[i][colIdx['Status']]).toUpperCase() === 'ACTIVE') {
      return {
        userId:      data[i][colIdx['UserID']],
        name:        data[i][colIdx['Name']],
        phone:       data[i][colIdx['Phone']],
        email:       data[i][colIdx['Email']],
        role:        data[i][colIdx['Role']],
        admissionNo: data[i][colIdx['AdmissionNo']]
      };
    }
  }
  throw new Error('User not found for phone: ' + phone);
}

// ─── JWT Implementation (HMAC-SHA256) ────────────────────────

/**
 * Create a JWT with the given payload.
 * Token expires in 24 hours.
 * @private
 */
function createJWT_(payload) {
  const secret = getJWTSecret_();
  const now    = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const claims = {
    userId: payload.userId,
    name:   payload.name,
    phone:  payload.phone,
    email:  payload.email,
    role:   payload.role,
    admNo:  payload.admNo || '',
    iat:    now,
    exp:    now + 86400   // 24 hours
  };

  var headerB64  = base64UrlEncode_(JSON.stringify(header));
  var payloadB64 = base64UrlEncode_(JSON.stringify(claims));
  var sigInput   = headerB64 + '.' + payloadB64;

  var signatureBytes = Utilities.computeHmacSha256Signature(sigInput, secret);
  var signatureB64   = base64UrlEncodeBytes_(signatureBytes);

  return sigInput + '.' + signatureB64;
}

/**
 * Verify a JWT and return the decoded payload.
 * @private
 */
function verifyJWT_(token) {
  var parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');

  var secret     = getJWTSecret_();
  var sigInput   = parts[0] + '.' + parts[1];
  var sigBytes   = Utilities.computeHmacSha256Signature(sigInput, secret);
  var expectedSig = base64UrlEncodeBytes_(sigBytes);

  if (expectedSig !== parts[2]) {
    throw new Error('Invalid token signature');
  }

  var payload = JSON.parse(base64UrlDecode_(parts[1]));

  // Check expiry
  var now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

/**
 * Get or generate the JWT secret from PropertiesService.
 * @private
 */
function getJWTSecret_() {
  var props  = PropertiesService.getScriptProperties();
  var secret = props.getProperty('JWT_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + '-' + Utilities.getUuid();
    props.setProperty('JWT_SECRET', secret);
  }
  return secret;
}

// ─── Base64-URL helpers ──────────────────────────────────────

function base64UrlEncode_(str) {
  var encoded = Utilities.base64Encode(str, Utilities.Charset.UTF_8);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeBytes_(bytes) {
  var encoded = Utilities.base64Encode(bytes);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode_(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (str.length % 4 !== 0) str += '=';
  var decoded = Utilities.newBlob(Utilities.base64Decode(str)).getDataAsString();
  return decoded;
}
