/*
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
try {
const body = await req.json();


// Basic validation
if (!body?.parentName || !body?.phone) {
return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
}


// Forward to n8n webhook (kept secret via env var)
const webhook = process.env.N8N_WEBHOOK_URL; // e.g. https://n8n.your-domain.com/webhook/efrat-leads
if (!webhook) throw new Error('N8N_WEBHOOK_URL not set');


const res = await fetch(webhook, {
method: 'POST',
headers: { 'Content-Type': 'application/json', 'X-Auth-Token': process.env.N8N_TOKEN || '' },
body: JSON.stringify(body),
});


if (!res.ok) throw new Error('n8n webhook failed');


return NextResponse.json({ ok: true });
} catch (err) {
console.error('[contact] error', err);
return NextResponse.json({ ok: false }, { status: 500 });
}
}
*/