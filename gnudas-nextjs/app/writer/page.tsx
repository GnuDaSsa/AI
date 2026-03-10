'use client';
import { useRef, useState } from 'react';

type Mode = 'novel' | 'scenario' | 'script';
type Message = { role: 'user' | 'assistant'; content: string };

const MODES: { id: Mode; label: string; sub: string; color: string }[] = [
  { id: 'novel',    label: '소설',    sub: '서사·묘사·내적 독백', color: '#a78bfa' },
  { id: 'scenario', label: '각본',    sub: '영화·드라마 시나리오', color: '#34d399' },
  { id: 'script',   label: '대본',    sub: '연극·뮤지컬·라디오',  color: '#60a5fa' },
];

const PLACEHOLDERS: Record<Mode, string> = {
  novel:    '예) 3장 시작 부분을 1인칭 시점으로 써줘. 주인공이 오랜 친구를 우연히 마주치는 장면이야.',
  scenario: '예) S#12. 옥상에서 두 사람이 처음으로 솔직하게 대화하는 씬을 써줘. 저녁 노을 배경.',
  script:   '예) 1막 클라이맥스. 형사가 범인인 동생과 대면하는 장면. 조명은 단일 스포트라이트.',
};

export default function WriterPage() {
  const [mode, setMode] = useState<Mode>('novel');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    const assistantIdx = next.length;
    setMessages([...next, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, mode, context }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = { role: 'assistant', content: full };
          return updated;
        });
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([]);
    setInput('');
  }

  const modeInfo = MODES.find(m => m.id === mode)!;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .msg { animation: fadeUp 0.2s ease; }
        .copy-btn { opacity:0; transition:opacity 0.15s; }
        .msg-wrap:hover .copy-btn { opacity:1; }
        textarea:focus { outline:none; border-color:rgba(167,139,250,0.5) !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '1rem 0 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f0f0f0' }}>작가 에이전트</h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>
              소설 · 각본 · 대본 전문 창작 AI
            </p>
          </div>
          <button
            onClick={reset}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#888', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: 13, cursor: 'pointer' }}
          >
            새 대화
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 20,
                border: `1px solid ${mode === m.id ? m.color : 'rgba(255,255,255,0.1)'}`,
                background: mode === m.id ? `${m.color}18` : 'transparent',
                color: mode === m.id ? m.color : '#666',
                fontSize: '0.85rem',
                fontWeight: mode === m.id ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {m.label}
              <span style={{ fontSize: '0.72rem', marginLeft: 6, opacity: 0.7 }}>{m.sub}</span>
            </button>
          ))}
          <button
            onClick={() => setShowContext(v => !v)}
            style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', borderRadius: 20, padding: '0.45rem 0.8rem', fontSize: '0.78rem', cursor: 'pointer' }}
          >
            {showContext ? '컨텍스트 닫기' : '작품 컨텍스트'}
          </button>
        </div>

        {/* Context panel */}
        {showContext && (
          <div style={{ marginTop: 10, padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 6, fontFamily: 'monospace' }}>작품 정보 (선택) — 제목, 장르, 배경, 주요 인물 등을 입력하면 에이전트가 일관성을 유지합니다</div>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="예) 제목: 겨울의 끝&#10;장르: 현대 로맨스 소설&#10;배경: 2025년 서울 마포구&#10;주인공: 박지수 (32세, 출판 편집자), 이현우 (35세, 건축가)&#10;키워드: 재회, 상처, 두 번째 사랑"
              style={{ width: '100%', minHeight: 90, background: 'transparent', border: 'none', color: '#ccc', fontSize: '0.88rem', lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        )}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, color: modeInfo.color, opacity: 0.6 }}>✍</div>
            <div style={{ fontSize: '1rem', color: '#555', marginBottom: 8 }}>
              <span style={{ color: modeInfo.color, fontWeight: 700 }}>{modeInfo.label}</span> 모드 준비 완료
            </div>
            <div style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.8, maxWidth: 420, margin: '0 auto' }}>
              씬 작성, 대화 교정, 인물 설계, 플롯 구성 등<br />
              원하는 작업을 자유롭게 요청하세요.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="msg-wrap" style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'user' ? (
              <div style={{ maxWidth: '70%', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '16px 16px 4px 16px', padding: '0.7rem 1rem', color: '#e9e4ff', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {msg.content}
              </div>
            ) : (
              <div className="msg" style={{ maxWidth: '90%', width: '100%' }}>
                <div style={{ fontSize: '0.72rem', color: '#444', fontFamily: 'monospace', marginBottom: 4 }}>
                  작가 에이전트 · {modeInfo.label}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px', padding: '0.9rem 1.1rem', color: '#e0e0e0', fontSize: '0.92rem', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: msg.content.includes('S#') || msg.content.includes(':') ? 'monospace' : 'inherit' }}>
                  {msg.content || <span style={{ color: '#444', animation: 'fadeUp 0.5s infinite alternate' }}>▌</span>}
                </div>
                {msg.content && (
                  <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                    style={{ marginTop: 4, background: 'transparent', border: 'none', color: '#555', fontSize: '0.75rem', cursor: 'pointer', padding: '2px 4px' }}
                  >
                    복사
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 0 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={PLACEHOLDERS[mode]}
            rows={3}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f0f0f0', padding: '0.7rem 0.9rem', fontSize: '0.9rem', lineHeight: 1.6, resize: 'none', fontFamily: 'inherit' }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ padding: '0.65rem 1.2rem', borderRadius: 12, border: 'none', background: loading ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${modeInfo.color}, ${modeInfo.color}99)`, color: loading ? '#555' : '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', minHeight: 48, transition: 'all 0.15s' }}
          >
            {loading ? '생성 중' : '전송'}
          </button>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#333', marginTop: 5, fontFamily: 'monospace' }}>
          Enter 전송 · Shift+Enter 줄바꿈
        </div>
      </div>
    </div>
  );
}
