export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('community_db', 'videos');
    const videos = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ videos });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, author, password, videoType, videoUrl } = body;
    if (!title || !author || !password || !videoUrl) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }
    const col = await getCollection('community_db', 'videos');
    await col.insertOne({
      title,
      description: description || '',
      author,
      password,
      videoType: videoType || 'url',
      videoUrl,
      createdAt: new Date(),
      views: 0,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
