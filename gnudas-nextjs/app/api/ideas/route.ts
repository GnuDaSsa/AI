export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const col = await getCollection('community_db', 'ideas');
    const search = req.nextUrl.searchParams.get('search')?.trim();
    const status = req.nextUrl.searchParams.get('status')?.trim();
    const sort = req.nextUrl.searchParams.get('sort') || 'latest';

    const query: Record<string, unknown> = {};
    if (status && status !== '전체') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: Record<string, -1> = sort === 'popular'
      ? { votes: -1, createdAt: -1 }
      : { createdAt: -1 };

    const ideas = await col.find(query).sort(sortOption).limit(100).toArray();
    return NextResponse.json({ ideas });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const col = await getCollection('community_db', 'ideas');
    await col.insertOne({ ...body, status: '제안됨', votes: 0, comments: 0, createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
