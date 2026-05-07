const fs = require('fs');
const path = require('path');
const { hashFile } = require('./hashService');

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

module.exports = {
  buildImagePayload
};
