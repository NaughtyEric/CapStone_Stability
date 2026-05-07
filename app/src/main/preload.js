const { contextBridge, ipcRenderer } = require('electron');
const { ethers } = require('ethers');

const RPC_URL = "http://127.0.0.1:8545";

contextBridge.exposeInMainWorld("eth", {
  getWallet: (privateKey) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Wallet(privateKey, provider);
  },

  getProvider: () => {
    return new ethers.JsonRpcProvider(RPC_URL);
  },

  getContract: (address, abi, privateKey) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey, provider);
      return new ethers.Contract(address, abi, wallet);
    }

    return new ethers.Contract(address, abi, provider);
  },

  sha256ToBytes32: async (fileBuffer) => {
    return ethers.sha256(fileBuffer);
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  // Image selection and hashing
  selectImage: () => ipcRenderer.invoke('select-image'),
  
  // Evidence submission
  submitEvidence: (data) => ipcRenderer.invoke('submit-evidence', data),
  
  // Record management
  getRecords: () => ipcRenderer.invoke('get-records'),
  deleteRecord: (recordId) => ipcRenderer.invoke('delete-record', recordId),
  updateTransactionId: (data) => ipcRenderer.invoke('update-transaction-id', data),

  // Blockchain submission
  submitToChain: (data) => ipcRenderer.invoke('submit-to-chain', data)
});
