const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { CodexSessionMonitor, getTodaySessionsDir } = require('./watcher');

let electronApi;
try {
  electronApi = require('node:electron');
} catch {
  electronApi = require('electron');
}

const { app, BrowserWindow, ipcMain, shell } = electronApi;

let mainWindow = null;
let monitor = null;
const trackedRoots = new Set([path.resolve(__dirname, '..')]);
const subagentsConfigPath = path.join(__dirname, 'config', 'subagents.json');

function readSubagentsConfig() {
  try {
    const raw = fs.readFileSync(subagentsConfigPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { version: 1, subagents: [] };
  }
}

function normalizeRoot(targetPath) {
  if (!targetPath) return '';
  return path.resolve(String(targetPath));
}

function syncTrackedRoots() {
  if (monitor) {
    monitor.setTrackedRoots(Array.from(trackedRoots.values()));
  }
}

function addTrackedRoot(targetPath) {
  const normalized = normalizeRoot(targetPath);
  if (!normalized) {
    return;
  }
  trackedRoots.add(normalized);
  syncTrackedRoots();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 820,
    minHeight: 560,
    autoHideMenuBar: true,
    title: 'Codex Popup',
    backgroundColor: '#111111',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startMonitor() {
  monitor = new CodexSessionMonitor();
  syncTrackedRoots();
  monitor.onSnapshot((snapshot) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('snapshot', snapshot);
    }
  });
  monitor.start();
}

app.whenReady().then(() => {
  createWindow();
  startMonitor();

  ipcMain.handle('get-initial-state', () => {
    return {
      sessionsDir: getTodaySessionsDir(),
      trackedRoots: Array.from(trackedRoots.values()),
      snapshot: monitor ? monitor.getSnapshot() : { sessions: [], summary: null },
      subagentsConfig: readSubagentsConfig()
    };
  });

  ipcMain.handle('launch-codex', (_event, cwd) => {
    const startDir = typeof cwd === 'string' && cwd.trim() ? cwd : process.cwd();
    addTrackedRoot(startDir);
    spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `cd /d "${startDir}" && codex`], {
      detached: true,
      stdio: 'ignore'
    }).unref();
    return { ok: true, trackedRoots: Array.from(trackedRoots.values()) };
  });

  ipcMain.handle('track-workspace', (_event, cwd) => {
    addTrackedRoot(cwd);
    return { ok: true, trackedRoots: Array.from(trackedRoots.values()) };
  });

  ipcMain.handle('open-sessions-dir', () => {
    return shell.openPath(getTodaySessionsDir());
  });

  ipcMain.handle('open-path', (_event, targetPath) => {
    if (typeof targetPath !== 'string' || !targetPath.trim()) {
      return '';
    }
    return shell.openPath(targetPath);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (monitor) {
    monitor.stop();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
