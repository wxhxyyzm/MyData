export const PHASES = [
  {
    id: 'p1',
    title: '第一阶段',
    subtitle: '35天验证期',
    emoji: '🔥',
    color: '#16a34a',
    colorSoft: '#dcfce7',
    startDate: '2026-05-06',
    days: 35,
    goal: '验证在低变量、无失控放纵餐、力量+有氧都有的情况下，能不能稳定下降',
    targets: '7日均值体重 ↓1.0-2.5kg · 腰围 ↓1-3cm · 排便不变差 · 月经不变乱',
    weeklyCalories: '普通日 1300 kcal × 6 + 高热量日 1450 kcal × 1 · 周均 ~1320',
  },
];

export const DAILY_ITEMS = [
  { key: 'wakeUp', label: '起床时间', inputType: 'time', placeholder: '09:00' },
  { key: 'weight', label: '体重', inputType: 'number', placeholder: 'kg', unit: 'kg' },
  { key: 'vitD', label: '维生素D', inputType: 'check' },
  { key: 'iron', label: '铁剂', inputType: 'check' },
  { key: 'exercise', label: '运动', inputType: 'exercise' },
  { key: 'calories', label: '热量摄入', inputType: 'number', placeholder: 'kcal', unit: 'kcal' },
  { key: 'bowel', label: '排便', inputType: 'select', options: ['正常', '费力', '无'] },
  { key: 'hunger', label: '饥饿感', inputType: 'slider', min: 1, max: 10 },
  { key: 'fatigue', label: '疲劳感', inputType: 'slider', min: 1, max: 10 },
  { key: 'sleep', label: '睡觉时间', inputType: 'time', placeholder: '01:00' },
];

export function getCalorieStatus(actual, target) {
  if (!actual || Number.isNaN(parseFloat(actual))) return null;
  const value = parseFloat(actual);
  if (value > target) return 'over';
  if (value < (target * 2) / 3) return 'under';
  return 'ok';
}

export function getExercisePlan(dateStr) {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  const plans = {
    0: { type: '恢复', desc: '低强度恢复 · 散步/轻松爬坡 30-50min', intensity: '低' },
    1: { type: '爬坡', desc: '爬坡快走 40-50min · 坡度7-10 速度5.0-5.5', intensity: '中' },
    2: { type: '力量+爬坡', desc: '力量跟练 20-25min + 爬坡快走 25-30min', intensity: '中高' },
    3: { type: '爬坡', desc: '爬坡快走 40-50min · 坡度7-10 速度5.0-5.5', intensity: '中' },
    4: { type: '力量+爬坡', desc: '力量跟练 20-25min + 爬坡快走 20-25min', intensity: '中高' },
    5: { type: '爬坡长距离', desc: '爬坡快走 45-55min · 本周最长爬坡', intensity: '中高' },
    6: { type: '自选运动', desc: '自选 40-60min · 跳舞/游泳/羽毛球/爬坡', intensity: '自定' },
  };
  return plans[day];
}

export function getCalorieTarget(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDay() === 6 ? 1450 : 1300;
}

export function phaseDates(phase) {
  const dates = [];
  const start = new Date(`${phase.startDate}T00:00:00`);
  for (let offset = 0; offset < phase.days; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  }
  return dates;
}
