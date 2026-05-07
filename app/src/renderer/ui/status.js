export function showStatus(element, type, message, timeout = 5000) {
  element.className = `status-message ${type}`;
  element.textContent = message;
  element.classList.remove('hidden');

  if (type === 'success' || type === 'info') {
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
