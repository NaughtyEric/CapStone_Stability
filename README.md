# CapStone_Stability - Evidence Blockchain App

A cross-platform desktop application (Windows & MacOS) for securely submitting image evidence to the blockchain.

## Project Overview

According to the previous email, the main objectives of this project are to:

- Ensure integrity and non-repudiation of digital evidence.
- Provide a simple workflow for capturing and registering evidence.
- Use blockchain for immutable timestamping and record storage.
- Offer a public verification tool that confirms image authenticity without exposing the original image.

Besides, the application should be a desktop app compatible with both Windows and MacOS. The requirements and core features include:

- Capture a snapshot of the entire screen or a selected region.
- Generate a SHA-256 hash of the captured image.
- Submit the hash, timestamp, and optional metadata to the blockchain smart contract.
- Optionally store a local record containing the snapshot, hash, and transaction ID.
- Allow users to view previously submitted evidence records.

## General Design

### Languages & Frameworks

- Solidity - Smart Contract Development
- JavaScript - Application Logic
- Electron - Desktop Application
- Web3.js - Blockchain Interaction
- Hardhat - Smart Contract Tooling

### Workflow

#### 1. Upload Image

Click the upload area or take a screenshot (full screen or selected region). The SHA-256 hash will be automatically generated.

#### 2. Add Metadata (Optional)

Enter any additional information about the evidence, such as:
- Description
- Location
- Case number
- Date of capture
- and more.

They will all be encrypted and stored alongside the hash on the blockchain.

#### 3. Submit to Blockchain

After configuring the blockchain settings (RPC URL, contract address, wallet address, and private key), users can record the evidence on-chain in one click.

Alternatively, click "Save Locally Only" to store the evidence without blockchain submission.

#### 4. View Records

Switch to the "View Records" tab to:
- Browse all submitted evidence
- View hash, timestamp, and transaction details
- Copy hashes for verification

#### 5. Verify Evidence

Open the "Verify Evidence" tab, re-upload an image, and check whether the hash exists on-chain without exposing the original image.

## Smart Contract

The application is designed to work with the `EvidenceRegistry` smart contract. See `chain/contracts/EvidenceRegistry.sol` for the contract source code.

### Contract Interface

```solidity
function submitEvidence(bytes32 hash, string memory metadata) public returns (uint256)
function getEvidence(uint256 id) public view returns (bytes32 hash, uint256 timestamp, string memory metadata, address submitter)
function verifyHash(bytes32 hash) public view returns (bool exists, uint256 evidenceId)
```

## Project Structure

```
├── app/
│   ├── src/
│   │   ├── main/            # Electron main process + IPC
│   │   ├── renderer/        # UI + renderer logic
│   │   └── modules/         # Shared app modules
│   └── package.json
├── chain/
│   ├── contracts/           # Solidity contracts
│   ├── ignition/            # Deployment modules
│   └── hardhat.config.ts
├── __tests__/
│   └── hash.test.js         # Test for hash generation, deprecated
└── README.md
```

### Building

```bash
# From the app/ folder
cd app
npm install

# Debug/run the Electron app
npm run start

# Build a Windows .exe installer (NSIS)
npm run build:win

# Build for MacOS
npm run build:mac

# Build for all platforms
npm run build
```

After `npm run build:win`, the Windows installer will be created under `app/dist/` (an `.exe` file). You can run that installer to get a runnable `.exe` application.
