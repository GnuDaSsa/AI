'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Tools', type: 'section' },
  { label: 'Home', href: '/' },
  { label: 'MBTI 검사기', href: '/mbti' },
  { label: '테토에겐 테스트', href: '/teto' },
  { label: '보도자료 생성기', href: '/press' },
  { label: '이미지 프롬프트', href: '/img-prompt' },
  { label: '녹음 변환·요약', href: '/record' },
  { label: '사주 로또 추출기', href: '/lotto-saju' },
  { label: 'divider', type: 'divider' },
  { label: 'Community', type: 'section' },
  { label: '꿀팁 공유', href: '/tips' },
  { label: '아이디어 제안소', href: '/ideas' },
  { label: '공무원 비주얼노벨', href: '/novel' },
  { label: '공무원 영상', href: '/videos' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .sidebar-shell { width: 220px; flex-shrink: 0; }
        .sidebar-panel {
          width: 220px;
          min-height: 100vh;
          background: #0a0a0f;
          border-right: 1px solid rgba(255,255,255,0.08);
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .nav-link { transition: background 0.15s ease, color 0.15s ease; }
        .nav-link:hover { background: rgba(255,255,255,0.04) !important; }
        .sidebar-menu-btn, .sidebar-overlay { display: none; }

        @media (max-width: 768px) {
          .sidebar-shell { width: 0; }
          .sidebar-panel {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 60;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            box-shadow: 8px 0 24px rgba(0,0,0,0.35);
          }
          .sidebar-panel.open { transform: translateX(0); }

          .sidebar-menu-btn {
            display: inline-flex;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 70;
            width: 40px;
            height: 40px;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            background: rgba(10,10,15,0.8);
            color: #f0f0f0;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
            backdrop-filter: blur(6px);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 50;
            background: rgba(0,0,0,0.35);
          }
        }
      `}</style>

      <button
        className="sidebar-menu-btn"
        aria-label="메뉴 열기"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>

      <div className="sidebar-shell">
        <aside className={`sidebar-panel ${open ? 'open' : ''}`}>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              padding: '1.1rem 1.4rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#f0f0f0',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            DLC
          </Link>

          <nav style={{ padding: '0.8rem 0', flex: 1 }}>
            {NAV_ITEMS.map((item, i) => {
              if (item.type === 'section') {
                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.8rem 1.4rem 0.3rem',
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      color: '#444',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.label}
                  </div>
                );
              }
              if (item.type === 'divider') {
                return (
                  <div
                    key={i}
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      margin: '0.6rem 0',
                    }}
                  />
                );
              }
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="nav-link"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1.4rem',
                    textDecoration: 'none',
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    borderLeft: active ? '2px solid #75e8ff' : '2px solid transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#f0f0f0' : '#888',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              padding: '1rem 1.4rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              color: '#333',
              letterSpacing: '0.06em',
            }}
          >
            © 2026 DLC
          </div>
        </aside>
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
    </>
  );
}
