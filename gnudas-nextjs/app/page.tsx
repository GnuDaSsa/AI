'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const TOOLS: { label: string; href: string }[] = [
  { label: 'MBTI 검사기', href: '/mbti' },
  { label: '테토에겐 테스트', href: '/teto' },
  { label: '보도자료 생성기', href: '/press' },
  { label: '이미지 프롬프트', href: '/img-prompt' },
  { label: '녹음 변환·요약', href: '/record' },
  { label: '꿀팁 공유', href: '/tips' },
  { label: '아이디어 제안소', href: '/ideas' },
  { label: '공무원 비주얼노벨', href: '/novel' },
  { label: '공무원 영상', href: '/videos' },
  { label: '사주 로또 추출기', href: '/lotto-saju' },
];

const PASSIVE_ACTIVITIES = [
  '자료공유',
  '아이디어 제안 및 고도화',
  '업무활용사례 질의응답',
  '카톡방 운영',
];

const ACTIVE_ACTIVITIES = [
  '반기 1회 오프라인 모임',
  '아이디어회의',
  '이번 분기 목표: 나만의 AI 콘텐츠 만들기',
];

type LocalWork = {
  branch: string;
  changedCount: number;
  changedFiles: string[];
  lastCommit: string;
  codingProcesses: string[];
  updatedAt: string;
  agentPipeline: { name: string; state: string; detail: string }[];
};

function isCodingProcess(line: string) {
  const v = line.toLowerCase();
  return v.includes('openclaw') || v.includes('codex') || v.includes('claude');
}

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [localWork, setLocalWork] = useState<LocalWork | null>(null);
  const [showCodingPopup, setShowCodingPopup] = useState(false);
  const wasCodingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      try {
        const res = await fetch('/api/local-work', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) {
          const codingNow = (data?.codingProcesses || []).some(isCodingProcess);
          if (codingNow && !wasCodingRef.current) {
            setShowCodingPopup(true);
          }
          wasCodingRef.current = codingNow;
          setLocalWork(data);
        }
      } catch {
        // ignore
      }
    };

    tick();
    const timer = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .tool-row { transition: background 0.15s ease; }
        .tool-row:hover { background: rgba(255,255,255,0.04) !important; cursor: pointer; }
        .tool-row:hover .tool-arrow { transform: translateX(4px); color: #75e8ff !important; }
        .tool-arrow { transition: transform 0.15s ease, color 0.15s ease; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#f0f0f0',
        fontFamily: '"Inter", "Apple SD Gothic Neo", sans-serif',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        {showCodingPopup && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ width: 'min(520px, 92vw)', borderRadius: 14, border: '1px solid rgba(117,232,255,0.4)', background: 'linear-gradient(180deg,#0d1430,#0a1025)', boxShadow: '0 10px 40px rgba(0,0,0,0.45)', padding: '1rem 1.1rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#75e8ff', marginBottom: 6 }}>LIVE CODING DETECTED</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>OpenClaw 코딩 작업 시작됨 🔥</div>
              <div style={{ fontSize: 13, color: '#9fb4e7', marginBottom: 12 }}>
                에이전트들이 탕비실에서 사무실로 이동해서 일하는 중이야.
              </div>
              <button onClick={() => setShowCodingPopup(false)} style={{ background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)', border: 'none', color: '#fff', borderRadius: 8, padding: '0.5rem 0.85rem', fontWeight: 800, cursor: 'pointer' }}>확인</button>
            </div>
          </div>
        )}

        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Link href="/" style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#f0f0f0',
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}>DLC</Link>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: '#888',
            letterSpacing: '0.06em',
          }}>Updated 2026.03</span>
        </header>

        <section style={{
          padding: '4rem 2rem 3rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          <h1 style={{
            fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            margin: '0 0 0.15em',
            color: '#f0f0f0',
          }}>AI Club</h1>
          <h1 style={{
            fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            margin: '0 0 2rem',
            color: '#75e8ff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.1em',
          }}>
            Deep Learning Crew
            <span style={{
              display: 'inline-block',
              width: '0.06em',
              height: '0.85em',
              background: '#75e8ff',
              marginLeft: '0.08em',
              verticalAlign: 'middle',
              animation: 'blink 1.1s step-end infinite',
              borderRadius: 1,
            }} />
          </h1>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {['회장 사진우', '총무 김동주'].map((b) => {
              const isChair = b.includes('회장');
              return (
                <span key={b} style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isChair ? '#08101a' : '#0a0f1d',
                  background: isChair
                    ? 'linear-gradient(90deg,#75e8ff,#a7f3ff)'
                    : 'linear-gradient(90deg,#c4b5fd,#ddd6fe)',
                  border: isChair
                    ? '1px solid rgba(117,232,255,0.55)'
                    : '1px solid rgba(196,181,253,0.55)',
                  padding: '0.34rem 0.8rem',
                  borderRadius: 999,
                  letterSpacing: '0.03em',
                  boxShadow: isChair
                    ? '0 0 0 1px rgba(117,232,255,0.2), 0 6px 18px rgba(117,232,255,0.35)'
                    : '0 0 0 1px rgba(196,181,253,0.2), 0 6px 18px rgba(139,92,246,0.28)',
                }}>{b}</span>
              );
            })}
          </div>
        </section>

        <section style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '2rem 2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            paddingBottom: '0.6rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#888',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>AI Tools</span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#888',
              letterSpacing: '0.06em',
            }}>{TOOLS.length} items</span>
          </div>

          <div>
            {TOOLS.map((tool, i) => (
              <div
                key={i}
                className="tool-row"
                onClick={() => router.push(tool.href)}
                onMouseEnter={() => setHoveredTool(i)}
                onMouseLeave={() => setHoveredTool(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.9rem 0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent',
                  borderRadius: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.97rem',
                    fontWeight: 600,
                    color: hoveredTool === i ? '#f0f0f0' : '#c8c8c8',
                    transition: 'color 0.18s ease',
                  }}>{tool.label}</span>
                </div>

                <span className="tool-arrow" style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: '#333',
                  display: 'inline-block',
                }}>→</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 2rem 3rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            padding: '2rem 1.5rem 2rem 0',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#888',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
            }}>활동내용 — Passive</div>
            {PASSIVE_ACTIVITIES.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0',
                borderBottom: i < PASSIVE_ACTIVITIES.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                <span style={{
                  width: 1,
                  height: '1em',
                  background: 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: '2rem 0 2rem 1.5rem',
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#75e8ff',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
            }}>활동내용 — Active</div>
            {ACTIVE_ACTIVITIES.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0',
                borderBottom: i < ACTIVE_ACTIVITIES.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                <span style={{
                  width: 1,
                  height: '1em',
                  background: '#75e8ff',
                  opacity: 0.4,
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.2rem 2rem',
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#444',
            letterSpacing: '0.06em',
          }}>© 2026 Deep Learning Crew</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: '#333',
            letterSpacing: '0.06em',
          }}>AI Club</span>
        </footer>

      </div>
    </>
  );
}
