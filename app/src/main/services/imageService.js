const fs = require('fs');
const path = require('path');
const { hashFile, hashBuffer } = require('./hashService');

async function buildImagePayload(filePath) {
  const hash = await hashFile(filePath);
  const imageData = fs.readFileSync(filePath);
  const base64Image = imageData.toString('base64');
  const ext = path.extname(filePath).slice(1).toLowerCase();

  return {
    path: filePath,
    hash,
    base64: `data:image/${ext};base64,${base64Image}`,
    fileName: path.basename(filePath)
  };
}

function buildImagePayloadFromBuffer(buffer, fileName, mimeType) {
  const hash = hashBuffer(buffer);
  const base64Image = buffer.toString('base64');
  const ext = fileName ? path.extname(fileName).slice(1).toLowerCase() : 'png';
  const resolvedName = fileName || `screenshot.${ext}`;
  const resolvedMime = mimeType || `image/${ext}`;

  return {
    path: null,
    hash,
    base64: `data:${resolvedMime};base64,${base64Image}`,
    fileName: resolvedName
  };
}

module.exports = {
  buildImagePayload,
  buildImagePayloadFromBuffer
};
