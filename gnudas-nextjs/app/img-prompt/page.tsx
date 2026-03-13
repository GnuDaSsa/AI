'use client';

import { useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

const STYLES = [
  '사실적 (Photorealistic)',
  '시네마틱 (Cinematic)',
  '초현실적 (Surreal)',
  '애니메이션 (Anime)',
  '수채화 (Watercolor)',
  '유화 (Oil Painting)',
  '사이버펑크 (Cyberpunk)',
  '판타지 (Fantasy Art)',
  '미니멀 (Minimalist)',
  '빈티지 (Vintage Film)',
  '팝아트 (Pop Art)',
  '스케치 (Pencil Sketch)',
  '픽셀아트 (Pixel Art)',
  '3D 렌더 (3D Render)',
  '수묵화 (Ink Wash)',
];

const RATIOS = [
  { label: '숏폼용 (9:16)', value: '9:16' },
  { label: '롱폼용 (16:9)', value: '16:9' },
  { label: '정방형 (1:1)', value: '1:1' },
];

export default function ImgPromptPage() {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [ratio, setRatio] = useState('9:16');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [imageError, setImageError] = useState('');

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  async function makePrompt() {
    if (!input.trim()) return;
    setLoadingPrompt(true);
    setGeneratedPrompt('');
    setImageDataUrl(null);
    setImageError('');

    try {
      const res = await fetch('/api/img-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, style, aspectRatio: ratio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImageError(data.error || '프롬프트 생성에 실패했습니다.');
        return;
      }
      setGeneratedPrompt(data.prompt || '');
    } finally {
      setLoadingPrompt(false);
    }
  }

  async function generateImage() {
    if (!generatedPrompt) return;
    if (!isAdmin && !apiKey.trim()) {
      setImageError('이미지 생성을 위해 Google AI API 키를 입력해주세요.');
      return;
    }
    if (isAdmin && !adminPassword.trim()) {
      setImageError('관리자 비밀번호를 입력해주세요.');
      return;
    }

    setLoadingImage(true);
    setImageDataUrl(null);
    setImageError('');

    try {
      const body: Record<string, string> = { prompt: generatedPrompt, aspectRatio: ratio };
      if (isAdmin) body.adminPassword = adminPassword;
      else body.apiKey = apiKey;

      const res = await fetch('/api/img-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setImageError(data.error || '이미지 생성에 실패했습니다.');
      } else {
        setImageDataUrl(data.imageDataUrl || null);
      }
    } finally {
      setLoadingImage(false);
    }
  }

  const promptJson = generatedPrompt
    ? JSON.stringify({ prompt: generatedPrompt }, null, 2)
    : '';

  return (
    <ToolShell
      eyebrow="Creative Production Tool"
      title="이미지 프롬프트"
      description="한국어 설명을 이미지 생성용 영어 프롬프트로 바꾸고, 원하는 비율과 스타일에 맞춰 바로 이미지를 확인할 수 있는 워크플로우입니다."
      badges={['Prompt Translation', 'Image Generation', 'Aspect Ratio Control']}
      meta={[
        { label: 'Flow', value: '설명 입력 → 프롬프트 생성 → 이미지 생성' },
        { label: 'Best for', value: '썸네일, 포스터, 비주얼 콘셉트 초안' },
        { label: 'Auth', value: '일반 API 키 또는 관리자 모드' },
      ]}
      main={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>장면 설명 입력</h2>
                <p className={styles.sectionDescription}>
                  분위기, 시간대, 배경, 피사체 행동을 함께 쓰면 프롬프트가 훨씬 정확해집니다.
                </p>
              </div>
              <span className={styles.pill}>Step 1</span>
            </div>

            <label className={styles.label}>원하는 이미지 설명</label>
            <textarea
              className={styles.textarea}
              placeholder="예: 밤하늘 아래 벚꽃이 피어있는 일본 거리, 비가 막 그친 뒤 젖은 도로에 네온이 반사되고 있음"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className={styles.grid2} style={{ marginTop: 14 }}>
              <div>
                <label className={styles.label}>스타일</label>
                <select
                  className={styles.select}
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {STYLES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>비율</label>
                <select
                  className={styles.select}
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                >
                  {RATIOS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} onClick={makePrompt} disabled={loadingPrompt}>
                {loadingPrompt ? '프롬프트 생성 중...' : '프롬프트 만들기'}
              </button>
            </div>
          </section>

          {generatedPrompt ? (
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>생성된 프롬프트</h2>
                  <p className={styles.sectionDescription}>
                    그대로 복사해 다른 툴로 넘기거나, 바로 이미지 생성을 이어갈 수 있습니다.
                  </p>
                </div>
                <button className={styles.buttonSecondary} onClick={() => copyText(promptJson)}>
                  JSON 복사
                </button>
              </div>

              <pre className={styles.codeBlock}>{promptJson}</pre>

              <div className={styles.actions}>
                <button className={styles.buttonPrimary} onClick={generateImage} disabled={loadingImage}>
                  {loadingImage ? '이미지 생성 중...' : '이미지 생성하기'}
                </button>
              </div>
            </section>
          ) : null}

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>생성 권한</h2>
                <p className={styles.sectionDescription}>
                  이미지 생성은 사용자 API 키 또는 관리자 비밀번호 중 하나가 필요합니다.
                </p>
              </div>
            </div>

            <div className={styles.actions} style={{ marginTop: 0 }}>
              <button
                className={isAdmin ? styles.buttonSecondary : styles.buttonPrimary}
                onClick={() => {
                  setIsAdmin(false);
                  setApiKey('');
                  setAdminPassword('');
                }}
              >
                일반 사용자
              </button>
              <button
                className={isAdmin ? styles.buttonPrimary : styles.buttonSecondary}
                onClick={() => {
                  setIsAdmin(true);
                  setApiKey('');
                  setAdminPassword('');
                }}
              >
                관리자
              </button>
            </div>

            <label className={styles.label} style={{ marginTop: 14 }}>
              {isAdmin ? '관리자 비밀번호' : 'Google AI API 키'}
            </label>
            <input
              className={styles.input}
              type="password"
              placeholder={isAdmin ? '관리자 비밀번호 입력' : 'AIza...로 시작하는 API 키'}
              value={isAdmin ? adminPassword : apiKey}
              onChange={(e) =>
                isAdmin ? setAdminPassword(e.target.value) : setApiKey(e.target.value)
              }
            />

            {!isAdmin ? (
              <p className={styles.emptyState} style={{ marginTop: 10 }}>
                입력한 키는 저장되지 않습니다. 프롬프트 생성은 서버 키, 이미지 생성은 입력한 키 또는 관리자 키로 실행됩니다.
              </p>
            ) : null}
          </section>

          {imageDataUrl ? (
            <section className={styles.surface}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>생성 이미지</h2>
                  <p className={styles.sectionDescription}>프롬프트와 비율이 실제로 어떻게 반영됐는지 확인합니다.</p>
                </div>
              </div>
              <img
                src={imageDataUrl}
                alt="생성된 이미지"
                style={{ width: '100%', borderRadius: 24, border: '1px solid rgba(88, 112, 145, 0.14)' }}
              />
            </section>
          ) : null}

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>실패 안내</h2>
                <p className={styles.sectionDescription}>에러를 결과와 같은 톤으로 숨기지 않고 분리해서 보여줍니다.</p>
              </div>
            </div>

            {imageError ? (
              <div
                className={styles.splitItem}
                style={{
                  borderColor: 'rgba(205, 92, 92, 0.22)',
                  background: 'rgba(255, 244, 244, 0.92)',
                  color: '#8b1e1e',
                }}
              >
                {imageError}
              </div>
            ) : (
              <p className={styles.emptyState}>이미지 생성 에러가 발생하면 이 영역에 분리 표시됩니다.</p>
            )}
          </section>
        </div>
      }
    />
  );
}
