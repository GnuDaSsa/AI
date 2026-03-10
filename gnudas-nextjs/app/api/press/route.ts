import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { 담당부서, 소감주체, 담당자, 연락처, 내용 } = await req.json();

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "당신은 공공기관 보도자료 작성 실무자다. 출력은 반드시 다음 형식을 따른다. 1) 첫 줄에 '보도자료 추천 제목' 2) 제목 후보 5개를 각 줄마다 작은따옴표로 감싸 출력 3) 빈 줄 4) 본문 초안. 본문은 공식적이고 간결한 보도자료 문체로 작성하며 문장 종결은 '이다','된다','했다' 계열을 사용한다.",
        },
        {
          role: 'user',
          content: [
            `담당부서: ${담당부서}`,
            `소감주체: ${소감주체 || '관계자'}`,
            `담당자: ${담당자}`,
            `연락처: ${연락처}`,
            `핵심 내용: ${내용}`,
            '위 내용을 바탕으로 제목 후보 5개와 보도자료 초안을 작성해라. 제목 후보는 한 줄씩 출력해라.',
          ].join('\n'),
        },
      ],
    });

    return NextResponse.json({ text: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
