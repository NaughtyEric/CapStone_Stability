import { initTabs } from './features/tabs.js';
import { initImageSelection, updateTimestampDisplay } from './features/imageSelection.js';
import { initSubmit } from './features/submit.js';
import { initRecords, loadRecords } from './features/records.js';
import { initSettings } from './features/settings.js';
import { initVerify } from './features/verify.js';

initTabs({ onRecordsTab: loadRecords });
initImageSelection();
initSubmit();
initRecords();
initSettings();
initVerify();
updateTimestampDisplay();
setInterval(updateTimestampDisplay, 1000);
