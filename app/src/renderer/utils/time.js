export function formatTimestampDisplay(date) {
  const now = date || new Date();
  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0') +
    ' (UTC' + (now.getTimezoneOffset() > 0 ? '-' : '+') +
    String(Math.abs(now.getTimezoneOffset() / 60)).padStart(1, '0') + ')';
}

export function parseTimestampToUnix(timestamp) {
  if (!timestamp) {
    return undefined;
  }

  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? undefined : Math.floor(parsed / 1000);
}
