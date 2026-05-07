export const dom = {
  uploadArea: document.getElementById('upload-area'),
  imagePreview: document.getElementById('image-preview'),
  previewImg: document.getElementById('preview-img'),
  clearImageBtn: document.getElementById('clear-image'),
  hashValue: document.getElementById('hash-value'),
  timestampValue: document.getElementById('timestamp-value'),
  metadataInput: document.getElementById('metadata-input'),
  contractAddress: document.getElementById('contract-address'),
  walletAddress: document.getElementById('wallet-address'),
  signAddress: document.getElementById('sign-address'),
  privateKey: document.getElementById('private-key'),
  submitBtn: document.getElementById('submit-btn'),
  saveLocalBtn: document.getElementById('save-local-btn'),
  submissionStatus: document.getElementById('submission-status'),
  recordsList: document.getElementById('records-list'),
  recordCount: document.getElementById('record-count'),
  refreshRecordsBtn: document.getElementById('refresh-records'),
  recordsStatus: document.getElementById('records-status'),
  rpcUrl: document.getElementById('rpc-url'),
  networkName: document.getElementById('network-name'),
  chainId: document.getElementById('chain-id'),
  saveSettingsBtn: document.getElementById('save-settings'),
  testConnectionBtn: document.getElementById('test-connection'),
  connectionStatus: document.getElementById('connection-status'),
  contractAbi: document.getElementById('contract-abi'),
  saveAbiBtn: document.getElementById('save-abi')
};

export const tabButtons = () => document.querySelectorAll('.tab-btn');
export const tabContents = () => document.querySelectorAll('.tab-content');
