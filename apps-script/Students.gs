/**
 * ============================================================
 *  VOO SCHOOL ERP — Students API (Students.gs)
 * ============================================================
 *  CRUD + dashboard for student data:
 *    • getStudents(filters)
 *    • getStudent(admNo)
 *    • getStudentFees(admNo, ay)
 *    • getStudentAttendance(admNo, month)
 *    • getMyChild(parentPhone)
 *    • getDashboardStats()
 *  Also initialises DAILY_ATTENDANCE & ANNOUNCEMENTS sheets.
 * ============================================================
 */

// ─── Sheet Initialisation ────────────────────────────────────

/**
 * Creates 📋 DAILY_ATTENDANCE if it doesn't exist.
 * Columns: Date | AdmissionNo | StudentName | Class | Section | Status | MarkedBy | Remarks
 */
function initDailyAttendanceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET.DAILY_ATTENDANCE);
  if (sheet) return sheet;

  sheet = ss.insertSheet(SHEET.DAILY_ATTENDANCE);
  const headers = [
    'Date', 'AdmissionNo', 'StudentName', 'Class',
    'Section', 'Status', 'MarkedBy', 'Remarks'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  Logger.log('📋 DAILY_ATTENDANCE sheet created.');
  return sheet;
}

/**
 * Creates 📢 ANNOUNCEMENTS if it doesn't exist.
 * Columns: AnnouncementID | Title | Message | TargetRole | TargetClass | CreatedBy | CreatedAt | Status
 */
function initAnnouncementsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET.ANNOUNCEMENTS);
  if (sheet) return sheet;

  sheet = ss.insertSheet(SHEET.ANNOUNCEMENTS);
  const headers = [
    'AnnouncementID', 'Title', 'Message', 'TargetRole',
    'TargetClass', 'CreatedBy', 'CreatedAt', 'Status'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  Logger.log('📢 ANNOUNCEMENTS sheet created.');
  return sheet;
}

// ─── getStudents ─────────────────────────────────────────────

/**
 * List students from ADMISSIONS sheet with optional filters.
 * @param {Object} filters — { classFilter, section, status, search }
 * @returns {Object} { students: [], total: N }
 */
function getStudents(filters) {
  const sheet = getSheetByName(SHEET.ADMISSIONS);
  const data  = sheet.getDataRange().getValues();
  if (data.length < 2) return { students: [], total: 0 };

  const headers = data[0];
  const colIdx  = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  // Locate key columns (flexible matching)
  const admCol    = findCol_(colIdx, ['Admission No', 'AdmissionNo', 'Adm No']);
  const nameCol   = findCol_(colIdx, ['Student Full Name', 'Student Name', 'Name']);
  const classCol  = findCol_(colIdx, ['Class']);
  const secCol    = findCol_(colIdx, ['Section']);
  const statusCol = findCol_(colIdx, ['Status']);
  const dobCol    = findCol_(colIdx, ['DOB', 'Date of Birth']);
  const genderCol = findCol_(colIdx, ['Gender']);
  const joinCol   = findCol_(colIdx, ['Join Date', 'JoinDate']);
  const fNameCol  = findCol_(colIdx, ['Father Name', 'FatherName']);
  const fMobCol   = findCol_(colIdx, ['Father Mobile', 'FatherMobile']);

  var students = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Skip empty rows
    if (!row[admCol] && !row[nameCol]) continue;

    // --- Apply filters ---
    if (filters.classFilter && String(row[classCol]).trim() !== filters.classFilter) continue;
    if (filters.section    && String(row[secCol]).trim() !== filters.section) continue;
    if (filters.status     && String(row[statusCol]).trim().toUpperCase() !== filters.status.toUpperCase()) continue;
    if (filters.search) {
      var term = filters.search.toLowerCase();
      var matchesSearch =
        String(row[admCol]).toLowerCase().indexOf(term) !== -1 ||
        String(row[nameCol]).toLowerCase().indexOf(term) !== -1 ||
        String(row[fMobCol]).toLowerCase().indexOf(term) !== -1;
      if (!matchesSearch) continue;
    }

    students.push({
      admNo:       row[admCol],
      name:        row[nameCol],
      dob:         parseDate(row[dobCol]),
      gender:      row[genderCol],
      class:       row[classCol],
      section:     row[secCol],
      joinDate:    parseDate(row[joinCol]),
      fatherName:  row[fNameCol],
      fatherPhone: row[fMobCol],
      status:      row[statusCol]
    });
  }

  return { students: students, total: students.length };
}

// ─── getStudent ──────────────────────────────────────────────

/**
 * Get full student profile by admission number.
 * @param {string} admNo
 * @returns {Object} student profile
 */
function getStudent(admNo) {
  if (!admNo) throw new Error('Admission number is required');

  const sheet = getSheetByName(SHEET.ADMISSIONS);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const colIdx = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  const admCol = findCol_(colIdx, ['Admission No', 'AdmissionNo', 'Adm No']);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][admCol]).trim() === String(admNo).trim()) {
      // Build a full profile from all columns
      var profile = {};
      headers.forEach(function(h, j) {
        var key = String(h).trim().replace(/[^a-zA-Z0-9]/g, '_');
        var val = data[i][j];
        // Format dates
        if (val instanceof Date) {
          val = parseDate(val);
        }
        profile[key] = val;
      });
      return profile;
    }
  }

  throw new Error('Student not found: ' + admNo);
}

// ─── getStudentFees ──────────────────────────────────────────

/**
 * Fee summary for a student from FEE LEDGER.
 * @param {string} admNo
 * @param {string} ay — academic year, e.g. "2025-26"
 * @returns {Object} { entries: [], totalDue, totalPaid, balance }
 */
function getStudentFees(admNo, ay) {
  if (!admNo) throw new Error('Admission number is required');

  const sheet = getSheetByName(SHEET.FEE_LEDGER);
  const data  = sheet.getDataRange().getValues();
  if (data.length < 2) return { entries: [], totalDue: 0, totalPaid: 0, balance: 0 };

  const headers = data[0];
  const colIdx = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  const admCol     = findCol_(colIdx, ['Admission No', 'AdmissionNo']);
  const ayCol      = findCol_(colIdx, ['Academic Year', 'AcademicYear']);
  const feeTypeCol = findCol_(colIdx, ['Fee Type', 'FeeType']);
  const dueCol     = findCol_(colIdx, ['Final Due', 'FinalDue']);
  const paidCol    = findCol_(colIdx, ['Amount Paid', 'AmountPaid']);
  const balCol     = findCol_(colIdx, ['Balance']);
  const dateCol    = findCol_(colIdx, ['Date']);
  const modeCol    = findCol_(colIdx, ['Payment Mode', 'PaymentMode']);
  const receiptCol = findCol_(colIdx, ['Receipt No', 'ReceiptNo']);

  var entries   = [];
  var totalDue  = 0;
  var totalPaid = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[admCol]).trim() !== String(admNo).trim()) continue;
    if (ay && String(row[ayCol]).trim() !== String(ay).trim()) continue;

    var due  = Number(row[dueCol])  || 0;
    var paid = Number(row[paidCol]) || 0;
    totalDue  += due;
    totalPaid += paid;

    entries.push({
      date:       parseDate(row[dateCol]),
      feeType:    row[feeTypeCol],
      due:        due,
      paid:       paid,
      balance:    Number(row[balCol]) || 0,
      receiptNo:  row[receiptCol],
      mode:       row[modeCol]
    });
  }

  return {
    entries:   entries,
    totalDue:  totalDue,
    totalPaid: totalPaid,
    balance:   totalDue - totalPaid
  };
}

// ─── getStudentAttendance ────────────────────────────────────

/**
 * Get attendance records for a student by month.
 * @param {string} admNo
 * @param {string} month — e.g. "2025-06" or "06-2025"
 * @returns {Object} { records: [], present, absent, total, percentage }
 */
function getStudentAttendance(admNo, month) {
  if (!admNo) throw new Error('Admission number is required');

  const sheet = getSheetByName(SHEET.DAILY_ATTENDANCE);
  if (!sheet) return { records: [], present: 0, absent: 0, total: 0, percentage: 0 };

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { records: [], present: 0, absent: 0, total: 0, percentage: 0 };

  const headers = data[0];
  const colIdx = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  var records  = [];
  var present  = 0;
  var absent   = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[colIdx['AdmissionNo']]).trim() !== String(admNo).trim()) continue;

    // Filter by month if specified
    if (month) {
      var dateStr = parseDate(row[colIdx['Date']]);
      // Accept YYYY-MM or MM-YYYY format matching
      if (dateStr.indexOf(month) === -1 && dateStr.substring(0,7) !== month) continue;
    }

    var status = String(row[colIdx['Status']]).trim().toUpperCase();
    if (status === 'PRESENT' || status === 'P') present++;
    if (status === 'ABSENT'  || status === 'A') absent++;

    records.push({
      date:    parseDate(row[colIdx['Date']]),
      status:  row[colIdx['Status']],
      remarks: row[colIdx['Remarks']] || ''
    });
  }

  var total = present + absent;
  return {
    records:    records,
    present:    present,
    absent:     absent,
    total:      total,
    percentage: total > 0 ? Math.round((present / total) * 10000) / 100 : 0
  };
}

// ─── getMyChild ──────────────────────────────────────────────

/**
 * Look up a child by the parent's phone number (Father Mobile column in ADMISSIONS).
 * @param {string} parentPhone
 * @returns {Object} student(s)
 */
function getMyChild(parentPhone) {
  if (!parentPhone) throw new Error('Parent phone is required');
  parentPhone = String(parentPhone).replace(/[\s\+\-]/g, '');

  const sheet = getSheetByName(SHEET.ADMISSIONS);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const colIdx = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  const admCol   = findCol_(colIdx, ['Admission No', 'AdmissionNo', 'Adm No']);
  const nameCol  = findCol_(colIdx, ['Student Full Name', 'Student Name', 'Name']);
  const classCol = findCol_(colIdx, ['Class']);
  const secCol   = findCol_(colIdx, ['Section']);
  const fMobCol  = findCol_(colIdx, ['Father Mobile', 'FatherMobile']);
  const statusCol = findCol_(colIdx, ['Status']);

  var children = [];

  for (var i = 1; i < data.length; i++) {
    var rowPhone = String(data[i][fMobCol]).replace(/[\s\+\-]/g, '');
    if (rowPhone === parentPhone) {
      children.push({
        admNo:   data[i][admCol],
        name:    data[i][nameCol],
        class:   data[i][classCol],
        section: data[i][secCol],
        status:  data[i][statusCol]
      });
    }
  }

  if (children.length === 0) {
    throw new Error('No children found for phone: ' + parentPhone);
  }

  return { children: children };
}

// ─── getDashboardStats ───────────────────────────────────────

/**
 * Aggregate dashboard statistics for admin/teacher.
 * @returns {Object} { totalStudents, activeStudents, feeCollected, feePending, classCounts }
 */
function getDashboardStats() {
  // --- Student stats from ADMISSIONS ---
  const admSheet = getSheetByName(SHEET.ADMISSIONS);
  const admData  = admSheet.getDataRange().getValues();
  const admHeaders = admData[0];
  const admIdx = {};
  admHeaders.forEach(function(h, i) { admIdx[String(h).trim()] = i; });

  const statusCol = findCol_(admIdx, ['Status']);
  const classCol  = findCol_(admIdx, ['Class']);

  var totalStudents  = 0;
  var activeStudents = 0;
  var classCounts    = {};

  for (var i = 1; i < admData.length; i++) {
    if (!admData[i][findCol_(admIdx, ['Admission No', 'AdmissionNo', 'Adm No'])]) continue;
    totalStudents++;
    var st = String(admData[i][statusCol]).trim().toUpperCase();
    if (st === 'ACTIVE' || st === 'ENROLLED' || st === '') {
      activeStudents++;
    }
    var cls = String(admData[i][classCol]).trim();
    if (cls) {
      classCounts[cls] = (classCounts[cls] || 0) + 1;
    }
  }

  // --- Fee stats from FEE LEDGER ---
  var feeCollected = 0;
  var feePending   = 0;

  try {
    const feeSheet = getSheetByName(SHEET.FEE_LEDGER);
    const feeData  = feeSheet.getDataRange().getValues();
    const feeHeaders = feeData[0];
    const feeIdx = {};
    feeHeaders.forEach(function(h, i) { feeIdx[String(h).trim()] = i; });

    const paidCol = findCol_(feeIdx, ['Amount Paid', 'AmountPaid']);
    const balCol  = findCol_(feeIdx, ['Balance']);

    for (var j = 1; j < feeData.length; j++) {
      feeCollected += Number(feeData[j][paidCol]) || 0;
      feePending   += Number(feeData[j][balCol])  || 0;
    }
  } catch (e) {
    // Fee ledger may not exist yet
    Logger.log('Fee stats skipped: ' + e.message);
  }

  return {
    totalStudents:  totalStudents,
    activeStudents: activeStudents,
    feeCollected:   feeCollected,
    feePending:     feePending,
    classCounts:    classCounts
  };
}

// ─── Column Finder (flexible header matching) ────────────────

/**
 * Find a column index from colIdx map using multiple possible names.
 * @private
 */
function findCol_(colIdx, possibleNames) {
  for (var n = 0; n < possibleNames.length; n++) {
    if (colIdx[possibleNames[n]] !== undefined) return colIdx[possibleNames[n]];
  }
  // Fallback: try case-insensitive
  var keys = Object.keys(colIdx);
  for (var n = 0; n < possibleNames.length; n++) {
    for (var k = 0; k < keys.length; k++) {
      if (keys[k].toLowerCase() === possibleNames[n].toLowerCase()) {
        return colIdx[keys[k]];
      }
    }
  }
  return 0; // default to first column
}
