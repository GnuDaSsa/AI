import { NextRequest, NextResponse } from 'next/server';

import { buildLottoSaju } from '@/lib/lotto-saju';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      birthDate?: string;
      birthTime?: string;
      ticketCount?: number;
    };

    if (!body.birthDate) {
      return NextResponse.json({ error: 'birthDate is required' }, { status: 400 });
    }

    const result = await buildLottoSaju({
      name: body.name,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      ticketCount: body.ticketCount,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unknown error' },
      { status: 500 },
    );
  }
}
