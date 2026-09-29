// ─── Глобальная настройка дизайна ───
// Импортируется ПЕРВЫМ в index.js, до App, чтобы успеть пропатчить
// StyleSheet.create для всех экранов.
import { StyleSheet } from 'react-native';

const MIN_FONT = 17;

if (!global.__FINPIG_STYLE_PATCH__) {
  global.__FINPIG_STYLE_PATCH__ = true;

  const originalCreate = StyleSheet.create;

  StyleSheet.create = (sheet) => {
    const fixed = {};
    for (const key in sheet) {
      const style = { ...sheet[key] };
      // Главное требование: шрифт не меньше MIN_FONT
      if (typeof style.fontSize === 'number' && style.fontSize < MIN_FONT) {
        style.fontSize = MIN_FONT;
      }
      fixed[key] = style;
    }
    return originalCreate(fixed);
  };
}
