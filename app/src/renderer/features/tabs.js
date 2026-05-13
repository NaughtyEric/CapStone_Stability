import { tabButtons, tabContents } from '../ui/dom.js';

let isAnimating = false;

export function initTabs({ onRecordsTab }) {
  const buttons = Array.from(tabButtons());

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isAnimating) {
        return;
      }

      const tabId = btn.dataset.tab;
      // Determine slide direction based on tab index
      const currentButton = buttons.find(button => button.classList.contains('active'));

      if (currentButton && currentButton.dataset.tab === tabId) {
        return;
      }

      const currentIndex = currentButton ? buttons.indexOf(currentButton) : 0;
      const nextIndex = buttons.indexOf(btn);
      const direction = nextIndex > currentIndex ? 'right' : 'left';

      buttons.forEach(button => button.classList.remove('active'));
      btn.classList.add('active');

      // Animate current and target tab panels
      const currentTab = currentButton
        ? document.getElementById(`${currentButton.dataset.tab}-tab`)
        : null;
      const targetTab = document.getElementById(`${tabId}-tab`);
      targetTab.classList.remove('hidden');
      targetTab.classList.add('active', 'tab-slide-in', direction === 'right' ? 'from-right' : 'from-left');

      if (currentTab) {
        currentTab.classList.remove('hidden');
        currentTab.classList.remove('active');
        currentTab.classList.add('tab-slide-out', direction === 'right' ? 'to-left' : 'to-right');
      }

      isAnimating = true;
      let pending = currentTab ? 2 : 1;

      const finalize = () => {
        // Cleanup animation classes after both panels finish
        pending -= 1;
        if (pending > 0) {
          return;
        }

        if (currentTab) {
          currentTab.classList.add('hidden');
          currentTab.classList.remove('tab-slide-out', 'to-left', 'to-right');
        }

        targetTab.classList.remove('tab-slide-in', 'from-left', 'from-right');
        isAnimating = false;
      };

      targetTab.addEventListener('animationend', finalize, { once: true });
      if (currentTab) {
        currentTab.addEventListener('animationend', finalize, { once: true });
      }

      if (tabId === 'records' && typeof onRecordsTab === 'function') {
        onRecordsTab();
      }
    });
  });
}
