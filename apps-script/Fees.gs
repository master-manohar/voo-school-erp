/**
 * ============================================================
 *  VOO SCHOOL ERP — Fee Management (Fees.gs)
 * ============================================================
 *  Handles:
 *    • getFeeLedger(admNo, ay)
 *    • getFeeSummary(ay)           — dashboard aggregates
 *    • recordPayment(...)          — write to FEE LEDGER
 *    • generateFeeSchedule(admNo, ay) — from FEE MASTER
 *    • getFeeMaster(ay)
 *    • sendFeeReminder(admNo)      — WA reminder via Settings
 * ============================================================
 */

// ─── getFeeLedger ────────────────────────────────────────────

/**
 * Return all fee entries for a student, optionally filtered by AY.
 * @param {string} admNo
 * @param {string} ay — e.g. "2025-26"
 * @returns {Object} { entries, totalDue, totalPaid, balance }
 */
function getFeeLedger(admNo, ay) {
  // Reuses getStudentFees from Students.gs
  return getStudentFees(admNo, ay);
}

// ─── getFeeSummary ───────────────────────────────────────────

/**
 * Dashboard-level fee summary for an academic year.
 * Aggregates: totalDue, totalCollected, totalPending, breakdown by class.
 * @param {string} ay — e.g. "2025-26"
 * @returns {Object}
 */
function getFeeSummary(ay) {
  const sheet = getSheetByName(SHEET.FEE_LEDGER);
  const data  = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { totalDue: 0, totalCollected: 0, totalPending: 0, byClass: {}, byFeeType: {} };
  }

  const headers = data[0];
  const colIdx  = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  const ayCol      = findCol_(colIdx, ['Academic Year', 'AcademicYear']);
  const classCol   = findCol_(colIdx, ['Class']);
  const feeTypeCol = findCol_(colIdx, ['Fee Type', 'FeeType']);
  const dueCol     = findCol_(colIdx, ['Final Due', 'FinalDue']);
  const paidCol    = findCol_(colIdx, ['Amount Paid', 'AmountPaid']);
  const balCol     = findCol_(colIdx, ['Balance']);

  var totalDue       = 0;
  var totalCollected = 0;
  var totalPending   = 0;
  var byClass        = {};
  var byFeeType      = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Filter by AY if provided
    if (ay && String(row[ayCol]).trim() !== String(ay).trim()) continue;

    var due  = Number(row[dueCol])  || 0;
    var paid = Number(row[paidCol]) || 0;
    var bal  = Number(row[balCol])  || 0;

    totalDue       += due;
    totalCollected += paid;
    totalPending   += bal;

    // By class
    var cls = String(row[classCol]).trim();
    if (cls) {
      if (!byClass[cls]) byClass[cls] = { due: 0, paid: 0, pending: 0 };
      byClass[cls].due     += due;
      byClass[cls].paid    += paid;
      byClass[cls].pending += bal;
    }

    // By fee type
    var ft = String(row[feeTypeCol]).trim();
    if (ft) {
      if (!byFeeType[ft]) byFeeType[ft] = { due: 0, paid: 0, pending: 0 };
      byFeeType[ft].due     += due;
      byFeeType[ft].paid    += paid;
      byFeeType[ft].pending += bal;
    }
  }

  return {
    academicYear:   ay || 'ALL',
    totalDue:       totalDue,
    totalCollected: totalCollected,
    totalPending:   totalPending,
    byClass:        byClass,
    byFeeType:      byFeeType
  };
}

// ─── recordPayment ───────────────────────────────────────────

/**
 * Record a fee payment in the FEE LEDGER sheet.
 * Updates existing row if a matching (admNo + ay + feeType) entry exists,
 * otherwise appends a new row.
 *
 * @param {string} admNo
 * @param {string} ay       — academic year
 * @param {string} feeType  — e.g. "Tuition Fee", "Transport Fee"
 * @param {number} amount   — amount being paid now
 * @param {string} mode     — "Cash", "Online", "UPI", "Cheque"
 * @param {string} paidBy   — user who recorded the payment
 * @returns {Object} { receiptNo, message }
 */
function recordPayment(admNo, ay, feeType, amount, mode, paidBy) {
  if (!admNo || !ay || !feeType || !amount) {
    throw new Error('admNo, ay, feeType, and amount are all required');
  }

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const sheet   = getSheetByName(SHEET.FEE_LEDGER);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIdx  = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  const admCol     = findCol_(colIdx, ['Admission No', 'AdmissionNo']);
  const ayCol      = findCol_(colIdx, ['Academic Year', 'AcademicYear']);
  const ftCol      = findCol_(colIdx, ['Fee Type', 'FeeType']);
  const dueCol     = findCol_(colIdx, ['Final Due', 'FinalDue']);
  const paidCol    = findCol_(colIdx, ['Amount Paid', 'AmountPaid']);
  const balCol     = findCol_(colIdx, ['Balance']);
  const dateCol    = findCol_(colIdx, ['Date']);
  const modeCol    = findCol_(colIdx, ['Payment Mode', 'PaymentMode']);
  const receiptCol = findCol_(colIdx, ['Receipt No', 'ReceiptNo']);

  // Generate receipt number
  var receiptNo = 'RCP-' + generateId();

  // Look for existing entry
  var matchedRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][admCol]).trim() === String(admNo).trim() &&
        String(data[i][ayCol]).trim()  === String(ay).trim() &&
        String(data[i][ftCol]).trim()  === String(feeType).trim()) {
      matchedRow = i + 1; // 1-indexed for sheet
      break;
    }
  }

  if (matchedRow > 0) {
    // Update existing row — add to paid, recalculate balance
    var existingPaid = Number(sheet.getRange(matchedRow, paidCol + 1).getValue()) || 0;
    var existingDue  = Number(sheet.getRange(matchedRow, dueCol + 1).getValue())  || 0;
    var newPaid      = existingPaid + amount;
    var newBalance   = existingDue - newPaid;

    sheet.getRange(matchedRow, paidCol + 1).setValue(newPaid);
    sheet.getRange(matchedRow, balCol + 1).setValue(Math.max(newBalance, 0));
    sheet.getRange(matchedRow, dateCol + 1).setValue(new Date());
    sheet.getRange(matchedRow, modeCol + 1).setValue(mode);
    sheet.getRange(matchedRow, receiptCol + 1).setValue(receiptNo);
  } else {
    // Append new row — get student name from ADMISSIONS
    var studentName = '';
    var studentClass = '';
    try {
      var student = getStudent(admNo);
      studentName  = student['Student_Full_Name'] || student['Student_Name'] || student['Name'] || '';
      studentClass = student['Class'] || '';
    } catch (e) {}

    var newRow = [];
    // Build row matching header order
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).trim();
      switch (h) {
        case '#':              newRow.push(''); break;
        case 'Date':           newRow.push(new Date()); break;
        case 'Admission No':
        case 'AdmissionNo':    newRow.push(admNo); break;
        case 'Student Name':
        case 'StudentName':    newRow.push(studentName); break;
        case 'Academic Year':
        case 'AcademicYear':   newRow.push(ay); break;
        case 'Class':          newRow.push(studentClass); break;
        case 'Fee Type':
        case 'FeeType':        newRow.push(feeType); break;
        case 'Standard Amount':newRow.push(amount); break;
        case 'Applicable':     newRow.push(amount); break;
        case 'Discount':       newRow.push(0); break;
        case 'Final Due':
        case 'FinalDue':       newRow.push(amount); break;
        case 'Amount Paid':
        case 'AmountPaid':     newRow.push(amount); break;
        case 'Balance':        newRow.push(0); break;
        case 'Receipt No':
        case 'ReceiptNo':      newRow.push(receiptNo); break;
        case 'Payment Mode':
        case 'PaymentMode':    newRow.push(mode); break;
        case 'Send Receipt':   newRow.push(''); break;
        case 'WA Status':      newRow.push(''); break;
        case 'Email Status':   newRow.push(''); break;
        default:               newRow.push(''); break;
      }
    }
    sheet.appendRow(newRow);
  }

  logAudit('PAYMENT_RECORDED', paidBy || 'system',
    'Payment ₹' + amount + ' for ' + admNo + ' (' + feeType + ') — Receipt: ' + receiptNo);

  return {
    receiptNo: receiptNo,
    message:   'Payment of ₹' + formatCurrency(amount) + ' recorded successfully'
  };
}

// ─── generateFeeSchedule ────────────────────────────────────

/**
 * Create fee entries in FEE LEDGER from FEE MASTER for a student.
 * @param {string} admNo
 * @param {string} ay — e.g. "2025-26"
 * @returns {Object} { entriesCreated, message }
 */
function generateFeeSchedule(admNo, ay) {
  if (!admNo || !ay) throw new Error('admNo and ay are required');

  // Get student's class
  var student = getStudent(admNo);
  var studentClass = student['Class'] || '';
  var studentName  = student['Student_Full_Name'] || student['Student_Name'] || student['Name'] || '';

  if (!studentClass) throw new Error('Student class not found');

  // Read fee master
  var feeMaster = getFeeMaster(ay);
  if (!feeMaster.entries || feeMaster.entries.length === 0) {
    throw new Error('No fee master entries found for AY ' + ay);
  }

  // Filter entries for student's class
  var applicable = feeMaster.entries.filter(function(entry) {
    return String(entry.class).trim() === String(studentClass).trim();
  });

  if (applicable.length === 0) {
    throw new Error('No fee structure found for class ' + studentClass + ' in AY ' + ay);
  }

  // Check existing entries to avoid duplicates
  var existing = getStudentFees(admNo, ay);
  var existingTypes = {};
  existing.entries.forEach(function(e) {
    existingTypes[e.feeType] = true;
  });

  // Write to FEE LEDGER
  var ledgerSheet = getSheetByName(SHEET.FEE_LEDGER);
  var headers     = ledgerSheet.getRange(1, 1, 1, ledgerSheet.getLastColumn()).getValues()[0];
  var created     = 0;

  applicable.forEach(function(fee) {
    if (existingTypes[fee.feeType]) return; // Skip duplicates

    var newRow = [];
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).trim();
      switch (h) {
        case '#':               newRow.push(''); break;
        case 'Date':            newRow.push(new Date()); break;
        case 'Admission No':
        case 'AdmissionNo':     newRow.push(admNo); break;
        case 'Student Name':
        case 'StudentName':     newRow.push(studentName); break;
        case 'Academic Year':
        case 'AcademicYear':    newRow.push(ay); break;
        case 'Class':           newRow.push(studentClass); break;
        case 'Fee Type':
        case 'FeeType':         newRow.push(fee.feeType); break;
        case 'Standard Amount': newRow.push(fee.amount); break;
        case 'Applicable':      newRow.push(fee.amount); break;
        case 'Discount':        newRow.push(fee.discount || 0); break;
        case 'Final Due':
        case 'FinalDue':        newRow.push(fee.amount - (fee.discount || 0)); break;
        case 'Amount Paid':
        case 'AmountPaid':      newRow.push(0); break;
        case 'Balance':         newRow.push(fee.amount - (fee.discount || 0)); break;
        case 'Receipt No':
        case 'ReceiptNo':       newRow.push(''); break;
        case 'Payment Mode':
        case 'PaymentMode':     newRow.push(''); break;
        case 'Send Receipt':    newRow.push(''); break;
        case 'WA Status':       newRow.push(''); break;
        case 'Email Status':    newRow.push(''); break;
        default:                newRow.push(''); break;
      }
    }
    ledgerSheet.appendRow(newRow);
    created++;
  });

  logAudit('FEE_SCHEDULE_GENERATED', 'system',
    created + ' fee entries created for ' + admNo + ' in AY ' + ay);

  return {
    entriesCreated: created,
    message: created + ' fee entries generated for ' + studentName + ' (' + studentClass + ')'
  };
}

// ─── getFeeMaster ────────────────────────────────────────────

/**
 * Read fee structure from FEE MASTER sheet.
 * @param {string} ay — optional academic year filter
 * @returns {Object} { entries: [] }
 */
function getFeeMaster(ay) {
  const sheet = getSheetByName(SHEET.FEE_MASTER);
  const data  = sheet.getDataRange().getValues();
  if (data.length < 2) return { entries: [] };

  const headers = data[0];
  const colIdx  = {};
  headers.forEach(function(h, i) { colIdx[String(h).trim()] = i; });

  // Try to find standard columns
  const ayCol      = findCol_(colIdx, ['Academic Year', 'AcademicYear', 'AY']);
  const classCol   = findCol_(colIdx, ['Class']);
  const feeTypeCol = findCol_(colIdx, ['Fee Type', 'FeeType']);
  const amountCol  = findCol_(colIdx, ['Amount', 'Standard Amount', 'Fee Amount']);
  const discCol    = findCol_(colIdx, ['Discount', 'Default Discount']);

  var entries = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (ay && String(row[ayCol]).trim() !== String(ay).trim()) continue;

    // Skip empty rows
    if (!row[classCol] && !row[feeTypeCol]) continue;

    entries.push({
      academicYear: row[ayCol],
      class:        row[classCol],
      feeType:      row[feeTypeCol],
      amount:       Number(row[amountCol]) || 0,
      discount:     Number(row[discCol])   || 0
    });
  }

  return { entries: entries };
}

// ─── sendFeeReminder ─────────────────────────────────────────

/**
 * Send a WhatsApp fee reminder to a student's parent.
 * Reads WA config from SETTINGS (configurable, not hardcoded).
 * @param {string} admNo
 * @returns {Object} { message, phone }
 */
function sendFeeReminder(admNo) {
  if (!admNo) throw new Error('Admission number is required');

  // Get student + parent phone
  var student = getStudent(admNo);
  var parentPhone = student['Father_Mobile'] || student['FatherMobile'] || '';
  var studentName = student['Student_Full_Name'] || student['Student_Name'] || student['Name'] || '';

  if (!parentPhone) {
    throw new Error('No parent phone number found for ' + admNo);
  }

  // Get pending fees
  var fees = getStudentFees(admNo, '');
  var pending = fees.balance;

  if (pending <= 0) {
    return { message: 'No pending fees for ' + studentName, phone: parentPhone };
  }

  // Send reminder via WhatsApp (uses configurable API from SETTINGS)
  var result = sendWhatsAppMessage(
    String(parentPhone).replace(/[\s\+\-]/g, ''),
    'fee_reminder',
    {
      student_name: studentName,
      amount:       formatCurrency(pending),
      admNo:        admNo
    }
  );

  logAudit('FEE_REMINDER_SENT', 'system',
    'Fee reminder sent to ' + parentPhone + ' for ' + studentName + ' — ₹' + formatCurrency(pending));

  return {
    message: 'Fee reminder sent to ' + parentPhone,
    phone:   parentPhone,
    pending: pending,
    waResult: result
  };
}
