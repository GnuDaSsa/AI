const fs = require('fs');
const os = require('os');
const path = require('path');

function getTodaySessionsDir(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return path.join(os.homedir(), '.codex', 'sessions', year, month, day);
}

function safeJsonParse(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function summarizeTool(name, rawArguments) {
  let args = {};
  if (typeof rawArguments === 'string') {
    try {
      args = JSON.parse(rawArguments);
    } catch {
      args = {};
    }
  }

  if (name === 'shell_command') {
    return truncate(`Running ${args.command || ''}`, 56);
  }
  if (name === 'apply_patch') {
    return 'Editing files';
  }
  if (name === 'update_plan') {
    return 'Planning';
  }
  if (name === 'view_image') {
    return 'Viewing image';
  }
  if (name === 'request_user_input') {
    return 'Waiting for input';
  }
  return `Using ${name}`;
}

function createSession(filePath) {
  return {
    id: filePath,
    filePath,
    fileName: path.basename(filePath),
    cwd: '',
    startedAt: '',
    updatedAt: '',
    status: 'idle',
    lastMessage: '',
    lastUserMessage: '',
    activeTools: new Map(),
    toolHistory: [],
    offset: 0,
    remainder: ''
  };
}

function normalizePath(targetPath) {
  if (!targetPath) return '';
  return path.resolve(String(targetPath)).toLowerCase();
}

function serializeSession(session) {
  const activeTools = Array.from(session.activeTools.values());
  const lastTool = activeTools[activeTools.length - 1] || session.toolHistory[session.toolHistory.length - 1] || null;

  return {
    id: session.id,
    filePath: session.filePath,
    fileName: session.fileName,
    cwd: session.cwd,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    status: session.status,
    lastMessage: session.lastMessage,
    lastUserMessage: session.lastUserMessage,
    activeTools,
    lastTool,
    toolHistory: session.toolHistory.slice(-8)
  };
}

class CodexSessionMonitor {
  constructor() {
    this.sessions = new Map();
    this.listeners = new Set();
    this.timer = null;
    this.currentDir = getTodaySessionsDir();
    this.trackedRoots = new Set();
  }

  start() {
    this.scan();
    this.timer = setInterval(() => this.scan(), 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onSnapshot(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    const sessions = Array.from(this.sessions.values())
      .filter((session) => this.isTrackedSession(session))
      .map(serializeSession)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

    const summary = {
      total: sessions.length,
      active: sessions.filter((session) => session.status === 'active').length,
      waiting: sessions.filter((session) => session.status === 'waiting').length
    };

    return {
      sessionsDir: this.currentDir,
      sessions,
      summary
    };
  }

  setTrackedRoots(roots) {
    this.trackedRoots = new Set((roots || []).map(normalizePath).filter(Boolean));
    this.emitSnapshot();
  }

  getTrackedRoots() {
    return Array.from(this.trackedRoots.values());
  }

  isTrackedSession(session) {
    if (!this.trackedRoots.size) {
      return false;
    }

    const sessionCwd = normalizePath(session.cwd);
    if (!sessionCwd) {
      return false;
    }

    for (const root of this.trackedRoots) {
      if (sessionCwd === root || sessionCwd.startsWith(`${root}${path.sep}`)) {
        return true;
      }
    }

    return false;
  }

  emitSnapshot() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  scan() {
    const nextDir = getTodaySessionsDir();
    if (nextDir !== this.currentDir) {
      this.currentDir = nextDir;
      this.sessions.clear();
    }

    if (!fs.existsSync(this.currentDir)) {
      this.emitSnapshot();
      return;
    }

    const files = fs.readdirSync(this.currentDir)
      .filter((name) => name.endsWith('.jsonl'))
      .map((name) => path.join(this.currentDir, name));

    for (const filePath of files) {
      if (!this.sessions.has(filePath)) {
        this.sessions.set(filePath, createSession(filePath));
      }
      this.readFileDelta(this.sessions.get(filePath));
    }

    this.emitSnapshot();
  }

  readFileDelta(session) {
    let stat;
    try {
      stat = fs.statSync(session.filePath);
    } catch {
      return;
    }

    if (stat.size < session.offset) {
      session.offset = 0;
      session.remainder = '';
    }

    if (stat.size === session.offset) {
      return;
    }

    const size = stat.size - session.offset;
    const buffer = Buffer.alloc(size);
    const fd = fs.openSync(session.filePath, 'r');
    fs.readSync(fd, buffer, 0, size, session.offset);
    fs.closeSync(fd);
    session.offset = stat.size;

    const text = session.remainder + buffer.toString('utf8');
    const lines = text.split('\n');
    session.remainder = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const record = safeJsonParse(line);
      if (!record) continue;
      this.applyRecord(session, record);
    }
  }

  applyRecord(session, record) {
    session.updatedAt = record.timestamp || session.updatedAt;

    if (record.type === 'session_meta') {
      session.cwd = record.payload && record.payload.cwd ? record.payload.cwd : session.cwd;
      session.startedAt = record.timestamp || session.startedAt;
      return;
    }

    if (record.type === 'event_msg') {
      const payload = record.payload || {};
      if (payload.type === 'task_started') {
        session.status = 'active';
      } else if (payload.type === 'user_message') {
        session.status = 'active';
        session.lastUserMessage = truncate(payload.message || '', 140);
      } else if (payload.type === 'agent_message') {
        session.status = 'active';
        session.lastMessage = truncate(payload.message || '', 180);
      } else if (payload.type === 'task_complete') {
        session.status = 'waiting';
        session.activeTools.clear();
      } else if (payload.type === 'turn_aborted') {
        session.status = 'idle';
        session.activeTools.clear();
      }
      return;
    }

    if (record.type !== 'response_item') {
      return;
    }

    const payload = record.payload || {};
    if (payload.type === 'function_call') {
      const tool = {
        toolId: payload.call_id || `${payload.name}-${Date.now()}`,
        name: payload.name || 'tool',
        status: summarizeTool(payload.name || 'tool', payload.arguments),
        startedAt: record.timestamp || ''
      };
      session.status = 'active';
      session.activeTools.set(tool.toolId, tool);
      session.toolHistory.push(tool);
      session.toolHistory = session.toolHistory.slice(-20);
      return;
    }

    if (payload.type === 'function_call_output') {
      const tool = session.activeTools.get(payload.call_id);
      if (tool) {
        tool.doneAt = record.timestamp || '';
        tool.exitSummary = truncate(String(payload.output || ''), 120);
      }
      session.activeTools.delete(payload.call_id);
      if (session.activeTools.size === 0 && session.status === 'active') {
        session.status = 'waiting';
      }
    }
  }
}

module.exports = {
  CodexSessionMonitor,
  getTodaySessionsDir
};
