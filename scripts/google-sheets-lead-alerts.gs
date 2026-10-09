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
    const recipient = properties.getProperty('NOTIFICATION_EMAIL');
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      throw new Error('Set NOTIFICATION_EMAIL in Project Settings > Script properties.');
    }
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
    const recipient = properties.getProperty('NOTIFICATION_EMAIL');
    const spreadsheet = SpreadsheetApp.openById(properties.getProperty('LEAD_ALERT_SPREADSHEET_ID'));
    const sheet = spreadsheet.getSheetByName(LEAD_TAB);
    if (!sheet || sheet.getRange(1, 11).getDisplayValue() !== ALERT_HEADER) throw new Error('Notification status column missing');
    const count = sheet.getLastRow() - 1;
    if (count < 1) return;
    const rows = sheet.getRange(2, 1, count, 11).getDisplayValues();
    let quota = MailApp.getRemainingDailyQuota();
    // Use per-row status instead of a row-number cursor: leads may be sorted.
    for (let i = 0; i < rows.length && quota > 0; i++) {
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
        MailApp.sendEmail({to: recipient, subject: 'פנייה חדשה מהאתר של אפרת', body: body, name: 'התראות אתר אפרת'});
        sheet.getRange(i + 2, 11).setValue('sent ' + new Date().toISOString());
        SpreadsheetApp.flush();
        quota--;
      } catch (error) {
        // Keep the row pending for the next scheduled run; do not log personal data.
        console.error('Lead notification failed at row ' + (i + 2));
        break;
      }
    }
  } finally { lock.releaseLock(); }
}
