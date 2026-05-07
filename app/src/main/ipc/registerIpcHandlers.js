const { ipcMain } = require('electron');
const { registerChainHandlers } = require('./chainHandlers');
const { registerImageHandlers } = require('./imageHandlers');
const { registerRecordsHandlers } = require('./recordsHandlers');

function registerIpcHandlers() {
  registerImageHandlers(ipcMain);
  registerRecordsHandlers(ipcMain);
  registerChainHandlers(ipcMain);
}

module.exports = {
  registerIpcHandlers
};
