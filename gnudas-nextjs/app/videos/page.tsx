'use client';
import { useEffect, useState } from 'react';

type Video = {
  _id: string;
  title: string;
  description: string;
  author: string;
  videoType: 'youtube' | 'url';
  videoUrl: string;
  createdAt: string;
  views: number;
};

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

const cardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(125,187,255,0.2)',
  background: 'rgba(8,10,34,0.6)',
  padding: '1.2rem',
  marginBottom: '1rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(125,187,255,0.3)',
  borderRadius: 8,
  color: '#eef4ff',
  padding: '0.5rem 0.75rem',
  fontSize: '0.92rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: '#8db9ff',
  fontSize: '0.85rem',
  display: 'block',
  marginBottom: 4,
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [form, setForm] = useState({ title: '', description: '', author: '', password: '', videoUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // modal
  const [selected, setSelected] = useState<Video | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [pwInput, setPwInput] = useState('');
  const [editForm, setEditForm] = useState({ title: '', description: '', author: '', videoUrl: '' });
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit() {
    if (!form.title || !form.author || !form.password || !form.videoUrl) {
      setFormError('모든 필수 항목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    const videoType = isYoutubeUrl(form.videoUrl) ? 'youtube' : 'url';
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, videoType }),
      });
      const data = await res.json();
      if (data.error) { setFormError(data.error); return; }
      setForm({ title: '', description: '', author: '', password: '', videoUrl: '' });
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  function openVideo(v: Video) {
    setSelected(v);
    setModalMode('view');
    setPwInput('');
    setActionError('');
    fetch(`/api/videos/${v._id}`, { method: 'PATCH' });
  }

  function openEdit() {
    if (!selected) return;
    setEditForm({ title: selected.title, description: selected.description, author: selected.author, videoUrl: selected.videoUrl });
    setModalMode('edit');
    setPwInput('');
    setActionError('');
  }

  async function doEdit() {
    if (!selected) return;
    setActionLoading(true);
    setActionError('');
    const videoType = isYoutubeUrl(editForm.videoUrl) ? 'youtube' : 'url';
    try {
      const res = await fetch(`/api/videos/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, videoType, password: pwInput }),
      });
      const data = await res.json();
      if (data.error) { setActionError(data.error); return; }
      setSelected(null);
      load();
    } finally {
      setActionLoading(false);
    }
  }

  async function doDelete() {
    if (!selected) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/videos/${selected._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput }),
      });
      const data = await res.json();
      if (data.error) { setActionError(data.error); return; }
      setSelected(null);
      load();
    } finally {
      setActionLoading(false);
    }
  }

  function renderEmbed(v: Video) {
    if (v.videoType === 'youtube') {
      const ytId = getYoutubeId(v.videoUrl);
      if (ytId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 10 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    return (
      <video
        src={v.videoUrl}
        controls
        style={{ width: '100%', borderRadius: 10, background: '#000' }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.3rem' }}>공무원 영상</h1>
          <p style={{ color: '#d5def3', fontSize: '0.9rem', margin: 0 }}>동호회 회원들이 만든 영상을 공유하는 공간입니다.</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setFormError(''); }}
          style={{ background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)', color: '#fff', fontWeight: 800, border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0 }}
        >
          {showForm ? '닫기' : '+ 영상 등록'}
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 14, fontSize: '1rem' }}>영상 등록</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label style={labelStyle}>제목 *</label>
              <input style={inputStyle} placeholder="영상 제목" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>영상 링크 * <span style={{ color: '#556', fontWeight: 400 }}>(YouTube URL 또는 직접 영상 URL)</span></label>
              <input style={inputStyle} placeholder="https://youtu.be/... 또는 영상 파일 URL" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>설명</label>
              <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }} placeholder="영상에 대한 간단한 설명 (선택)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>게시자 이름 *</label>
                <input style={inputStyle} placeholder="홍길동" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>비밀번호 * <span style={{ color: '#556', fontWeight: 400 }}>(수정·삭제 시 사용)</span></label>
                <input type="password" style={inputStyle} placeholder="비밀번호 설정" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
          </div>
          {formError && <div style={{ color: '#ff8080', fontSize: '0.85rem', marginTop: 8 }}>{formError}</div>}
          <button
            onClick={submit}
            disabled={submitting}
            style={{ marginTop: 14, width: '100%', background: 'linear-gradient(90deg,#f97316,#ec4899)', color: '#fff', fontWeight: 800, border: 'none', borderRadius: 10, padding: '0.65rem', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      )}

      {/* 영상 목록 */}
      {loading ? (
        <div style={{ color: '#556', textAlign: 'center', padding: '3rem' }}>불러오는 중...</div>
      ) : videos.length === 0 ? (
        <div style={{ color: '#445', textAlign: 'center', padding: '4rem', fontFamily: 'monospace' }}>등록된 영상이 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {videos.map(v => {
            const ytId = v.videoType === 'youtube' ? getYoutubeId(v.videoUrl) : null;
            return (
              <div
                key={v._id}
                onClick={() => openVideo(v)}
                style={{ ...cardStyle, marginBottom: 0, cursor: 'pointer', transition: 'border-color 0.15s', border: '1px solid rgba(125,187,255,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(117,232,255,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(125,187,255,0.2)')}
              >
                {/* 썸네일 */}
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: '#000' }}>
                  {ytId ? (
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#446', fontSize: '2rem' }}>▶</div>
                  )}
                </div>
                <div style={{ fontWeight: 700, color: '#eef4ff', fontSize: '0.95rem', marginBottom: 4, lineHeight: 1.35 }}>{v.title}</div>
                {v.description && <div style={{ color: '#668', fontSize: '0.8rem', marginBottom: 6, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{v.description}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#556', fontFamily: 'monospace' }}>
                  <span>{v.author}</span>
                  <span>조회 {v.views}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 영상 모달 */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ width: 'min(680px, 95vw)', maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, border: '1px solid rgba(117,232,255,0.3)', background: 'linear-gradient(180deg,#0d1430,#0a1025)', padding: '1.4rem' }}>

            {modalMode === 'view' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#eef4ff', flex: 1, marginRight: 12 }}>{selected.title}</div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#556', cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0 }}>✕</button>
                </div>
                <div style={{ marginBottom: 14 }}>{renderEmbed(selected)}</div>
                {selected.description && <div style={{ color: '#9fb4e7', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 12 }}>{selected.description}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#556', fontFamily: 'monospace' }}>by {selected.author} · 조회 {selected.views}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={openEdit} style={{ background: 'rgba(117,232,255,0.1)', border: '1px solid rgba(117,232,255,0.3)', borderRadius: 8, color: '#75e8ff', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>수정</button>
                    <button onClick={() => { setModalMode('delete'); setPwInput(''); setActionError(''); }} style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, color: '#ff8080', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>삭제</button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'edit' && (
              <>
                <div style={{ fontWeight: 800, color: '#75e8ff', marginBottom: 14 }}>영상 수정</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>제목</label>
                    <input style={inputStyle} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>영상 링크</label>
                    <input style={inputStyle} value={editForm.videoUrl} onChange={e => setEditForm(f => ({ ...f, videoUrl: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>설명</label>
                    <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>게시자 이름</label>
                    <input style={inputStyle} value={editForm.author} onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>비밀번호 확인</label>
                    <input type="password" style={inputStyle} placeholder="등록 시 설정한 비밀번호 또는 관리자 비밀번호" value={pwInput} onChange={e => setPwInput(e.target.value)} />
                  </div>
                </div>
                {actionError && <div style={{ color: '#ff8080', fontSize: '0.85rem', marginTop: 8 }}>{actionError}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => setModalMode('view')} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#888', padding: '0.6rem', cursor: 'pointer', fontWeight: 700 }}>취소</button>
                  <button onClick={doEdit} disabled={actionLoading} style={{ flex: 2, background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', padding: '0.6rem', cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: 800, opacity: actionLoading ? 0.7 : 1 }}>
                    {actionLoading ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </>
            )}

            {modalMode === 'delete' && (
              <>
                <div style={{ fontWeight: 800, color: '#ff8080', marginBottom: 10 }}>영상 삭제</div>
                <div style={{ color: '#9fb4e7', fontSize: '0.9rem', marginBottom: 14 }}>
                  <strong style={{ color: '#eef4ff' }}>&ldquo;{selected.title}&rdquo;</strong> 영상을 삭제하시겠습니까?<br />삭제 후 복구할 수 없습니다.
                </div>
                <div>
                  <label style={labelStyle}>비밀번호 확인</label>
                  <input type="password" style={inputStyle} placeholder="등록 시 설정한 비밀번호 또는 관리자 비밀번호" value={pwInput} onChange={e => setPwInput(e.target.value)} />
                </div>
                {actionError && <div style={{ color: '#ff8080', fontSize: '0.85rem', marginTop: 8 }}>{actionError}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => setModalMode('view')} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#888', padding: '0.6rem', cursor: 'pointer', fontWeight: 700 }}>취소</button>
                  <button onClick={doDelete} disabled={actionLoading} style={{ flex: 1, background: 'rgba(255,60,60,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: 10, color: '#ff8080', padding: '0.6rem', cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: 800, opacity: actionLoading ? 0.7 : 1 }}>
                    {actionLoading ? '삭제 중...' : '삭제하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
