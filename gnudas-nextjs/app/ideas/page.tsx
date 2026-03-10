'use client';
import { useEffect, useState } from 'react';

interface Idea {
  _id: string;
  title: string;
  content: string;
  nickname: string;
  status: string;
  votes?: number;
  comments?: number;
  createdAt: string;
}

const STATUSES = ['전체', '제안됨', '검토중', '채택', '보류'];
const STATUS_COLORS: Record<string, string> = {
  제안됨: '#75e8ff',
  검토중: '#f59e0b',
  채택: '#34d399',
  보류: '#ef4444',
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [form, setForm] = useState({ title: '', content: '', nickname: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [adminPw, setAdminPw] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { fetchIdeas(); }, [statusFilter, sort]);

  async function fetchIdeas() {
    const params = new URLSearchParams({ status: statusFilter, sort });
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/ideas?${params.toString()}`);
    const data = await res.json();
    setIdeas(data.ideas || []);
  }

  async function submitIdea() {
    if (!form.title || !form.content || !form.nickname) return alert('모든 필드를 입력해주세요.');
    if (form.content.length < 10) return alert('내용을 10자 이상 입력해주세요.');
    setLoading(true);
    try {
      await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setForm({ title: '', content: '', nickname: '' });
      setShowForm(false);
      fetchIdeas();
    } finally {
      setLoading(false);
    }
  }

  async function vote(id: string) {
    await fetch(`/api/ideas/${id}/vote`, { method: 'POST' });
    fetchIdeas();
  }

  async function deleteIdea() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/ideas/${deleteTarget}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPw }),
    });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error || '삭제 실패'); return; }
    setDeleteTarget(null);
    setAdminPw('');
    setDeleteError('');
    fetchIdeas();
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#0d1538', border: '1px solid #2b3f7a', borderRadius: 12, padding: 24, minWidth: 300 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#f3f7ff' }}>관리자 비밀번호 입력</div>
            <input type="password" placeholder="비밀번호" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && deleteIdea()} style={{ width: '100%', marginBottom: 8, background: '#06091f', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} autoFocus />
            {deleteError && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{deleteError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={deleteIdea} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem' }}>삭제</button>
              <button onClick={() => { setDeleteTarget(null); setAdminPw(''); setDeleteError(''); }} style={{ flex: 1, background: '#1e2f6a', color: '#dbe8ff', border: 'none', borderRadius: 8, padding: '0.55rem' }}>취소</button>
            </div>
          </div>
        </div>
      )}
      <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>🧠 아이디어 제안소</h1>
      <p style={{ color: '#aab7d6', marginBottom: 16 }}>일반 게시판처럼 상태/인기 기반으로 아이디어를 관리합니다.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="제목/내용/작성자 검색" style={{ flex: 1, minWidth: 220, background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} />
        <button onClick={fetchIdeas} style={{ padding: '0.55rem 0.9rem', borderRadius: 8, border: '1px solid #3f58a2', background: '#15214f', color: '#dbe8ff' }}>검색</button>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #3f58a2', background: '#15214f', color: '#dbe8ff' }}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'latest' | 'popular')} style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #3f58a2', background: '#15214f', color: '#dbe8ff' }}>
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
        </select>
        <button onClick={() => setShowForm((v) => !v)} style={{ background: 'linear-gradient(90deg,#75e8ff,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem 0.9rem', fontWeight: 800 }}>{showForm ? '닫기' : '글쓰기'}</button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #2d4484', borderRadius: 12, padding: 14, marginBottom: 14, background: 'rgba(10,20,54,0.65)' }}>
          <input placeholder="제목" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ width: '100%', marginBottom: 8, background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} />
          <textarea placeholder="내용" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} style={{ width: '100%', minHeight: 100, marginBottom: 8, background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <input placeholder="닉네임" value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} style={{ background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} />
            <button onClick={submitIdea} disabled={loading} style={{ background: '#24409b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem 0.75rem' }}>{loading ? '등록 중' : '등록'}</button>
          </div>
        </div>
      )}

      {ideas.map((idea) => (
        <div key={idea._id} style={{ border: '1px solid #253a7b', borderRadius: 12, padding: 14, marginBottom: 10, background: 'rgba(9,16,42,0.55)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, color: '#f3f7ff' }}>{idea.title}</h3>
            <span style={{ fontSize: 12, color: '#8fb2ff' }}>{new Date(idea.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          <div style={{ marginTop: 6, color: '#d6e2ff', lineHeight: 1.6 }}>{idea.content}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, fontSize: 13, color: '#9fb4e7' }}>
            <span style={{ color: STATUS_COLORS[idea.status] || '#9fb4e7' }}>● {idea.status}</span>
            <span>제안자 {idea.nickname}</span>
            <span>댓글 {(idea.comments || 0)}</span>
            <button onClick={() => vote(idea._id)} style={{ marginLeft: 'auto', background: 'rgba(117,232,255,0.14)', border: '1px solid rgba(117,232,255,0.35)', color: '#75e8ff', borderRadius: 8, padding: '0.25rem 0.6rem' }}>⬆ {(idea.votes || 0)}</button>
            <button onClick={() => { setDeleteTarget(idea._id); setDeleteError(''); }} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', borderRadius: 8, padding: '0.25rem 0.6rem', fontSize: 13 }}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
}
