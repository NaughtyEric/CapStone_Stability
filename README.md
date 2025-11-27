# CapStone_Stability - Evidence Blockchain App

A cross-platform desktop application (Windows & MacOS) for securely submitting image evidence to the blockchain.

## Features

- **SHA-256 Image Hashing**: Generate cryptographic hashes of images for integrity verification
- **Blockchain Submission**: Submit evidence hashes, timestamps, and metadata to a smart contract
- **Local Record Storage**: Store evidence records locally with snapshots, hashes, and transaction IDs
- **Evidence Viewer**: Browse and manage previously submitted evidence records
- **Cross-Platform**: Works on both Windows and MacOS

## Installation

### Prerequisites

- Node.js 18+ 
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Run the application
npm start
```

### Building for Production

```bash
# Build for Windows
npm run build:win

# Build for MacOS
npm run build:mac

# Build for all platforms
npm run build
```

## Usage

### 1. Upload Image

1. Click the upload area or drag and drop an image
2. Supported formats: JPG, PNG, GIF, BMP, WebP
3. The SHA-256 hash will be automatically generated

### 2. Add Metadata (Optional)

Enter any additional information about the evidence, such as:
- Description
- Location
- Case number
- Date of capture

### 3. Submit to Blockchain

1. Configure your blockchain settings (RPC URL, contract address)
2. Enter your wallet address and private key
3. Click "Submit to Blockchain" to record the evidence on-chain

Alternatively, click "Save Locally Only" to store the evidence without blockchain submission.

### 4. View Records

Switch to the "View Records" tab to:
- Browse all submitted evidence
- View hash, timestamp, and transaction details
- Copy hashes for verification
- Delete local records

## Smart Contract

The application is designed to work with the `EvidenceRegistry` smart contract. See `src/contracts/EvidenceRegistry.sol` for the contract source code.

### Contract Interface

```solidity
function submitEvidence(bytes32 hash, string memory metadata) public returns (uint256)
function getEvidence(uint256 id) public view returns (bytes32 hash, uint256 timestamp, string memory metadata, address submitter)
function verifyHash(bytes32 hash) public view returns (bool exists, uint256 evidenceId)
```

## Project Structure

```
├── src/
│   ├── main/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js       # Preload script for IPC
│   ├── renderer/
│   │   ├── index.html       # Main UI
│   │   ├── styles.css       # Styling
│   │   └── renderer.js      # Renderer process logic
│   └── contracts/
│       └── EvidenceRegistry.sol  # Smart contract
├── __tests__/
│   └── hash.test.js         # Unit tests
├── package.json
└── README.md
```

## Security Notes

- Private keys are stored locally only and never transmitted
- SHA-256 ensures cryptographic integrity of evidence
- Blockchain submission creates an immutable timestamp record

## Testing

```bash
npm test
```

## License

MIT
