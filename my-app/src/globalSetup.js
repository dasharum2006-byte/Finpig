
import { StyleSheet } from 'react-native';

const MIN_FONT = 17;

if (!global.__FINPIG_STYLE_PATCH__) {
  global.__FINPIG_STYLE_PATCH__ = true;

  const originalCreate = StyleSheet.create;

  StyleSheet.create = (sheet) => {
    const fixed = {};
    for (const key in sheet) {
      const style = { ...sheet[key] };

      if (typeof style.fontSize === 'number' && style.fontSize < MIN_FONT) {
        style.fontSize = MIN_FONT;
      }
      fixed[key] = style;
    }
    return originalCreate(fixed);
  };
}
