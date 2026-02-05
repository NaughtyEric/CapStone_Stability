const fs = require('fs');
const path = require('path');

/**
 * Mock electron BEFORE importing recordsManager
 * Keep the mock self-contained (no outer variables)
 */
jest.mock('electron', () => {
    const path = require('path');
    return {
        app: {
            getPath: jest.fn(() => path.join(__dirname, '.test-data'))
        }
    };
});

/**
 * Mock uuid for deterministic IDs
 */
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-1234')
}));

const recordsManager = require('../recordsManager');

describe('recordsManager', () => {
    const testDataDir = path.join(__dirname, '.test-data');
    const testStorePath = path.join(testDataDir, 'evidence-records.json');

    /**
     * Hard reset between tests:
     * - filesystem
     * - all mocks
     */
    beforeEach(() => {
        jest.restoreAllMocks();

        if (fs.existsSync(testStorePath)) {
            fs.unlinkSync(testStorePath);
        }
        if (fs.existsSync(testDataDir)) {
            fs.rmSync(testDataDir, { recursive: true, force: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(testDataDir)) {
            fs.rmSync(testDataDir, { recursive: true, force: true });
        }
    });

    /* =========================
       loadRecords
       ========================= */
    describe('loadRecords', () => {
        it('returns empty array when file does not exist', () => {
            const records = recordsManager.loadRecords();
            expect(records).toEqual([]);
        });

        it('loads records when file exists', () => {
            const mockRecords = [
                { id: '1', hash: 'hash1', timestamp: '2026-02-05T00:00:00Z' }
            ];

            fs.mkdirSync(testDataDir, { recursive: true });
            fs.writeFileSync(testStorePath, JSON.stringify(mockRecords));

            const records = recordsManager.loadRecords();
            expect(records).toEqual(mockRecords);
        });

        it('returns empty array on invalid JSON', () => {
            fs.mkdirSync(testDataDir, { recursive: true });
            fs.writeFileSync(testStorePath, 'invalid json');

            const records = recordsManager.loadRecords();
            expect(records).toEqual([]);
        });
    });

    /* =========================
       saveRecords
       ========================= */
    describe('saveRecords', () => {
        it('saves records successfully', () => {
            fs.mkdirSync(testDataDir, { recursive: true });

            const records = [
                { id: '1', hash: 'hash1', timestamp: '2026-02-05T00:00:00Z' }
            ];

            const result = recordsManager.saveRecords(records);

            expect(result).toBe(true);
            expect(fs.existsSync(testStorePath)).toBe(true);

            const saved = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
            expect(saved).toEqual(records);
        });

        it('returns false when write fails', () => {
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                throw new Error('Write error');
            });

            const result = recordsManager.saveRecords([{ id: '1' }]);
            expect(result).toBe(false);
        });
    });

    /* =========================
       createRecord
       ========================= */
    describe('createRecord', () => {
        it('creates a confirmed record when transactionId exists', () => {
            const record = recordsManager.createRecord(
                'hash123',
                'metadata',
                'tx123',
                '/path/image.jpg',
                'base64data'
            );

            expect(record.id).toBe('test-uuid-1234');
            expect(record.hash).toBe('hash123');
            expect(record.transactionId).toBe('tx123');
            expect(record.status).toBe('confirmed');
            expect(record).toHaveProperty('timestamp');
        });

        it('creates a pending record when transactionId is missing', () => {
            const record = recordsManager.createRecord(
                'hash123',
                'metadata',
                null,
                '/path/image.jpg',
                'base64data'
            );

            expect(record.transactionId).toBe('pending');
            expect(record.status).toBe('pending');
        });
    });

    /* =========================
       addRecord
       ========================= */
    describe('addRecord', () => {
        it('adds a new record to storage', () => {
            fs.mkdirSync(testDataDir, { recursive: true });

            const result = recordsManager.addRecord(
                'hash123',
                'metadata',
                'tx123',
                '/path/image.jpg',
                'base64data'
            );

            expect(result.success).toBe(true);
            expect(result.record.id).toBe('test-uuid-1234');

            const records = recordsManager.loadRecords();
            expect(records).toHaveLength(1);
        });

        it('returns error when save fails', () => {
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                throw new Error('Write error');
            });

            const result = recordsManager.addRecord(
                'hash123',
                'metadata',
                'tx123',
                '/path/image.jpg',
                'base64data'
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    /* =========================
       deleteRecord
       ========================= */
    describe('deleteRecord', () => {
        it('deletes a record by id', () => {
            fs.mkdirSync(testDataDir, { recursive: true });

            recordsManager.addRecord('hash1', 'meta1', 'tx1', '/p1', 'b1');
            recordsManager.addRecord('hash2', 'meta2', 'tx2', '/p2', 'b2');

            const records = recordsManager.loadRecords();
            const deleteId = records[0].id;

            const result = recordsManager.deleteRecord(deleteId);
            expect(result.success).toBe(true);

            const updated = recordsManager.loadRecords();
            expect(updated).toHaveLength(1);
            expect(updated[0].id).not.toBe(deleteId);
        });

        it('returns success when record does not exist', () => {
            fs.mkdirSync(testDataDir, { recursive: true });

            const result = recordsManager.deleteRecord('non-existent-id');
            expect(result.success).toBe(true);
        });
    });

    /* =========================
       updateTransactionId
       ========================= */
    describe('updateTransactionId', () => {
        it('updates transactionId and status', () => {
            fs.mkdirSync(testDataDir, { recursive: true });

            const { record } = recordsManager.addRecord(
                'hash123',
                'meta',
                null,
                '/path',
                'base64'
            );

            const result = recordsManager.updateTransactionId(record.id, 'tx456');

            expect(result.success).toBe(true);
            expect(result.record.transactionId).toBe('tx456');
            expect(result.record.status).toBe('confirmed');
        });

        it('returns error when record not found', () => {
            fs.mkdirSync(testDataDir, { recursive: true });

            const result = recordsManager.updateTransactionId('missing', 'tx456');
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});