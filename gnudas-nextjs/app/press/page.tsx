'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

export default function PressPage() {
  const [form, setForm] = useState({ 담당부서: '', 소감주체: '', 담당자: '', 연락처: '', 내용: '' });
  const [result, setResult] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (!form.담당부서 || !form.내용 || !form.담당자 || !form.연락처) {
      alert('담당부서, 담당자, 연락처, 핵심 내용을 먼저 입력해 주세요.');
      return;
    }

    setLoading(true);
    setResult('');
    setTitles([]);
    setError('');

    try {
      const res = await fetch('/api/press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '초안을 생성하지 못했습니다.');
        return;
      }

      const full = data.text || '';
      setResult(full);

      const titleMatches = full.match(/'([^']+)'/g);
      if (titleMatches) {
        setTitles(titleMatches.slice(0, 5).map((title: string) => title.replace(/'/g, '')));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      eyebrow="Public Writing Tool"
      title="보도자료 생성기"
      description="사실관계와 전달 구조를 먼저 잡는 실무형 보도자료 초안 도구입니다. 담당 정보와 핵심 문장을 입력하면 제목 후보와 본문 초안을 한 번에 정리합니다."
      badges={['Fact-first Draft', '공공기관 톤', 'Streaming Response']}
      meta={[
        { label: 'Best for', value: '행정·기관 보도자료 초안 작성' },
        { label: 'Input', value: '담당부서, 담당자, 연락처, 핵심 내용' },
        { label: 'Output', value: '제목 후보 5개 + 본문 초안' },
      ]}
      main={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>기본 정보 입력</h2>
                <p className={styles.sectionDescription}>
                  누가 발표하고, 무엇을 왜 알리는지 먼저 정리합니다. 핵심 사실만 명확히 넣을수록 결과 품질이 좋아집니다.
                </p>
              </div>
              <span className={styles.pill}>Step 1</span>
            </div>

            <label className={styles.label}>담당부서</label>
            <input
              className={styles.input}
              value={form.담당부서}
              onChange={(e) => setForm((prev) => ({ ...prev, 담당부서: e.target.value }))}
              placeholder="예: 4차산업추진국 AI반도체과"
            />

            <div className={styles.grid3} style={{ marginTop: 14 }}>
              {[
                ['소감주체', '예: 성남시장 홍길동'],
                ['담당자', '예: 홍길동'],
                ['연락처', '예: 031-729-0000'],
              ].map(([key, placeholder]) => (
                <div key={key}>
                  <label className={styles.label}>{key}</label>
                  <input
                    className={styles.input}
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <label className={styles.label} style={{ marginTop: 16 }}>
              핵심 반영 내용
            </label>
            <textarea
              className={styles.textarea}
              value={form.내용}
              onChange={(e) => setForm((prev) => ({ ...prev, 내용: e.target.value }))}
              placeholder="무엇을, 언제, 누구에게 제공하는지 문장으로 적어 주세요. 예산, 일정, 기대효과가 있으면 함께 넣어 주세요."
            />

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={generate} disabled={loading}>
                {loading ? '초안 생성 중...' : '보도자료 초안 만들기'}
              </button>
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>본문 초안</h2>
                <p className={styles.sectionDescription}>
                  결과는 실무자가 바로 다듬기 좋도록 문장 단위로 정리됩니다.
                </p>
              </div>
              <span className={styles.pill}>Step 2</span>
            </div>

            {result ? (
              <div className={styles.resultPanel}>{result.split('보도자료 추천 제목')[0] || result}</div>
            ) : error ? (
              <p className={styles.emptyState} style={{ color: '#ffb4b4' }}>
                {error}
              </p>
            ) : (
              <p className={styles.emptyState}>
                초안을 생성하면 이 영역에 문단형 결과가 표시됩니다.
              </p>
            )}
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>제목 후보</h2>
                <p className={styles.sectionDescription}>
                  첫 문장보다 강한 헤드라인이 필요할 때 바로 비교할 수 있습니다.
                </p>
              </div>
            </div>

            {titles.length > 0 ? (
              <div className={styles.toolList}>
                {titles.map((title, index) => (
                  <div className={styles.toolListItem} key={title}>
                    <div>
                      <strong>{index + 1}. {title}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>생성 후 제목 후보 5개가 여기에 표시됩니다.</p>
            )}
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>작성 가이드</h2>
                <p className={styles.sectionDescription}>완성도를 높이는 입력 팁입니다.</p>
              </div>
            </div>

            <div className={styles.splitCard}>
              {[
                '핵심 내용은 한 문단보다 3~5개 사실 포인트로 넣는 편이 좋습니다.',
                '행사명, 일정, 대상, 기대효과가 들어가면 제목 품질이 확실히 올라갑니다.',
                '소감 주체가 비어 있으면 인용문이 약해질 수 있습니다.',
              ].map((item) => (
                <div className={styles.splitItem} key={item}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      }
    />
  );
}
