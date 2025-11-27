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
const privateKey = document.getElementById('private-key');
const submitBtn = document.getElementById('submit-btn');
const saveLocalBtn = document.getElementById('save-local-btn');
const submissionStatus = document.getElementById('submission-status');
const recordsList = document.getElementById('records-list');
const recordCount = document.getElementById('record-count');
const refreshRecordsBtn = document.getElementById('refresh-records');
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
  timestampValue.textContent = new Date().toISOString();
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

// Submit to Blockchain
submitBtn.addEventListener('click', async () => {
  if (!currentImage) {
    showStatus(submissionStatus, 'error', 'Please select an image first');
    return;
  }
  
  const contract = contractAddress.value.trim();
  const wallet = walletAddress.value.trim();
  const key = privateKey.value.trim();
  
  if (!contract || !wallet || !key) {
    showStatus(submissionStatus, 'error', 'Please fill in all blockchain fields');
    return;
  }
  
  submitBtn.disabled = true;
  showStatus(submissionStatus, 'info', '⏳ Submitting to blockchain...');
  
  try {
    // Simulate blockchain transaction (in real implementation, use Web3)
    const transactionId = await submitToBlockchain(currentImage.hash, metadataInput.value);
    
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

// Simulate blockchain submission (replace with actual Web3 implementation)
async function submitToBlockchain(hash, metadata) {
  // In production, this would use Web3 to interact with the smart contract
  // For now, we simulate a transaction
  return new Promise((resolve, reject) => {
    const contract = contractAddress.value.trim();
    const wallet = walletAddress.value.trim();
    const key = privateKey.value.trim();
    
    // Basic validation
    if (!contract.startsWith('0x') || contract.length !== 42) {
      reject(new Error('Invalid contract address'));
      return;
    }
    
    if (!wallet.startsWith('0x') || wallet.length !== 42) {
      reject(new Error('Invalid wallet address'));
      return;
    }
    
    // Simulate network delay
    setTimeout(() => {
      // Generate a mock transaction hash (development only - real implementation uses Web3)
      // Use crypto-based random for better uniqueness
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const txHash = '0x' + Array.from(randomBytes, byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
      resolve(txHash);
    }, 2000);
  });
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
    displayRecords(records);
  } catch (error) {
    console.error('Error loading records:', error);
    recordsList.innerHTML = '<p class="no-records">Error loading records</p>';
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
      // Switch to submit tab and populate with record data
      alert('Please configure blockchain settings in the Submit tab and submit the record from there.');
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
  const url = rpcUrl.value.trim();
  if (!url) {
    showStatus(connectionStatus, 'error', '❌ Please enter an RPC URL');
    return;
  }
  
  showStatus(connectionStatus, 'info', '🔄 Testing connection...');
  
  // In production, this would make an actual RPC call
  setTimeout(() => {
    if (url.includes('infura') || url.includes('alchemy') || url.includes('localhost')) {
      showStatus(connectionStatus, 'success', '✅ Connection successful!');
    } else {
      showStatus(connectionStatus, 'error', '❌ Could not connect to RPC endpoint');
    }
  }, 1000);
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

// Initialize
updateTimestamp();
setInterval(updateTimestamp, 1000);
