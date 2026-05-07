const recordsManager = require('../../modules/recordsManager');

function registerRecordsHandlers(ipcMain) {
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
}

module.exports = {
  registerRecordsHandlers
};
