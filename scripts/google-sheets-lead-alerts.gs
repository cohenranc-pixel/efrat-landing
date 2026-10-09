/**
 * Bound Google Apps Script: email alerts for the existing lead sheet.
 * Set the script property NOTIFICATION_EMAIL before running installLeadAlerts.
 */
const LEAD_TAB = 'Rev1.1';
const ALERT_HEADER = 'EmailNotificationStatus';

function installLeadAlerts() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const properties = PropertiesService.getScriptProperties();
    getLeadAlertRecipients(properties);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(LEAD_TAB);
    if (!sheet) throw new Error('Lead sheet not found');
    const headers = sheet.getRange(1, 1, 1, 10).getDisplayValues()[0];
    const expected = ['ReceivedAtDate','ReceivedAtTime','parentName','phone','grade','subject','message','source','ip','ua'];
    if (JSON.stringify(headers) !== JSON.stringify(expected)) throw new Error('Unexpected lead columns');
    const statusHeader = sheet.getRange(1, 11).getDisplayValue();
    if (statusHeader && statusHeader !== ALERT_HEADER) throw new Error('Column K is already in use');
    sheet.getRange(1, 11).setValue(ALERT_HEADER);
    // Initialize once: historical leads must never generate an email flood.
    if (!properties.getProperty('LEAD_ALERTS_INITIALIZED')) {
      const count = sheet.getLastRow() - 1;
      if (count > 0) sheet.getRange(2, 11, count, 1).setValues(Array.from({length: count}, () => ['baseline']));
      SpreadsheetApp.flush();
      properties.setProperty('LEAD_ALERT_SPREADSHEET_ID', spreadsheet.getId());
      properties.setProperty('LEAD_ALERTS_INITIALIZED', 'true');
    }
    const triggers = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'notifyNewLeads');
    if (!triggers.length) ScriptApp.newTrigger('notifyNewLeads').timeBased().everyMinutes(1).create();
    for (let i = 1; i < triggers.length; i++) ScriptApp.deleteTrigger(triggers[i]);
  } finally { lock.releaseLock(); }
}

function notifyNewLeads() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const properties = PropertiesService.getScriptProperties();
    if (properties.getProperty('LEAD_ALERTS_INITIALIZED') !== 'true') throw new Error('Run installLeadAlerts first');
    const recipients = getLeadAlertRecipients(properties);
    const spreadsheet = SpreadsheetApp.openById(properties.getProperty('LEAD_ALERT_SPREADSHEET_ID'));
    const sheet = spreadsheet.getSheetByName(LEAD_TAB);
    if (!sheet || sheet.getRange(1, 11).getDisplayValue() !== ALERT_HEADER) throw new Error('Notification status column missing');
    const count = sheet.getLastRow() - 1;
    if (count < 1) return;
    const rows = sheet.getRange(2, 1, count, 11).getDisplayValues();
    let quota = MailApp.getRemainingDailyQuota();
    // Use per-row status instead of a row-number cursor: leads may be sorted.
    for (let i = 0; i < rows.length && quota >= recipients.length; i++) {
      const r = rows[i];
      if (r[10] || r[7] !== 'efrat-landing' || !r[2] || !r[3]) continue;
      const body = [
        'התקבלה פנייה חדשה באתר אפרת כהן.',
        '',
        'תאריך: ' + r[0] + ' ' + r[1],
        'שם ההורה: ' + r[2],
        'טלפון: ' + r[3],
        'כיתה / גיל: ' + (r[4] || 'לא צוין'),
        'מקצוע: ' + (r[5] || 'לא צוין'),
        'הודעה: ' + (r[6] || 'לא נכתבה הודעה'),
        '',
        spreadsheet.getUrl()
      ].join('\n');
      try {
        MailApp.sendEmail({to: recipients.join(','), subject: 'פנייה חדשה מהאתר של אפרת', body: body, htmlBody: buildLeadEmailHtml(r, spreadsheet.getUrl()), name: 'התראות אתר אפרת'});
        sheet.getRange(i + 2, 11).setValue('sent ' + new Date().toISOString());
        SpreadsheetApp.flush();
        quota -= recipients.length;
      } catch (error) {
        // Keep the row pending for the next scheduled run; do not log personal data.
        console.error('Lead notification failed at row ' + (i + 2));
        break;
      }
    }
  } finally { lock.releaseLock(); }
}

function escapeLeadHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character];
  });
}

function buildLeadEmailHtml(r, sheetUrl) {
  const safe = escapeLeadHtml;
  const phone = String(r[3] || '').replace(/[^\d+]/g, '');
  const phoneHtml = phone
    ? '<a href="tel:' + safe(phone) + '" style="color:#0f766e;text-decoration:none;font-weight:bold"><span dir="ltr">' + safe(r[3]) + '</span></a>'
    : safe(r[3]);
  function field(label, value) {
    return '<tr><td style="padding:14px 0;border-bottom:1px solid #e8edf0;color:#64748b;font-size:14px;width:35%;vertical-align:top">' +
      label + '</td><td style="padding:14px 0;border-bottom:1px solid #e8edf0;color:#183344;font-size:16px;font-weight:bold;word-break:break-word">' +
      value + '</td></tr>';
  }
  return '<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>' +
    '<body dir="rtl" style="margin:0;padding:0;background:#f1f5f7;font-family:Arial,Helvetica,sans-serif;text-align:right;color:#183344">' +
    '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">פנייה חדשה מאת ' + safe(r[2]) + ' — כל הפרטים מחכים לך בפנים.</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f7"><tr><td align="center" style="padding:32px 16px">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="rtl" style="max-width:600px;text-align:right">' +
    '<tr><td style="padding:0 8px 20px;color:#183344;font-size:20px;font-weight:bold">אפרת כהן<span style="display:block;margin-top:6px;color:#64748b;font-size:13px;font-weight:normal">התראות מהאתר</span></td></tr>' +
    '<tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8ed">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">' +
    '<tr><td style="background:#123b45;padding:28px 28px 30px;border-top:5px solid #49b6a5">' +
    '<div style="color:#9be0d3;font-size:13px;font-weight:bold;margin-bottom:12px">פנייה חדשה התקבלה</div>' +
    '<h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.4">יש לך מתעניינים חדשים</h1>' +
    '<p style="margin:12px 0 0;color:#d8e8eb;font-size:15px;line-height:1.7">הפרטים נשמרו בגיליון ומוכנים להמשך טיפול.</p></td></tr>' +
    '<tr><td style="padding:28px">' +
    '<div style="color:#64748b;font-size:13px;margin-bottom:8px">שם ההורה</div>' +
    '<h2 style="margin:0 0 10px;font-size:24px;line-height:1.5;color:#183344;word-break:break-word">' + safe(r[2]) + '</h2>' +
    '<div style="color:#64748b;font-size:13px;line-height:1.7">מועד קבלת הפנייה: <span dir="ltr" style="display:inline-block">' + safe(r[0]) + ' &nbsp; ' + safe(r[1]) + '</span></div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px">' +
    field('טלפון', phoneHtml) + field('כיתה / גיל', safe(r[4] || 'לא צוין')) + field('מקצוע', safe(r[5] || 'לא צוין')) +
    '</table>' +
    '<div style="margin-top:24px;color:#64748b;font-size:13px;font-weight:bold">הודעת הלקוח</div>' +
    '<div style="margin-top:10px;padding:18px;background:#f4f8f9;border-right:3px solid #49b6a5;border-radius:8px;color:#334b59;font-size:15px;line-height:1.9;word-break:break-word">' +
    safe(r[6] || 'לא נכתבה הודעה').replace(/\r\n|\r|\n/g, '<br>') + '</div>' +
    '<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px"><tr><td bgcolor="#0f766e" style="border-radius:8px">' +
    '<a href="' + safe(sheetUrl) + '" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border:1px solid #0f766e;border-radius:8px">פתיחת גיליון הפניות</a>' +
    '</td></tr></table></td></tr></table></td></tr>' +
    '<tr><td style="padding:20px 8px;color:#7b8b96;font-size:12px;line-height:1.8">הודעה אוטומטית מטופס ההרשמה באתר אפרת כהן.</td></tr>' +
    '</table></td></tr></table></body></html>';
}


/**
 * Keep NOTIFICATION_EMAIL as the primary recipient.
 * ADDITIONAL_NOTIFICATION_EMAIL is optional; clear it to send only to the primary.
 */
function getLeadAlertRecipients(properties) {
  const primary = (properties.getProperty('NOTIFICATION_EMAIL') || '').trim();
  const additional = (properties.getProperty('ADDITIONAL_NOTIFICATION_EMAIL') || '').trim();
  const emailPattern = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
  if (!emailPattern.test(primary)) {
    throw new Error('Set a valid NOTIFICATION_EMAIL in Project Settings > Script properties.');
  }
  if (additional && !emailPattern.test(additional)) {
    throw new Error('Set a valid ADDITIONAL_NOTIFICATION_EMAIL or leave it empty.');
  }
  return [primary, additional].filter(function (email, index, all) {
    return email && all.findIndex(function (other) {
      return other.toLowerCase() === email.toLowerCase();
    }) === index;
  });
}
