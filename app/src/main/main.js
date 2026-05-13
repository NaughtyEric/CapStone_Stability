const { app, BrowserWindow, Menu } = require('electron');
const { registerIpcHandlers } = require('./ipc/registerIpcHandlers');
const { createMainWindow } = require('./windows/createMainWindow');

function bootApplication() {
  if (process.platform === 'darwin') {
    const menu = Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          { role: 'quit', label: 'Exit' }
        ]
      }
    ]);
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }
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
