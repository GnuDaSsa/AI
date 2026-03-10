'use client';

import { FormEvent, useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

type ApiResponse = {
  profile: {
    name: string;
    birthDate: string;
    birthTime: string;
    pillars: { label: string; text: string; elements: string[] }[];
    dominantElement: { label: string; description: string };
    supportElement: { label: string; description: string };
    cautiousElement: { label: string; description: string };
    summary: string;
    disclaimer: string;
    connectionGuide: {
      rule: string;
      dominantNumbers: number[];
      supportNumbers: number[];
      cautiousNumbers: number[];
      summary: string;
    };
  };
  history: {
    source: string;
    drawCount: number;
    latestDrawNo: number;
    latestDrawDate: string;
    hotNumbers: number[];
    coldNumbers: number[];
    recentDraws: { drawNo: number; date: string; numbers: number[]; bonusNo: number }[];
  };
  target: {
    drawNo: number;
    dateLabel: string;
  };
  tickets: {
    numbers: number[];
    angle: string;
    emphasis: string;
    reasons: { number: number; elementLabel: string; why: string }[];
  }[];
};

const INITIAL_FORM = {
  name: '',
  birthDateText: '',
  birthTimeText: '12:00',
  birthMeridiem: 'PM' as 'AM' | 'PM',
  ticketCount: '5',
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatDateInput(value: string) {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function formatTimeInput(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function to24HourTime(timeText: string, meridiem: 'AM' | 'PM') {
  const matched = timeText.match(/^(\d{1,2}):(\d{2})$/);
  if (!matched) {
    return null;
  }

  const hour12 = Number(matched[1]);
  const minute = Number(matched[2]);
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) {
    return null;
  }

  let hour24 = hour12 % 12;
  if (meridiem === 'PM') {
    hour24 += 12;
  }

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function NumberBall({ num, accent = false }: { num: number; accent?: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 15,
        color: accent ? '#fff' : '#0f2240',
        background: accent
          ? 'linear-gradient(135deg, #1d4ed8, #7c3aed)'
          : 'linear-gradient(135deg, #fff, #dbeafe)',
        border: accent ? '1px solid rgba(59,130,246,0.36)' : '1px solid rgba(59,130,246,0.18)',
        boxShadow: accent
          ? '0 10px 24px rgba(59,130,246,0.24)'
          : '0 8px 18px rgba(15, 35, 70, 0.08)',
      }}
    >
      {num}
    </span>
  );
}

export default function LottoSajuPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const birthDate = formatDateInput(form.birthDateText);
    const birthTime = to24HourTime(form.birthTimeText, form.birthMeridiem);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError('생년월일을 8자리로 입력해 주세요. 예: 19990421');
      return;
    }

    if (!birthTime) {
      setError('출생 시간은 오전/오후와 함께 hh:mm 형식으로 입력해 주세요. 예: 오전 09:30');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lotto-saju', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          birthDate,
          birthTime,
          ticketCount: Number(form.ticketCount),
        }),
      });

      const data = (await response.json()) as ApiResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || '번호를 생성하지 못했습니다.');
      }

      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '요청 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      eyebrow="Fun Lab"
      title="사주 로또 추출기"
      description="양력 생년월일과 시간을 기준으로 간지·오행 흐름을 가볍게 추정하고, 최근 로또 회차 기록의 빈도/냉각 구간을 합쳐 이번 주용 번호 세트를 뽑아주는 엔터테인먼트 실험입니다."
      badges={['사주명리 모티프', '최근 회차 히스토리 반영', '이번 주 추천 세트']}
      meta={[
        { label: 'Target', value: result ? `${result.target.drawNo}회 · ${result.target.dateLabel}` : '입력 후 계산' },
        { label: 'History', value: result ? `${result.history.drawCount.toLocaleString()}개 회차 분석` : '외부 히스토리 로드 대기' },
        { label: 'Mode', value: 'For Fun / Entertainment' },
      ]}
      main={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>사주 정보 입력</h2>
                <p className={styles.sectionDescription}>
                  음력 변환 없이 양력 기준으로 빠르게 계산합니다. 시간 미상인 경우 정오 기준으로 계산됩니다.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.grid2}>
                <label>
                  <span className={styles.label}>이름 또는 별칭</span>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="예: 동주"
                  />
                </label>

                <label>
                  <span className={styles.label}>추천 세트 수</span>
                  <select
                    className={styles.select}
                    value={form.ticketCount}
                    onChange={(event) => setForm((prev) => ({ ...prev, ticketCount: event.target.value }))}
                  >
                    {[3, 4, 5, 6, 7].map((count) => (
                      <option key={count} value={count}>
                        {count}세트
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className={styles.label}>생년월일</span>
                  <input
                    required
                    inputMode="numeric"
                    className={styles.input}
                    value={form.birthDateText}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, birthDateText: formatDateInput(event.target.value) }))
                    }
                    placeholder="1999-04-21 또는 19990421"
                  />
                </label>

                <label>
                  <span className={styles.label}>출생 시간</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', gap: 10 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                      }}
                    >
                      {(['AM', 'PM'] as const).map((meridiem) => {
                        const active = form.birthMeridiem === meridiem;
                        return (
                          <button
                            key={meridiem}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, birthMeridiem: meridiem }))}
                            style={{
                              borderRadius: 16,
                              border: active
                                ? '1px solid rgba(37,99,235,0.5)'
                                : '1px solid rgba(88,112,145,0.18)',
                              background: active
                                ? 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))'
                                : 'rgba(255,255,255,0.88)',
                              color: active ? '#1d4ed8' : '#475569',
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {meridiem === 'AM' ? '오전' : '오후'}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      inputMode="numeric"
                      className={styles.input}
                      value={form.birthTimeText}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, birthTimeText: formatTimeInput(event.target.value) }))
                      }
                      placeholder="09:30 또는 0930"
                    />
                  </div>
                </label>
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: 'none',
                    borderRadius: 18,
                    padding: '13px 18px',
                    background: 'linear-gradient(135deg, #0f172a, #2563eb)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                  }}
                >
                  {loading ? '계산 중...' : '이번 주 번호 뽑기'}
                </button>
              </div>

              {error ? (
                <p style={{ marginTop: 14, color: '#b91c1c', fontSize: 14 }}>
                  {error}
                </p>
              ) : null}
            </form>
          </section>

          {result ? (
            <>
              <section className={styles.surface}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>사주 해석 요약</h2>
                    <p className={styles.sectionDescription}>{result.profile.summary}</p>
                  </div>
                </div>

                <div className={styles.grid3}>
                  {[
                    ['주요 오행', `${result.profile.dominantElement.label} · ${result.profile.dominantElement.description}`],
                    ['보조 오행', `${result.profile.supportElement.label} · ${result.profile.supportElement.description}`],
                    ['주의 오행', `${result.profile.cautiousElement.label} · ${result.profile.cautiousElement.description}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        borderRadius: 22,
                        padding: 18,
                        background: 'linear-gradient(180deg, rgba(10,23,55,0.96), rgba(31,41,87,0.92))',
                        color: '#eef4ff',
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93c5fd' }}>
                        {label}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {result.profile.pillars.map((pillar) => (
                    <div
                      key={pillar.label}
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: '1px solid rgba(59,130,246,0.14)',
                        background: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {pillar.label}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>{pillar.text}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#475569' }}>{pillar.elements.join(' / ')}</div>
                    </div>
                  ))}
                </div>

                <p style={{ marginTop: 16, color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>
                  {result.profile.disclaimer}
                </p>
              </section>

              <section className={styles.surface}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>사주와 숫자 연결 해설</h2>
                    <p className={styles.sectionDescription}>{result.profile.connectionGuide.summary}</p>
                  </div>
                </div>

                <div
                  style={{
                    padding: 18,
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(59,130,246,0.12)',
                    color: '#334155',
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  {result.profile.connectionGuide.rule}
                </div>

                <div className={styles.grid3} style={{ marginTop: 16 }}>
                  {[
                    ['주요 오행 숫자군', result.profile.connectionGuide.dominantNumbers],
                    ['보조 오행 숫자군', result.profile.connectionGuide.supportNumbers],
                    ['주의 오행 숫자군', result.profile.connectionGuide.cautiousNumbers],
                  ].map(([label, values]) => (
                    <div
                      key={String(label)}
                      style={{
                        borderRadius: 20,
                        padding: 18,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(239,246,255,0.76))',
                        border: '1px solid rgba(59,130,246,0.12)',
                      }}
                    >
                      <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
                        {label}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        {(values as number[]).map((num) => (
                          <NumberBall key={`${label}-${num}`} num={num} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.surface}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>이번 주 추천 번호</h2>
                    <p className={styles.sectionDescription}>
                      {result.target.drawNo}회차 ({result.target.dateLabel}) 기준으로 생성된 조합입니다.
                    </p>
                  </div>
                </div>

                <div className={styles.stack}>
                  {result.tickets.map((ticket, index) => (
                    <article
                      key={ticket.numbers.join('-')}
                      style={{
                        borderRadius: 24,
                        padding: 20,
                        background: index % 2 === 0
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(219,234,254,0.76))'
                          : 'linear-gradient(135deg, rgba(239,246,255,0.96), rgba(224,231,255,0.78))',
                        border: '1px solid rgba(59,130,246,0.14)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
                            Set {index + 1}
                          </div>
                          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{ticket.angle}</div>
                        </div>
                        <div style={{ fontSize: 13, color: '#475569' }}>{ticket.emphasis}</div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                        {ticket.numbers.map((num) => (
                          <NumberBall key={num} num={num} />
                        ))}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: 10,
                          marginTop: 16,
                        }}
                      >
                        {ticket.reasons.map((reason) => (
                          <div
                            key={`${ticket.numbers.join('-')}-${reason.number}`}
                            style={{
                              padding: 12,
                              borderRadius: 16,
                              background: 'rgba(255,255,255,0.68)',
                              border: '1px solid rgba(59,130,246,0.1)',
                            }}
                          >
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>
                              {reason.number} · {reason.elementLabel}
                            </div>
                            <div style={{ marginTop: 4, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                              {reason.why}
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>결과 미리보기</h2>
                  <p className={styles.sectionDescription}>
                    계산을 실행하면 사주 요약, 최근 회차 히스토리, 추천 번호 세트가 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      }
      side={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>참고 방식</h2>
                <p className={styles.sectionDescription}>
                  사주 모티프와 회차 기록을 함께 섞어 가중치를 만듭니다.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                '생년월일/시간으로 연·월·일·시의 간지와 오행 성향을 추정',
                '최근 12회와 52회 번호 빈도를 동시에 반영',
                '오랫동안 안 나온 냉번호에 약한 반등 가중치 부여',
                '합계, 홀짝, 연속수 편중을 피하도록 조합 필터링',
              ].map((line) => (
                <div
                  key={line}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.76)',
                    color: '#334155',
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>최근 회차</h2>
                <p className={styles.sectionDescription}>
                  {result
                    ? `${result.history.latestDrawNo}회차까지 반영`
                    : '생성 후 최근 회차 8개가 노출됩니다.'}
                </p>
              </div>
            </div>

            {result ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))',
                    color: '#eff6ff',
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93c5fd' }}>
                    Hot Numbers
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {result.history.hotNumbers.map((num) => (
                      <NumberBall key={`hot-${num}`} num={num} accent />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
                    Cold Numbers
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {result.history.coldNumbers.map((num) => (
                      <NumberBall key={`cold-${num}`} num={num} />
                    ))}
                  </div>
                </div>

                {result.history.recentDraws.map((draw) => (
                  <div
                    key={draw.drawNo}
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      border: '1px solid rgba(59,130,246,0.12)',
                      background: 'rgba(255,255,255,0.76)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: '#64748b' }}>
                      <span>{draw.drawNo}회</span>
                      <span>{draw.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {draw.numbers.map((num) => (
                        <NumberBall key={`${draw.drawNo}-${num}`} num={num} />
                      ))}
                      <NumberBall num={draw.bonusNo} accent />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      }
    />
  );
}
