import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function ParentGateScreen({ navigation }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const HOLD_MS = 3000;

  const startHold = () => {
    setHolding(true);
    setProgress(0);

    const startedAt = Date.now();
    progressRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(progressRef.current);
        clearInterval(timerRef.current);
        setHolding(false);
        setProgress(0);
        navigation.replace('Parent');
      }
    }, 50);
  };

  const endHold = () => {
    clearInterval(progressRef.current);
    clearInterval(timerRef.current);
    setHolding(false);
    setProgress(0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Для взрослого</Text>
        <Text style={styles.subtitle}>
          Это раздел для родителей.{'\n'}
          Нажми и удерживай кнопку 3 секунды, чтобы войти.
        </Text>

        <TouchableOpacity
          style={[styles.holdBtn, holding && styles.holdBtnActive]}
          onPressIn={startHold}
          onPressOut={endHold}
          activeOpacity={1}
        >
          <Text style={styles.holdBtnText}>
            {holding ? `${Math.round(progress * 100)}%` : 'Удерживай 3 сек'}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 10},
  backBtn: { padding: 20 },
  backText: { fontSize: 20, color: colors.accent, fontWeight: '600' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 10 },
  subtitle: { fontSize: 17, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  holdBtn: {
    width: 220, paddingVertical: 20, borderRadius: 16,
    backgroundColor: colors.accent, alignItems: 'center',
  },
  holdBtnActive: { backgroundColor: '#e8a87c' },
  holdBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  progressTrack: {
    width: '80%', height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
});