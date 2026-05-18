const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  goFull:      () => ipcRenderer.send('go-full'),
  goWidget:    () => ipcRenderer.send('go-widget'),
  appQuit:     () => ipcRenderer.send('app-quit'),
  appMinimize: () => ipcRenderer.send('app-minimize'),
});
