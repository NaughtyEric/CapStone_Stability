const root = document.getElementById('screen-root');
const screenImage = document.getElementById('screen-image');
const selectionRect = document.getElementById('selection-rect');

let startX = 0;
let startY = 0;
let isDragging = false;

function updateRect(x, y, width, height) {
  selectionRect.style.left = `${x}px`;
  selectionRect.style.top = `${y}px`;
  selectionRect.style.width = `${width}px`;
  selectionRect.style.height = `${height}px`;
  selectionRect.classList.remove('hidden');
}

function clearRect() {
  selectionRect.classList.add('hidden');
}

root.addEventListener('mousedown', (event) => {
  if (event.button !== 0) {
    return;
  }
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  updateRect(startX, startY, 1, 1);
});

root.addEventListener('mousemove', (event) => {
  if (!isDragging) {
    return;
  }
  const currentX = event.clientX;
  const currentY = event.clientY;
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  updateRect(x, y, width, height);
});

root.addEventListener('mouseup', (event) => {
  if (!isDragging) {
    return;
  }
  isDragging = false;
  const endX = event.clientX;
  const endY = event.clientY;
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width < 5 || height < 5) {
    clearRect();
    return;
  }

  window.selectionAPI.completeSelection({
    x,
    y,
    width,
    height,
    devicePixelRatio: window.devicePixelRatio
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.selectionAPI.cancelSelection();
  }
});

window.selectionAPI.onImage(({ dataUrl }) => {
  screenImage.src = dataUrl;
});

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});
