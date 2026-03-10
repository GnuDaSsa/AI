import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 25MB 이하여야 합니다.' }, { status: 400 });
    }

    const transcription = await client.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'ko',
    });

    const transcript = transcription.text;

    // AI 요약
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '당신은 회의록 요약 전문가입니다. 주어진 텍스트를 간결하고 구조적으로 요약해주세요. 주요 안건, 논의 내용, 결정사항, 액션아이템으로 나누어 정리해주세요.' },
        { role: 'user', content: `다음 텍스트를 요약해주세요:\n\n${transcript}` },
      ],
    });

    return NextResponse.json({
      transcript,
      summary: completion.choices[0].message.content,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

