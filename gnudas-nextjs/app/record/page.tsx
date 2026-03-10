'use client';

import { DragEvent, useRef, useState } from 'react';

import { ToolShell, toolShellStyles as styles } from '@/components/tools/ToolShell';

export default function RecordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(nextFile: File | null) {
    setFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0] || null);
  }

  async function transcribe() {
    if (!file) return;

    setLoading(true);
    setTranscript('');
    setSummary('');
    setProgress('파일 업로드 중...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress('음성 변환 중입니다. 파일 크기에 따라 시간이 걸릴 수 있습니다.');
      const res = await fetch('/api/record', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setTranscript(data.transcript || '');
      setSummary(data.summary || '');
      setProgress('완료되었습니다.');
    } finally {
      setLoading(false);
    }
  }

  function downloadTxt(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolShell
      eyebrow="Voice Workflow"
      title="녹음 변환·요약"
      description="회의 음성, 인터뷰, 메모 녹음을 텍스트로 정리하고 핵심만 빠르게 요약합니다. 업로드 직후 진행 상태와 결과를 분리해 확인할 수 있습니다."
      badges={['Audio → Text', 'Summary Layer', '25MB Upload']}
      meta={[
        { label: 'Accept', value: 'mp3, wav, m4a, ogg 등' },
        { label: 'Best for', value: '회의 기록, 인터뷰 정리, 빠른 요약' },
        { label: 'Output', value: '원문 텍스트 + AI 요약' },
      ]}
      main={
        <div className={styles.stack}>
          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>파일 업로드</h2>
                <p className={styles.sectionDescription}>
                  긴 음성일수록 파일명을 명확히 두면 나중에 텍스트 파일을 내려받을 때 관리가 쉽습니다.
                </p>
              </div>
              <span className={styles.pill}>Step 1</span>
            </div>

            <label className={styles.label}>음성 파일 선택</label>
            <input
              ref={inputRef}
              style={{ display: 'none' }}
              type="file"
              accept="audio/*"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={styles.optionButton}
              style={{
                minHeight: 124,
                marginTop: 4,
                justifyContent: 'center',
                textAlign: 'center',
                borderStyle: 'dashed',
                borderColor: dragActive ? 'rgba(117, 232, 255, 0.46)' : 'rgba(255, 255, 255, 0.16)',
                background: dragActive ? 'rgba(117, 232, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span style={{ width: '100%' }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#eef2f7' }}>
                  파일을 드래그하거나 클릭해서 업로드
                </span>
                <span style={{ display: 'block', marginTop: 8, color: '#8f98a6', fontSize: 13 }}>
                  mp3, wav, m4a, ogg 등 음성 파일 지원
                </span>
              </span>
            </button>

            {file ? (
              <div className={styles.splitItem} style={{ marginTop: 14 }}>
                <strong>{file.name}</strong>
                <div className={styles.muted}>
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            ) : null}

            <div className={styles.actions}>
              <button
                className={styles.buttonPrimary}
                onClick={transcribe}
                disabled={loading || !file}
              >
                {loading ? '변환 진행 중...' : '변환 시작'}
              </button>
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>변환 텍스트</h2>
                <p className={styles.sectionDescription}>
                  원문 전체를 확인하고 필요하면 TXT로 내려받을 수 있습니다.
                </p>
              </div>
              {transcript ? (
                <button
                  className={styles.buttonSecondary}
                  onClick={() =>
                    downloadTxt(transcript, `transcript_${file?.name || 'record'}.txt`)
                  }
                >
                  TXT 다운로드
                </button>
              ) : null}
            </div>

            {transcript ? (
              <div className={styles.resultPanel}>{transcript}</div>
            ) : (
              <p className={styles.emptyState}>변환을 시작하면 원문 텍스트가 이 영역에 표시됩니다.</p>
            )}
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>진행 상태</h2>
                <p className={styles.sectionDescription}>업로드부터 요약 완료까지 현재 단계를 보여줍니다.</p>
              </div>
            </div>

            <div className={styles.splitCard}>
              <div className={styles.splitItem}>
                <strong>{loading ? '처리 중' : transcript ? '완료' : '대기 중'}</strong>
                <p className={styles.sectionDescription} style={{ marginTop: 8 }}>
                  {progress || '파일을 선택하면 여기서 처리 상태를 확인할 수 있습니다.'}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.surface}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>AI 요약</h2>
                <p className={styles.sectionDescription}>긴 녹음을 빠르게 읽기 좋게 압축합니다.</p>
              </div>
            </div>

            {summary ? (
              <div className={styles.resultPanel}>{summary}</div>
            ) : (
              <p className={styles.emptyState}>요약 결과는 이 영역에 표시됩니다.</p>
            )}
          </section>
        </div>
      }
    />
  );
}
