import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import { useDemo } from '../context/DemoContext';
import { Switch } from 'react-native';
const GOALS_OF_APP = [
  '🎯 Понять, откуда берутся деньги',
  '🎯 Научиться различать нужное и желаемое',
  '🎯 Планировать бюджет на период',
  '🎯 Копить на мечту',
  '🎯 Принимать решения и видеть последствия',
];

export default function ParentScreen({ navigation }) {
  const bank = useBank();
  const petCtx = usePet();
  const budgetPlanCtx = useBudgetPlan();
    const { demoMode, toggleDemo } = useDemo();
  const handleResetProfile = () => {
    Alert.alert(
      'Сбросить профиль?',
      'Весь прогресс ребёнка будет удалён: питомец, монеты, цели, план. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => {
            petCtx.clearPet?.();
            budgetPlanCtx.resetPlan?.();
            bank.setBalance?.(0);
            // Очищаем конверты
            bank.envelopes?.forEach((env) => {
              bank.withdrawFromEnvelope?.(env.id, env.amount);
            });
            Alert.alert('Готово', 'Профиль сброшен. Перезапустите приложение.');
          },
        },
      ]
    );
  };


  const totalSaved = bank.envelopes?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const periodsDone = budgetPlanCtx.history?.length ?? 0;
  const hasCurrentPlan = !!budgetPlanCtx.currentPlan;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>👨‍👩‍👧 Раздел для взрослого</Text>
          <Text style={styles.subtitle}>
            Здесь видно, чему ребёнок учится в игре — без оценок и сравнений
          </Text>
        </View>

        {/* Цели приложения */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Чему учит приложение</Text>
          {GOALS_OF_APP.map((goal, i) => (
            <Text key={i} style={styles.goalItem}>{goal}</Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Прогресс</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Игровых периодов пройдено</Text>
            <Text style={styles.statValue}>{periodsDone}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Текущий план составлен</Text>
            <Text style={styles.statValue}>{hasCurrentPlan ? '✅' : '—'}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Накоплено в копилках</Text>
            <Text style={styles.statValue}>{Math.floor(totalSaved)} 🪙</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Монет на руках</Text>
            <Text style={styles.statValue}>{Math.floor(bank.balance)} 🪙</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Целей в копилке</Text>
            <Text style={styles.statValue}>{bank.envelopes?.length ?? 0}</Text>
          </View>

          {petCtx.pet && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Питомец</Text>
              <Text style={styles.statValue}>
                {petCtx.pet.name} (стадия {petCtx.pet.stage ?? 0})
              </Text>
            </View>
          )}
        </View>

        {/* Пройденные темы */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Пройденные темы</Text>
          {periodsDone === 0 ? (
            <Text style={styles.emptyText}>
              Ребёнок ещё не завершил ни одного периода
            </Text>
          ) : (
            <Text style={styles.bodyText}>
              Пройдено периодов: {periodsDone}. Каждый период — это цикл «план → траты → итоги».
            </Text>
          )}
        </View>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>🧪 Демо-режим</Text>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    Для  проверки. Все периоды подряд, без ожидания.
                </Text>
                </View>
                <Switch value={demoMode} onValueChange={toggleDemo} />
            </View>
            </View>
        {/* Сброс профиля */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Сбросить профиль</Text>
          <Text style={styles.dangerText}>
            Удаляет питомца, монеты, цели и всю историю. Используйте для тестового сброса.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleResetProfile}>
            <Text style={styles.dangerBtnText}>Сбросить профиль</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 20 },
  backBtn: { fontSize: 16, color: colors.accent, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, lineHeight: 20 },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#eee',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },

  goalItem: { fontSize: 14, color: colors.text, marginVertical: 3, lineHeight: 20 },
  bodyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  emptyText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },

  statRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  statLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.text },

  dangerCard: {
    backgroundColor: '#fff5f5', borderRadius: 16,
    padding: 16, marginTop: 6,
    borderWidth: 1, borderColor: '#ffcdd2',
  },
  dangerTitle: { fontSize: 16, fontWeight: '700', color: '#c62828', marginBottom: 8 },
  dangerText: { fontSize: 13, color: '#8a6d6d', marginBottom: 12, lineHeight: 18 },
  dangerBtn: {
    backgroundColor: '#e53935', paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
  },
  dangerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});