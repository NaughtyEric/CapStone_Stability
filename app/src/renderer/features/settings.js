import { dom } from '../ui/dom.js';
import { showStatus } from '../ui/status.js';

const SETTINGS_KEY = 'blockchain-settings';

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      rpcUrl: '',
      networkName: 'mainnet',
      chainId: 1,
      contractAbi: '',
      contractAddress: '',
      walletAddress: '',
      signAddress: '',
      privateKey: ''
    };
  } catch (error) {
    return {
      rpcUrl: '',
      networkName: 'mainnet',
      chainId: 1,
      contractAbi: '',
      contractAddress: '',
      walletAddress: '',
      signAddress: '',
      privateKey: ''
    };
  }
}

function saveSettings() {
  const settings = {
    rpcUrl: dom.rpcUrl.value,
    networkName: dom.networkName.value,
    chainId: parseInt(dom.chainId.value, 10) || 1,
    contractAbi: dom.contractAbi.value,
    contractAddress: dom.contractAddress.value,
    walletAddress: dom.walletAddress.value,
    signAddress: dom.signAddress.value,
    privateKey: dom.privateKey.value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function initSettings() {
  const settings = loadSettings();
  dom.rpcUrl.value = settings.rpcUrl || '';
  dom.networkName.value = settings.networkName || 'mainnet';
  dom.chainId.value = settings.chainId || 1;
  dom.contractAbi.value = settings.contractAbi || '';
  dom.contractAddress.value = settings.contractAddress || '';
  dom.walletAddress.value = settings.walletAddress || '';
  dom.signAddress.value = settings.signAddress || '';
  dom.privateKey.value = settings.privateKey || '';

  dom.saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    showStatus(dom.connectionStatus, 'success', '✅ Settings saved successfully!');
  });

  dom.saveAbiBtn.addEventListener('click', () => {
    try {
      if (dom.contractAbi.value.trim()) {
        JSON.parse(dom.contractAbi.value);
      }
      saveSettings();
      showStatus(dom.connectionStatus, 'success', '✅ ABI saved successfully!');
    } catch (error) {
      showStatus(dom.connectionStatus, 'error', '❌ Invalid JSON format for ABI');
    }
  });

  dom.testConnectionBtn.addEventListener('click', async () => {
    dom.testConnectionBtn.disabled = true;
    showStatus(dom.connectionStatus, 'info', '⏳ Testing connection...');

    try {
      const url = dom.rpcUrl.value.trim();
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
          dom.chainId.value = parsedChainId;
        }
      }

      showStatus(dom.connectionStatus, 'success', '✅ Connection successful!');
    } catch (error) {
      showStatus(dom.connectionStatus, 'error', '❌ Connection failed: ' + error.message);
    } finally {
      dom.testConnectionBtn.disabled = false;
    }
  });

  dom.networkName.addEventListener('change', () => {
    const chainIds = {
      mainnet: 1,
      goerli: 5,
      sepolia: 11155111,
      polygon: 137,
      custom: ''
    };
    dom.chainId.value = chainIds[dom.networkName.value] || '';
  });
}
