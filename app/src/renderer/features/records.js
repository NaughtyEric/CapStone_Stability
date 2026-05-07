import { dom } from '../ui/dom.js';
import { state, setRecordsCache } from '../state.js';
import { escapeHtml, showStatus } from '../ui/status.js';
import { submitToBlockchain } from '../services/blockchain.js';
import { parseTimestampToUnix } from '../utils/time.js';

let skipDeleteConfirm = false;
let deleteModal = null;
let deleteConfirmBtn = null;
let deleteCancelBtn = null;
let deleteSkipCheckbox = null;
let deleteResolve = null;

export function initRecords() {
  dom.refreshRecordsBtn.addEventListener('click', loadRecords);
  initDeleteConfirmModal();
}

export async function loadRecords() {
  try {
    const records = await window.electronAPI.getRecords();
    const normalizedRecords = Array.isArray(records) ? records : [];
    setRecordsCache(normalizedRecords);
    displayRecords(normalizedRecords);
  } catch (error) {
    console.error('Error loading records:', error);
    dom.recordsList.innerHTML = '<p class="no-records">Error loading records</p>';
    setRecordsCache([]);
  }
}

function displayRecords(records) {
  if (!records || records.length === 0) {
    dom.recordsList.innerHTML = '<p class="no-records">No records found. Submit your first evidence!</p>';
    dom.recordCount.textContent = '0 records';
    return;
  }

  dom.recordCount.textContent = `${records.length} record${records.length > 1 ? 's' : ''}`;

  dom.recordsList.innerHTML = records.map(record => `
    <div class="record-item" data-id="${record.id}">
      <div class="record-header">
        <span class="record-status ${record.status}">${record.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}</span>
        <span style="color: #64748b; font-size: 0.85rem;">${new Date(record.timestamp).toLocaleString()}</span>
      </div>
      <div class="record-details">
        <div>
          <span class="label">Hash:</span>
          <div class="value">${record.hash}</div>
        </div>
        ${record.transactionId ? `
        <div>
          <span class="label">Transaction ID:</span>
          <div class="value">${record.transactionId}</div>
        </div>
        ` : ''}
        ${record.metadata ? `
        <div>
          <span class="label">Metadata:</span>
          <div class="value" style="font-family: inherit;">${escapeHtml(record.metadata)}</div>
        </div>
        ` : ''}
      </div>
      ${record.base64Image ? `
      <div class="record-image">
        <img src="${record.base64Image}" alt="Evidence image">
      </div>
      ` : ''}
      <div class="record-actions">
        ${record.status === 'pending' ? `
        <button class="btn btn-primary submit-pending" data-id="${record.id}">🚀 Submit to Blockchain</button>
        ` : ''}
        <button class="btn btn-secondary copy-hash" data-hash="${record.hash}">📋 Copy Hash</button>
        <button class="btn btn-danger delete-record" data-id="${record.id}">🗑️ Delete</button>
      </div>
    </div>
  `).join('');

  attachRecordEventListeners();
}

function attachRecordEventListeners() {
  document.querySelectorAll('.copy-hash').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.hash);
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy Hash', 2000);
    });
  });

  document.querySelectorAll('.delete-record').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await confirmDeleteRecord();
      if (!confirmed) {
        return;
      }

      const result = await window.electronAPI.deleteRecord(btn.dataset.id);
      if (result.success) {
        loadRecords();
      }
    });
  });

  document.querySelectorAll('.submit-pending').forEach(btn => {
    btn.addEventListener('click', async () => {
      const recordId = btn.dataset.id;
      const record = state.recordsCache.find(item => item.id === recordId);

      if (!record) {
        showStatus(dom.recordsStatus, 'error', 'Record not found. Please refresh.');
        return;
      }

      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      showStatus(dom.recordsStatus, 'info', 'Submitting record to blockchain...');

      try {
        const txHash = await submitToBlockchain({
          hash: record.hash,
          metadata: record.metadata || '',
          signerAddress: dom.signAddress ? dom.signAddress.value.trim() : '',
          timestamp: parseTimestampToUnix(record.timestamp)
        });

        const updateResult = await window.electronAPI.updateTransactionId({
          recordId,
          transactionId: txHash
        });

        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update record');
        }

        showStatus(dom.recordsStatus, 'success', `Submitted to blockchain. Transaction ID: ${txHash}`);
        await loadRecords();
      } catch (error) {
        showStatus(dom.recordsStatus, 'error', 'Blockchain submission failed: ' + error.message);
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });
}

function initDeleteConfirmModal() {
  deleteModal = document.getElementById('delete-confirm-modal');
  deleteConfirmBtn = document.getElementById('confirm-delete-btn');
  deleteCancelBtn = document.getElementById('cancel-delete-btn');
  deleteSkipCheckbox = document.getElementById('delete-confirm-skip');

  if (!deleteModal || !deleteConfirmBtn || !deleteCancelBtn || !deleteSkipCheckbox) {
    return;
  }

  deleteConfirmBtn.addEventListener('click', () => {
    if (deleteSkipCheckbox.checked) {
      skipDeleteConfirm = true;
    }
    resolveDeleteConfirm(true);
  });

  deleteCancelBtn.addEventListener('click', () => {
    resolveDeleteConfirm(false);
  });

  deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
      resolveDeleteConfirm(false);
    }
  });
}

function confirmDeleteRecord() {
  if (skipDeleteConfirm || !deleteModal) {
    return Promise.resolve(true);
  }

  return new Promise(resolve => {
    deleteResolve = resolve;
    deleteSkipCheckbox.checked = false;
    deleteModal.classList.remove('hidden');
  });
}

function resolveDeleteConfirm(confirmed) {
  if (!deleteResolve) {
    return;
  }

  const resolve = deleteResolve;
  deleteResolve = null;
  deleteModal.classList.add('hidden');
  resolve(confirmed);
}
