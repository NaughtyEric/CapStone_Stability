const { Web3 } = require('web3');

// Add 0x prefix if missing
function normalizePrivateKey(privateKey) {
	if (!privateKey) {
		throw new Error('Private key is required');
	}
	return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
}

// test if this key is a valid 32-byte hex string
function isValidPrivateKey(privateKey) {
	return /^0x[0-9a-fA-F]{64}$/.test(privateKey);
}

function normalizeHash(hash) {
	if (!hash) {
		throw new Error('Hash is required');
	}
	const normalized = hash.startsWith('0x') ? hash : `0x${hash}`;
	if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
		throw new Error('Hash must be a 32-byte hexadecimal string');
	}
	return normalized;
}

function normalizeAddress(address) {
	return address ? address.trim() : '';
}

function isValidAddress(address) {
	return /^0x[0-9a-fA-F]{40}$/.test(address);
}

function getSubmitMethod(contract) {
	const candidates = contract.options.jsonInterface.filter(item => {
		return item.type === 'function' && item.name === 'submitEvidence';
	});

	if (candidates.length === 0) {
		return null;
	}

	const threeArgs = candidates.find(item => item.inputs && item.inputs.length === 3);
	if (threeArgs) {
		return { type: 'three', method: contract.methods.submitEvidence };
	}

	const twoArgs = candidates.find(item => item.inputs && item.inputs.length === 2);
	if (twoArgs) {
		return { type: 'two', method: contract.methods.submitEvidence };
	}

	return null;
}

async function submitEvidenceOnChain({
	rpcUrl,
	chainId,
	contractAddress,
	contractAbi,
	walletAddress,
	privateKey,
	hash,
	metadata,
	timestamp
}) {
	if (!rpcUrl) {
		throw new Error('RPC URL is required');
	}
	if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
		throw new Error('Invalid contract address');
	}

	const normalizedKey = normalizePrivateKey(privateKey);
	if (!isValidPrivateKey(normalizedKey)) {
		throw new Error('Invalid private key');
	}

	const normalizedWallet = normalizeAddress(walletAddress);
	if (normalizedWallet && !isValidAddress(normalizedWallet)) {
		throw new Error('Invalid wallet address');
	}

	const normalizedHash = normalizeHash(hash);
	if (!normalizedHash) {
		throw new Error('Invalid hash format');
	}

	let parsedAbi;
	try {
		parsedAbi = typeof contractAbi === 'string' ? JSON.parse(contractAbi) : contractAbi;
	} catch (error) {
		throw new Error('Invalid contract ABI');
	}

	if (!Array.isArray(parsedAbi)) {
		throw new Error('Contract ABI must be an array');
	}

	const web3 = new Web3(rpcUrl);
	const actualChainId = await web3.eth.getChainId();
	if (chainId && Number(chainId) !== Number(actualChainId)) {
		throw new Error(`Chain ID mismatch. RPC is ${actualChainId}`);
	}

	const account = web3.eth.accounts.privateKeyToAccount(normalizedKey);
	web3.eth.accounts.wallet.add(account);
	web3.eth.defaultAccount = account.address;

	if (normalizedWallet && normalizedWallet.toLowerCase() !== account.address.toLowerCase()) {
		throw new Error('Wallet address does not match private key');
	}

	const contract = new web3.eth.Contract(parsedAbi, contractAddress);
	const submitMethod = getSubmitMethod(contract);
	if (!submitMethod) {
		throw new Error('submitEvidence method not found in ABI');
	}

	const safeMetadata = metadata || '';
	const unixTimestamp = Number.isFinite(Number(timestamp))
		? Math.floor(Number(timestamp))
		: Math.floor(Date.now() / 1000);

	const tx = submitMethod.type === 'three'
		? submitMethod.method(normalizedHash, unixTimestamp, safeMetadata)
		: submitMethod.method(normalizedHash, safeMetadata);

	const gas = await tx.estimateGas({ from: account.address });
	const gasPrice = await web3.eth.getGasPrice();

	const receipt = await tx.send({
		from: account.address,
		gas,
		gasPrice
	});

	return {
		transactionHash: receipt.transactionHash,
		blockNumber: receipt.blockNumber,
		gasUsed: receipt.gasUsed,
		chainId: actualChainId
	};
}

module.exports = {
	submitEvidenceOnChain
};
