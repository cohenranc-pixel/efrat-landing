import { sign } from 'node:crypto';

export const maxDuration = 30;

const EXPECTED_HEADERS = ['ReceivedAtDate', 'ReceivedAtTime', 'parentName', 'phone', 'grade', 'subject', 'message', 'source', 'ip', 'ua'];
const errorMessage = 'לא ניתן לאשר שהפרטים נשמרו. אנא התקשרו אלינו.';

function reply(status: number, ok: boolean) {
  return Response.json(ok ? { ok: true } : { ok: false, error: errorMessage }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
}

async function googleToken(email: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const claims = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: email, scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const signature = sign('RSA-SHA256', Buffer.from(claims), privateKey.replace(/\\n/g, '\n')).toString('base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${claims}.${signature}` }),
    signal: AbortSignal.timeout(8000), cache: 'no-store',
  });
  if (!response.ok) throw new Error('Google authentication failed');
  const data = await response.json();
  if (typeof data.access_token !== 'string' || !data.access_token) throw new Error('Missing access token');
  return data.access_token as string;
}

export async function POST(request: Request) {
  // The form posts to the same origin; no cross-origin browser submissions.
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return reply(403, false);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, false);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 12000) return reply(413, false);
  let payload: Record<string, unknown>;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > 12000) return reply(413, false);
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply(400, false);
    payload = parsed;
  } catch { return reply(400, false); }
  const limits = { parentName: 120, phone: 40, grade: 100, subject: 200, message: 2000 };
  const fields: Record<string, string> = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = payload[key] ?? '';
    if (typeof value !== 'string' || value.length > limit) return reply(400, false);
    fields[key] = value.trim();
  }
  const digits = fields.phone.replace(/\D/g, '');
  if (!fields.parentName || !/^[+\d\s().-]+$/.test(fields.phone) || digits.length < 9 || digits.length > 15) return reply(400, false);

  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_TAB_NAME;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!sheetId || !sheetName || !email || !privateKey) {
    console.error('Contact form: Google Sheets configuration missing');
    return reply(503, false);
  }
  try {
    const token = await googleToken(email, privateKey);
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/`;
    const tab = `'${sheetName.replace(/'/g, "''")}'`;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    // Refuse to append if the destination schema has changed.
    const schema = await fetch(`${base}${encodeURIComponent(`${tab}!A1:J1`)}`, {
      headers, cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!schema.ok) throw new Error('Cannot read destination schema');
    const schemaData = await schema.json();
    if (JSON.stringify(schemaData.values?.[0]) !== JSON.stringify(EXPECTED_HEADERS)) throw new Error('Destination headers mismatch');
    const date = new Date();
    const dateParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(date);
    const row = [dateParts, time, fields.parentName, fields.phone, fields.grade, fields.subject, fields.message,
      'efrat-landing', request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || '',
      (request.headers.get('user-agent') || '').slice(0, 500)];
    const result = await fetch(`${base}${encodeURIComponent(`${tab}!A:J`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: 'POST', headers, body: JSON.stringify({ majorDimension: 'ROWS', values: [row] }),
      signal: AbortSignal.timeout(8000), cache: 'no-store',
    });
    if (!result.ok) throw new Error('Google Sheets append failed');
    const data = await result.json();
    if (data.updates?.updatedRows !== 1) throw new Error('Google Sheets did not confirm one saved row');
    return reply(200, true);
  } catch {
    // Never log form fields, private keys, tokens, or upstream response bodies.
    console.error('Contact form: Google Sheets submission could not be confirmed');
    return reply(502, false);
  }
}
