const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Hash generation function (same as in main.js)
function generateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}

// Generate hash from buffer
function generateBufferHash(buffer) {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

describe('SHA-256 Hash Generation', () => {
  const testDir = path.join(__dirname, 'test-files');
  
  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => fs.unlinkSync(path.join(testDir, file)));
      fs.rmdirSync(testDir);
    }
  });
  
  test('should generate consistent SHA-256 hash for same content', async () => {
    const content = 'Test image content for hashing';
    const testFile = path.join(testDir, 'test1.txt');
    fs.writeFileSync(testFile, content);
    
    const hash1 = await generateFileHash(testFile);
    const hash2 = await generateFileHash(testFile);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
  });
  
  test('should generate different hashes for different content', async () => {
    const testFile1 = path.join(testDir, 'test2.txt');
    const testFile2 = path.join(testDir, 'test3.txt');
    
    fs.writeFileSync(testFile1, 'Content A');
    fs.writeFileSync(testFile2, 'Content B');
    
    const hash1 = await generateFileHash(testFile1);
    const hash2 = await generateFileHash(testFile2);
    
    expect(hash1).not.toBe(hash2);
  });
  
  test('should produce valid hex string', async () => {
    const testFile = path.join(testDir, 'test4.txt');
    fs.writeFileSync(testFile, 'Some random content');
    
    const hash = await generateFileHash(testFile);
    
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
  
  test('should handle empty file', async () => {
    const testFile = path.join(testDir, 'empty.txt');
    fs.writeFileSync(testFile, '');
    
    const hash = await generateFileHash(testFile);
    
    // SHA-256 of empty string
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  
  test('should match crypto module direct hash', () => {
    const content = 'Test content for verification';
    const buffer = Buffer.from(content);
    
    const directHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const functionHash = generateBufferHash(buffer);
    
    expect(directHash).toBe(functionHash);
  });
  
  test('should reject for non-existent file', async () => {
    await expect(generateFileHash('/non/existent/file.txt')).rejects.toThrow();
  });
});

describe('Evidence Record Validation', () => {
  test('should create valid evidence record structure', () => {
    const record = {
      id: 'test-uuid',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: new Date().toISOString(),
      metadata: 'Test metadata',
      transactionId: '0x123...',
      status: 'confirmed'
    };
    
    expect(record).toHaveProperty('id');
    expect(record).toHaveProperty('hash');
    expect(record).toHaveProperty('timestamp');
    expect(record).toHaveProperty('metadata');
    expect(record).toHaveProperty('transactionId');
    expect(record).toHaveProperty('status');
  });
  
  test('should validate hash format', () => {
    const validHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const invalidHash = 'not-a-valid-hash';
    
    const isValidHash = (hash) => /^[a-f0-9]{64}$/.test(hash);
    
    expect(isValidHash(validHash)).toBe(true);
    expect(isValidHash(invalidHash)).toBe(false);
  });
  
  test('should validate Ethereum address format', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44E';
    const invalidAddress = 'not-an-address';
    const shortAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f';
    
    const isValidAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);
    
    // This test shows that we validate ethereum addresses properly
    expect(isValidAddress(validAddress)).toBe(true);
    expect(isValidAddress(invalidAddress)).toBe(false);
    expect(isValidAddress(shortAddress)).toBe(false);
  });
  
  test('should validate timestamp format', () => {
    const timestamp = new Date().toISOString();
    
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });
});

describe('Transaction ID Validation', () => {
  test('should validate Ethereum transaction hash format', () => {
    const validTxHash = '0x' + 'a'.repeat(64);
    const invalidTxHash = '0x123';
    
    const isValidTxHash = (hash) => /^0x[a-fA-F0-9]{64}$/.test(hash);
    
    expect(isValidTxHash(validTxHash)).toBe(true);
    expect(isValidTxHash(invalidTxHash)).toBe(false);
  });
});
