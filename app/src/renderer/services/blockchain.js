import { dom } from '../ui/dom.js';

export async function submitToBlockchain({ hash, metadata, signerAddress, timestamp }) {
  const rpc = dom.rpcUrl.value.trim();
  const contract = dom.contractAddress.value.trim();
  const wallet = dom.walletAddress.value.trim();
  const key = dom.privateKey.value.trim();
  const abiText = dom.contractAbi.value.trim();

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
    chainId: parseInt(dom.chainId.value, 10) || undefined,
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
