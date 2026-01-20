const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Image selection and hashing
  selectImage: () => ipcRenderer.invoke('select-image'),
  
  // Evidence submission
  submitEvidence: (data) => ipcRenderer.invoke('submit-evidence', data),
  
  // Record management
  getRecords: () => ipcRenderer.invoke('get-records'),
  deleteRecord: (recordId) => ipcRenderer.invoke('delete-record', recordId),
  updateTransactionId: (data) => ipcRenderer.invoke('update-transaction-id', data)
});
