const sessionsDirEl = document.getElementById('sessionsDir');
const summaryEl = document.getElementById('summary');
const facilityStageEl = document.getElementById('facilityStage');
const missionBoardEl = document.getElementById('missionBoard');
const timestampLabelEl = document.getElementById('timestampLabel');
const launchButton = document.getElementById('launchButton');
const openDirButton = document.getElementById('openDirButton');

const ARCHETYPES = [
  { key: 'satoru', role: 'Blindfold Mentor', technique: 'Infinity Field', alias: 'Kairo Satorin' },
  { key: 'yuji', role: 'Close-Range Striker', technique: 'Crimson Impact', alias: 'Yu Kaneda' },
  { key: 'megumi', role: 'Shadow Tactician', technique: 'Ten Shadows', alias: 'Meguru Fushin' },
  { key: 'nobara', role: 'Weapon Specialist', technique: 'Resonance Nails', alias: 'Nora Kugase' },
  { key: 'maki', role: 'Glasses Enforcer', technique: 'Steel Frame', alias: 'Maki Zenra' },
  { key: 'nanami', role: 'Ratio Analyst', technique: 'Ratio Cut', alias: 'Nana Mito' }
];

const DEFAULT_ROLE_PRESETS = {
  satoru: { title: '기획자', brief: '문제 정의와 우선순위 설계' },
  yuji: { title: '코더', brief: '구현과 기능 개발' },
  megumi: { title: '웹디자이너', brief: '강한 브랜드형 UI 설계' },
  nobara: { title: '작가', brief: '스토리와 카피 작성' },
  maki: { title: '리뷰어', brief: '검토와 품질 확인' },
  nanami: { title: '리서처', brief: '조사와 자료 정리' }
};
let rolePresets = { ...DEFAULT_ROLE_PRESETS };
let subagentCatalog = [];

const SPRITE_PALETTES = {
  satoru: { hair: '#f0f5ff', hairShade: '#aebee0', uniform: '#1d2842', trim: '#daf1ff', accent: '#69d8ff', shoes: '#1f2535', detail: '#111524' },
  yuji: { hair: '#ff8dac', hairShade: '#d66084', uniform: '#243352', trim: '#202b43', accent: '#de3c62', shoes: '#2d220f', detail: '#b83f47' },
  megumi: { hair: '#1a243a', hairShade: '#4b5777', uniform: '#2f355f', trim: '#6e7cb0', accent: '#c7ad4a', shoes: '#6b562d', detail: '#d7e1ff' },
  nobara: { hair: '#9a5b44', hairShade: '#6d3d2f', uniform: '#332136', trim: '#1e1723', accent: '#d19a4d', shoes: '#5a4030', detail: '#f0c889' },
  maki: { hair: '#1d2335', hairShade: '#50597a', uniform: '#2a2646', trim: '#d9d4c4', accent: '#9cf19f', shoes: '#433625', detail: '#2f3653' },
  nanami: { hair: '#f1d694', hairShade: '#c4a566', uniform: '#bfa46e', trim: '#745f40', accent: '#ffdf91', shoes: '#5f4d35', detail: '#2a3559' }
};

const SPRITE_IMAGES = {
  satoru: '../assets/agents/satoru_full.png',
  yuji: '../assets/agents/yuji_full.png',
  nobara: '../assets/agents/nobara_full.png',
  megumi: '../assets/agents/megumi_full.png',
  maki: '../assets/agents/maki_full.png',
  nanami: '../assets/agents/maki_full.png'
};

const sceneryState = {
  totalSessions: 0,
  officeSlots: 0,
  loungeSlots: 0
};

const agentNodes = new Map();
const archetypeAssignments = new Map();
const slotAssignments = new Map();
let sceneryLayerEl = null;
let agentLayerEl = null;
let lastSnapshot = null;
let trackedRoots = [];

function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncate(text, max) {
  const safe = String(text || '');
  return safe.length > max ? `${safe.slice(0, max - 1)}...` : safe;
}

function summarizeTwoLines(session, profile) {
  const task = truncate(profile.brief || deriveDuty(session, 'office'), 24);
  const detailSource = session.activeTools?.length
    ? session.activeTools[session.activeTools.length - 1].status
    : (session.lastTool?.status || session.lastMessage || session.lastUserMessage || '진행 중');
  const detail = truncate(detailSource, 26);
  return [task, detail];
}

function hashSeed(seed) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function sessionArchetype(session, index) {
  const assigned = archetypeAssignments.get(session.id);
  if (assigned) {
    return assigned;
  }
  const seed = hashSeed(session.id || `${index}`);
  return ARCHETYPES[seed % ARCHETYPES.length];
}

function deriveDisplayName(session, archetype) {
  const raw = session.cwd ? session.cwd.split(/[\\/]/).filter(Boolean).pop() : '';
  if (raw) {
    return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return archetype.alias;
}

function inferAgentProfile(session, archetype) {
  const activeSubagentId = inferSubagentId(session);
  const configured = subagentCatalog.find((subagent) => subagent.id === activeSubagentId);
  if (configured) {
    return {
      title: configured.title,
      brief: configured.short_brief
    };
  }

  return rolePresets[archetype.key] || {
    title: deriveDisplayName(session, archetype).toLowerCase() === 'ai' ? archetype.alias : deriveDisplayName(session, archetype),
    brief: `${archetype.role} 업무`
  };
}

function inferSubagentId(session) {
  const text = [
    session.cwd || '',
    session.lastUserMessage || '',
    session.lastMessage || '',
    session.lastTool?.name || '',
    session.lastTool?.status || '',
    ...(session.activeTools || []).flatMap((tool) => [tool.name || '', tool.status || ''])
  ].join(' ').toLowerCase();

  const hasAny = (keywords) => keywords.some((keyword) => text.includes(keyword));

  if (hasAny(['apply_patch', 'shell_command', 'npm', 'node ', 'build', 'lint', 'test', 'fix', 'bug', 'debug', 'refactor', 'implement', 'code', '코드', '구현', '디버그'])) {
    return 'coder';
  }
  if (hasAny(['ui', 'ux', 'design', 'layout', 'brand', 'landing', 'figma', 'css', 'web', '디자인', '브랜드', '레이아웃', '화면'])) {
    return 'web_designer';
  }
  if (hasAny(['story', 'copy', 'script', 'narrative', 'dialog', 'worldbuilding', 'writer', '스토리', '카피', '대사', '문안', '세계관', '작가'])) {
    return 'writer';
  }
  if (hasAny(['research', 'search', 'document', 'docs', '리서치', '조사', '문서'])) {
    return 'researcher';
  }
  if (hasAny(['review', 'qa', '검토', '리뷰'])) {
    return 'reviewer';
  }
  return 'planner';
}

function applySubagentConfig(config) {
  const subagents = Array.isArray(config?.subagents) ? config.subagents : [];
  if (!subagents.length) {
    rolePresets = { ...DEFAULT_ROLE_PRESETS };
    subagentCatalog = [];
    return;
  }

  const mapping = {
    planner: 'satoru',
    coder: 'yuji',
    web_designer: 'megumi',
    writer: 'nobara',
    reviewer: 'maki',
    researcher: 'nanami'
  };

  const nextPresets = { ...DEFAULT_ROLE_PRESETS };
  for (const subagent of subagents) {
    const archetypeKey = mapping[subagent.id];
    if (!archetypeKey) {
      continue;
    }

    nextPresets[archetypeKey] = {
      title: subagent.title || nextPresets[archetypeKey].title,
      brief: subagent.short_brief || nextPresets[archetypeKey].brief
    };
  }

  rolePresets = nextPresets;
  subagentCatalog = subagents;
}

function deriveDuty(session, zone) {
  if (zone === 'lounge') {
    return '휴식 중';
  }
  if (session.activeTools?.length) {
    return session.activeTools[session.activeTools.length - 1].status || 'Executing tool chain';
  }
  if (session.lastTool?.status) {
    return session.lastTool.status;
  }
  if (session.lastMessage) {
    return truncate(session.lastMessage, 54);
  }
  if (session.lastUserMessage) {
    return truncate(session.lastUserMessage, 54);
  }
  if (session.status === 'waiting') {
    return '다음 작업 대기';
  }
  return '새 지시 대기';
}

function rect(x, y, width, height, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
}

function rects(cells, fill) {
  return cells.map(([x, y, width = 1, height = 1]) => rect(x, y, width, height, fill)).join('');
}

function getStageMetrics() {
  const width = Math.max(Math.floor(facilityStageEl.clientWidth || 0), 860);
  const height = Math.max(Math.floor(facilityStageEl.clientHeight || 0), 720);
  const officeRight = Math.floor(width * 0.64);
  const loungeLeft = Math.floor(width * 0.71);

  return {
    width,
    height,
    officeLeft: 24,
    officeRight,
    loungeLeft,
    loungeRight: width - 36
  };
}

function buildOfficeLayout(count, metrics) {
  if (!count) return [];

  const cols = count >= 4 ? 2 : 1;
  const rows = Math.ceil(count / cols);
  const clusterWidth = 228;
  const clusterHeight = 168;
  const gapX = 28;
  const gapY = 34;
  const totalWidth = (cols * clusterWidth) + ((cols - 1) * gapX);
  const totalHeight = (rows * clusterHeight) + ((rows - 1) * gapY);
  const startX = metrics.officeLeft + Math.max(0, Math.floor(((metrics.officeRight - metrics.officeLeft) - totalWidth) / 2));
  const startY = 92 + Math.max(0, Math.floor((Math.max(420, metrics.height - 160) - totalHeight) / 2));
  const roomNames = ['North Ops', 'Incident Grid', 'Archive Bay'];

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + (col * (clusterWidth + gapX));
    const y = startY + (row * (clusterHeight + gapY));

    return {
      x,
      y,
      room: roomNames[row] || `Ops ${row + 1}`,
      anchor: { x: x + 108, y: y + 118 }
    };
  });
}

function buildLoungeLayout(count, metrics) {
  if (!count) return [];

  const cols = 1;
  const rows = Math.ceil(count / cols);
  const clusterWidth = 160;
  const clusterHeight = 142;
  const gapX = 0;
  const gapY = 20;
  const totalWidth = (cols * clusterWidth) + ((cols - 1) * gapX);
  const totalHeight = (rows * clusterHeight) + ((rows - 1) * gapY);
  const startX = metrics.loungeLeft + Math.max(0, Math.floor(((metrics.loungeRight - metrics.loungeLeft) - totalWidth) / 2));
  const startY = 112 + Math.max(0, Math.floor((Math.max(420, metrics.height - 190) - totalHeight) / 2));
  const roomNames = ['Coffee Bar', 'Window Bench', 'Quiet Booth', 'Side Table'];

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + (col * (clusterWidth + gapX));
    const y = startY + (row * (clusterHeight + gapY));

    return {
      x,
      y,
      room: roomNames[index] || `Lounge ${index + 1}`,
      anchor: { x: x + 80, y: y + 110 }
    };
  });
}

function updateSceneryState(totalSessions) {
  const normalized = Math.max(0, totalSessions);
  if (normalized !== sceneryState.totalSessions) {
    sceneryState.totalSessions = normalized;
    sceneryState.officeSlots = normalized;
    sceneryState.loungeSlots = normalized;
  }
}

function buildFacilityLayout(totalSessions) {
  const metrics = getStageMetrics();
  updateSceneryState(totalSessions);

  return {
    metrics,
    office: buildOfficeLayout(sceneryState.officeSlots, metrics),
    lounge: buildLoungeLayout(sceneryState.loungeSlots, metrics)
  };
}

function syncArchetypeAssignments(sessions) {
  const activeIds = new Set(sessions.map((session) => session.id));

  for (const sessionId of Array.from(archetypeAssignments.keys())) {
    if (!activeIds.has(sessionId)) {
      archetypeAssignments.delete(sessionId);
    }
  }

  const usedKeys = new Set(Array.from(archetypeAssignments.values()).map((entry) => entry.key));
  for (const session of sessions) {
    if (archetypeAssignments.has(session.id)) {
      continue;
    }

    const nextArchetype = ARCHETYPES.find((candidate) => !usedKeys.has(candidate.key))
      || ARCHETYPES[hashSeed(session.id) % ARCHETYPES.length];
    archetypeAssignments.set(session.id, nextArchetype);
    usedKeys.add(nextArchetype.key);
  }
}

function syncSlotAssignments(sessions) {
  const activeIds = new Set(sessions.map((session) => session.id));

  for (const sessionId of Array.from(slotAssignments.keys())) {
    if (!activeIds.has(sessionId)) {
      slotAssignments.delete(sessionId);
    }
  }

  const usedSlots = new Set(slotAssignments.values());
  let nextSlot = 0;

  for (const session of sessions) {
    if (slotAssignments.has(session.id)) {
      continue;
    }

    while (usedSlots.has(nextSlot)) {
      nextSlot += 1;
    }

    slotAssignments.set(session.id, nextSlot);
    usedSlots.add(nextSlot);
    nextSlot += 1;
  }
}

function buildPixelSprite(archetype, status) {
  const palette = SPRITE_PALETTES[archetype.key] || SPRITE_PALETTES.megumi;
  const aura = status === 'active' ? palette.accent : status === 'waiting' ? '#f1b945' : '#8893a6';
  const spriteSrc = SPRITE_IMAGES[archetype.key] || SPRITE_IMAGES.megumi;

  return `
    <div class="pixel-aura" style="--aura:${escapeHtml(aura)}"></div>
    <div class="pixel-sprite-frame" aria-hidden="true">
      <img
        class="pixel-sprite-image"
        src="${spriteSrc}"
        alt=""
      />
    </div>
  `;
}

function statusClass(status) {
  if (status === 'active') return 'active';
  if (status === 'waiting') return 'waiting';
  return 'idle';
}

function partitionSessions(sessions) {
  const active = [];
  const standby = [];

  for (const session of sessions) {
    if (session.status === 'active') {
      active.push(session);
    } else {
      standby.push(session);
    }
  }

  return { active, standby };
}

function getActiveToolCount(sessions) {
  return sessions.reduce((count, session) => count + (session.activeTools?.length || 0), 0);
}

function renderSummary(snapshot, activeCount, standbyCount) {
  const safe = snapshot.summary || { total: 0, active: 0, waiting: 0 };
  const cards = [
    ['Tracked Sorcerers', safe.total],
    ['Working In Office', activeCount],
    ['Resting In Lounge', standbyCount],
    ['Active Tools', getActiveToolCount(snapshot.sessions || [])]
  ];

  summaryEl.innerHTML = cards.map(([label, value]) => `
    <article class="status-card">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value)}</div>
    </article>
  `).join('');
}

function renderDeskCluster(desk, index) {
  return `
    <div class="desk-cluster" style="left:${desk.x}px; top:${desk.y}px">
      <div class="room-label" style="top:-26px; left:6px">${escapeHtml(desk.room)}</div>
      <div class="desk-table" style="left:0; top:26px">
        <div class="monitor"></div>
        <div class="display-panel left"></div>
      </div>
      <div class="desk-table" style="right:0; top:106px">
        <div class="monitor"></div>
        <div class="display-panel right"></div>
      </div>
      <div class="chair" style="left:42px; top:118px"></div>
      <div class="chair" style="right:40px; top:24px"></div>
      <div class="energy-trace" style="opacity:${0.18 + ((index % 3) * 0.1)}"></div>
    </div>
  `;
}

function renderLoungeCluster(spot, index) {
  return `
    <div class="lounge-cluster" style="left:${spot.x}px; top:${spot.y}px">
      <div class="room-label" style="top:-24px; left:4px">${escapeHtml(spot.room)}</div>
      <div class="sofa" style="left:0; top:16px"></div>
      <div class="sofa" style="left:42px; top:82px"></div>
      <div class="table-round" style="left:102px; top:20px">
        <div class="coffee"></div>
      </div>
      <div class="energy-trace" style="bottom:10px; width:58px; opacity:${0.12 + ((index % 2) * 0.08)}"></div>
    </div>
  `;
}

function renderScenery(layout) {
  sceneryLayerEl.innerHTML = [
    layout.office.map(renderDeskCluster).join(''),
    layout.lounge.map(renderLoungeCluster).join('')
  ].join('');
}

function renderFilterNote() {
  const noteEl = facilityStageEl.querySelector('.filter-note');
  const message = trackedRoots.length
    ? `Tracking ${trackedRoots.length} Codex workspace${trackedRoots.length > 1 ? 's' : ''}`
    : 'No tracked Codex workspace yet. Use Launch Codex to start a monitored agent.';

  if (noteEl) {
    noteEl.textContent = message;
  }
}

function ensureFacilityStage() {
  if (agentLayerEl && sceneryLayerEl) {
    return;
  }

  facilityStageEl.innerHTML = `
    <div class="zone-shell office-shell"></div>
    <div class="zone-shell lounge-shell"></div>
    <div class="zone-title" style="left:28px; top:18px">Operations Office</div>
    <div class="zone-title" style="right:32px; top:18px">Recovery Lounge</div>
    <div class="divider-note">Active sessions stay on the floor. Waiting and idle sessions fall back to the lounge.</div>
    <div class="zone-subtitle" style="left:28px; top:42px">Desk clusters, monitors, and active execution lanes</div>
    <div class="zone-subtitle" style="right:32px; top:42px">Cool-down seats, standby booths, and watch rotation</div>
    <div class="filter-note"></div>
    <div class="scenery-layer" id="sceneryLayer"></div>
    <div class="agent-layer" id="agentLayer"></div>
  `;

  sceneryLayerEl = document.getElementById('sceneryLayer');
  agentLayerEl = document.getElementById('agentLayer');
  agentLayerEl.addEventListener('dblclick', (event) => {
    const node = event.target.closest('.agent-node');
    if (!node) {
      return;
    }

    const target = node.getAttribute('data-path');
    if (target) {
      window.codexPopup.openPath(target);
    }
  });
}

function renderAgentMarkup(session, archetype, zone) {
  const profile = inferAgentProfile(session, archetype);
  const duty = deriveDuty(session, zone);
  const zoneLabel = zone === 'office' ? 'ON DUTY' : 'STANDBY';
  const [summaryLine1, summaryLine2] = summarizeTwoLines(session, profile);
  const speechMarkup = zone === 'office' ? `
    <div class="speech">
      <div class="speech-line">${escapeHtml(summaryLine1)}</div>
      <div class="speech-line muted">${escapeHtml(summaryLine2)}</div>
    </div>
  ` : '';

  return `
    ${speechMarkup}
    <div class="agent-sprite">
      ${buildPixelSprite(archetype, session.status)}
      <div class="sprite-shadow"></div>
    </div>
    <div class="agent-badge">
      <div class="badge-row">
        <div class="agent-name">${escapeHtml(profile.title)}</div>
        <div class="agent-zone">${escapeHtml(zoneLabel)}</div>
      </div>
      <div class="agent-role">${escapeHtml(profile.brief)}</div>
      <div class="agent-duty">${escapeHtml(duty)}</div>
    </div>
  `;
}

function upsertAgentNode(session, target, index, zone) {
  const archetype = sessionArchetype(session, index);
  const status = statusClass(session.status);
  let node = agentNodes.get(session.id);

  if (!node) {
    node = document.createElement('div');
    node.className = 'agent-node';
    agentNodes.set(session.id, node);
    agentLayerEl.appendChild(node);
  }

  node.dataset.path = session.cwd || '';
  node.className = `agent-node ${status} archetype-${archetype.key}`;
  node.style.left = `${target.x}px`;
  node.style.top = `${target.y}px`;
  node.innerHTML = renderAgentMarkup(session, archetype, zone);
}

function clearUnusedAgents(activeSessionIds) {
  for (const [sessionId, node] of agentNodes.entries()) {
    if (activeSessionIds.has(sessionId)) {
      continue;
    }

    node.classList.add('exiting');
    setTimeout(() => {
      if (agentNodes.get(sessionId) !== node) {
        return;
      }
      node.remove();
      agentNodes.delete(sessionId);
    }, 320);
  }
}

function renderStage(snapshot) {
  ensureFacilityStage();

  const sessions = snapshot.sessions || [];
  syncArchetypeAssignments(sessions);
  syncSlotAssignments(sessions);
  const { active, standby } = partitionSessions(sessions);
  const visibleSessionIds = new Set();
  const layout = buildFacilityLayout(sessions.length);

  renderScenery(layout);
  renderFilterNote();

  sessions.forEach((session) => {
    const slotIndex = slotAssignments.get(session.id) || 0;
    const zone = session.status === 'active' ? 'office' : 'lounge';
    const target = zone === 'office' ? layout.office[slotIndex] : layout.lounge[slotIndex];
    if (!target) return;
    visibleSessionIds.add(session.id);
    upsertAgentNode(session, target.anchor, slotIndex, zone);
  });

  clearUnusedAgents(visibleSessionIds);

  const hasVisibleAgents = visibleSessionIds.size > 0;
  let emptyStateEl = facilityStageEl.querySelector('.empty-state');
  if (!hasVisibleAgents) {
    if (!emptyStateEl) {
      emptyStateEl = document.createElement('div');
      emptyStateEl.className = 'empty-state';
      emptyStateEl.style.position = 'absolute';
      emptyStateEl.style.left = '50%';
      emptyStateEl.style.top = '50%';
      emptyStateEl.style.transform = 'translate(-50%, -50%)';
      emptyStateEl.style.width = 'min(440px, calc(100% - 48px))';
      emptyStateEl.style.zIndex = '4';
      facilityStageEl.appendChild(emptyStateEl);
    }

    emptyStateEl.innerHTML = 'No Codex session logs detected yet.<br />Launch Codex or wait for a new session to write into today\'s folder.';
  } else if (emptyStateEl) {
    emptyStateEl.remove();
  }

  return { active, standby };
}

function renderMissionBoard(sessions, active, standby) {
  if (!sessions.length) {
    missionBoardEl.innerHTML = `
      <div class="empty-state">
        The mission board is empty.<br />
        New Codex sessions will appear here with tool traces and latest transmissions.
      </div>
    `;
    return;
  }

  const renderGroup = (title, groupSessions, startIndex) => {
    if (!groupSessions.length) {
      return `
        <section class="mission-group">
          <div class="mission-group-title">${escapeHtml(title)}</div>
          <div class="empty-state">No agents in this zone.</div>
        </section>
      `;
    }

    const cards = groupSessions.slice(0, 4).map((session, index) => {
      const absoluteIndex = startIndex + index;
      const archetype = sessionArchetype(session, absoluteIndex);
      const profile = inferAgentProfile(session, archetype);
      const tools = session.activeTools?.length
        ? session.activeTools
        : (session.lastTool ? [session.lastTool] : []);
      const isStandby = title === 'Standby In Lounge';
      const message = isStandby
        ? '휴식 중. 이전 작업 로그는 숨김 처리됩니다.'
        : truncate(session.lastMessage || session.lastUserMessage || 'No transmissions yet.', 220);

      return `
        <article class="mission-card ${absoluteIndex === 0 ? 'primary' : ''}">
          <div class="mission-head">
            <div>
              <div class="mission-name">${escapeHtml(profile.title)}</div>
              <div class="mission-sub">${escapeHtml(profile.brief)}</div>
            </div>
            <div class="mission-status ${escapeHtml(statusClass(session.status))}">${escapeHtml(session.status)}</div>
          </div>
          <div class="mission-meta">Updated ${escapeHtml(session.updatedAt || '-')}</div>
          <div class="mission-cwd">${escapeHtml(truncate(session.cwd || 'Unknown working directory', 70))}</div>
          <div class="mission-cwd">${escapeHtml(`Duty: ${deriveDuty(session, isStandby ? 'lounge' : 'office')}`)}</div>
          <div class="mission-message">${escapeHtml(message)}</div>
          <div class="tool-stack">
            ${isStandby
              ? '<div class="tool-pill">휴식 중</div>'
              : tools.map((tool) => `<div class="tool-pill">${escapeHtml(tool.status || 'Standing by')}</div>`).join('')}
          </div>
        </article>
      `;
    }).join('');

    return `
      <section class="mission-group">
        <div class="mission-group-title">${escapeHtml(title)}</div>
        ${cards}
      </section>
    `;
  };

  missionBoardEl.innerHTML = [
    renderGroup('Working In Office', active, 0),
    renderGroup('Standby In Lounge', standby, active.length)
  ].join('');
}

function render(snapshot) {
  lastSnapshot = snapshot;
  const sessions = snapshot.sessions || [];
  const { active, standby } = renderStage(snapshot);

  sessionsDirEl.textContent = snapshot.sessionsDir || '';
  timestampLabelEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;
  renderSummary(snapshot, active.length, standby.length);
  renderMissionBoard(sessions, active, standby);
}

launchButton.addEventListener('click', async () => {
  const firstAgentCwd = Array.from(agentNodes.values())[0]?.getAttribute('data-path') || '';
  const result = await window.codexPopup.launchCodex(firstAgentCwd);
  trackedRoots = result?.trackedRoots || trackedRoots;
  renderFilterNote();
});

openDirButton.addEventListener('click', async () => {
  await window.codexPopup.openSessionsDir();
});

window.codexPopup.getInitialState().then(({ snapshot, trackedRoots: initialTrackedRoots, subagentsConfig }) => {
  trackedRoots = initialTrackedRoots || [];
  applySubagentConfig(subagentsConfig);
  render(snapshot);
});

window.codexPopup.onSnapshot((snapshot) => {
  render(snapshot);
});

window.addEventListener('resize', () => {
  if (lastSnapshot) {
    render(lastSnapshot);
  }
});
