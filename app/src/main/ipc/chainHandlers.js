const submitManager = require('../../modules/submitManager');

async function handleSubmitToChain(event, data) {
  try {
    const result = await submitManager.submitEvidenceOnChain(data);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message || 'Submit failed' };
  }
}

function registerChainHandlers(ipcMain) {
  ipcMain.handle('submit-to-chain', handleSubmitToChain);
}

module.exports = {
  registerChainHandlers
};
