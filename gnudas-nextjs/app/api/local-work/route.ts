import { NextResponse } from 'next/server';
import { execSync } from 'node:child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safe(cmd: string) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function detectModel(line: string) {
  const v = line.toLowerCase();
  if (v.includes('codex') || v.includes('openclaw')) return 'gpt-5.4-medium';
  if (v.includes('claude')) return 'claude-sonnet';
  if (v.includes('next dev')) return 'local-runtime';
  return 'unknown';
}

function shortName(line: string) {
  const v = line.toLowerCase();
  if (v.includes('codex')) return 'Codex SubAgent';
  if (v.includes('claude')) return 'Claude SubAgent';
  if (v.includes('openclaw')) return 'OpenClaw Main';
  if (v.includes('next dev')) return 'Dev Server';
  return 'Worker';
}

export async function GET() {
  const branch = safe('git rev-parse --abbrev-ref HEAD') || 'unknown';
  const statusRaw = safe('git status --porcelain');
  const changedFiles = statusRaw ? statusRaw.split('\n').filter(Boolean).map((l) => l.slice(3)) : [];
  const changedCount = changedFiles.length;
  const lastCommit = safe('git log -1 --pretty=format:"%h %s"');
  const codingProcesses = safe("pgrep -fl 'claude|codex|openclaw|next dev' | head -n 12")
    .split('\n')
    .filter(Boolean);

  const processAgents = codingProcesses.map((line, idx) => ({
    name: `${shortName(line)} #${idx + 1}`,
    model: detectModel(line),
    state: 'RUNNING',
    detail: line,
  }));

  const agentPipeline = [
    { name: 'Planner Agent', model: 'gpt-5.4-medium', state: 'DONE', detail: '요구사항 해석 완료' },
    {
      name: 'Coding Agent',
      model: 'gpt-5.4-medium',
      state: changedCount > 0 ? 'RUNNING' : 'IDLE',
      detail: changedCount > 0 ? `${changedCount}개 파일 로컬 변경 감지` : '작업 대기 중',
    },
    {
      name: 'Review Agent',
      model: 'claude-sonnet',
      state: changedCount > 0 ? 'QUEUED' : 'READY',
      detail: changedCount > 0 ? '변경사항 확정 후 검토 예정' : '검토 가능 상태',
    },
    {
      name: 'Ops Agent',
      model: 'local-runtime',
      state: codingProcesses.length > 0 ? 'RUNNING' : 'IDLE',
      detail: codingProcesses.length > 0 ? `${codingProcesses.length}개 로컬 프로세스 활성` : '활성 프로세스 없음',
    },
    ...processAgents,
  ];

  return NextResponse.json({
    branch,
    changedCount,
    changedFiles: changedFiles.slice(0, 12),
    lastCommit,
    codingProcesses,
    updatedAt: new Date().toISOString(),
    agentPipeline,
  });
}
