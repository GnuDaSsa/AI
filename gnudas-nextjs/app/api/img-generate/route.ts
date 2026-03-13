import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function parseGoogleApiError(e: unknown): { message: string; status: number } {
  const raw = String(e);
  const codeMatch = raw.match(/"code"\s*:\s*(\d+)/);
  const code = codeMatch ? parseInt(codeMatch[1]) : 500;
  const messages: Record<number, string> = {
    429: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 Google AI Studio에서 플랜을 확인해주세요.',
    401: 'API 키가 유효하지 않습니다.',
    403: 'API 키에 이 기능을 사용할 권한이 없습니다.',
    400: '요청 형식이 올바르지 않습니다.',
    503: 'Google AI 서버가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.',
  };
  return { message: messages[code] ?? '알 수 없는 오류가 발생했습니다.', status: code >= 400 && code < 600 ? code : 500 };
}

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
    const { message, status } = parseGoogleApiError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
