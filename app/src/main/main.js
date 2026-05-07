const { app, BrowserWindow } = require('electron');
const { registerIpcHandlers } = require('./ipc/registerIpcHandlers');
const { createMainWindow } = require('./windows/createMainWindow');

function bootApplication() {
  registerIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

// App lifecycle
app.whenReady().then(bootApplication);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
