export function genId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

export function todayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(str) {
  if (!str) return '';
  const date = new Date(`${str}T00:00:00`);
  if (Number.isNaN(date.getTime())) return str;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatDateShort(str) {
  if (!str) return '';
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return str;
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end - start) / 86400000);
}

export function relativeDate(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const days = Math.floor((now - date) / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getWeekday(str) {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(`${str}T00:00:00`);
  return labels[date.getDay()] || '';
}
