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

// Save evidence records to local storage
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

// Create new evidence record
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

// Add new record
function addRecord(hash, metadata, transactionId, imagePath, base64Image) {
    const records = loadRecords();
    const newRecord = createRecord(hash, metadata, transactionId, imagePath, base64Image);
    records.push(newRecord);

    if (saveRecords(records)) {
        return { success: true, record: newRecord };
    }
    return { success: false, error: 'Failed to save record' };
}

// Delete record by ID
function deleteRecord(recordId) {
    const records = loadRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);

    if (saveRecords(filteredRecords)) {
        return { success: true };
    }
    return { success: false, error: 'Failed to delete record' };
}

// Update transaction ID
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