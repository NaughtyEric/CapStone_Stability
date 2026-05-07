const submitManager = require('../../modules/submitManager');

async function handleSubmitToChain(event, data) {
  try {
    const result = await submitManager.submitEvidenceOnChain(data);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message || 'Submit failed' };
  }
}

async function handleVerifyOnChain(event, data) {
  try {
    const result = await submitManager.verifyEvidenceOnChain(data);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message || 'Verification failed' };
  }
}

function registerChainHandlers(ipcMain) {
  ipcMain.handle('submit-to-chain', handleSubmitToChain);
  ipcMain.handle('verify-on-chain', handleVerifyOnChain);
}

module.exports = {
  registerChainHandlers
};
