import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { TouchableOpacity } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useDemo } from '../context/DemoContext';
import { useMusic } from '../context/MusicContext';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
const MAX_STAGE = 3;


export default function SettingsScreen({ navigation }) {
  const { demoMode, toggleDemo } = useDemo();
  const bank = useBank();
  const { musicOn, setMusicOn, volume, setVolume, sfxOn, setSfxOn } = useMusic();
const budgetPlanCtx = useBudgetPlan();
const petCtx = usePet();
const currentStage = petCtx.pet?.stage ?? 0;

const hasSpending = budgetPlanCtx.currentFact && (
  budgetPlanCtx.currentFact.needs > 0 ||
  budgetPlanCtx.currentFact.wants > 0 ||
  budgetPlanCtx.currentFact.savings > 0

);
const canFinishPeriod = currentStage >= MAX_STAGE && hasSpending;

const handleResetProfile = () => {
  Alert.alert(
    'Сбросить профиль?',
    'Питомец, монеты, цели, план — всё удалится. Используйте для тестового сброса.',
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Сбросить',
        style: 'destructive',
        onPress: async () => {
            petCtx.clearPet?.();
            budgetPlanCtx.resetPlan?.();
            bank.resetBank?.();                       // ← одна строка вместо всего
            await AsyncStorage.clear();               // ← чистит всё хранилище
            Alert.alert(
              'Готово',
    'Профиль сброшен. Закрой приложение ПОЛНОСТЬЮ и запусти заново.'
  );
},
      },
    ]
  );
};
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⚙️ Настройки</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>🔊 Звуки</Text>
            <Switch value={sfxOn} onValueChange={setSfxOn} />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>🎵 Музыка</Text>
            <Switch value={musicOn} onValueChange={setMusicOn} />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>🎚️ Громкость</Text>
            <Slider
              style={{ flex: 1, marginLeft: 12 }}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#1E88E5"
              maximumTrackTintColor="#CFE4F7"
              thumbTintColor="#1E88E5"
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.menuEmoji}>📅</Text>
          <Text style={styles.menuText}>История</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.card}>
        <View style={styles.row}>
            <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>🧪 Демо-режим</Text>
            <Text style={styles.rowHint}>
                Для проверки. На главном экране появится панель быстрых действий.
            </Text>
            </View>
            <Switch value={demoMode} onValueChange={toggleDemo} />
        </View>
        </View>
        <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
                Alert.alert(
                'Сменить питомца?',
                'Ты выберешь нового питомца. Монеты, цели и прогресс сохранятся.',
                [
                    { text: 'Отмена', style: 'cancel' },
                    { text: 'Сменить', onPress: () => navigation.navigate('Catalog') },
                ]
                );
            }}
            >
            <Text style={styles.menuEmoji}>🔄</Text>
            <Text style={styles.menuText}>Сменить питомца</Text>
            <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            {canFinishPeriod && (
            <TouchableOpacity
                style={[styles.menuRow, { backgroundColor: '#fff7e6' }]}
                onPress={() => navigation.navigate('BudgetResultScreen')}
            >
                <Text style={styles.menuEmoji}>📊</Text>
                <Text style={styles.menuText}>Итоги периода</Text>
                <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            )}
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate('ParentGateScreen')}
        >
          <Text style={styles.menuEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.menuText}>Для родителей</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.menuRow}
          onPress={() => alert('Демо-режим скоро')}
        >
          <Text style={styles.menuEmoji}>🧪</Text>
          <Text style={styles.menuText}>Демо-режим</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity> */}
            <TouchableOpacity
            style={[styles.menuRow, { borderColor: '#ffcdd2', backgroundColor: '#fff5f5' }]}
            onPress={handleResetProfile}
            >
            <Text style={styles.menuEmoji}>🗑️</Text>
            <Text style={[styles.menuText, { color: '#c62828' }]}>Сбросить профиль</Text>
            <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => alert('Финпиг — образовательное приложение для детей 7–11 лет')}
        >
          <Text style={styles.menuEmoji}>ℹ️</Text>
          <Text style={styles.menuText}>О приложении</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 10 },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 20 },
  backBtn: { fontSize: 20, color: colors.accent, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#E3F2FD',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E3F2FD',
  },
  rowLabel: { fontSize: 18, color: colors.text },

  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#E3F2FD',
  },
  rowHint: { fontSize: 17, color: '#7BA7D4', marginTop: 2 },
  menuEmoji: { fontSize: 22, marginRight: 12 },
  menuText: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text },
  menuArrow: { fontSize: 22, color: '#bbb' },
});