const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('selectionAPI', {
  onImage: (handler) => ipcRenderer.on('selection-image', (event, payload) => handler(payload)),
  completeSelection: (selection) => ipcRenderer.send('selection-complete', selection),
  cancelSelection: () => ipcRenderer.send('selection-cancel')
});
