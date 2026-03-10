'use client';
import { useEffect, useState } from 'react';

interface Tip {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  likes: number;
  views?: number;
  createdAt: string;
}

const CATEGORIES = ['전체', 'ChatGPT', 'Gemini', 'Claude', 'Midjourney', 'DALL-E', '기타'];

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [form, setForm] = useState({ title: '', content: '', author: '', category: 'ChatGPT' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [adminPw, setAdminPw] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { fetchTips(); }, [categoryFilter, sort]);

  async function fetchTips() {
    const params = new URLSearchParams({ sort, category: categoryFilter });
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/tips?${params.toString()}`);
    const data = await res.json();
    setTips(data.tips || []);
  }

  async function submitTip() {
    if (!form.title || !form.content || !form.author) return alert('모든 필드를 입력해주세요.');
    setLoading(true);
    try {
      await fetch('/api/tips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setForm({ title: '', content: '', author: '', category: 'ChatGPT' });
      setShowForm(false);
      fetchTips();
    } finally {
      setLoading(false);
    }
  }

  async function likeTip(id: string) {
    await fetch(`/api/tips/${id}/like`, { method: 'POST' });
    fetchTips();
  }

  async function viewTip(id: string) {
    await fetch(`/api/tips/${id}/view`, { method: 'POST' });
    fetchTips();
  }

  async function deleteTip() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/tips/${deleteTarget}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPw }),
    });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error || '삭제 실패'); return; }
    setDeleteTarget(null);
    setAdminPw('');
    setDeleteError('');
    fetchTips();
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#0d1538', border: '1px solid #2b3f7a', borderRadius: 12, padding: 24, minWidth: 300 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#f3f7ff' }}>관리자 비밀번호 입력</div>
            <input type="password" placeholder="비밀번호" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && deleteTip()} style={{ width: '100%', marginBottom: 8, background: '#06091f', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} autoFocus />
            {deleteError && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{deleteError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={deleteTip} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem' }}>삭제</button>
              <button onClick={() => { setDeleteTarget(null); setAdminPw(''); setDeleteError(''); }} style={{ flex: 1, background: '#1e2f6a', color: '#dbe8ff', border: 'none', borderRadius: 8, padding: '0.55rem' }}>취소</button>
            </div>
          </div>
        </div>
      )}
      <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>💡 꿀팁 공유 게시판</h1>
      <p style={{ color: '#aab7d6', marginBottom: 16 }}>검색/정렬/카테고리로 글을 탐색하고 좋아요 반응을 남겨보세요.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="제목/내용/작성자 검색" style={{ flex: 1, minWidth: 220, background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} />
        <button onClick={fetchTips} style={{ padding: '0.55rem 0.9rem', borderRadius: 8, border: '1px solid #3f58a2', background: '#15214f', color: '#dbe8ff' }}>검색</button>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #3f58a2', background: '#15214f', color: '#dbe8ff' }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input placeholder="작성자" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} style={{ background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }} />
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={{ background: '#0d1538', color: '#eaf1ff', border: '1px solid #2b3f7a', borderRadius: 8, padding: '0.55rem 0.75rem' }}>
              {CATEGORIES.filter((c) => c !== '전체').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={submitTip} disabled={loading} style={{ background: '#24409b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem 0.75rem' }}>{loading ? '등록 중' : '등록'}</button>
          </div>
        </div>
      )}

      {tips.map((tip) => (
        <div key={tip._id} onClick={() => viewTip(tip._id)} style={{ border: '1px solid #253a7b', borderRadius: 12, padding: 14, marginBottom: 10, background: 'rgba(9,16,42,0.55)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, color: '#f3f7ff' }}>{tip.title}</h3>
            <span style={{ fontSize: 12, color: '#8fb2ff' }}>{new Date(tip.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          <div style={{ marginTop: 6, color: '#d6e2ff', lineHeight: 1.6 }}>{tip.content}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, fontSize: 13, color: '#9fb4e7' }}>
            <span>#{tip.category}</span>
            <span>작성자 {tip.author}</span>
            <span>조회 {(tip.views || 0)}</span>
            <button onClick={(e) => { e.stopPropagation(); likeTip(tip._id); }} style={{ marginLeft: 'auto', background: 'rgba(255,119,230,0.14)', border: '1px solid rgba(255,119,230,0.35)', color: '#ff77e6', borderRadius: 8, padding: '0.25rem 0.6rem' }}>❤️ {tip.likes || 0}</button>
            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(tip._id); setDeleteError(''); }} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', borderRadius: 8, padding: '0.25rem 0.6rem', fontSize: 13 }}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
}
