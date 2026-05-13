const { BrowserWindow } = require('electron');
const path = require('path');

function createSelectionWindow(display) {
  const bounds = display ? display.bounds : undefined;

  const window = new BrowserWindow({
    x: bounds ? bounds.x : undefined,
    y: bounds ? bounds.y : undefined,
    width: bounds ? bounds.width : 800,
    height: bounds ? bounds.height : 600,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreen: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'selectionPreload.js')
    }
  });

  window.loadFile(path.join(__dirname, '..', '..', 'renderer', 'selection.html'));

  return window;
}

module.exports = {
  createSelectionWindow
};
