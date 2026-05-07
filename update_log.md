# Journal 2

## General Updates
- Now support evidence verification by re-uploading the image in the "Verify Evidence" tab. The app will compute the hash of the uploaded image and check if it exists on-chain, displaying the verification result and evidence details if found.
- Refactored the project structure to separate concerns and improve maintainability, with a clearer distinction. Now the main process logic is organized under `app/src/main/`, the renderer logic under `app/src/renderer/`, and shared modules under `app/src/modules/`. All functionalities are distributed to dedicated files, improving readability and scalability.
- Tested and verified the project on Hardhat local blockchain, ensuring that the smart contract interactions, hash generation, image handling, and UI functionalities are working as intended.

## Details of Changes

### Verify Evidence Feature

- Added a new "Verify Evidence" tab in the UI where users can upload an image to check if it has been previously submitted on-chain.
- Implemented the logic to compute the hash of the uploaded image and query the blockchain for a matching record. The results are displayed in the UI, showing whether the evidence exists and providing details like timestamp, metadata, and submitter address if found.

### Project Structure

- Main process entry and lifecycle: [app/src/main/main.js](app/src/main/main.js) with window creation in [app/src/main/windows/createMainWindow.js](app/src/main/windows/createMainWindow.js).
- IPC handlers grouped by domain: [app/src/main/ipc/registerIpcHandlers.js](app/src/main/ipc/registerIpcHandlers.js) wiring [app/src/main/ipc/imageHandlers.js](app/src/main/ipc/imageHandlers.js), [app/src/main/ipc/recordsHandlers.js](app/src/main/ipc/recordsHandlers.js), and [app/src/main/ipc/chainHandlers.js](app/src/main/ipc/chainHandlers.js).
- Main-process services: [app/src/main/services/hashService.js](app/src/main/services/hashService.js) and [app/src/main/services/imageService.js](app/src/main/services/imageService.js).
- Preload bridge: [app/src/main/preload.js](app/src/main/preload.js).
- Renderer entry and layout: [app/src/renderer/renderer.js](app/src/renderer/renderer.js) and [app/src/renderer/index.html](app/src/renderer/index.html).
- Renderer features: [app/src/renderer/features/imageSelection.js](app/src/renderer/features/imageSelection.js), [app/src/renderer/features/submit.js](app/src/renderer/features/submit.js), [app/src/renderer/features/verify.js](app/src/renderer/features/verify.js), [app/src/renderer/features/records.js](app/src/renderer/features/records.js), [app/src/renderer/features/settings.js](app/src/renderer/features/settings.js), [app/src/renderer/features/tabs.js](app/src/renderer/features/tabs.js).
- Renderer utilities: [app/src/renderer/services/blockchain.js](app/src/renderer/services/blockchain.js), [app/src/renderer/ui/dom.js](app/src/renderer/ui/dom.js), [app/src/renderer/ui/status.js](app/src/renderer/ui/status.js), [app/src/renderer/utils/time.js](app/src/renderer/utils/time.js), [app/src/renderer/state.js](app/src/renderer/state.js).
- Shared modules: [app/src/modules/recordsManager.js](app/src/modules/recordsManager.js) and [app/src/modules/submitManager.js](app/src/modules/submitManager.js).

### Local Testing Instructions

Start a local Hardhat test chain:

```bash
cd chain
npm install
npx hardhat node
```

Deploy the EvidenceRegistry contract to the local chain:

```bash
npx hardhat ignition deploy --network localhost ignition/modules/EvidenceRegistry.ts
```

Use the deployed address from [chain/ignition/deployments/chain-31337/deployed_addresses.json](chain/ignition/deployments/chain-31337/deployed_addresses.json) and the ABI from [chain/artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json](chain/artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json).

Run the Electron app:

```bash
cd app
npm install
npm run start
```

Test flow:
- In Settings, set RPC URL to `http://127.0.0.1:8545` (if using default Hardhat network) , paste the contract address, and paste the ABI.
- In Submit Evidence, upload an image and submit to chain.
- In Verify Evidence, upload the same image to confirm it existed earlier.

## Future Work

- Screenshot button is currently still a placeholder. Implementing the actual screenshot capture functionality is a priority for the next iteration.
- Move user information input (like wallet address) from the Submission page to the Settings page for better UX.
- Consider implementing zero-knowledge proofs (ZKP) to enhance privacy and security of evidence verification. (Not prior but a potential future enhancement)