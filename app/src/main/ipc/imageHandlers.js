const { dialog } = require('electron');
const { buildImagePayload } = require('../services/imageService');

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

function registerImageHandlers(ipcMain) {
  ipcMain.handle('select-image', handleSelectImage);
}

module.exports = {
  registerImageHandlers
};
