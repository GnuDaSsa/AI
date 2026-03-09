const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('codexPopup', {
  getInitialState: () => ipcRenderer.invoke('get-initial-state'),
  launchCodex: (cwd) => ipcRenderer.invoke('launch-codex', cwd),
  trackWorkspace: (cwd) => ipcRenderer.invoke('track-workspace', cwd),
  openSessionsDir: () => ipcRenderer.invoke('open-sessions-dir'),
  openPath: (targetPath) => ipcRenderer.invoke('open-path', targetPath),
  onSnapshot: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on('snapshot', listener);
    return () => ipcRenderer.removeListener('snapshot', listener);
  }
});
