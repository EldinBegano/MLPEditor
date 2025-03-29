const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content) => ipcRenderer.send('show-save-dialog', content),
  onSaveComplete: (callback) => ipcRenderer.on('save-complete', (event, path) => callback(path)),
  onSaveError: (callback) => ipcRenderer.on('save-error', (event, error) => callback(error)),
  openFile: () => ipcRenderer.send('show-open-dialog'),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (event, data) => callback(data)),
  onFileOpenError: (callback) => ipcRenderer.on('file-open-error', (event, error) => callback(error)),
  onNewFile: (callback) => ipcRenderer.on('new-file', () => callback()),
  onSaveFile: (callback) => ipcRenderer.on('save-file', () => callback()),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', () => callback())
});