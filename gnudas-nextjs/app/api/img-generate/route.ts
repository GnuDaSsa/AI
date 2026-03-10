import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { prompt, aspectRatio, apiKey, adminPassword } = await req.json();

  let resolvedKey: string;
  if (adminPassword && process.env.ADMIN_PASSWORD && adminPassword === process.env.ADMIN_PASSWORD) {
    resolvedKey = process.env.GOOGLE_API_KEY || '';
  } else if (apiKey) {
    resolvedKey = apiKey;
  } else {
    return NextResponse.json({ error: 'API 키 또는 관리자 비밀번호가 필요합니다.' }, { status: 401 });
  }

  if (!resolvedKey) {
    return NextResponse.json({ error: '유효한 이미지 생성 키를 찾지 못했습니다.' }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });

  try {
    const imageRes = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: { numberOfImages: 1, aspectRatio },
    });
    const raw = imageRes?.generatedImages?.[0]?.image;
    if (raw?.mimeType && raw?.imageBytes) {
      return NextResponse.json({ imageDataUrl: `data:${raw.mimeType};base64,${raw.imageBytes}` });
    }
    return NextResponse.json({ imageDataUrl: null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
