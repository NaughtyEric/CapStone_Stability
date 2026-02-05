const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const recordsManager = require('../modules/recordsManager');

// Generate SHA-256 hash of a file
function generateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}

// Create the main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Open DevTools automatically for debugging
  mainWindow.webContents.openDevTools();
}

// IPC Handlers
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
    ]
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  const filePath = result.filePaths[0];
  const hash = await generateFileHash(filePath);
  const imageData = fs.readFileSync(filePath);
  const base64Image = imageData.toString('base64');
  const ext = path.extname(filePath).slice(1).toLowerCase();
  
  return {
    path: filePath,
    hash: hash,
    base64: `data:image/${ext};base64,${base64Image}`,
    fileName: path.basename(filePath)
  };
});

ipcMain.handle('submit-evidence', async (event, { hash, metadata, transactionId, imagePath, base64Image }) => {
  return recordsManager.addRecord(hash, metadata, transactionId, imagePath, base64Image);
});

ipcMain.handle('get-records', async () => {
  return recordsManager.loadRecords();
});

ipcMain.handle('delete-record', async (event, recordId) => {
  return recordsManager.deleteRecord(recordId);
});

ipcMain.handle('update-transaction-id', async (event, { recordId, transactionId }) => {
  return recordsManager.updateTransactionId(recordId, transactionId);
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
