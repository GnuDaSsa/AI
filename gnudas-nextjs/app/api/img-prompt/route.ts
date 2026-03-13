import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
