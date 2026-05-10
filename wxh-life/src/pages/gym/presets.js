export const CARDIO_PRESETS = [
  { name: '跳操', caloriesPerMin: 8, emoji: '💃' },
  { name: '爬坡', caloriesPerMin: 9, emoji: '⛰️' },
  { name: '骑行', caloriesPerMin: 7, emoji: '🚴' },
  { name: '跳绳', caloriesPerMin: 12, emoji: '🪢' },
  { name: '游泳', caloriesPerMin: 11, emoji: '🏊' },
];

export const STRENGTH_PRESETS = [
  { name: '深蹲', emoji: '🦵' },
  { name: '俯卧撑', emoji: '💪' },
  { name: '平板支撑', emoji: '🧘' },
  { name: '卷腹', emoji: '🔥' },
  { name: '臀桥', emoji: '🍑' },
  { name: '哑铃', emoji: '🏋️' },
];

export const MOOD_OPTIONS = [
  { key: 'energized', emoji: '💪', label: '充满能量' },
  { key: 'calm', emoji: '😌', label: '平静' },
  { key: 'tired', emoji: '😮‍💨', label: '疲惫' },
  { key: 'struggling', emoji: '🥲', label: '吃力' },
];

export const DEFAULT_LOCATION_PRESETS = [
  { key: 'home', emoji: '🏠', label: '家里' },
  { key: 'gym', emoji: '🏋️', label: '健身房' },
  { key: 'activity_room', emoji: '🏟️', label: '活动室' },
  { key: 'outdoor', emoji: '🌦️', label: '户外' },
  { key: 'travel', emoji: '✈️', label: '出差' },
];

export const EMOJI_PALETTE_EXERCISE = [
  '🏃', '🚶', '🧘', '🏋️', '💪', '🦵', '🔥', '💃', '🚴', '🏊',
  '⛰️', '🪢', '⚽', '🏀', '🏸', '🎾', '🥊', '✨', '🌙', '🌿',
];

export const EMOJI_PALETTE_LOCATION = [
  '🏠', '🏋️', '🏟️', '🌦️', '✈️', '📍', '🏢', '🌳', '🏖️', '🚗',
  '🛏️', '🛋️', '🎵', '☀️', '🌙', '✨',
];

export function emptyExtras() {
  return { mood: null, difficulty: 0, location: null, customLocation: '', note: '' };
}
