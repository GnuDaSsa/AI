'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

// ─── 질문 풀: [질문, 타입] ────────────────────────────────────────────────────
type QType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
type Question = { text: string; type: QType };

const QUESTIONS_POOL: Question[] = [
  // E (12)
  { text: '여럿이 모이는 자리에서 대화를 주도하는 편이다.', type: 'E' },
  { text: '새로운 사람을 만나는 것이 에너지를 준다.', type: 'E' },
  { text: '파티나 모임에 참석하면 기분이 좋아진다.', type: 'E' },
  { text: '이야기를 나누다 보면 생각이 더 잘 정리된다.', type: 'E' },
  { text: '친구가 많고 사람들과 어울리는 것이 즐겁다.', type: 'E' },
  { text: '오랜 시간 혼자 있으면 기운이 빠지는 느낌이 든다.', type: 'E' },
  { text: '모르는 사람에게 먼저 말을 거는 것이 어렵지 않다.', type: 'E' },
  { text: '여러 사람과 함께 일할 때 더 신나고 동기부여가 된다.', type: 'E' },
  { text: '내 감정이나 생각을 밖으로 표현하는 편이다.', type: 'E' },
  { text: '조용한 저녁보다 활기찬 모임이 더 좋다.', type: 'E' },
  { text: '사람들 앞에서 발표하는 게 특별히 두렵지 않다.', type: 'E' },
  { text: '여럿이 함께 노는 것을 혼자 하는 취미보다 선호한다.', type: 'E' },

  // I (12)
  { text: '혼자만의 조용한 시간이 꼭 필요하다.', type: 'I' },
  { text: '긴 모임 뒤에는 혼자 쉬면서 에너지를 충전한다.', type: 'I' },
  { text: '깊은 대화 한 번이 가벼운 수다 열 번보다 좋다.', type: 'I' },
  { text: '생각을 말로 하기 전에 머릿속으로 충분히 정리한다.', type: 'I' },
  { text: '소수의 친한 친구와 보내는 시간이 가장 편하다.', type: 'I' },
  { text: '낯선 환경에서 사람들과 어울리는 것이 피곤하다.', type: 'I' },
  { text: '조용히 혼자 책을 읽거나 취미 생활을 즐기는 편이다.', type: 'I' },
  { text: '사람들이 많은 곳에 오래 있으면 지치는 느낌이 든다.', type: 'I' },
  { text: '집이나 익숙한 공간에 있을 때 가장 편안하다.', type: 'I' },
  { text: '내면 세계가 풍부하고 혼자 상상하는 시간이 즐겁다.', type: 'I' },
  { text: '대화보다 글로 내 생각을 표현하는 것이 더 편하다.', type: 'I' },
  { text: '새로운 만남보다 기존 관계를 깊게 유지하는 것이 좋다.', type: 'I' },

  // S (12)
  { text: '사실과 구체적인 정보에 집중하는 편이다.', type: 'S' },
  { text: '과거 경험을 바탕으로 현재 상황을 판단한다.', type: 'S' },
  { text: '눈앞에 보이는 것, 만질 수 있는 것을 더 신뢰한다.', type: 'S' },
  { text: '단계적이고 순서에 따른 접근 방식을 선호한다.', type: 'S' },
  { text: '세부 사항을 꼼꼼히 챙기는 것이 중요하다고 생각한다.', type: 'S' },
  { text: '검증된 방법을 선호하고 새로운 방식에는 신중하다.', type: 'S' },
  { text: '현실적인 목표를 세우고 착실히 실행한다.', type: 'S' },
  { text: '실용적인 것이 아이디어보다 더 가치 있다고 느낀다.', type: 'S' },
  { text: '지금 이 순간의 현실에 집중하는 편이다.', type: 'S' },
  { text: '루틴과 일상의 패턴이 주는 안정감이 좋다.', type: 'S' },
  { text: '숫자와 데이터 같은 명확한 정보를 선호한다.', type: 'S' },
  { text: '이론보다 실제로 해본 경험이 중요하다고 생각한다.', type: 'S' },

  // N (12)
  { text: '상상하고 미래를 꿈꾸는 것을 좋아한다.', type: 'N' },
  { text: '패턴이나 숨은 의미를 찾는 것이 흥미롭다.', type: 'N' },
  { text: '아이디어가 넘치고 새로운 가능성을 탐색한다.', type: 'N' },
  { text: '세부 사항보다 전체적인 맥락과 큰 그림이 중요하다.', type: 'N' },
  { text: '직관적으로 상황의 본질을 파악하는 편이다.', type: 'N' },
  { text: '미래의 가능성에 더 관심이 많다.', type: 'N' },
  { text: '기존 방식을 뒤집는 혁신적인 아이디어를 즐긴다.', type: 'N' },
  { text: '비유나 은유로 개념을 설명하는 것이 자연스럽다.', type: 'N' },
  { text: '때로 현실보다 가능성에 더 흥분된다.', type: 'N' },
  { text: '복잡한 이론이나 철학적 질문이 흥미롭다.', type: 'N' },
  { text: '창의적인 문제 해결을 즐기고 독창성을 추구한다.', type: 'N' },
  { text: '표면보다 이면에 숨겨진 의미를 탐구하고 싶다.', type: 'N' },

  // T (12)
  { text: '결정할 때 논리와 이성을 중시한다.', type: 'T' },
  { text: '비판적 사고로 문제를 분석하는 것이 편하다.', type: 'T' },
  { text: '감정에 휘둘리지 않고 객관적으로 판단하려 한다.', type: 'T' },
  { text: '논쟁에서 사실과 논리로 상대를 설득하는 편이다.', type: 'T' },
  { text: '효율성과 공정성을 중요하게 생각한다.', type: 'T' },
  { text: '개인 감정보다 원칙을 우선시하는 경향이 있다.', type: 'T' },
  { text: '잘못된 정보를 보면 바로잡아 주고 싶다.', type: 'T' },
  { text: '냉정하게 사실을 전달하는 것이 친절이라고 생각한다.', type: 'T' },
  { text: '결과물의 품질이 과정에서의 감정보다 중요하다.', type: 'T' },
  { text: '문제를 해결할 때 원인 분석을 먼저 한다.', type: 'T' },
  { text: '감정적 호소보다 논리적 근거에 더 설득된다.', type: 'T' },
  { text: '공정한 규칙이 모두에게 동등하게 적용되어야 한다.', type: 'T' },

  // F (12)
  { text: '상대방의 감정에 공감하는 것이 자연스럽다.', type: 'F' },
  { text: '결정할 때 나와 주변 사람에게 미치는 영향을 고려한다.', type: 'F' },
  { text: '조화로운 관계가 논리적인 결론보다 중요할 수 있다.', type: 'F' },
  { text: '타인의 아픔을 보면 내 일처럼 마음이 쓰인다.', type: 'F' },
  { text: '칭찬을 받으면 동기부여가 크게 높아진다.', type: 'F' },
  { text: '주변 분위기와 감정에 민감하게 반응한다.', type: 'F' },
  { text: '갈등 상황에서 모두가 상처받지 않도록 노력한다.', type: 'F' },
  { text: '사람들을 돕고 지지하는 역할이 보람 있다.', type: 'F' },
  { text: '비판을 받으면 논리보다 감정적으로 먼저 반응한다.', type: 'F' },
  { text: '사람들의 마음을 헤아리고 배려하는 것이 중요하다.', type: 'F' },
  { text: '관계를 위해 때로는 내 의견을 양보할 수 있다.', type: 'F' },
  { text: '따뜻한 분위기와 정서적 연결을 소중히 여긴다.', type: 'F' },

  // J (12)
  { text: '계획을 세우고 그대로 실행할 때 만족스럽다.', type: 'J' },
  { text: '일을 미리 준비해두면 마음이 편하다.', type: 'J' },
  { text: '마감 기한을 잘 지키고 기한 전에 끝내는 편이다.', type: 'J' },
  { text: '정리된 공간과 체계적인 환경을 선호한다.', type: 'J' },
  { text: '할 일 목록을 만들고 하나씩 완료해나가는 것이 좋다.', type: 'J' },
  { text: '예상치 못한 변화가 생기면 불편하고 스트레스를 받는다.', type: 'J' },
  { text: '결정을 내린 후에는 그 선택에 확신을 갖는다.', type: 'J' },
  { text: '약속과 일정을 정확히 지키는 것을 중시한다.', type: 'J' },
  { text: '여행 전에 세부 일정을 미리 짜두는 편이다.', type: 'J' },
  { text: '일이 체계적으로 진행될 때 안심이 된다.', type: 'J' },
  { text: '목표를 설정하고 달성하는 과정이 중요하다.', type: 'J' },
  { text: '즉흥보다는 계획된 활동을 선호한다.', type: 'J' },

  // P (12)
  { text: '즉흥적으로 행동하는 것을 좋아한다.', type: 'P' },
  { text: '계획보다 상황에 따라 유연하게 대처하는 편이다.', type: 'P' },
  { text: '여러 옵션을 열어두고 가능성을 탐색하는 것이 좋다.', type: 'P' },
  { text: '갑작스러운 변화가 생겨도 쉽게 적응한다.', type: 'P' },
  { text: '마감 직전의 긴장감이 오히려 동기부여가 된다.', type: 'P' },
  { text: '결정을 서두르기보다 더 많은 정보를 기다린다.', type: 'P' },
  { text: '자유롭고 열린 방식으로 일하는 것이 편하다.', type: 'P' },
  { text: '즉흥 여행이 계획된 여행보다 설레는 경우가 많다.', type: 'P' },
  { text: '규칙보다 상황에 맞는 융통성이 더 중요하다.', type: 'P' },
  { text: '동시에 여러 일을 진행하는 멀티태스킹이 어렵지 않다.', type: 'P' },
  { text: '정해진 루틴보다 매번 다른 방식으로 하는 것이 즐겁다.', type: 'P' },
  { text: '결정이 확정되어도 더 좋은 방법이 있을까 생각한다.', type: 'P' },
];

// ─── 선택지 ───────────────────────────────────────────────────────────────────
const CHOICES = [
  { label: '매우 그렇다', value: 2 },
  { label: '그렇다', value: 1 },
  { label: '중간이다', value: 0 },
  { label: '아니다', value: -1 },
  { label: '전혀 아니다', value: -2 },
];

// ─── MBTI 정보 ────────────────────────────────────────────────────────────────
interface MbtiInfo {
  emoji: string;
  nickname: string;
  desc: string;
  celeb: string[];
  good: string[];
  bad: string[];
}

const MBTI_INFO: Record<string, MbtiInfo> = {
  INTJ: {
    emoji: '🔭',
    nickname: '전략가',
    desc: '독립적이고 전략적이며 분석적인 사고의 소유자. 장기적 비전을 가지고 체계적으로 목표를 달성한다. 높은 기준을 추구하며 비효율을 참지 못한다.',
    celeb: ['엘론 머스크', '마크 저커버그', '니체', '크리스토퍼 놀란'],
    good: ['ENFP', 'ENTP'],
    bad: ['ESFP', 'ESTP'],
  },
  INTP: {
    emoji: '🧩',
    nickname: '논리술사',
    desc: '지적 호기심이 넘치고 분석을 즐기는 이론가. 복잡한 개념을 이해하고 새로운 아이디어를 탐구하는 데 시간 가는 줄 모른다.',
    celeb: ['알베르트 아인슈타인', '빌 게이츠', '데카르트', '에이다 러브레이스'],
    good: ['ENTJ', 'ESTJ'],
    bad: ['ESFJ', 'ENFJ'],
  },
  ENTJ: {
    emoji: '👑',
    nickname: '통솔자',
    desc: '타고난 리더십으로 조직을 이끄는 지휘관. 목표 달성을 위해 과감하게 결정하고 추진력 있게 실행한다. 비효율적인 상황을 즉시 개선하려 한다.',
    celeb: ['스티브 잡스', '나폴레옹', '마거릿 대처', '고든 램지'],
    good: ['INTP', 'INFP'],
    bad: ['ISFP', 'INFP'],
  },
  ENTP: {
    emoji: '⚡',
    nickname: '변론가',
    desc: '아이디어가 넘치고 토론을 즐기는 혁신가. 기존의 틀을 깨고 새로운 가능성을 탐색하는 것을 즐긴다. 논쟁에서 지적 자극을 얻는다.',
    celeb: ['토마스 에디슨', '레오나르도 다빈치', '벤자민 프랭클린', '볼테르'],
    good: ['INFJ', 'INTJ'],
    bad: ['ISFJ', 'ISTJ'],
  },
  INFJ: {
    emoji: '🔮',
    nickname: '옹호자',
    desc: '깊은 통찰력과 따뜻한 공감 능력을 가진 이상주의자. 타인을 돕고 세상을 더 나은 곳으로 만들고자 하는 강한 사명감을 가진다.',
    celeb: ['마틴 루터 킹', '넬슨 만델라', '마더 테레사', '간디'],
    good: ['ENTP', 'ENFP'],
    bad: ['ESTP', 'ESFP'],
  },
  INFP: {
    emoji: '🌿',
    nickname: '중재자',
    desc: '이상과 가치를 중시하는 몽상적 이상주의자. 진정성 있는 관계와 자기 표현을 추구하며 창의적인 방식으로 세상과 소통한다.',
    celeb: ['조앤 롤링', '빈센트 반 고흐', '셰익스피어', '존 레논'],
    good: ['ENFJ', 'ENTJ'],
    bad: ['ESTJ', 'ESFJ'],
  },
  ENFJ: {
    emoji: '🌟',
    nickname: '선도자',
    desc: '카리스마 넘치는 공감 능력자. 타인의 잠재력을 이끌어내고 영감을 주는 데 뛰어나다. 사람들과 함께 성장하는 것에서 보람을 찾는다.',
    celeb: ['오프라 윈프리', '버락 오바마', '마틴 루터 킹 Jr.', '테일러 스위프트'],
    good: ['INFP', 'ISFP'],
    bad: ['ISTP', 'INTP'],
  },
  ENFP: {
    emoji: '🎆',
    nickname: '활동가',
    desc: '열정적이고 창의적이며 사람을 사랑하는 자유로운 영혼. 새로운 아이디어와 가능성에 늘 흥분되어 있고 주변에 활력을 불어넣는다.',
    celeb: ['유재석', '로빈 윌리엄스', '월트 디즈니', '마크 트웨인'],
    good: ['INFJ', 'INTJ'],
    bad: ['ISTJ', 'ISFJ'],
  },
  ISTJ: {
    emoji: '🏛️',
    nickname: '청렴결백한 논리주의자',
    desc: '책임감 강하고 신뢰할 수 있는 현실주의자. 규칙과 전통을 중시하며 맡은 일을 철저하게 완수한다. 안정성과 일관성을 추구한다.',
    celeb: ['조지 워싱턴', '워런 버핏', '나타샤 로마노프', '앤젤라 머켈'],
    good: ['ESTP', 'ESFP'],
    bad: ['ENFP', 'ENTP'],
  },
  ISFJ: {
    emoji: '🛡️',
    nickname: '수호자',
    desc: '헌신적이고 따뜻한 마음을 가진 보호자. 사랑하는 사람들을 지키고 돕는 데 아낌없이 헌신한다. 세심한 배려와 실용적인 지원을 잘한다.',
    celeb: ['비욘세', '케이트 미들턴', '로자 파크스', '마더 테레사'],
    good: ['ESFP', 'ESTP'],
    bad: ['ENTP', 'ENTJ'],
  },
  ESTJ: {
    emoji: '📋',
    nickname: '경영자',
    desc: '실용적이고 체계적인 사실주의자. 규칙과 질서를 중시하며 집단을 조직하고 관리하는 능력이 탁월하다. 책임감이 강하고 믿음직스럽다.',
    celeb: ['도널드 트럼프', '사라 페일린', '제임스 먼로', '엠마 왓슨'],
    good: ['ISFP', 'ISTP'],
    bad: ['INFP', 'INFJ'],
  },
  ESFJ: {
    emoji: '🤝',
    nickname: '집정관',
    desc: '사교적이고 배려심이 깊은 사람들의 친구. 주변 사람들의 필요를 먼저 살피고 따뜻한 공동체를 만들어가는 데 능하다.',
    celeb: ['테일러 스위프트', '셀레나 고메즈', '엘튼 존', '빌 클린턴'],
    good: ['ISFP', 'ISTP'],
    bad: ['INTP', 'INTJ'],
  },
  ISTP: {
    emoji: '🔧',
    nickname: '만능재주꾼',
    desc: '대담하고 실용적인 탐험가. 도구와 기계를 능숙하게 다루며 문제를 즉각적이고 효율적으로 해결한다. 차분하지만 위기 상황에서 빛난다.',
    celeb: ['클린트 이스트우드', '어니스트 헤밍웨이', '마이클 조던', '브루스 리'],
    good: ['ESTJ', 'ESFJ'],
    bad: ['ENFJ', 'ENTJ'],
  },
  ISFP: {
    emoji: '🎨',
    nickname: '모험가',
    desc: '유연하고 매력적인 예술가. 현재의 순간을 즐기며 자신만의 독특한 방식으로 세상을 경험하고 표현한다. 조용하지만 강한 자기 신념이 있다.',
    celeb: ['마이클 잭슨', '아리아나 그란데', '리오넬 메시', '오드리 헵번'],
    good: ['ESTJ', 'ESFJ'],
    bad: ['ENTJ', 'ESTJ'],
  },
  ESTP: {
    emoji: '🎯',
    nickname: '사업가',
    desc: '에너지 넘치고 행동 지향적인 실용주의자. 눈앞의 현실 문제를 빠르게 파악하고 즉각 행동한다. 위험을 즐기고 스릴을 추구한다.',
    celeb: ['도널드 트럼프', '에디 머피', '잭 니컬슨', '어니스트 헤밍웨이'],
    good: ['ISTJ', 'ISFJ'],
    bad: ['INFJ', 'INTJ'],
  },
  ESFP: {
    emoji: '🎉',
    nickname: '연예인',
    desc: '자발적이고 활기차며 사람들의 관심을 즐기는 공연자. 삶을 즐기는 방법을 알고 주변 사람들에게도 기쁨을 전파한다.',
    celeb: ['마릴린 먼로', '저스틴 비버', '킴 카다시안', '아델'],
    good: ['ISTJ', 'ISFJ'],
    bad: ['INTJ', 'INFJ'],
  },
};

// ─── 랜덤 문항 선택 유틸 ──────────────────────────────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildQuestions(): Question[] {
  const byType = (t: QType) => QUESTIONS_POOL.filter((q) => q.type === t);
  const selected: Question[] = [
    ...pickRandom(byType('E'), 6),
    ...pickRandom(byType('I'), 6),
    ...pickRandom(byType('S'), 6),
    ...pickRandom(byType('N'), 6),
    ...pickRandom(byType('T'), 6),
    ...pickRandom(byType('F'), 6),
    ...pickRandom(byType('J'), 6),
    ...pickRandom(byType('P'), 6),
  ];
  // 전체를 다시 셔플
  return selected.sort(() => Math.random() - 0.5);
}

// ─── 결과 계산 ────────────────────────────────────────────────────────────────
function calcMbti(answers: Record<number, number>, questions: Question[]): {
  mbti: string;
  pcts: Record<string, number>;
} {
  const scores: Record<QType, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  questions.forEach((q, idx) => {
    const val = answers[idx] ?? 0;
    if (val > 0) scores[q.type] += val;
    else if (val < 0) {
      // 반대 타입에 점수 부여
      const opposite: Record<QType, QType> = { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' };
      scores[opposite[q.type]] += Math.abs(val);
    }
  });

  const dim = (a: QType, b: QType): [string, number] => {
    const total = scores[a] + scores[b] || 1;
    const pctA = Math.round((scores[a] / total) * 100);
    return [scores[a] >= scores[b] ? a : b, pctA];
  };

  const [ei, eiPct] = dim('E', 'I');
  const [sn, snPct] = dim('S', 'N');
  const [tf, tfPct] = dim('T', 'F');
  const [jp, jpPct] = dim('J', 'P');

  const mbti = `${ei}${sn}${tf}${jp}`;
  const pcts: Record<string, number> = {
    E: ei === 'E' ? eiPct : 100 - eiPct,
    I: ei === 'I' ? eiPct : 100 - eiPct,
    S: sn === 'S' ? snPct : 100 - snPct,
    N: sn === 'N' ? snPct : 100 - snPct,
    T: tf === 'T' ? tfPct : 100 - tfPct,
    F: tf === 'F' ? tfPct : 100 - tfPct,
    J: jp === 'J' ? jpPct : 100 - jpPct,
    P: jp === 'P' ? jpPct : 100 - jpPct,
  };

  return { mbti, pcts };
}

function DimBar({ labelA, labelB, pctA }: { labelA: string; labelB: string; pctA: number }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: '#75e8ff', fontWeight: 700 }}>{labelA} {pctA}%</span>
        <span style={{ color: '#98a4b7', fontWeight: 700 }}>{labelB} {100 - pctA}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${pctA}%` }}
        />
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function MbtiPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ mbti: string; pcts: Record<string, number> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const info = result ? MBTI_INFO[result.mbti] : null;

  function startQuiz() {
    const qs = buildQuestions();
    setQuestions(qs);
    setCurrent(0);
    setAnswers({});
    setResult(null);
    setSaved(false);
    setPhase('quiz');
  }

  function selectAnswer(val: number) {
    const next = { ...answers, [current]: val };
    setAnswers(next);

    if (current < questions.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 220);
    } else {
      // 마지막 문항 응답 후 결과 계산
      const res = calcMbti(next, questions);
      setResult(res);
      setPhase('result');
      saveResult(res);
    }
  }

  async function saveResult(res: { mbti: string; pcts: Record<string, number> }) {
    setSaving(true);
    try {
      await fetch('/api/mbti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(res),
      });
      setSaved(true);
    } catch {
      // 저장 실패 무시
    } finally {
      setSaving(false);
    }
  }

  const progress = questions.length ? Math.round((current / questions.length) * 100) : 0;
  const currentAnswer = answers[current];

  // ── 인트로 화면 ─────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <ToolShell
        eyebrow="Diagnostic Tool"
        title="MBTI 검사기"
        description="48개 질문으로 에너지 방향, 인식 방식, 판단 기준, 생활 리듬을 나눠서 봅니다. 결과만 화려한 테스트가 아니라, 답변 흐름과 차원별 비율을 함께 읽게 설계했습니다."
        badges={['48 Questions', 'Randomized Set', 'Dimension Breakdown']}
        meta={[
          { label: 'Duration', value: '약 5~8분' },
          { label: 'Method', value: '5단계 응답 · 4가지 차원 측정' },
          { label: 'Output', value: '유형 결과 + 차원별 비율' },
        ]}
        main={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>검사 시작 전</h2>
                  <p className={styles.sectionDescription}>
                    정답을 고르는 검사가 아니라, 평소 반응에 가까운 선택을 빠르게 고르는 편이 더 정확합니다.
                  </p>
                </div>
              </div>
              <div className={styles.splitCard}>
                {[
                  '총 48문항, 각 5단계 응답으로 진행됩니다.',
                  'E/I · S/N · T/F · J/P 네 가지 축을 함께 계산합니다.',
                  '문항 구성은 매번 랜덤으로 섞여 반복 검사 체감이 덜합니다.',
                ].map((item) => (
                  <div className={styles.splitItem} key={item}>
                    {item}
                  </div>
                ))}
              </div>
              <div className={styles.actions}>
                <button className={styles.buttonPrimary} onClick={startQuiz}>
                  검사 시작하기
                </button>
              </div>
            </section>
          </div>
        }
        side={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>이런 분께 맞습니다</h2>
                  <p className={styles.sectionDescription}>가벼운 유입용 카드보다 결과 해석까지 보려는 사용자에게 맞춰져 있습니다.</p>
                </div>
              </div>
              <div className={styles.splitCard}>
                {['팀 소개용 프로필 작성', '자기 이해용 기록', '친구와 결과 비교'].map((item) => (
                  <div className={styles.splitItem} key={item}>{item}</div>
                ))}
              </div>
            </section>
          </div>
        }
      />
    );
  }

  // ── 퀴즈 화면 ───────────────────────────────────────────────────
  if (phase === 'quiz') {
    return (
      <ToolShell
        eyebrow="Diagnostic Tool"
        title={`MBTI 검사 ${current + 1}/${questions.length}`}
        description="응답 리듬이 끊기지 않도록 질문과 선택지만 크게 보이게 정리했습니다."
        badges={['Live Session', 'Single Question Focus']}
        meta={[
          { label: 'Progress', value: `${progress}% 완료` },
          { label: 'Current axis', value: questions[current]?.type || '-' },
          { label: 'Guide', value: '가장 가까운 반응을 고르세요' },
        ]}
        main={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>질문</h2>
                <p className={styles.sectionDescription}>{questions[current]?.text}</p>
              </div>
            </div>

            <div className={styles.progressTrack} style={{ marginBottom: 18 }}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.stack}>
              {CHOICES.map((choice) => (
                <button
                  className={`${styles.optionButton} ${currentAnswer === choice.value ? styles.optionButtonSelected : ''}`}
                  key={choice.value}
                  onClick={() => selectAnswer(choice.value)}
                >
                  <span style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span>{choice.label}</span>
                    <span style={{ color: currentAnswer === choice.value ? '#75e8ff' : '#667386', fontSize: 12, fontFamily: 'monospace' }}>
                      select
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              {current > 0 ? (
                <button className={styles.buttonSecondary} onClick={() => setCurrent((c) => c - 1)}>
                  이전
                </button>
              ) : null}
              {current < questions.length - 1 && currentAnswer !== undefined ? (
                <button className={styles.buttonGhost} onClick={() => setCurrent((c) => c + 1)}>
                  다음 질문
                </button>
              ) : null}
            </div>
          </section>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>응답 팁</h2>
                <p className={styles.sectionDescription}>너무 오래 고민하지 않아야 자연스러운 프로필이 나옵니다.</p>
              </div>
            </div>
            <div className={styles.splitCard}>
              {[
                '이상적인 나보다 평소 반응에 가까운 쪽을 고르세요.',
                '중간값을 남발하기보다 약간 기운 선택이 더 해석하기 쉽습니다.',
                '진행률은 자동 저장되지 않으니 한 번에 끝내는 게 좋습니다.',
              ].map((item) => (
                <div className={styles.splitItem} key={item}>{item}</div>
              ))}
            </div>
          </section>
        }
      />
    );
  }

  // ── 결과 화면 ───────────────────────────────────────────────────
  if (phase === 'result' && result && info) {
    return (
      <ToolShell
        eyebrow="Diagnostic Result"
        title={result.mbti}
        description={info.desc}
        badges={[info.nickname, saving ? 'Saving...' : saved ? 'Saved' : 'Result Ready']}
        meta={[
          { label: 'Compatible', value: info.good.join(', ') },
          { label: 'Challenging', value: info.bad.join(', ') },
          { label: 'Celebrity', value: info.celeb.slice(0, 2).join(', ') },
        ]}
        main={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>차원별 비율</h2>
                  <p className={styles.sectionDescription}>결과를 하나의 라벨이 아니라 비율로 읽을 수 있게 구성했습니다.</p>
                </div>
              </div>
              <DimBar labelA="E 외향" labelB="I 내향" pctA={result.pcts.E} />
              <DimBar labelA="S 감각" labelB="N 직관" pctA={result.pcts.S} />
              <DimBar labelA="T 사고" labelB="F 감정" pctA={result.pcts.T} />
              <DimBar labelA="J 판단" labelB="P 인식" pctA={result.pcts.J} />
            </section>

            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>유형 해석</h2>
                  <p className={styles.sectionDescription}>별명, 유명인, 관계 궁합을 한눈에 확인합니다.</p>
                </div>
              </div>
              <div className={styles.splitCard}>
                <div className={styles.splitItem}>
                  <strong>같은 유형 유명인</strong>
                  <p className={styles.sectionDescription} style={{ marginTop: 8 }}>{info.celeb.join(' · ')}</p>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.splitItem}>
                    <strong>잘 맞는 유형</strong>
                    <p className={styles.sectionDescription} style={{ marginTop: 8 }}>{info.good.join(', ')}</p>
                  </div>
                  <div className={styles.splitItem}>
                    <strong>안 맞는 유형</strong>
                    <p className={styles.sectionDescription} style={{ marginTop: 8 }}>{info.bad.join(', ')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        }
        side={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>다시 검사</h2>
                <p className={styles.sectionDescription}>질문 셋이 랜덤이라, 시간 차이를 두고 다시 해보면 편차를 비교할 수 있습니다.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={startQuiz}>
                다시 검사하기
              </button>
            </div>
          </section>
        }
      />
    );
  }

  return null;
}
