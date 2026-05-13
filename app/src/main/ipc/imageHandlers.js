const { BrowserWindow, desktopCapturer, dialog, ipcMain, screen } = require('electron');
const { createSelectionWindow } = require('../windows/createSelectionWindow');
const { buildImagePayload, buildImagePayloadFromBuffer } = require('../services/imageService');

async function handleSelectImage() {
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
  return buildImagePayload(filePath);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getDisplayForWindow(window) {
  if (!window) {
    return screen.getPrimaryDisplay();
  }
  return screen.getDisplayMatching(window.getBounds());
}

async function captureScreenImage(display) {
  const width = Math.floor(display.size.width * display.scaleFactor);
  const height = Math.floor(display.size.height * display.scaleFactor);

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height }
  });

  const source = sources.find(item => item.display_id === String(display.id)) || sources[0];
  if (!source) {
    throw new Error('No screen sources available');
  }

  const thumbnail = source.thumbnail;
  if (thumbnail.isEmpty()) {
    throw new Error('Failed to capture screenshot');
  }

  return thumbnail;
}

function toPixelRect(selection, imageSize) {
  const scale = Number(selection.devicePixelRatio) || 1;
  const x = Math.max(0, Math.round(selection.x * scale));
  const y = Math.max(0, Math.round(selection.y * scale));
  const width = Math.max(1, Math.round(selection.width * scale));
  const height = Math.max(1, Math.round(selection.height * scale));

  const clampedWidth = Math.min(width, imageSize.width - x);
  const clampedHeight = Math.min(height, imageSize.height - y);

  return {
    x,
    y,
    width: clampedWidth,
    height: clampedHeight
  };
}

function waitForSelection(window) {
  return new Promise(resolve => {
    const onComplete = (event, selection) => {
      if (event.sender.id !== window.webContents.id) {
        return;
      }
      cleanup();
      resolve(selection);
    };

    const onCancel = (event) => {
      if (event.sender.id !== window.webContents.id) {
        return;
      }
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      ipcMain.removeListener('selection-complete', onComplete);
      ipcMain.removeListener('selection-cancel', onCancel);
      if (!window.isDestroyed()) {
        window.hide();
      }
    };

    ipcMain.on('selection-complete', onComplete);
    ipcMain.on('selection-cancel', onCancel);
  });
}

async function handleTakeScreenshot(event) {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  let selectionWindow;

  if (mainWindow) {
    mainWindow.hide();
  }

  try {
    await delay(200);

    const display = getDisplayForWindow(mainWindow);
    const image = await captureScreenImage(display);
    const imageSize = image.getSize();

    selectionWindow = createSelectionWindow(display);
    const selectionPromise = waitForSelection(selectionWindow);

    selectionWindow.webContents.once('did-finish-load', () => {
      selectionWindow.webContents.send('selection-image', {
        dataUrl: image.toDataURL()
      });
      selectionWindow.show();
      selectionWindow.focus();
    });

    const selection = await selectionPromise;
    if (!selection) {
      return null;
    }

    const pixelRect = toPixelRect(selection, imageSize);
    const cropped = image.crop(pixelRect);
    const buffer = cropped.toPNG();
    const fileName = `screenshot-${Date.now()}.png`;
    return buildImagePayloadFromBuffer(buffer, fileName, 'image/png');
  } finally {
    if (selectionWindow && !selectionWindow.isDestroyed()) {
      selectionWindow.destroy();
    }
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  }
}

function registerImageHandlers(ipcMain) {
  ipcMain.handle('select-image', handleSelectImage);
  ipcMain.handle('take-screenshot', handleTakeScreenshot);
}

module.exports = {
  registerImageHandlers
};
