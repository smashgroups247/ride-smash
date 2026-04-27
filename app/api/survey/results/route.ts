import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();

    const allDocs = await db
      .collection('surveys')
      .find({}, { projection: { _id: 0, type: 1, timestamp: 1, answers: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    const driver = allDocs.filter((d) => d.type === 'driver');
    const passenger = allDocs.filter((d) => d.type === 'passenger');

    return NextResponse.json({ driver, passenger });
  } catch (err) {
    console.error('[GET /api/survey/results]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
