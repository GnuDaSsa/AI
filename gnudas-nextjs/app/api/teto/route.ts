export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const col = await getCollection('teto_db', 'results');
    await col.insertOne({ ...body, createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
