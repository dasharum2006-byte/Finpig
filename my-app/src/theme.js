// ─── Единая палитра приложения: нежно-голубой · синий · белый ───
// Три главных цвета: colors.bg (нежно-голубой), colors.primary (синий), colors.white.

export const colors = {
  // ─── ТРИ ГЛАВНЫХ ЦВЕТА ───
  bg: '#EAF4FF',        // нежно-голубой фон
  primary: '#1E88E5',   // синий (кнопки, акценты)
  white: '#FFFFFF',     // белые поверхности/карточки

  // ─── Оттенки синего ───
  primaryDark: '#0D47A1',
  primaryMid: '#1976D2',
  primaryLight: '#42A5F5',
  primarySoft: '#E3F2FD',
  primaryPale: '#90CAF9',

  // ─── Текст ───
  text: '#0D47A1',
  textSecondary: '#1976D2',
  textOnPrimary: '#FFFFFF',

  // ─── Поверхности и границы ───
  cardBg: '#FFFFFF',
  border: '#90CAF9',
  disabled: '#CFE4F7',
  disabledText: '#7BA7D4',

  // ─── Статусы (обратная связь) ───
  success: '#2E7D32',
  successSoft: '#E8F5E9',
  danger: '#D32F2F',
  dangerSoft: '#FFEBEE',
  warning: '#F9A825',

  // ─── Обратная совместимость со старыми ключами ───
  background: '#EAF4FF',
  accent: '#1E88E5',
  accentDark: '#0D47A1',
};

// Главные требования доступности
export const MIN_TOUCH = 48; // минимальный размер нажимаемой области, dp
export const MIN_FONT = 17;  // минимальный размер шрифта

export default { colors, MIN_TOUCH, MIN_FONT };
