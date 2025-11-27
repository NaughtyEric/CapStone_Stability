const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Store path for evidence records
const getStorePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'evidence-records.json');
};

// Load evidence records from local storage
function loadRecords() {
  try {
    const storePath = getStorePath();
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading records:', error);
  }
  return [];
}

// Save evidence records to local storage
function saveRecords(records) {
  try {
    const storePath = getStorePath();
    fs.writeFileSync(storePath, JSON.stringify(records, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving records:', error);
    return false;
  }
}

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
  const timestamp = new Date().toISOString();
  const records = loadRecords();
  
  const newRecord = {
    id: uuidv4(),
    hash: hash,
    timestamp: timestamp,
    metadata: metadata || '',
    transactionId: transactionId || 'pending',
    imagePath: imagePath,
    base64Image: base64Image,
    status: transactionId ? 'confirmed' : 'pending'
  };
  
  records.push(newRecord);
  
  if (saveRecords(records)) {
    return { success: true, record: newRecord };
  }
  
  return { success: false, error: 'Failed to save record' };
});

ipcMain.handle('get-records', async () => {
  return loadRecords();
});

ipcMain.handle('delete-record', async (event, recordId) => {
  const records = loadRecords();
  const filteredRecords = records.filter(r => r.id !== recordId);
  
  if (saveRecords(filteredRecords)) {
    return { success: true };
  }
  
  return { success: false, error: 'Failed to delete record' };
});

ipcMain.handle('update-transaction-id', async (event, { recordId, transactionId }) => {
  const records = loadRecords();
  const record = records.find(r => r.id === recordId);
  
  if (record) {
    record.transactionId = transactionId;
    record.status = 'confirmed';
    
    if (saveRecords(records)) {
      return { success: true, record: record };
    }
  }
  
  return { success: false, error: 'Failed to update record' };
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
