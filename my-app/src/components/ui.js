// ─── UI-обёртки ───
// Дают всем нажимаемым элементам минимальный размер 48×48 dp.
import React from 'react';
import {
  TouchableOpacity as RNTouchableOpacity,
  Pressable as RNPressable,
} from 'react-native';

export const MIN_TOUCH = 48;
const minSize = { minHeight: MIN_TOUCH, minWidth: MIN_TOUCH };

export const TouchableOpacity = React.forwardRef(({ style, ...rest }, ref) => (
  <RNTouchableOpacity ref={ref} {...rest} style={[minSize, style]} />
));
TouchableOpacity.displayName = 'TouchableOpacity';

export const Pressable = React.forwardRef(({ style, ...rest }, ref) => (
  <RNPressable
    ref={ref}
    {...rest}
    style={(state) => [minSize, typeof style === 'function' ? style(state) : style]}
  />
));
Pressable.displayName = 'Pressable';

export default { TouchableOpacity, Pressable, MIN_TOUCH };
