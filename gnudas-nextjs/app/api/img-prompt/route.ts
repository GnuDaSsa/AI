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
  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
  const { prompt, style, aspectRatio } = await req.json();

  const systemPrompt = `You are an expert image prompt engineer.
Convert the user's Korean description into a detailed English image generation prompt.
Include the style (${style}) and aspect ratio context (${aspectRatio}) naturally in the prompt.
Return JSON with one field:
- "prompt": a detailed, vivid English prompt for image generation

Be specific about lighting, composition, mood, and visual details. Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `User description: ${prompt}` }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    if (!text) {
      return NextResponse.json({ error: '프롬프트 생성 결과가 비어있습니다.' }, { status: 500 });
    }
    const parsed = JSON.parse(text);

    return NextResponse.json({ prompt: parsed.prompt || '' });
  } catch (e) {
    const { message, status } = parseGoogleApiError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
