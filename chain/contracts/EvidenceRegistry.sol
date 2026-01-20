// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EvidenceRegistry
 * @dev Smart contract for storing evidence hashes on the blockchain
 * @notice This contract allows users to submit and verify evidence records
 */
contract EvidenceRegistry {
    
    struct Evidence {
        bytes32 hash;           // SHA-256 hash of the evidence
        uint256 timestamp;      // Timestamp when evidence was submitted
        string metadata;        // Optional metadata about the evidence
        address submitter;      // Address of the person who submitted
        bool exists;            // Check if record exists
    }
    
    // Mapping from evidence ID to Evidence struct
    mapping(uint256 => Evidence) public evidenceRecords;
    
    // Mapping from hash to evidence ID (to check if hash already exists)
    mapping(bytes32 => uint256) public hashToId;
    
    // Counter for evidence IDs
    uint256 public evidenceCount;
    
    // Events
    event EvidenceSubmitted(
        uint256 indexed evidenceId,
        bytes32 indexed hash,
        address indexed submitter,
        uint256 timestamp,
        string metadata
    );
    
    event EvidenceVerified(
        uint256 indexed evidenceId,
        bytes32 indexed hash,
        bool verified
    );
    
    /**
     * @dev Submit new evidence to the blockchain
     * @param _hash SHA-256 hash of the evidence (as bytes32)
     * @param _metadata Optional metadata about the evidence
     * @return evidenceId The ID of the newly created evidence record
     */
    function submitEvidence(bytes32 _hash, string memory _metadata) public returns (uint256) {
        require(_hash != bytes32(0), "Hash cannot be empty");
        require(!evidenceRecords[hashToId[_hash]].exists, "Evidence with this hash already exists");
        
        evidenceCount++;
        uint256 newId = evidenceCount;
        
        evidenceRecords[newId] = Evidence({
            hash: _hash,
            timestamp: block.timestamp,
            metadata: _metadata,
            submitter: msg.sender,
            exists: true
        });
        
        hashToId[_hash] = newId;
        
        emit EvidenceSubmitted(newId, _hash, msg.sender, block.timestamp, _metadata);
        
        return newId;
    }
    
    /**
     * @dev Get evidence record by ID
     * @param _id Evidence ID
     * @return hash The SHA-256 hash
     * @return timestamp When the evidence was submitted
     * @return metadata The metadata string
     * @return submitter The address that submitted the evidence
     */
    function getEvidence(uint256 _id) public view returns (
        bytes32 hash,
        uint256 timestamp,
        string memory metadata,
        address submitter
    ) {
        require(evidenceRecords[_id].exists, "Evidence does not exist");
        Evidence memory evidence = evidenceRecords[_id];
        return (evidence.hash, evidence.timestamp, evidence.metadata, evidence.submitter);
    }
    
    /**
     * @dev Verify if a hash exists in the registry
     * @param _hash The hash to verify
     * @return exists Whether the hash exists
     * @return evidenceId The ID of the evidence (0 if not found)
     */
    function verifyHash(bytes32 _hash) public view returns (bool exists, uint256 evidenceId) {
        evidenceId = hashToId[_hash];
        exists = evidenceId != 0;
        return (exists, evidenceId);
    }
    
    /**
     * @dev Get evidence ID by hash
     * @param _hash The hash to look up
     * @return The evidence ID (0 if not found)
     */
    function getEvidenceIdByHash(bytes32 _hash) public view returns (uint256) {
        return hashToId[_hash];
    }
    
    /**
     * @dev Check if caller submitted specific evidence
     * @param _id Evidence ID
     * @return True if caller is the submitter
     */
    function isSubmitter(uint256 _id) public view returns (bool) {
        return evidenceRecords[_id].submitter == msg.sender;
    }
    
    /**
     * @dev Get total number of evidence records
     * @return The total count
     */
    function getTotalEvidence() public view returns (uint256) {
        return evidenceCount;
    }
}
