import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// ── Allowed answer values ─────────────────────────────────────────────────────
const ALLOWED_Q1 = new Set([
  'Every day',
  'A few times a week',
  'A few times a month',
  'Rarely',
]);

const ALLOWED_Q2 = new Set([
  'Price / fare amount',
  'How quickly the driver arrives (ETA)',
  'Driver rating and reviews',
  'Safety features in the app',
  'Car type and comfort level',
]);

const ALLOWED_Q3 = new Set([
  'Yes — unsafe or uncomfortable driver behaviour',
  'Yes — wrong route taken or overcharged',
  'Yes — bad app experience or too many cancellations',
  "No, I've never had a serious issue",
]);

const ALLOWED_Q4 = new Set([
  'Schedule rides in advance',
  'Live trip sharing with a trusted contact',
  'In-app SOS / emergency safety button',
  'Monthly ride subscription / pass for savings',
  'Multiple stops in a single ride',
  'Package or errand delivery option',
]);

const ALLOWED_Q5 = new Set([
  'Yes — I actively care about driver welfare',
  'Somewhat — it would be a nice bonus',
  'Not really — price and speed matter more',
  "I've never thought about this before",
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

    // q4 — multi-select array
    if (!Array.isArray(rawAnswers.q4) || rawAnswers.q4.length === 0) {
      return NextResponse.json({ error: 'q4 must be a non-empty array' }, { status: 400 });
    }
    const q4: string[] = [];
    for (const item of rawAnswers.q4) {
      const s = sanitizeString(item);
      if (!ALLOWED_Q4.has(s)) {
        return NextResponse.json({ error: `Invalid q4 option: ${s}` }, { status: 400 });
      }
      q4.push(s);
    }

    // q5 — single-select
    const q5 = sanitizeString(rawAnswers.q5);
    if (!ALLOWED_Q5.has(q5)) {
      return NextResponse.json({ error: 'Invalid value for q5' }, { status: 400 });
    }

    // q6 — scale 1-5
    const q6 = clampScale(rawAnswers.q6);
    if (q6 === null) {
      return NextResponse.json({ error: 'Invalid value for q6 (must be 1–5)' }, { status: 400 });
    }

    // q7 — optional free text
    const q7 = sanitizeString(rawAnswers.q7, 2000);

    const doc = {
      type: 'passenger',
      timestamp: new Date().toISOString(),
      answers: { q1, q2, q3, q4, q5, q6, q7 },
      createdAt: new Date(),
    };

    const db = await getDb();
    await db.collection('surveys').insertOne(doc);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/survey/passenger]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
