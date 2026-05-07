import { dom } from '../ui/dom.js';
import { escapeHtml, showStatus } from '../ui/status.js';
import { verifyOnChain } from '../services/blockchain.js';

let verifyImage = null;

export function initVerify() {
  if (!dom.verifyUploadArea || !dom.verifyBtn) {
    return;
  }

  dom.verifyUploadArea.addEventListener('click', async () => {
    try {
      const result = await window.electronAPI.selectImage();

      if (result) {
        verifyImage = result;
        showVerifyImage(result);
      }
    } catch (error) {
      console.error('Error selecting image for verification:', error);
      showStatus(dom.verifyStatus, 'error', 'Failed to select image: ' + error.message);
    }
  });

  dom.verifyClearImageBtn.addEventListener('click', () => {
    clearVerifyImage();
  });

  dom.verifyBtn.addEventListener('click', async () => {
    if (!verifyImage) {
      showStatus(dom.verifyStatus, 'error', 'Please select an image first');
      return;
    }

    dom.verifyBtn.disabled = true;
    showStatus(dom.verifyStatus, 'info', 'Verifying evidence on chain...');

    try {
      const result = await verifyOnChain({
        hash: verifyImage.hash
      });

      if (!result.exists) {
        dom.verifyDetails.classList.add('hidden');
        showStatus(dom.verifyStatus, 'error', 'No on-chain evidence found for this image.');
        return;
      }

      showVerifyDetails(result);
      showStatus(dom.verifyStatus, 'success', 'Evidence found on chain.');
    } catch (error) {
      showStatus(dom.verifyStatus, 'error', 'Verification failed: ' + error.message, 10000);
    } finally {
      dom.verifyBtn.disabled = false;
    }
  });
}

function showVerifyImage(imageData) {
  dom.verifyPreviewImg.src = imageData.base64;
  dom.verifyImagePreview.classList.remove('hidden');
  dom.verifyUploadArea.style.display = 'none';
  dom.verifyHashValue.textContent = imageData.hash;
  dom.verifyBtn.disabled = false;
}

function clearVerifyImage() {
  verifyImage = null;
  dom.verifyImagePreview.classList.add('hidden');
  dom.verifyUploadArea.style.display = 'block';
  dom.verifyHashValue.textContent = 'No image selected';
  dom.verifyBtn.disabled = true;
  dom.verifyDetails.classList.add('hidden');
  dom.verifyStatus.classList.add('hidden');
}

function showVerifyDetails(result) {
  const { evidenceId, evidence } = result;

  if (!evidence) {
    dom.verifyDetails.classList.add('hidden');
    return;
  }

  const metadata = evidence.metadata ? escapeHtml(evidence.metadata) : '';

  dom.verifyDetails.innerHTML = `
    <div>
      <span class="label">Evidence ID:</span>
      <div class="value">${evidenceId}</div>
    </div>
    <div>
      <span class="label">Submitter:</span>
      <div class="value">${evidence.submitter}</div>
    </div>
    <div>
      <span class="label">Timestamp:</span>
      <div class="value">${new Date(Number(evidence.timestamp) * 1000).toLocaleString()}</div>
    </div>
    ${metadata ? `
    <div>
      <span class="label">Metadata:</span>
      <div class="value" style="font-family: inherit;">${metadata}</div>
    </div>
    ` : ''}
  `;

  dom.verifyDetails.classList.remove('hidden');
}
