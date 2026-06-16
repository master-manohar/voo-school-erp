/**
 * ============================================================
 *  VOO SCHOOL ERP — Settings & WhatsApp API (Settings.gs)
 * ============================================================
 *  CRITICAL: The WhatsApp API provider, key, URL, and phone
 *  number are ALL read from the ⚙️ SETTINGS sheet at runtime.
 *  Admins can change them at any time without touching code.
 *
 *  Supported WhatsApp providers:
 *    1. GETA    — Geta AI (POST with x-api-key header)
 *    2. META    — WhatsApp Business Cloud API (Bearer token)
 *    3. TWILIO  — Twilio WhatsApp (Basic auth)
 *    4. CUSTOM  — Fully configurable URL + headers
 *
 *  Functions:
 *    • getSettings()
 *    • getWhatsAppConfig()
 *    • updateWhatsAppConfig(provider, apiKey, apiUrl, phoneNumber)
 *    • testWhatsAppConnection()
 *    • updateSchoolInfo(name, address, phone, email, logo)
 *    • sendWhatsAppMessage(phone, templateName, params) ← CORE
 * ============================================================
 */

// ─── SETTINGS Sheet Key Names ────────────────────────────────
// The SETTINGS sheet is a key-value store: Column A = Key, Column B = Value.
const SETTING_KEYS = {
  // School info
  SCHOOL_NAME:     'SCHOOL_NAME',
  SCHOOL_ADDRESS:  'SCHOOL_ADDRESS',
  SCHOOL_PHONE:    'SCHOOL_PHONE',
  SCHOOL_EMAIL:    'SCHOOL_EMAIL',
  SCHOOL_LOGO:     'SCHOOL_LOGO',

  // WhatsApp config — ALL changeable from UI
  WA_PROVIDER:     'WA_PROVIDER',       // GETA | META | TWILIO | CUSTOM
  WA_API_KEY:      'WA_API_KEY',        // API key / token
  WA_API_URL:      'WA_API_URL',        // Base URL
  WA_PHONE_NUMBER: 'WA_PHONE_NUMBER',   // Sender phone / Phone Number ID
  WA_API_VERSION:  'WA_API_VERSION',    // e.g. "v17.0" for Meta
  WA_ACCOUNT_SID:  'WA_ACCOUNT_SID',    // For Twilio
  WA_CUSTOM_HEADERS: 'WA_CUSTOM_HEADERS' // JSON string for custom provider
};

// ─── getSettings ─────────────────────────────────────────────

/**
 * Read ALL settings from the ⚙️ SETTINGS sheet as a key-value map.
 * @returns {Object} all settings
 */
function getSettings() {
  const sheet = getSheetByName(SHEET.SETTINGS);
  const data  = sheet.getDataRange().getValues();
  var settings = {};

  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var val = data[i][1];
    if (key) {
      settings[key] = val;
    }
  }

  return settings;
}

// ─── getWhatsAppConfig ───────────────────────────────────────

/**
 * Read WhatsApp-specific config from SETTINGS sheet.
 * This is called at runtime every time a WA message is sent —
 * so admin changes take effect immediately.
 *
 * @returns {Object} { provider, apiKey, apiUrl, phoneNumber, apiVersion, accountSid, customHeaders }
 */
function getWhatsAppConfig() {
  var all = getSettings();
  return {
    provider:      all[SETTING_KEYS.WA_PROVIDER]       || 'GETA',
    apiKey:        all[SETTING_KEYS.WA_API_KEY]         || '',
    apiUrl:        all[SETTING_KEYS.WA_API_URL]         || '',
    phoneNumber:   all[SETTING_KEYS.WA_PHONE_NUMBER]    || '',
    apiVersion:    all[SETTING_KEYS.WA_API_VERSION]     || 'v17.0',
    accountSid:    all[SETTING_KEYS.WA_ACCOUNT_SID]     || '',
    customHeaders: all[SETTING_KEYS.WA_CUSTOM_HEADERS]  || '{}'
  };
}

// ─── updateWhatsAppConfig ────────────────────────────────────

/**
 * Save new WhatsApp API configuration to the SETTINGS sheet.
 * Admin can switch providers or rotate API keys at any time.
 *
 * @param {string} provider   — GETA | META | TWILIO | CUSTOM
 * @param {string} apiKey     — API key or Bearer token
 * @param {string} apiUrl     — Base API URL
 * @param {string} phoneNumber — Sender number or Meta Phone Number ID
 * @returns {Object} { message }
 */
function updateWhatsAppConfig(provider, apiKey, apiUrl, phoneNumber) {
  if (!provider) throw new Error('Provider is required');

  setSetting_(SETTING_KEYS.WA_PROVIDER,     provider.toUpperCase());
  setSetting_(SETTING_KEYS.WA_API_KEY,      apiKey     || '');
  setSetting_(SETTING_KEYS.WA_API_URL,      apiUrl     || '');
  setSetting_(SETTING_KEYS.WA_PHONE_NUMBER, phoneNumber || '');

  logAudit('WA_CONFIG_UPDATED', 'admin',
    'WhatsApp provider changed to ' + provider.toUpperCase());

  return { message: 'WhatsApp configuration updated to ' + provider.toUpperCase() };
}

// ─── testWhatsAppConnection ──────────────────────────────────

/**
 * Send a test message using the current WA config from SETTINGS.
 * @returns {Object} { success, response }
 */
function testWhatsAppConnection() {
  var config = getWhatsAppConfig();

  if (!config.apiKey) {
    throw new Error('WhatsApp API key is not configured. Go to Settings → WhatsApp to set it up.');
  }

  // Send a test message to the configured sender number itself
  var testPhone = config.phoneNumber || '';
  if (!testPhone) {
    throw new Error('WhatsApp sender phone number is not configured.');
  }

  try {
    var result = sendWhatsAppMessage(testPhone, 'test', { message: 'VOO ERP test message' });
    return { success: true, response: result, provider: config.provider };
  } catch (err) {
    return { success: false, error: err.message, provider: config.provider };
  }
}

// ─── updateSchoolInfo ────────────────────────────────────────

/**
 * Save school information to the SETTINGS sheet.
 * @param {string} name
 * @param {string} address
 * @param {string} phone
 * @param {string} email
 * @param {string} logo — URL to logo image
 * @returns {Object} { message }
 */
function updateSchoolInfo(name, address, phone, email, logo) {
  if (name)    setSetting_(SETTING_KEYS.SCHOOL_NAME,    name);
  if (address) setSetting_(SETTING_KEYS.SCHOOL_ADDRESS, address);
  if (phone)   setSetting_(SETTING_KEYS.SCHOOL_PHONE,   phone);
  if (email)   setSetting_(SETTING_KEYS.SCHOOL_EMAIL,   email);
  if (logo)    setSetting_(SETTING_KEYS.SCHOOL_LOGO,    logo);

  logAudit('SCHOOL_INFO_UPDATED', 'admin', 'School info updated');

  return { message: 'School information updated successfully' };
}

// ─── sendWhatsAppMessage — THE CORE ABSTRACTION ──────────────

/**
 * Send a WhatsApp message using the CURRENT config from SETTINGS sheet.
 *
 * ⚠️  READS CONFIG FROM SETTINGS EVERY TIME — not from constants.
 *     This ensures admin changes take effect immediately.
 *
 * @param {string} phone        — recipient phone (e.g. "919876543210")
 * @param {string} templateName — template name (from WA REGISTRY)
 * @param {Object} params       — template parameters
 * @returns {Object} API response
 */
function sendWhatsAppMessage(phone, templateName, params) {
  // ┌─────────────────────────────────────────────────────────┐
  // │  READ CONFIG FROM SETTINGS SHEET — NOT FROM CONSTANTS   │
  // │  This is intentional. Admin can change provider/key     │
  // │  from the UI and it takes effect on the very next call. │
  // └─────────────────────────────────────────────────────────┘
  var config = getWhatsAppConfig();

  if (!config.apiKey) {
    throw new Error('WhatsApp API key not configured. Please set it in Settings.');
  }
  if (!config.apiUrl) {
    throw new Error('WhatsApp API URL not configured. Please set it in Settings.');
  }

  // Normalise phone
  phone = String(phone).replace(/[\s\+\-]/g, '');

  // Route to provider-specific sender
  var provider = config.provider.toUpperCase();

  switch (provider) {
    case 'GETA':
      return sendViaGeta_(config, phone, templateName, params);

    case 'META':
      return sendViaMeta_(config, phone, templateName, params);

    case 'TWILIO':
      return sendViaTwilio_(config, phone, templateName, params);

    case 'CUSTOM':
      return sendViaCustom_(config, phone, templateName, params);

    default:
      throw new Error('Unknown WhatsApp provider: ' + provider +
        '. Supported: GETA, META, TWILIO, CUSTOM');
  }
}

// ─── Provider: Geta AI ───────────────────────────────────────

/**
 * Send WhatsApp message via Geta AI.
 * POST with x-api-key header.
 * @private
 */
function sendViaGeta_(config, phone, templateName, params) {
  var url = config.apiUrl;
  // Ensure trailing endpoint
  if (url.indexOf('/message') === -1) {
    url = url.replace(/\/+$/, '') + '/message/send-template';
  }

  var payload = {
    phone:    phone,
    template: templateName,
    params:   params || {}
  };

  var options = {
    method:      'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': config.apiKey
    },
    payload:             JSON.stringify(payload),
    muteHttpExceptions:  true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code     = response.getResponseCode();
  var body     = response.getContentText();

  Logger.log('[GETA] ' + code + ' → ' + body);

  if (code >= 400) {
    throw new Error('Geta API error (' + code + '): ' + body);
  }

  return { status: code, body: JSON.parse(body) };
}

// ─── Provider: Meta WhatsApp Business Cloud API ──────────────

/**
 * Send WhatsApp message via Meta (WhatsApp Business Cloud API).
 * POST to https://graph.facebook.com/{version}/{phoneNumberId}/messages
 * @private
 */
function sendViaMeta_(config, phone, templateName, params) {
  var version     = config.apiVersion || 'v17.0';
  var phoneNumId  = config.phoneNumber;

  var url = 'https://graph.facebook.com/' + version + '/' + phoneNumId + '/messages';

  // Override if apiUrl is explicitly set
  if (config.apiUrl && config.apiUrl.indexOf('graph.facebook.com') !== -1) {
    url = config.apiUrl;
  }

  // Build template components from params
  var components = [];
  if (params) {
    var bodyParams = [];
    var keys = Object.keys(params);
    for (var k = 0; k < keys.length; k++) {
      bodyParams.push({
        type: 'text',
        text: String(params[keys[k]])
      });
    }
    if (bodyParams.length > 0) {
      components.push({
        type:       'body',
        parameters: bodyParams
      });
    }
  }

  var payload = {
    messaging_product: 'whatsapp',
    to:                phone,
    type:              'template',
    template: {
      name:       templateName,
      language:   { code: 'en' },
      components: components
    }
  };

  var options = {
    method:      'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + config.apiKey
    },
    payload:             JSON.stringify(payload),
    muteHttpExceptions:  true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code     = response.getResponseCode();
  var body     = response.getContentText();

  Logger.log('[META] ' + code + ' → ' + body);

  if (code >= 400) {
    throw new Error('Meta WA API error (' + code + '): ' + body);
  }

  return { status: code, body: JSON.parse(body) };
}

// ─── Provider: Twilio ────────────────────────────────────────

/**
 * Send WhatsApp message via Twilio.
 * @private
 */
function sendViaTwilio_(config, phone, templateName, params) {
  var accountSid = config.accountSid;
  var authToken  = config.apiKey;
  var fromPhone  = config.phoneNumber;

  if (!accountSid) throw new Error('Twilio Account SID not configured');

  var url = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';

  // Override if apiUrl is explicitly set
  if (config.apiUrl && config.apiUrl.indexOf('twilio.com') !== -1) {
    url = config.apiUrl;
  }

  // Build message body from params
  var bodyText = 'Template: ' + templateName;
  if (params) {
    var keys = Object.keys(params);
    for (var k = 0; k < keys.length; k++) {
      bodyText += '\n' + keys[k] + ': ' + params[keys[k]];
    }
  }

  var payload = {
    To:   'whatsapp:+' + phone,
    From: 'whatsapp:+' + fromPhone,
    Body: bodyText
  };

  var options = {
    method:  'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(accountSid + ':' + authToken)
    },
    payload:             payload,
    muteHttpExceptions:  true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code     = response.getResponseCode();
  var body     = response.getContentText();

  Logger.log('[TWILIO] ' + code + ' → ' + body);

  if (code >= 400) {
    throw new Error('Twilio API error (' + code + '): ' + body);
  }

  return { status: code, body: JSON.parse(body) };
}

// ─── Provider: Custom ────────────────────────────────────────

/**
 * Send WhatsApp message via a custom/generic provider.
 * URL, headers, and payload structure are all configurable.
 * @private
 */
function sendViaCustom_(config, phone, templateName, params) {
  var url = config.apiUrl;
  if (!url) throw new Error('Custom WA API URL not configured');

  // Parse custom headers from SETTINGS (stored as JSON string)
  var customHeaders = {};
  try {
    customHeaders = JSON.parse(config.customHeaders || '{}');
  } catch (e) {
    Logger.log('Failed to parse custom headers: ' + e.message);
  }

  // Always include API key in Authorization header if custom headers don't override it
  if (!customHeaders['Authorization'] && !customHeaders['authorization'] && config.apiKey) {
    customHeaders['Authorization'] = 'Bearer ' + config.apiKey;
  }

  var payload = {
    phone:    phone,
    template: templateName,
    params:   params || {}
  };

  var options = {
    method:      'post',
    contentType: 'application/json',
    headers:     customHeaders,
    payload:             JSON.stringify(payload),
    muteHttpExceptions:  true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code     = response.getResponseCode();
  var body     = response.getContentText();

  Logger.log('[CUSTOM] ' + code + ' → ' + body);

  if (code >= 400) {
    throw new Error('Custom WA API error (' + code + '): ' + body);
  }

  try {
    return { status: code, body: JSON.parse(body) };
  } catch (e) {
    return { status: code, body: body };
  }
}

// ─── Internal: Set a single setting ─────────────────────────

/**
 * Write a key-value pair to the SETTINGS sheet.
 * If the key already exists, update its value; otherwise append.
 * @private
 */
function setSetting_(key, value) {
  var sheet = getSheetByName(SHEET.SETTINGS);
  var data  = sheet.getDataRange().getValues();

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  // Key not found — append
  sheet.appendRow([key, value]);
}
