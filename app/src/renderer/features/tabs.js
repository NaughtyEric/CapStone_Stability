import { tabButtons, tabContents } from '../ui/dom.js';

export function initTabs({ onRecordsTab }) {
  tabButtons().forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabButtons().forEach(button => button.classList.remove('active'));
      btn.classList.add('active');

      tabContents().forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
      });

      const targetTab = document.getElementById(`${tabId}-tab`);
      targetTab.classList.remove('hidden');
      targetTab.classList.add('active');

      if (tabId === 'records' && typeof onRecordsTab === 'function') {
        onRecordsTab();
      }
    });
  });
}
