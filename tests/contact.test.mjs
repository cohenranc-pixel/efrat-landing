import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { POST } from '../app/api/contact/route.ts';

const originalFetch = globalThis.fetch;
const envNames = ['GOOGLE_SHEETS_SPREADSHEET_ID', 'GOOGLE_SHEETS_TAB_NAME', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'];
const originalEnv = Object.fromEntries(envNames.map(k => [k, process.env[k]]));
after(() => {
  globalThis.fetch = originalFetch;
  for (const key of envNames) {
    if (originalEnv[key] === undefined) delete process.env[key]; else process.env[key] = originalEnv[key];
  }
});
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const headers = ['ReceivedAtDate', 'ReceivedAtTime', 'parentName', 'phone', 'grade', 'subject', 'message', 'source', 'ip', 'ua'];
function setup(mode = 'success') {
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'test-sheet';
  process.env.GOOGLE_SHEETS_TAB_NAME = 'Rev1.1';
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.invalid';
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).replace(/\n/g, '\\n');
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('oauth2')) {
      const assertion = options.body.get('assertion');
      const parts = assertion.split('.');
      assert.equal(verify('RSA-SHA256', Buffer.from(parts.slice(0, 2).join('.')), publicKey, Buffer.from(parts[2], 'base64url')), true);
      const claims = JSON.parse(Buffer.from(parts[1], 'base64url'));
      assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
      assert.equal(claims.exp - claims.iat, 3600);
      return Response.json({ access_token: 'mock-token' });
    }
    if (!String(url).includes(':append')) return Response.json({ values: [mode === 'schema' ? ['wrong'] : headers] });
    if (mode === 'failure') return Response.json({}, { status: 403 });
    if (mode === 'timeout') throw new Error('timeout');
    return Response.json({ updates: { updatedRows: mode === 'unconfirmed' ? 0 : 1 } });
  };
  return calls;
}
function request(payload = { parentName: 'לקוח בדיקה', phone: '054-0000000', message: '=1+1' }, origin = 'https://efrat-landing.vercel.app') {
  return new Request('https://efrat-landing.vercel.app/api/contact', {
    method: 'POST', headers: { origin, 'Content-Type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.1', 'User-Agent': 'test' }, body: JSON.stringify(payload),
  });
}
test('confirmed append uses the existing schema and RAW text', async () => {
  const calls = setup();
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 3);
  const append = calls[2];
  assert.match(append.url, /valueInputOption=RAW/);
  const row = JSON.parse(append.options.body).values[0];
  assert.equal(row.length, 10);
  assert.equal(row[3], '054-0000000');
  assert.equal(row[6], '=1+1');
  assert.equal(row[7], 'efrat-landing');
  assert.equal(row[8], '192.0.2.1');
  assert.match(row[0], /^\d{2}\/\d{2}\/\d{4}$/);
});
test('cross-origin and invalid input never contact Google', async () => {
  const calls = setup();
  assert.equal((await POST(request(undefined, 'https://other.invalid'))).status, 403);
  assert.equal((await POST(request({ parentName: 'a', phone: 'invalid' }))).status, 400);
  assert.equal((await POST(request({ parentName: 12, phone: '0540000000' }))).status, 400);
  assert.equal((await POST(request({ parentName: 'a', phone: '0540000000', message: 'a'.repeat(2001) }))).status, 400);
  assert.equal(calls.length, 0);
});
test('missing credentials fail before any Google request', async () => {
  const calls = setup(); delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  assert.equal((await POST(request())).status, 503);
  assert.equal(calls.length, 0);
});
test('header mismatch prevents appending', async () => {
  const calls = setup('schema');
  assert.equal((await POST(request())).status, 502);
  assert.equal(calls.length, 2);
});
test('Google failures and unconfirmed writes never return success or retry', async () => {
  for (const mode of ['failure', 'timeout', 'unconfirmed']) {
    const calls = setup(mode);
    const response = await POST(request());
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
    assert.equal(calls.length, 3);
  }
});
