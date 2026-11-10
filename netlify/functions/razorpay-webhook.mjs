// Razorpay TEST-mode webhook receiver (2026-11-10). Lives only on a deploy
// preview: www production is deployed from dist/ with --no-build, so this
// function never reaches www.rsquaredacademy.com.
// It stores the raw body and the signature header in Netlify Blobs so the
// signature can be checked offline with the webhook secret. No secrets are
// stored or logged.
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const MAX_BODY = 100_000;

function verify(raw, header, secret) {
  if (!secret || !header) return null;
  const want = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return want.length === header.length &&
    crypto.timingSafeEqual(Buffer.from(want), Buffer.from(header));
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('ok\n', { status: 200 });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return new Response('too large\n', { status: 413 });
  const signature = req.headers.get('x-razorpay-signature');
  const eventId = req.headers.get('x-razorpay-event-id') || `noid-${Date.now()}`;
  let event = null;
  try { event = JSON.parse(raw).event ?? null; } catch { /* keep raw */ }
  const store = getStore('razorpay-test-webhooks');
  await store.setJSON(`${new Date().toISOString()}-${eventId}`, {
    received_at: new Date().toISOString(),
    event_id: eventId,
    event,
    signature,
    verified: verify(raw, signature, process.env.RAZORPAY_WEBHOOK_SECRET),
    raw,
  });
  console.log(`razorpay-webhook: stored ${event} ${eventId}`);
  return new Response('ok\n', { status: 200 });
};

export const config = { path: '/api/razorpay-webhook' };
