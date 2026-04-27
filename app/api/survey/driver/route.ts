import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// ── Allowed answer values for strict validation ──────────────────────────────
const ALLOWED_Q1 = new Set([
  'Less than 6 months',
  '6 months – 1 year',
  '1 – 3 years',
  'More than 3 years',
]);

const ALLOWED_Q2 = new Set([
  'Commission / deductions are too high',
  'Poor customer support when issues arise',
  'Unfair passenger ratings / no driver protection',
  'No financial support during vehicle breakdowns',
  'Too many drivers, not enough ride requests',
]);

const ALLOWED_Q3 = new Set([
  "I have savings — I'd fix it myself",
  "I'd borrow money from family or friends",
  "I'd take a loan from a bank or local lender",
  "Honestly, I don't know — it would be a crisis",
]);

const ALLOWED_Q5 = new Set([
  'Lower platform commission rate',
  'Vehicle repair financial aid (VM Wallet)',
  'Pension savings per ride (MP Wallet)',
  'Better customer support and dispute resolution',
  'Driver loyalty rewards and tier system',
  'Ability to see and claim pre-booked rides',
]);

const ALLOWED_Q6 = new Set([
  'In-app live chat',
  'Phone call with agent',
  'WhatsApp support',
  'Self-service help centre',
]);

// ── Sanitize helpers ──────────────────────────────────────────────────────────
function sanitizeString(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function clampScale(val: unknown): number | null {
  const n = Number(val);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const rawAnswers = body.answers ?? {};

    // q1 — single-select
    const q1 = sanitizeString(rawAnswers.q1);
    if (!ALLOWED_Q1.has(q1)) {
      return NextResponse.json({ error: 'Invalid value for q1' }, { status: 400 });
    }

    // q2 — single-select
    const q2 = sanitizeString(rawAnswers.q2);
    if (!ALLOWED_Q2.has(q2)) {
      return NextResponse.json({ error: 'Invalid value for q2' }, { status: 400 });
    }

    // q3 — single-select
    const q3 = sanitizeString(rawAnswers.q3);
    if (!ALLOWED_Q3.has(q3)) {
      return NextResponse.json({ error: 'Invalid value for q3' }, { status: 400 });
    }

    // q4 — scale 1-5
    const q4 = clampScale(rawAnswers.q4);
    if (q4 === null) {
      return NextResponse.json({ error: 'Invalid value for q4 (must be 1–5)' }, { status: 400 });
    }

    // q5 — multi-select array
    if (!Array.isArray(rawAnswers.q5) || rawAnswers.q5.length === 0) {
      return NextResponse.json({ error: 'q5 must be a non-empty array' }, { status: 400 });
    }
    const q5: string[] = [];
    for (const item of rawAnswers.q5) {
      const s = sanitizeString(item);
      if (!ALLOWED_Q5.has(s)) {
        return NextResponse.json({ error: `Invalid q5 option: ${s}` }, { status: 400 });
      }
      q5.push(s);
    }

    // q6 — single-select
    const q6 = sanitizeString(rawAnswers.q6);
    if (!ALLOWED_Q6.has(q6)) {
      return NextResponse.json({ error: 'Invalid value for q6' }, { status: 400 });
    }

    // q7 — optional free text
    const q7 = sanitizeString(rawAnswers.q7, 2000);

    const doc = {
      type: 'driver',
      timestamp: new Date().toISOString(),
      answers: { q1, q2, q3, q4, q5, q6, q7 },
      createdAt: new Date(),
    };

    const db = await getDb();
    await db.collection('surveys').insertOne(doc);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/survey/driver]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
