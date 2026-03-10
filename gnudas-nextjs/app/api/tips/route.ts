export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const col = await getCollection('community_db', 'tips');
    const search = req.nextUrl.searchParams.get('search')?.trim();
    const category = req.nextUrl.searchParams.get('category')?.trim();
    const sort = req.nextUrl.searchParams.get('sort') || 'latest';

    const query: Record<string, unknown> = {};
    if (category && category !== '전체') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: Record<string, -1> = sort === 'popular'
      ? { likes: -1, views: -1, createdAt: -1 }
      : { createdAt: -1 };

    const tips = await col.find(query).sort(sortOption).limit(100).toArray();
    return NextResponse.json({ tips });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const col = await getCollection('community_db', 'tips');
    await col.insertOne({ ...body, likes: 0, views: 0, createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
