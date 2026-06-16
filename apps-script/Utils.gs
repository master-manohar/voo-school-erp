/**
 * ============================================================
 *  VOO SCHOOL ERP — Shared Utilities (Utils.gs)
 * ============================================================
 *  Common helpers used across all modules:
 *    • getSheetByName(name)
 *    • findRowByValue(sheet, col, value)
 *    • parseDate(value)
 *    • formatCurrency(amount)
 *    • generateId()
 *    • hashPassword(password) — SHA-256
 *    • logAudit(action, user, details)
 * ============================================================
 */

// ─── Sheet Access ────────────────────────────────────────────

/**
 * Get a sheet by its exact name. Throws if not found.
 * @param {string} name — sheet name (including emoji prefix)
 * @returns {Sheet}
 */
function getSheetByName(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet "' + name + '" not found. Please check sheet names in the spreadsheet.');
  }
  return sheet;
}

// ─── Row Finder ──────────────────────────────────────────────

/**
 * Find the first row number (1-indexed) where a column matches a value.
 * Returns -1 if not found.
 *
 * @param {Sheet}  sheet — the sheet to search
 * @param {number} col   — column number (1-indexed)
 * @param {*}      value — the value to match
 * @returns {number} row number or -1
 */
function findRowByValue(sheet, col, value) {
  var data = sheet.getRange(1, col, sheet.getLastRow(), 1).getValues();
  var target = String(value).trim();

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === target) {
      return i + 1; // 1-indexed
    }
  }
  return -1;
}

// ─── Date Helpers ────────────────────────────────────────────

/**
 * Safely parse / format a date value from a sheet cell.
 * Returns a string in YYYY-MM-DD format or the original value.
 * @param {*} value
 * @returns {string}
 */
function parseDate(value) {
  if (!value) return '';

  if (value instanceof Date) {
    var y = value.getFullYear();
    var m = ('0' + (value.getMonth() + 1)).slice(-2);
    var d = ('0' + value.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }

  // Try parsing string
  var str = String(value).trim();
  if (!str) return '';

  try {
    var parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      var y = parsed.getFullYear();
      var m = ('0' + (parsed.getMonth() + 1)).slice(-2);
      var d = ('0' + parsed.getDate()).slice(-2);
      return y + '-' + m + '-' + d;
    }
  } catch (e) {}

  return str; // return as-is if unparseable
}

// ─── Currency Formatting ─────────────────────────────────────

/**
 * Format a number as Indian-style currency string (without ₹ symbol).
 * e.g. 1234567.89 → "12,34,567.89"
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00';
  var num = Number(amount);
  if (isNaN(num)) return '0.00';

  var parts     = num.toFixed(2).split('.');
  var intPart   = parts[0];
  var decPart   = parts[1];
  var isNeg     = intPart.charAt(0) === '-';
  if (isNeg) intPart = intPart.substring(1);

  // Indian grouping: last 3, then groups of 2
  var lastThree = intPart.slice(-3);
  var rest      = intPart.slice(0, -3);
  if (rest) {
    lastThree = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return (isNeg ? '-' : '') + lastThree + '.' + decPart;
}

// ─── ID Generator ────────────────────────────────────────────

/**
 * Generate a short unique ID (timestamp + random).
 * e.g. "1718441234-A3F2"
 * @returns {string}
 */
function generateId() {
  var ts   = Math.floor(Date.now() / 1000);
  var rand = Math.floor(Math.random() * 65536).toString(16).toUpperCase();
  while (rand.length < 4) rand = '0' + rand;
  return ts + '-' + rand;
}

// ─── Password Hashing ───────────────────────────────────────

/**
 * Hash a password using SHA-256.
 * @param {string} password — plain text
 * @returns {string} hex-encoded hash
 */
function hashPassword(password) {
  if (!password) return '';

  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);

  // Convert byte array to hex string
  var hex = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var hx = byte.toString(16);
    if (hx.length === 1) hx = '0' + hx;
    hex += hx;
  }
  return hex;
}

// ─── Audit Logging ───────────────────────────────────────────

/**
 * Write an entry to the 📋 AUDIT LOG sheet.
 * Columns: Timestamp | Action | User | Details
 *
 * @param {string} action  — e.g. "LOGIN_OTP", "PAYMENT_RECORDED"
 * @param {string} user    — who performed the action
 * @param {string} details — human-readable description
 */
function logAudit(action, user, details) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.AUDIT_LOG);
    if (!sheet) {
      // Create audit log sheet if missing
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET.AUDIT_LOG);
      sheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Action', 'User', 'Details']]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      action  || '',
      user    || 'system',
      details || ''
    ]);
  } catch (e) {
    // Never let audit logging break the main flow
    Logger.log('Audit log error: ' + e.message);
  }
}

// ─── Generic Sheet-to-JSON ───────────────────────────────────

/**
 * Convert a sheet to an array of objects (header row becomes keys).
 * Useful for quick data reads.
 * @param {string} sheetName
 * @returns {Object[]}
 */
function sheetToJson(sheetName) {
  var sheet = getSheetByName(sheetName);
  var data  = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(function(h) { return String(h).trim(); });
  var result  = [];

  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) {
        obj[headers[j]] = data[i][j];
      }
    }
    result.push(obj);
  }

  return result;
}

// ─── Validation Helpers ──────────────────────────────────────

/**
 * Validate that an email looks roughly correct.
 */
function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate that a phone number has 10-15 digits.
 */
function isValidPhone(phone) {
  if (!phone) return false;
  var digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Sanitise a string for safe sheet storage (trim, remove line breaks).
 */
function sanitise(str) {
  if (!str) return '';
  return String(str).trim().replace(/[\r\n]+/g, ' ');
}
