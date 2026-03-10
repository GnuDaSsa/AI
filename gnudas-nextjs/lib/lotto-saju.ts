const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
const ELEMENTS = ['water', 'wood', 'fire', 'earth', 'metal'] as const;

type ElementKey = (typeof ELEMENTS)[number];

type Pillar = {
  label: 'year' | 'month' | 'day' | 'hour';
  stem: string;
  branch: string;
  stemElement: ElementKey;
  branchElement: ElementKey;
};

export type LottoDraw = {
  draw_no: number;
  numbers: number[];
  bonus_no: number;
  date: string;
  total_sales_amount?: number;
};

export type LottoSajuInput = {
  name?: string;
  birthDate: string;
  birthTime?: string;
  ticketCount?: number;
};

type GeneratedTicket = {
  numbers: number[];
  angle: string;
  emphasis: string;
  reasons: { number: number; elementLabel: string; why: string }[];
};

const STEM_TO_ELEMENT: ElementKey[] = [
  'wood',
  'wood',
  'fire',
  'fire',
  'earth',
  'earth',
  'metal',
  'metal',
  'water',
  'water',
];

const BRANCH_TO_ELEMENT: ElementKey[] = [
  'water',
  'earth',
  'wood',
  'wood',
  'earth',
  'fire',
  'fire',
  'earth',
  'metal',
  'metal',
  'earth',
  'water',
];

const ELEMENT_LABEL: Record<ElementKey, string> = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
};

const ELEMENT_DESCRIPTION: Record<ElementKey, string> = {
  wood: '확장과 발산',
  fire: '집중과 추진',
  earth: '균형과 안정',
  metal: '정제와 결단',
  water: '흐름과 직감',
};

const SUPPORTING_ELEMENT: Record<ElementKey, ElementKey> = {
  wood: 'water',
  fire: 'wood',
  earth: 'fire',
  metal: 'earth',
  water: 'metal',
};

const OPPOSING_ELEMENT: Record<ElementKey, ElementKey> = {
  wood: 'metal',
  fire: 'water',
  earth: 'wood',
  metal: 'fire',
  water: 'earth',
};

const HOUR_BRANCH_RANGES = [
  { start: 23, end: 24, branchIndex: 0 },
  { start: 0, end: 1, branchIndex: 0 },
  { start: 1, end: 3, branchIndex: 1 },
  { start: 3, end: 5, branchIndex: 2 },
  { start: 5, end: 7, branchIndex: 3 },
  { start: 7, end: 9, branchIndex: 4 },
  { start: 9, end: 11, branchIndex: 5 },
  { start: 11, end: 13, branchIndex: 6 },
  { start: 13, end: 15, branchIndex: 7 },
  { start: 15, end: 17, branchIndex: 8 },
  { start: 17, end: 19, branchIndex: 9 },
  { start: 19, end: 21, branchIndex: 10 },
  { start: 21, end: 23, branchIndex: 11 },
] as const;

const FALLBACK_DRAWS: LottoDraw[] = [
  { draw_no: 1209, numbers: [2, 17, 20, 35, 37, 39], bonus_no: 24, date: '2026-01-31T00:00:00Z' },
  { draw_no: 1210, numbers: [1, 7, 9, 17, 27, 38], bonus_no: 31, date: '2026-02-07T00:00:00Z' },
  { draw_no: 1211, numbers: [23, 26, 27, 35, 38, 40], bonus_no: 10, date: '2026-02-14T00:00:00Z' },
  { draw_no: 1212, numbers: [5, 8, 25, 31, 41, 44], bonus_no: 45, date: '2026-02-21T00:00:00Z' },
  { draw_no: 1213, numbers: [5, 11, 25, 27, 36, 38], bonus_no: 2, date: '2026-02-28T00:00:00Z' },
];

function numberElement(num: number): ElementKey {
  return ELEMENTS[(num - 1) % 5];
}

function groupNumbersByElement(element: ElementKey) {
  return Array.from({ length: 45 }, (_, index) => index + 1).filter((num) => numberElement(num) === element);
}

function formatKoreanDate(input: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(input));
}

function parseBirthDateTime(birthDate: string, birthTime?: string) {
  const time = birthTime && /^\d{2}:\d{2}$/.test(birthTime) ? birthTime : '12:00';
  return new Date(`${birthDate}T${time}:00+09:00`);
}

function sexagenaryFromIndex(index: number) {
  const normalized = ((index % 60) + 60) % 60;
  const stemIndex = normalized % 10;
  const branchIndex = normalized % 12;
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
  };
}

function getYearPillar(date: Date): Pillar {
  const yearIndex = date.getFullYear() - 1984;
  const pair = sexagenaryFromIndex(yearIndex);
  return {
    label: 'year',
    stem: pair.stem,
    branch: pair.branch,
    stemElement: STEM_TO_ELEMENT[pair.stemIndex],
    branchElement: BRANCH_TO_ELEMENT[pair.branchIndex],
  };
}

function getMonthPillar(date: Date, yearStemIndex: number): Pillar {
  const month = date.getMonth() + 1;
  const branchIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0][month - 1];
  const stemIndex = (yearStemIndex * 2 + month + 1) % 10;
  return {
    label: 'month',
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    stemElement: STEM_TO_ELEMENT[stemIndex],
    branchElement: BRANCH_TO_ELEMENT[branchIndex],
  };
}

function daysBetween(start: Date, end: Date) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / oneDay);
}

function getDayPillar(date: Date): Pillar {
  const base = new Date('1984-02-02T00:00:00+09:00');
  const pair = sexagenaryFromIndex(daysBetween(base, date));
  return {
    label: 'day',
    stem: pair.stem,
    branch: pair.branch,
    stemElement: STEM_TO_ELEMENT[pair.stemIndex],
    branchElement: BRANCH_TO_ELEMENT[pair.branchIndex],
  };
}

function getHourBranchIndex(hour: number) {
  return HOUR_BRANCH_RANGES.find((range) => {
    if (range.start === 23) {
      return hour >= 23;
    }
    return hour >= range.start && hour < range.end;
  })?.branchIndex ?? 6;
}

function getHourPillar(date: Date, dayStemIndex: number): Pillar {
  const branchIndex = getHourBranchIndex(date.getHours());
  const stemIndex = (dayStemIndex * 2 + branchIndex) % 10;
  return {
    label: 'hour',
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    stemElement: STEM_TO_ELEMENT[stemIndex],
    branchElement: BRANCH_TO_ELEMENT[branchIndex],
  };
}

function getPillars(date: Date) {
  const yearPair = sexagenaryFromIndex(date.getFullYear() - 1984);
  const dayPair = sexagenaryFromIndex(daysBetween(new Date('1984-02-02T00:00:00+09:00'), date));

  return [
    getYearPillar(date),
    getMonthPillar(date, yearPair.stemIndex),
    getDayPillar(date),
    getHourPillar(date, dayPair.stemIndex),
  ];
}

function scoreElements(pillars: Pillar[]) {
  const scores: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  const weights: Record<Pillar['label'], number> = {
    year: 1.4,
    month: 1.8,
    day: 2.4,
    hour: 1.1,
  };

  for (const pillar of pillars) {
    scores[pillar.stemElement] += weights[pillar.label];
    scores[pillar.branchElement] += weights[pillar.label] * 0.75;
  }

  return scores;
}

function getElementRanking(scores: Record<ElementKey, number>) {
  return [...ELEMENTS].sort((a, b) => scores[b] - scores[a]);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 },
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`failed to fetch ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getLottoHistory() {
  try {
    const draws = await fetchJson<LottoDraw[]>('https://smok95.github.io/lotto/results/all.json');
    const deduped = Array.from(
      draws.reduce((map, draw) => map.set(draw.draw_no, draw), new Map<number, LottoDraw>()).values(),
    ).sort((a, b) => a.draw_no - b.draw_no);

    if (deduped.length > 0) {
      return {
        draws: deduped,
        source: 'smok95.github.io/lotto',
      };
    }
  } catch {
    // Fallback below.
  }

  return {
    draws: FALLBACK_DRAWS,
    source: 'local-fallback',
  };
}

function getHistoryStats(draws: LottoDraw[]) {
  const freq52 = Array.from({ length: 46 }, () => 0);
  const freq12 = Array.from({ length: 46 }, () => 0);
  const lastSeen = Array.from({ length: 46 }, () => -1);
  const latestIndex = draws.length - 1;
  const recent52 = draws.slice(-52);
  const recent12 = draws.slice(-12);

  recent52.forEach((draw) => {
    draw.numbers.forEach((num) => {
      freq52[num] += 1;
    });
  });

  recent12.forEach((draw) => {
    draw.numbers.forEach((num) => {
      freq12[num] += 1;
    });
  });

  draws.forEach((draw, index) => {
    draw.numbers.forEach((num) => {
      lastSeen[num] = index;
    });
  });

  const numbers = Array.from({ length: 45 }, (_, index) => index + 1);

  const hotNumbers = [...numbers]
    .sort((a, b) => freq12[b] * 1.8 + freq52[b] - (freq12[a] * 1.8 + freq52[a]))
    .slice(0, 6);

  const coldNumbers = [...numbers]
    .sort((a, b) => {
      const gapA = lastSeen[a] === -1 ? 999 : latestIndex - lastSeen[a];
      const gapB = lastSeen[b] === -1 ? 999 : latestIndex - lastSeen[b];
      return gapB - gapA;
    })
    .slice(0, 6);

  return { freq52, freq12, lastSeen, latestIndex, hotNumbers, coldNumbers };
}

function computeTargetDraw(draws: LottoDraw[]) {
  const latest = draws[draws.length - 1];
  const latestDate = new Date(latest.date);
  const nextDate = new Date(latestDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    drawNo: latest.draw_no + 1,
    dateIso: nextDate.toISOString(),
    dateLabel: formatKoreanDate(nextDate.toISOString()),
  };
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeed(input: LottoSajuInput, targetDrawNo: number) {
  const base = `${input.birthDate}|${input.birthTime ?? '12:00'}|${targetDrawNo}|${input.name ?? ''}`;
  return [...base].reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
}

function weightedPick(candidates: { number: number; weight: number }[], rng: () => number) {
  const total = candidates.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rng() * total;
  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor <= 0) {
      return candidate.number;
    }
  }
  return candidates[candidates.length - 1].number;
}

function isBalancedTicket(numbers: number[]) {
  const odd = numbers.filter((num) => num % 2 === 1).length;
  const sum = numbers.reduce((acc, value) => acc + value, 0);
  let consecutive = 0;

  for (let index = 1; index < numbers.length; index += 1) {
    if (numbers[index] === numbers[index - 1] + 1) {
      consecutive += 1;
    }
  }

  return odd >= 2 && odd <= 4 && sum >= 90 && sum <= 185 && consecutive <= 2;
}

function makeTicketCandidates(
  favored: ElementKey[],
  cautious: ElementKey,
  stats: ReturnType<typeof getHistoryStats>,
) {
  return Array.from({ length: 45 }, (_, index) => {
    const number = index + 1;
    const element = numberElement(number);
    const recencyGap = stats.lastSeen[number] === -1 ? 18 : stats.latestIndex - stats.lastSeen[number];
    let weight = 1.2 + stats.freq52[number] * 0.12 + stats.freq12[number] * 0.28;

    if (favored[0] === element) {
      weight += 2.4;
    }
    if (favored[1] === element) {
      weight += 1.2;
    }
    if (cautious === element) {
      weight -= 0.55;
    }
    if (recencyGap >= 8) {
      weight += 0.9;
    }
    if (stats.freq12[number] === 0) {
      weight += 0.45;
    }

    return {
      number,
      weight: Math.max(0.35, Number(weight.toFixed(2))),
    };
  });
}

function generateTickets(
  input: LottoSajuInput,
  favored: ElementKey[],
  cautious: ElementKey,
  stats: ReturnType<typeof getHistoryStats>,
  targetDrawNo: number,
) {
  const rng = mulberry32(createSeed(input, targetDrawNo));
  const desiredCount = Math.min(Math.max(input.ticketCount ?? 5, 3), 7);
  const tickets: GeneratedTicket[] = [];
  const baseCandidates = makeTicketCandidates(favored, cautious, stats);
  const angleTexts = [
    '사주 강점 + 최근 빈도 균형형',
    '강한 오행 집중형',
    '냉번호 반등형',
    '홀짝 균형형',
    '최근 12회차 역추세형',
    '주간 흐름 분산형',
    '보수적 조합형',
  ];

  let guard = 0;

  while (tickets.length < desiredCount && guard < 300) {
    guard += 1;
    const selected = new Set<number>();
    let attempts = 0;

    while (selected.size < 6 && attempts < 200) {
      const remaining = baseCandidates.filter((item) => !selected.has(item.number));
      selected.add(weightedPick(remaining, rng));
      attempts += 1;
    }

    const numbers = [...selected].sort((a, b) => a - b);
    const signature = numbers.join('-');
    if (!isBalancedTicket(numbers) || tickets.some((ticket) => ticket.numbers.join('-') === signature)) {
      continue;
    }

    const emphasis = numbers
      .map((num) => `${num}(${ELEMENT_LABEL[numberElement(num)]})`)
      .slice(0, 3)
      .join(' · ');

    const reasons = numbers.map((num) => {
      const element = numberElement(num);
      const recencyGap = stats.lastSeen[num] === -1 ? 18 : stats.latestIndex - stats.lastSeen[num];
      let why = '균형 보정';

      if (element === favored[0]) {
        why = '주요 오행 가중치';
      } else if (element === favored[1]) {
        why = '보조 오행 가중치';
      } else if (stats.freq12[num] === 0 || recencyGap >= 8) {
        why = '최근 미출현 반등';
      } else if (stats.freq12[num] >= 3) {
        why = '최근 빈도 반영';
      } else if (element === cautious) {
        why = '주의 오행이지만 분산용 채택';
      }

      return {
        number: num,
        elementLabel: ELEMENT_LABEL[element],
        why,
      };
    });

    tickets.push({
      numbers,
      angle: angleTexts[tickets.length] ?? '균형형',
      emphasis,
      reasons,
    });
  }

  if (tickets.length < desiredCount) {
    const sortedFallback = [...baseCandidates]
      .sort((a, b) => b.weight - a.weight)
      .map((candidate) => candidate.number);

    for (let index = tickets.length; index < desiredCount; index += 1) {
      const numbers = sortedFallback
        .slice(index, index + 12)
        .filter((_, candidateIndex) => candidateIndex % 2 === 0)
        .slice(0, 6)
        .sort((a, b) => a - b);

      tickets.push({
        numbers,
        angle: angleTexts[index] ?? '균형형',
        emphasis: numbers
          .map((num) => `${num}(${ELEMENT_LABEL[numberElement(num)]})`)
          .slice(0, 3)
          .join(' · '),
        reasons: numbers.map((num) => ({
          number: num,
          elementLabel: ELEMENT_LABEL[numberElement(num)],
          why: numberElement(num) === favored[0] ? '주요 오행 우선 선별' : '상위 가중치 fallback',
        })),
      });
    }
  }

  return tickets;
}

export async function buildLottoSaju(input: LottoSajuInput) {
  const birth = parseBirthDateTime(input.birthDate, input.birthTime);
  const pillars = getPillars(birth);
  const elementScores = scoreElements(pillars);
  const ranking = getElementRanking(elementScores);
  const dominant = ranking[0];
  const support = SUPPORTING_ELEMENT[dominant];
  const cautious = OPPOSING_ELEMENT[dominant];
  const history = await getLottoHistory();
  const stats = getHistoryStats(history.draws);
  const target = computeTargetDraw(history.draws);
  const tickets = generateTickets(input, [dominant, support], cautious, stats, target.drawNo);
  const recentDraws = history.draws.slice(-8).reverse();
  const latest = history.draws[history.draws.length - 1];

  return {
    profile: {
      name: input.name?.trim() || '익명',
      birthDate: input.birthDate,
      birthTime: input.birthTime || '12:00',
      pillars: pillars.map((pillar) => ({
        label: pillar.label,
        text: `${pillar.stem}${pillar.branch}`,
        elements: [ELEMENT_LABEL[pillar.stemElement], ELEMENT_LABEL[pillar.branchElement]],
      })),
      dominantElement: {
        key: dominant,
        label: ELEMENT_LABEL[dominant],
        description: ELEMENT_DESCRIPTION[dominant],
      },
      supportElement: {
        key: support,
        label: ELEMENT_LABEL[support],
        description: ELEMENT_DESCRIPTION[support],
      },
      cautiousElement: {
        key: cautious,
        label: ELEMENT_LABEL[cautious],
        description: ELEMENT_DESCRIPTION[cautious],
      },
      summary: `${ELEMENT_LABEL[dominant]} 기운이 가장 도드라지고 ${ELEMENT_LABEL[support]} 흐름이 이를 받쳐주는 패턴으로 읽었습니다.`,
      disclaimer: '정밀한 사주명식이 아니라 양력 생년월일·시간을 바탕으로 간지/오행 리듬을 가볍게 추정한 엔터테인먼트용 계산입니다.',
      connectionGuide: {
        rule: '번호 1~45를 수→목→화→토→금 순환 오행으로 배정한 뒤, 사주에서 강한 오행과 보조 오행에 해당하는 숫자군에 기본 가중치를 줍니다.',
        dominantNumbers: groupNumbersByElement(dominant),
        supportNumbers: groupNumbersByElement(support),
        cautiousNumbers: groupNumbersByElement(cautious),
        summary: `${ELEMENT_LABEL[dominant]} 오행 숫자군을 우선 보고, ${ELEMENT_LABEL[support]} 숫자군을 보강한 뒤, 최근 12회/52회 빈도와 장기 미출현 번호를 함께 섞어 조합했습니다.`,
      },
    },
    history: {
      source: history.source,
      drawCount: history.draws.length,
      latestDrawNo: latest.draw_no,
      latestDrawDate: formatKoreanDate(latest.date),
      hotNumbers: stats.hotNumbers,
      coldNumbers: stats.coldNumbers,
      recentDraws: recentDraws.map((draw) => ({
        drawNo: draw.draw_no,
        date: formatKoreanDate(draw.date),
        numbers: draw.numbers,
        bonusNo: draw.bonus_no,
      })),
    },
    target,
    tickets,
  };
}
