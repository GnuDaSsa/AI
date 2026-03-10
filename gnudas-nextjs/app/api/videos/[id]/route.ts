import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';

type Params = { params: Promise<{ id: string }> };

async function checkAuth(col: Awaited<ReturnType<typeof getCollection>>, id: string, password: string) {
  if (password === process.env.ADMIN_PASSWORD) return true;
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return false;
  return doc.password === password;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { password, title, description, author, videoType, videoUrl } = await req.json();
    const col = await getCollection('community_db', 'videos');
    if (!(await checkAuth(col, id, password))) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, author, videoType, videoUrl, updatedAt: new Date() } }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { password } = await req.json();
    const col = await getCollection('community_db', 'videos');
    if (!(await checkAuth(col, id, password))) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const col = await getCollection('community_db', 'videos');
    await col.updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
