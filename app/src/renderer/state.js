export const state = {
  currentImage: null,
  recordsCache: []
};

export function setCurrentImage(image) {
  state.currentImage = image;
}

export function setRecordsCache(records) {
  state.recordsCache = records;
}
