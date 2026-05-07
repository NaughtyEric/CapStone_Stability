const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

// Store path for evidence records
const getStorePath = () => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'evidence-records.json');
};

// Load evidence records from local storage
function loadRecords() {
    try {
        const storePath = getStorePath();
        if (fs.existsSync(storePath)) {
            const data = fs.readFileSync(storePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading records:', error);
    }
    return [];
}

/**
 * Save evidence records to local storage.
 * @param {Array} records - Full list of evidence records to persist.
 * @returns {boolean} - True if save was successful, false otherwise.
 */
function saveRecords(records) {
    try {
        const storePath = getStorePath();
        fs.writeFileSync(storePath, JSON.stringify(records, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving records:', error);
        return false;
    }
}

/**
 * Create a new evidence record.
 * @param {string} hash - SHA-256 hash string for the evidence.
 * @param {string} metadata - Optional descriptive text for the evidence.
 * @param {string} transactionId - Blockchain transaction hash, or empty for pending.
 * @param {string} imagePath - Filesystem path to the evidence image.
 * @param {string} base64Image - Data URL for quick UI preview.
 */
function createRecord(hash, metadata, transactionId, imagePath, base64Image) {
    return {
        id: uuidv4(),
        hash: hash,
        timestamp: new Date().toISOString(),
        metadata: metadata || '',
        transactionId: transactionId || 'pending',
        imagePath: imagePath,
        base64Image: base64Image,
        status: transactionId ? 'confirmed' : 'pending'
    };
}

/**
 * Add a new evidence record.
 * @param {string} hash - SHA-256 hash string for the evidence.
 * @param {string} metadata - Optional descriptive text for the evidence.
 * @param {string} transactionId - Blockchain transaction hash, or empty for pending.
 * @param {string} imagePath - Filesystem path to the evidence image.
 * @param {string} base64Image - Data URL for quick UI preview.
 * @returns {{ success: boolean, record?: object, error?: string }}
 */
function addRecord(hash, metadata, transactionId, imagePath, base64Image) {
    const records = loadRecords();
    const newRecord = createRecord(hash, metadata, transactionId, imagePath, base64Image);
    records.push(newRecord);

    if (saveRecords(records)) {
        return { success: true, record: newRecord };
    }
    return { success: false, error: 'Failed to save record' };
}

/**
 * Delete a local record by ID.
 * @param {string} recordId - Unique identifier of the record to remove.
 * @returns {{ success: boolean, error?: string }}
 */
function deleteRecord(recordId) {
    const records = loadRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);

    if (saveRecords(filteredRecords)) {
        return { success: true };
    }
    return { success: false, error: 'Failed to delete record' };
}

/**
 * Update a record with a confirmed transaction hash.
 * @param {string} recordId - Unique identifier of the record to update.
 * @param {string} transactionId - Blockchain transaction hash after confirmation.
 * @returns {{ success: boolean, record?: object, error?: string }}
 */
function updateTransactionId(recordId, transactionId) {
    const records = loadRecords();
    const record = records.find(r => r.id === recordId);

    if (record) {
        record.transactionId = transactionId;
        record.status = 'confirmed';

        if (saveRecords(records)) {
            return { success: true, record: record };
        }
    }
    return { success: false, error: 'Failed to update record' };
}

module.exports = {
    loadRecords,
    saveRecords,
    createRecord,
    addRecord,
    deleteRecord,
    updateTransactionId
};

/**
 * TODO: Record manager could be enhanced in the future to support:
 * - Long term archival of records (e.g., moving old records to a separate file or DB)
 * - Better reading strategies for large datasets (e.g., pagination, indexing)
 */