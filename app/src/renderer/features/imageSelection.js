import { dom } from '../ui/dom.js';
import { setCurrentImage } from '../state.js';
import { showStatus } from '../ui/status.js';
import { formatTimestampDisplay } from '../utils/time.js';

export function initImageSelection() {
  dom.uploadArea.addEventListener('click', async () => {
    try {
      const result = await window.electronAPI.selectImage();

      if (result) {
        setCurrentImage(result);
        displayImage(result);
        updateTimestampDisplay();
        enableButtons();
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      showStatus(dom.submissionStatus, 'error', 'Failed to select image: ' + error.message);
    }
  });

  dom.clearImageBtn.addEventListener('click', () => {
    setCurrentImage(null);
    dom.imagePreview.classList.add('hidden');
    dom.uploadActions.style.display = 'flex';
    dom.hashValue.textContent = 'No image selected';
    dom.timestampValue.textContent = '-';
    disableButtons();
  });
}

export function updateTimestampDisplay() {
  dom.timestampValue.textContent = formatTimestampDisplay(new Date());
}

export function resetForm() {
  setCurrentImage(null);
  dom.imagePreview.classList.add('hidden');
  dom.uploadActions.style.display = 'flex';
  dom.hashValue.textContent = 'No image selected';
  dom.timestampValue.textContent = '-';
  dom.metadataInput.value = '';
  disableButtons();
}

export function enableButtons() {
  dom.submitBtn.disabled = false;
  dom.saveLocalBtn.disabled = false;
}

export function disableButtons() {
  dom.submitBtn.disabled = true;
  dom.saveLocalBtn.disabled = true;
}

function displayImage(imageData) {
  dom.previewImg.src = imageData.base64;
  dom.imagePreview.classList.remove('hidden');
  dom.uploadActions.style.display = 'none';
  dom.hashValue.textContent = imageData.hash;
}
