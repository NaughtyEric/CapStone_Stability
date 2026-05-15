import { dom } from '../ui/dom.js';
import { state } from '../state.js';
import { showStatus, showToast } from '../ui/status.js';
import { submitToBlockchain } from '../services/blockchain.js';
import { resetForm } from './imageSelection.js';

export function initSubmit() {
  dom.submitBtn.addEventListener('click', async () => {
    if (!state.currentImage) {
      showStatus(dom.submissionStatus, 'error', 'Please select an image first');
      return;
    }

    const contract = dom.contractAddress.value.trim();
    const wallet = dom.walletAddress.value.trim();
    const signer = dom.signAddress ? dom.signAddress.value.trim() : '';
    const key = dom.privateKey.value.trim();

    if (!contract || !wallet || !key) {
      showStatus(dom.submissionStatus, 'error', 'Please fill in all blockchain fields');
      return;
    }

    dom.submitBtn.disabled = true;
    showStatus(dom.submissionStatus, 'info', '⏳ Submitting to blockchain...', { autoHide: false });

    try {
      const transactionId = await submitToBlockchain({
        hash: state.currentImage.hash,
        metadata: dom.metadataInput.value,
        signerAddress: signer || wallet,
        timestamp: Math.floor(Date.now() / 1000)
      });

      const result = await window.electronAPI.submitEvidence({
        hash: state.currentImage.hash,
        metadata: dom.metadataInput.value,
        transactionId,
        imagePath: state.currentImage.path,
        base64Image: state.currentImage.base64
      });

      if (result.success) {
        showStatus(dom.submissionStatus, 'success', `✅ Successfully submitted! Transaction ID: ${transactionId}`);
        resetForm();
      } else {
        showStatus(dom.submissionStatus, 'error', '❌ Failed to save record: ' + result.error);
        showToast('Submit failed: ' + result.error, 'error');
      }
    } catch (error) {
      showStatus(dom.submissionStatus, 'error', '❌ Blockchain submission failed: ' + error.message);
      showToast('Submit failed: ' + error.message, 'error');
    } finally {
      dom.submitBtn.disabled = false;
    }
  });

  dom.saveLocalBtn.addEventListener('click', async () => {
    if (!state.currentImage) {
      showStatus(dom.submissionStatus, 'error', 'Please select an image first');
      return;
    }

    dom.saveLocalBtn.disabled = true;

    try {
      const result = await window.electronAPI.submitEvidence({
        hash: state.currentImage.hash,
        metadata: dom.metadataInput.value,
        transactionId: '',
        imagePath: state.currentImage.path,
        base64Image: state.currentImage.base64
      });

      if (result.success) {
        showStatus(dom.submissionStatus, 'success', '✅ Evidence saved locally! You can submit to blockchain later.');
        resetForm();
      } else {
        showStatus(dom.submissionStatus, 'error', '❌ Failed to save record: ' + result.error);
        showToast('Save failed: ' + result.error, 'error');
      }
    } catch (error) {
      showStatus(dom.submissionStatus, 'error', '❌ Failed to save: ' + error.message);
      showToast('Save failed: ' + error.message, 'error');
    } finally {
      dom.saveLocalBtn.disabled = false;
    }
  });
}
