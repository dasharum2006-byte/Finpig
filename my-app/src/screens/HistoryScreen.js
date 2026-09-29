import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';

const BLOCKS = [
  { id: 1, key: '@block_one_progress_v1', title: 'Блок 1: Основы', total: 6 },
  { id: 2, key: '@block_two_progress_v1', title: 'Блок 2: Банковские хитрости', total: 6 },
  { id: 3, key: '@block_three_progress_v1', title: 'Блок 3: Бюджет и цели', total: 5 },
  { id: 4, key: '@block_four_progress_v1', title: 'Блок 4: Законы', total: 5 },
];

export default function HistoryScreen({ navigation }) {
  const bank = useBank();
  const budgetPlanCtx = useBudgetPlan();
  const [blocksProgress, setBlocksProgress] = useState({});

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const result = {};
        for (const b of BLOCKS) {
          const raw = await AsyncStorage.getItem(b.key);
          result[b.id] = raw ? parseInt(raw, 10) : 0;
        }
        setBlocksProgress(result);
      };
      load();
    }, [])
  );

  const goal = budgetPlanCtx.goal;
  const envelopes = bank.envelopes ?? [];
  const totalSaved = envelopes.reduce((s, e) => s + e.amount, 0);
  const history = budgetPlanCtx.history ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📅 История</Text>
        <Text style={styles.subtitle}>
          Что ты уже прошёл и как идут дела
        </Text>

        {/* ─── Пройденные задания ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Пройденные задания</Text>
          {BLOCKS.map((b) => {
            const done = blocksProgress[b.id] ?? 0;
            const percent = Math.min(100, Math.round((done / b.total) * 100));
            const isDone = done >= b.total;
            return (
              <View key={b.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{b.title}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[
                      styles.progressFill,
                      { width: `${percent}%`, backgroundColor: isDone ? '#4caf50' : '#42A5F5' },
                    ]} />
                  </View>
                </View>
                <Text style={[styles.rowValue, isDone && { color: '#4caf50' }]}>
                  {done} / {b.total} {isDone ? '✅' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ─── Прогресс по цели ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Прогресс по цели</Text>
          {goal ? (
            <>
              <View style={styles.row}>
                <Text style={styles.rowTitle}>{goal.title}</Text>
                <Text style={styles.rowValue}>
                  {Math.floor(totalSaved)} / {goal.cost} 🪙
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, (totalSaved / goal.cost) * 100)}%`,
                    backgroundColor: totalSaved >= goal.cost ? '#4caf50' : '#42A5F5',
                  },
                ]} />
              </View>
              <Text style={styles.hintText}>
                {totalSaved >= goal.cost
                  ? '🎉 Цель достигнута! Можно покупать.'
                  : `Осталось накопить ${goal.cost - Math.floor(totalSaved)} 🪙`}
              </Text>
            </>
          ) : (
            <Text style={styles.emptyText}>Цель пока не выбрана</Text>
          )}
        </View>

        {/* ─── Итоги периодов ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Завершённые периоды</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Ты ещё не завершил ни одного периода</Text>
          ) : (
            history.map((item, index) => {
              const { plan, fact } = item;
              const match = (planVal, factVal) => {
                if (!planVal) return 100;
                return Math.max(0, Math.round(100 - (Math.abs(factVal - planVal) / planVal) * 100));
              };
              const overall = Math.round(
                (match(plan.needs, fact.needs) +
                  match(plan.wants, fact.wants) +
                  match(plan.savings, fact.savings)) / 3
              );
              return (
                <View key={index} style={styles.periodRow}>
                  <Text style={styles.periodTitle}>Период {index + 1}</Text>
                  <Text style={styles.periodLine}>
                    🍎 {plan.needs} → {fact.needs} · 🎈 {plan.wants} → {fact.wants} · 💰 {plan.savings} → {fact.savings}
                  </Text>
                  <Text style={styles.periodMatch}>Выполнено на {overall}%</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', paddingTop: 10},
  scroll: { padding: 20, paddingBottom: 20 },

  backBtn: { fontSize: 20, color: '#42A5F5', fontWeight: '600', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '900', color: '#0D47A1', marginBottom: 6 },
  subtitle: { fontSize: 18, color: '#1976D2', marginBottom: 20, lineHeight: 20 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0D47A1', marginBottom: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowTitle: { fontSize: 17, fontWeight: '700', color: '#0D47A1', marginBottom: 4 },
  rowValue: { fontSize: 17, fontWeight: '800', color: '#1976D2', marginLeft: 8 },

  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E3F2FD',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: { height: '100%', borderRadius: 5 },

  hintText: { fontSize: 17, color: '#1976D2', fontStyle: 'italic', marginTop: 6 },

  emptyText: { fontSize: 17, color: '#1976D2', fontStyle: 'italic' },

  periodRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  periodTitle: { fontSize: 18, fontWeight: '800', color: '#0D47A1', marginBottom: 4 },
  periodLine: { fontSize: 17, color: '#1976D2' },
  periodMatch: { fontSize: 17, fontWeight: '700', color: '#42A5F5', marginTop: 4 },
});