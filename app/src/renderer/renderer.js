// DOM Elements
const uploadArea = document.getElementById('upload-area');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const clearImageBtn = document.getElementById('clear-image');
const hashValue = document.getElementById('hash-value');
const timestampValue = document.getElementById('timestamp-value');
const metadataInput = document.getElementById('metadata-input');
const contractAddress = document.getElementById('contract-address');
const walletAddress = document.getElementById('wallet-address');
const signAddress = document.getElementById('sign-address');
const privateKey = document.getElementById('private-key');
const submitBtn = document.getElementById('submit-btn');
const screenshotBtn = document.getElementById('screenshot-btn');
const saveLocalBtn = document.getElementById('save-local-btn');
const submissionStatus = document.getElementById('submission-status');
const recordsList = document.getElementById('records-list');
const recordCount = document.getElementById('record-count');
const refreshRecordsBtn = document.getElementById('refresh-records');
const recordsStatus = document.getElementById('records-status');
const rpcUrl = document.getElementById('rpc-url');
const networkName = document.getElementById('network-name');
const chainId = document.getElementById('chain-id');
const saveSettingsBtn = document.getElementById('save-settings');
const testConnectionBtn = document.getElementById('test-connection');
const connectionStatus = document.getElementById('connection-status');
const contractAbi = document.getElementById('contract-abi');
const saveAbiBtn = document.getElementById('save-abi');

// State
let currentImage = null;
let settings = loadSettings();
let recordsCache = [];

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Update button states
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden');
        });

        const targetTab = document.getElementById(`${tabId}-tab`);
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');

        // Load records when switching to records tab
        if (tabId === 'records') {
            loadRecords();
        }
    });
});

// Image Selection
uploadArea.addEventListener('click', async () => {
    try {
        const result = await window.electronAPI.selectImage();

        if (result) {
            currentImage = result;
            displayImage(result);
            updateTimestamp();
            enableButtons();
        }
    } catch (error) {
        console.error('Error selecting image:', error);
        showStatus(submissionStatus, 'error', 'Failed to select image: ' + error.message);
    }
});

// Clear Image
clearImageBtn.addEventListener('click', () => {
    currentImage = null;
    imagePreview.classList.add('hidden');
    uploadArea.style.display = 'block';
    hashValue.textContent = 'No image selected';
    timestampValue.textContent = '-';
    disableButtons();
});

// Display selected image
function displayImage(imageData) {
    previewImg.src = imageData.base64;
    imagePreview.classList.remove('hidden');
    uploadArea.style.display = 'none';
    hashValue.textContent = imageData.hash;
}

// Update timestamp display
function updateTimestamp() {
    var now = new Date();
    // “YYYY-MM-DD HH:MM:SS (UTC+x)” format
    var formatted = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0') +
        ' (UTC' + (now.getTimezoneOffset() > 0 ? '-' : '+') +
        String(Math.abs(now.getTimezoneOffset() / 60)).padStart(1, '0') + ')';
    timestampValue.textContent = formatted;
}

// Enable/Disable buttons
function enableButtons() {
    submitBtn.disabled = false;
    saveLocalBtn.disabled = false;
}

function disableButtons() {
    submitBtn.disabled = true;
    saveLocalBtn.disabled = true;
}

if (screenshotBtn) {
    screenshotBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.takeScreenshot();

            if (result) {
                currentImage = result;
                displayImage(result);
                updateTimestamp();
                enableButtons();
            }
        } catch (error) {
            console.error('Error taking screenshot:', error);
            showStatus(submissionStatus, 'error', 'Failed to take screenshot: ' + error.message);
        }
    });
}

// Submit to Blockchain
submitBtn.addEventListener('click', async () => {
    if (!currentImage) {
        showStatus(submissionStatus, 'error', 'Please select an image first');
        return;
    }

    const contract = contractAddress.value.trim();
    const wallet = walletAddress.value.trim();
    const signer = signAddress ? signAddress.value.trim() : '';
    const key = privateKey.value.trim();

    if (!contract || !wallet || !key) {
        showStatus(submissionStatus, 'error', 'Please fill in all blockchain fields');
        return;
    }

    submitBtn.disabled = true;
    showStatus(submissionStatus, 'info', '⏳ Submitting to blockchain...');

    try {
        const transactionId = await submitToBlockchain({
            hash: currentImage.hash,
            metadata: metadataInput.value,
            signerAddress: signer || wallet,
            timestamp: Math.floor(Date.now() / 1000)
        });

        // Save to local storage
        const result = await window.electronAPI.submitEvidence({
            hash: currentImage.hash,
            metadata: metadataInput.value,
            transactionId: transactionId,
            imagePath: currentImage.path,
            base64Image: currentImage.base64
        });

        if (result.success) {
            showStatus(submissionStatus, 'success', `✅ Successfully submitted! Transaction ID: ${transactionId}`);
            resetForm();
        } else {
            showStatus(submissionStatus, 'error', '❌ Failed to save record: ' + result.error);
        }
    } catch (error) {
        showStatus(submissionStatus, 'error', '❌ Blockchain submission failed: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
});

// Save Locally Only
saveLocalBtn.addEventListener('click', async () => {
    if (!currentImage) {
        showStatus(submissionStatus, 'error', 'Please select an image first');
        return;
    }

    saveLocalBtn.disabled = true;

    try {
        const result = await window.electronAPI.submitEvidence({
            hash: currentImage.hash,
            metadata: metadataInput.value,
            transactionId: '',
            imagePath: currentImage.path,
            base64Image: currentImage.base64
        });

        if (result.success) {
            showStatus(submissionStatus, 'success', '✅ Evidence saved locally! You can submit to blockchain later.');
            resetForm();
        } else {
            showStatus(submissionStatus, 'error', '❌ Failed to save record: ' + result.error);
        }
    } catch (error) {
        showStatus(submissionStatus, 'error', '❌ Failed to save: ' + error.message);
    } finally {
        saveLocalBtn.disabled = false;
    }
});

// Web3 implementation
async function submitToBlockchain({ hash, metadata, signerAddress, timestamp }) {
    const rpc = rpcUrl.value.trim();
    const contract = contractAddress.value.trim();
    const wallet = walletAddress.value.trim();
    const key = privateKey.value.trim();
    const abiText = contractAbi.value.trim();

    if (!rpc) {
        throw new Error('RPC URL is empty');
    }
    if (!contract) {
        throw new Error('Contract address is empty');
    }
    if (!wallet) {
        throw new Error('Wallet address is empty');
    }
    if (!key) {
        throw new Error('Private key is empty');
    }
    if (!abiText) {
        throw new Error('Contract ABI is empty');
    }

    let parsedAbi;
    try {
        parsedAbi = JSON.parse(abiText);
    } catch (error) {
        throw new Error('Invalid ABI JSON');
    }

    const submitTimestamp = Number.isFinite(Number(timestamp))
        ? Math.floor(Number(timestamp))
        : Math.floor(Date.now() / 1000);

    const result = await window.electronAPI.submitToChain({
        rpcUrl: rpc,
        chainId: parseInt(chainId.value, 10) || undefined,
        contractAddress: contract,
        contractAbi: parsedAbi,
        walletAddress: wallet,
        privateKey: key,
        signerAddress,
        hash,
        metadata,
        timestamp: submitTimestamp
    });

    if (!result.success) {
        throw new Error(result.error || 'Blockchain submission failed');
    }

    return result.result.transactionHash;
}

// Reset form after successful submission
function resetForm() {
    currentImage = null;
    imagePreview.classList.add('hidden');
    uploadArea.style.display = 'block';
    hashValue.textContent = 'No image selected';
    timestampValue.textContent = '-';
    metadataInput.value = '';
    disableButtons();
}

// Load and display records
async function loadRecords() {
    try {
        const records = await window.electronAPI.getRecords();
        recordsCache = Array.isArray(records) ? records : [];
        displayRecords(records);
    } catch (error) {
        console.error('Error loading records:', error);
        recordsList.innerHTML = '<p class="no-records">Error loading records</p>';
        recordsCache = [];
    }
}

// Display records in the list
function displayRecords(records) {
    if (!records || records.length === 0) {
        recordsList.innerHTML = '<p class="no-records">No records found. Submit your first evidence!</p>';
        recordCount.textContent = '0 records';
        return;
    }

    recordCount.textContent = `${records.length} record${records.length > 1 ? 's' : ''}`;

    recordsList.innerHTML = records.map(record => `
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

    // Add event listeners
    attachRecordEventListeners();
}

// Attach event listeners to record actions
function attachRecordEventListeners() {
    // Copy hash buttons
    document.querySelectorAll('.copy-hash').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.hash);
            btn.textContent = '✅ Copied!';
            setTimeout(() => btn.textContent = '📋 Copy Hash', 2000);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-record').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this record?')) {
                const result = await window.electronAPI.deleteRecord(btn.dataset.id);
                if (result.success) {
                    loadRecords();
                }
            }
        });
    });

    // Submit pending buttons
    document.querySelectorAll('.submit-pending').forEach(btn => {
        btn.addEventListener('click', async () => {
            const recordId = btn.dataset.id;
            const record = recordsCache.find(item => item.id === recordId);

            if (!record) {
                showStatus(recordsStatus, 'error', 'Record not found. Please refresh.');
                return;
            }

            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Submitting...';
            showStatus(recordsStatus, 'info', 'Submitting record to blockchain...');

            try {
                const txHash = await submitToBlockchain({
                    hash: record.hash,
                    metadata: record.metadata || '',
                    signerAddress: signAddress ? signAddress.value.trim() : '',
                    timestamp: parseTimestampToUnix(record.timestamp)
                });

                const updateResult = await window.electronAPI.updateTransactionId({
                    recordId,
                    transactionId: txHash
                });

                if (!updateResult.success) {
                    throw new Error(updateResult.error || 'Failed to update record');
                }

                showStatus(recordsStatus, 'success', `Submitted to blockchain. Transaction ID: ${txHash}`);
                await loadRecords();
            } catch (error) {
                showStatus(recordsStatus, 'error', 'Blockchain submission failed: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    });
}

// Refresh records
refreshRecordsBtn.addEventListener('click', loadRecords);

// Settings functions
function loadSettings() {
    try {
        const saved = localStorage.getItem('blockchain-settings');
        return saved ? JSON.parse(saved) : {
            rpcUrl: '',
            networkName: 'mainnet',
            chainId: 1,
            contractAbi: ''
        };
    } catch (e) {
        return {
            rpcUrl: '',
            networkName: 'mainnet',
            chainId: 1,
            contractAbi: ''
        };
    }
}

function saveSettings() {
    settings = {
        rpcUrl: rpcUrl.value,
        networkName: networkName.value,
        chainId: parseInt(chainId.value) || 1,
        contractAbi: contractAbi.value
    };
    localStorage.setItem('blockchain-settings', JSON.stringify(settings));
}

// Initialize settings inputs
rpcUrl.value = settings.rpcUrl || '';
networkName.value = settings.networkName || 'mainnet';
chainId.value = settings.chainId || 1;
contractAbi.value = settings.contractAbi || '';

// Save settings button
saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    showStatus(connectionStatus, 'success', '✅ Settings saved successfully!');
});

// Save ABI button
saveAbiBtn.addEventListener('click', () => {
    try {
        if (contractAbi.value.trim()) {
            JSON.parse(contractAbi.value); // Validate JSON
        }
        saveSettings();
        showStatus(connectionStatus, 'success', '✅ ABI saved successfully!');
    } catch (e) {
        showStatus(connectionStatus, 'error', '❌ Invalid JSON format for ABI');
    }
});

// Test connection button
testConnectionBtn.addEventListener('click', async () => {
    testConnectionBtn.disabled = true;
    showStatus(connectionStatus, 'info', '⏳ Testing connection...');
    try {
        const url = rpcUrl.value.trim();
        if (!url) {
            throw new Error('RPC URL is empty');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_chainId',
                params: []
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message || 'RPC error');
        }

        if (typeof data.result === 'string' && data.result.startsWith('0x')) {
            const parsedChainId = parseInt(data.result, 16);
            if (!Number.isNaN(parsedChainId)) {
                chainId.value = parsedChainId;
            }
        }

        showStatus(connectionStatus, 'success', '✅ Connection successful!');
    } catch (error) {
        showStatus(connectionStatus, 'error', '❌ Connection failed: ' + error.message);
    } finally {
        testConnectionBtn.disabled = false;
    }
});

// Network selector updates chain ID
networkName.addEventListener('change', () => {
    const chainIds = {
        'mainnet': 1,
        'goerli': 5,
        'sepolia': 11155111,
        'polygon': 137,
        'custom': ''
    };
    chainId.value = chainIds[networkName.value] || '';
});

// Utility functions
function showStatus(element, type, message) {
    element.className = `status-message ${type}`;
    element.textContent = message;
    element.classList.remove('hidden');

    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseTimestampToUnix(timestamp) {
    if (!timestamp) {
        return undefined;
    }

    const parsed = Date.parse(timestamp);
    return Number.isNaN(parsed) ? undefined : Math.floor(parsed / 1000);
}

// Initialize
updateTimestamp();
setInterval(updateTimestamp, 1000);
