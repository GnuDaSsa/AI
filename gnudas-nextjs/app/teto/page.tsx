'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

type ResultKey = 'teto_male' | 'teto_female' | 'egen_male' | 'egen_female';

type TetoQuestion = {
  question: string;
  options: [
    { label: string; drive: number; tone: number },
    { label: string; drive: number; tone: number },
  ];
};

const QUESTIONS: TetoQuestion[] = [
  {
    question: '호감이 생기면 어느 쪽이 더 자연스럽다?',
    options: [
      { label: '내가 먼저 흐름을 만들고 반응을 확인한다', drive: 2, tone: 1 },
      { label: '분위기를 보면서 천천히 간격을 줄인다', drive: -2, tone: -1 },
    ],
  },
  {
    question: '썸에서 자주 나오는 내 텐션은?',
    options: [
      { label: '답답하면 바로 표현하고 정리하는 편이다', drive: 2, tone: 1 },
      { label: '은근한 여지와 감정선을 오래 가져가는 편이다', drive: -2, tone: -1 },
    ],
  },
  {
    question: '연락할 때 더 가까운 모습은?',
    options: [
      { label: '생각나면 바로 보내고 템포도 빠르다', drive: 2, tone: 0 },
      { label: '문장과 타이밍을 다듬어서 보낸다', drive: -1, tone: -1 },
    ],
  },
  {
    question: '모임에서 내 존재감은 보통 어떻게 읽히나?',
    options: [
      { label: '시원시원하고 눈에 띄는 쪽', drive: 1, tone: 2 },
      { label: '부드럽고 정돈된 쪽', drive: -1, tone: -2 },
    ],
  },
  {
    question: '칭찬받을 때 더 끌리는 방식은?',
    options: [
      { label: '대놓고 선명하게 표현해 주는 것', drive: 1, tone: 1 },
      { label: '은근하고 다정하게 알아봐 주는 것', drive: -1, tone: -2 },
    ],
  },
  {
    question: '스타일 무드는 어디에 더 가깝나?',
    options: [
      { label: '또렷하고 힘 있는 인상', drive: 0, tone: 2 },
      { label: '부드럽고 결이 정돈된 인상', drive: 0, tone: -2 },
    ],
  },
  {
    question: '갈등이 생기면 나는...',
    options: [
      { label: '불편해도 빨리 꺼내서 정리하려 한다', drive: 2, tone: 1 },
      { label: '조금 더 보고 감정을 정리한 뒤 말한다', drive: -2, tone: -1 },
    ],
  },
  {
    question: '좋아하는 사람 앞에서 내 신호는...',
    options: [
      { label: '티가 꽤 나는 편이고 액션도 빠르다', drive: 2, tone: 1 },
      { label: '티는 덜 나도 오래 보고 스며드는 편이다', drive: -2, tone: -1 },
    ],
  },
  {
    question: '데이트를 잡을 때 보통 나는...',
    options: [
      { label: '장소와 흐름을 먼저 제안하는 편이다', drive: 2, tone: 1 },
      { label: '상대 제안을 보고 결을 맞춰가는 편이다', drive: -2, tone: -1 },
    ],
  },
  {
    question: '첫인상으로 자주 듣는 말은?',
    options: [
      { label: '단단하고 당당해 보인다', drive: 0, tone: 2 },
      { label: '차분하고 섬세해 보인다', drive: 0, tone: -2 },
    ],
  },
  {
    question: '관계에서 더 중요하게 보는 것은?',
    options: [
      { label: '확실한 표현과 분명한 액션', drive: 2, tone: 1 },
      { label: '정서적 안정감과 세심한 배려', drive: -2, tone: -1 },
    ],
  },
  {
    question: '내 매력이 가장 잘 살아나는 순간은?',
    options: [
      { label: '주도적으로 분위기를 끌고 갈 때', drive: 2, tone: 2 },
      { label: '섬세하게 공기와 감정을 읽어줄 때', drive: -2, tone: -2 },
    ],
  },
];

interface ResultInfo {
  label: string;
  emoji: string;
  desc: string;
  traits: string[];
  tip: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
}

const RESULTS: Record<ResultKey, ResultInfo> = {
  teto_male: {
    label: '테토남',
    emoji: '🔥',
    desc: '주도성, 직진력, 존재감이 전면에 드러나는 타입입니다. 관계의 흐름을 먼저 만들고, 시원한 액션으로 긴장을 끌고 가는 쪽에 가깝습니다.',
    traits: ['직진형 반응', '분명한 액션', '또렷한 존재감', '리드 성향', '선명한 호감 표현'],
    tip: '속도와 밀도가 강한 편이라 상대 템포를 한 박자 읽어주면 훨씬 매력적으로 오래 갑니다.',
    accent: '#75e8ff',
    accentSoft: 'rgba(117,232,255,0.10)',
    accentBorder: 'rgba(117,232,255,0.28)',
  },
  teto_female: {
    label: '테토녀',
    emoji: '⚡',
    desc: '직진성과 밝은 에너지가 있으면서도 표현 결은 더 세련되고 감각적인 타입입니다. 끌리면 먼저 보여주되, 무드와 스타일의 존재감이 함께 살아납니다.',
    traits: ['밝은 리액션', '선명한 무드', '감각적 존재감', '직진형 호감 표현', '또렷한 스타일'],
    tip: '선명한 인상이 강점이라 디테일한 배려가 보이는 순간을 같이 만들면 밸런스가 더 좋아집니다.',
    accent: '#c7b6ff',
    accentSoft: 'rgba(199,182,255,0.12)',
    accentBorder: 'rgba(199,182,255,0.28)',
  },
  egen_male: {
    label: '에겐남',
    emoji: '🌙',
    desc: '차분함과 안정감이 먼저 읽히는 타입입니다. 속도를 무리하게 당기지 않고 분위기를 보고 움직이며, 신뢰를 쌓아가며 매력을 보여주는 결이 강합니다.',
    traits: ['잔잔한 배려', '신중한 접근', '안정적 텐션', '관찰 후 반응', '편안한 무드'],
    tip: '좋은 인상을 오래 주는 타입이라도 중요한 타이밍에는 호감 신호를 더 또렷하게 주는 편이 좋습니다.',
    accent: '#6366f1',
    accentSoft: 'rgba(99,102,241,0.12)',
    accentBorder: 'rgba(99,102,241,0.28)',
  },
  egen_female: {
    label: '에겐녀',
    emoji: '🫧',
    desc: '부드럽고 섬세한 결이 매력의 중심인 타입입니다. 표정, 말투, 정서적 거리 조절에서 힘이 드러나며, 누구든 충분히 이 결과가 나올 수 있는 감성형 아키타입입니다.',
    traits: ['섬세한 감정선', '부드러운 무드', '정돈된 표현', '은근한 텐션', '스며드는 매력'],
    tip: '조심스러움이 길어지면 신호가 약하게 읽힐 수 있으니, 결정적 순간에는 분명한 표현을 얹어주는 편이 좋습니다.',
    accent: '#14b8a6',
    accentSoft: 'rgba(20,184,166,0.12)',
    accentBorder: 'rgba(20,184,166,0.28)',
  },
};

function resolveResultKey(driveScore: number, toneScore: number): ResultKey {
  if (driveScore >= 0 && toneScore >= 0) return 'teto_male';
  if (driveScore >= 0 && toneScore < 0) return 'teto_female';
  if (driveScore < 0 && toneScore >= 0) return 'egen_male';
  return 'egen_female';
}

function OptionButton({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.optionButton} ${selected ? styles.optionButtonSelected : ''}`}
    >
      {text}
    </button>
  );
}

export default function TetoPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [current, setCurrent] = useState(0);
  const [resultKey, setResultKey] = useState<ResultKey | null>(null);
  const [driveScore, setDriveScore] = useState(0);
  const [toneScore, setToneScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startQuiz() {
    setAnswers(Array.from({ length: QUESTIONS.length }, () => null));
    setCurrent(0);
    setResultKey(null);
    setSaved(false);
    setPhase('quiz');
  }

  function handleSelect(questionIndex: number, optionIndex: number) {
    const nextAnswers = answers.map((value, index) => (index === questionIndex ? optionIndex : value));
    setAnswers(nextAnswers);

    if (questionIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent((prev) => prev + 1), 180);
      return;
    }

    handleSubmitQuiz(nextAnswers as number[]);
  }

  function handleSubmitQuiz(resolvedAnswers?: number[]) {
    const nextAnswers = resolvedAnswers ?? (answers as number[]);
    if (nextAnswers.some((answer) => answer === null)) {
      return;
    }

    const nextDrive = nextAnswers.reduce(
      (sum, optionIndex, questionIndex) => sum + QUESTIONS[questionIndex].options[optionIndex].drive,
      0,
    );
    const nextTone = nextAnswers.reduce(
      (sum, optionIndex, questionIndex) => sum + QUESTIONS[questionIndex].options[optionIndex].tone,
      0,
    );
    const key = resolveResultKey(nextDrive, nextTone);

    setDriveScore(nextDrive);
    setToneScore(nextTone);
    setResultKey(key);
    setPhase('result');
    saveResult(key, nextDrive, nextTone);
  }

  async function saveResult(key: ResultKey, nextDrive: number, nextTone: number) {
    setSaving(true);
    try {
      await fetch('/api/teto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: key,
          driveScore: nextDrive,
          toneScore: nextTone,
          answerCount: QUESTIONS.length,
        }),
      });
      setSaved(true);
    } catch {
      // 저장 실패는 무시
    } finally {
      setSaving(false);
    }
  }

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = Math.round((current / QUESTIONS.length) * 100);
  const result = resultKey ? RESULTS[resultKey] : null;
  const drivePct = Math.round(((driveScore + QUESTIONS.length * 2) / (QUESTIONS.length * 4)) * 100);
  const tonePct = Math.round(((toneScore + QUESTIONS.length * 2) / (QUESTIONS.length * 4)) * 100);

  if (phase === 'intro') {
    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title="테토에겐 테스트"
        description=""
        main={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>설문 방식</h2>
                  <p className={styles.sectionDescription}>
                    성별을 먼저 고르는 구조를 버리고, 행동의 추진력과 분위기 결을 따로 봅니다. 그래서 남성도 충분히 에겐녀 결과가 나올 수 있고, 반대로 여성도 테토남 결이 나올 수 있습니다.
                  </p>
                </div>
              </div>

              <div className={styles.splitCard}>
                {[
                  '축 1: 내가 관계를 먼저 끌고 가는지, 천천히 읽는지',
                  '축 2: 존재감이 단단한지, 결이 부드럽고 섬세한지',
                  '결과는 생물학적 성별이 아니라 분위기 아키타입으로 계산',
                ].map((item) => (
                  <div className={styles.splitItem} key={item}>{item}</div>
                ))}
              </div>

              <div className={styles.actions}>
                <button className={styles.buttonPrimary} onClick={startQuiz}>
                  테스트 시작하기
                </button>
              </div>
            </section>
          </div>
        }
      />
    );
  }

  if (phase === 'quiz') {
    const currentAnswer = answers[current];
    const question = QUESTIONS[current];

    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title={`테토에겐 테스트 ${current + 1}/${QUESTIONS.length}`}
        description=""
        main={
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>질문</h2>
                <p className={styles.sectionDescription}>
                  되고 싶은 캐릭터보다 실제로 반복해서 나오는 반응 쪽을 고르는 편이 더 정확합니다.
                </p>
              </div>
              <span className={styles.pill}>{current + 1}/{QUESTIONS.length}</span>
            </div>

            <div className={styles.progressTrack} style={{ marginBottom: 18 }}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <article className={styles.splitItem} style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7f8da1' }}>
                  Q{current + 1}
                </div>
                <p className={styles.sectionDescription} style={{ marginTop: 10, color: '#eef2f7', fontSize: 18, fontWeight: 700, maxWidth: 'none' }}>
                  {question.question}
                </p>
              </div>

              <div className={styles.stack}>
                <OptionButton
                  text={question.options[0].label}
                  selected={currentAnswer === 0}
                  onClick={() => handleSelect(current, 0)}
                />
                <OptionButton
                  text={question.options[1].label}
                  selected={currentAnswer === 1}
                  onClick={() => handleSelect(current, 1)}
                />
              </div>
            </article>

            <div className={styles.actions}>
              {current > 0 ? (
                <button className={styles.buttonSecondary} onClick={() => setCurrent((prev) => prev - 1)}>
                  이전
                </button>
              ) : null}
            </div>
          </section>
        }
      />
    );
  }

  if (phase === 'result' && result && resultKey) {
    return (
      <ToolShell
        eyebrow="Personality Snapshot"
        title={result.label}
        description=""
        main={
          <div className={styles.stack}>
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>결과 해석</h2>
                  <p className={styles.sectionDescription}>
                    이 결과는 성별 선택지가 아니라, 응답에서 읽힌 분위기 아키타입입니다.
                  </p>
                </div>
                <span className={styles.pill}>{saving ? '저장 중' : saved ? '저장됨' : '결과 준비됨'}</span>
              </div>

              <div style={{ marginBottom: 10, color: result.accent, fontWeight: 700, fontSize: 18 }}>
                {result.emoji} {result.label}
              </div>
              <p className={styles.resultPanel} style={{ margin: 0 }}>{result.desc}</p>
            </section>

            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>축별 분포</h2>
                  <p className={styles.sectionDescription}>
                    추진력 축과 분위기 축을 따로 봐서 네 가지 결과로 나눴습니다.
                  </p>
                </div>
              </div>

              <div className={styles.splitCard}>
                <div className={styles.splitItem}>
                  <strong style={{ color: '#eef2f7' }}>추진력 축</strong>
                  <div className={styles.progressTrack} style={{ marginTop: 12 }}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${drivePct}%`, background: `linear-gradient(90deg, ${result.accent}, #f2f4f8)` }}
                    />
                  </div>
                  <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                    {driveScore >= 0 ? '테토 쪽으로 더 기울어 있음' : '에겐 쪽으로 더 기울어 있음'}
                  </p>
                </div>

                <div className={styles.splitItem}>
                  <strong style={{ color: '#eef2f7' }}>분위기 축</strong>
                  <div className={styles.progressTrack} style={{ marginTop: 12 }}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${tonePct}%`, background: 'linear-gradient(90deg, #6b7280, #eef2f7)' }}
                    />
                  </div>
                  <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                    {toneScore >= 0 ? '남 코드 쪽 존재감이 더 강함' : '녀 코드 쪽 결이 더 강함'}
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>핵심 특성</h2>
                  <p className={styles.sectionDescription}>
                    응답에서 반복적으로 읽힌 결만 남겼습니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.traits.map((trait) => (
                  <span className={styles.pill} key={trait}>{trait}</span>
                ))}
              </div>

              <div
                className={styles.splitItem}
                style={{ marginTop: 16, borderColor: result.accentBorder, background: result.accentSoft, padding: '18px 18px' }}
              >
                <strong style={{ color: result.accent }}>관계 팁</strong>
                <p className={styles.sectionDescription} style={{ marginTop: 8, color: '#d5dce7', maxWidth: 'none' }}>
                  {result.tip}
                </p>
              </div>

              <div className={styles.actions}>
                <button className={styles.buttonPrimary} onClick={() => setPhase('intro')}>
                  다시 테스트하기
                </button>
              </div>
            </section>
          </div>
        }
      />
    );
  }

  return null;
}
