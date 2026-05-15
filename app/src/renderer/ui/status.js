export function showStatus(element, type, message, optionsOrTimeout) {
  const options = typeof optionsOrTimeout === 'object' && optionsOrTimeout !== null
    ? optionsOrTimeout
    : { timeout: optionsOrTimeout };
  const timeout = Number.isFinite(options.timeout) ? options.timeout : 5000;
  const autoHide = typeof options.autoHide === 'boolean'
    ? options.autoHide
    : (type === 'success' || type === 'info');

  element.className = `status-message ${type}`;
  element.textContent = message;
  element.classList.remove('hidden');

  if (autoHide) {
    setTimeout(() => {
      element.classList.add('hidden');
    }, timeout);
  }
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function showToast(message, type = 'error', options = {}) {
  const container = document.getElementById('toast-container');
  if (!container) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const timeout = Number.isFinite(options.timeout) ? options.timeout : 4000;

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });
  }, timeout);
}
