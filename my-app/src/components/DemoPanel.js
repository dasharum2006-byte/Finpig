import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { TouchableOpacity, Pressable } from './ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';

const BLOCK_KEYS = [
  '@block_one_progress_v1',
  '@block_two_progress_v1',
  '@block_three_progress_v1',
  '@block_four_progress_v1',
];

const BLOCK_MAX = {
  '@block_one_progress_v1': 6,
  '@block_two_progress_v1': 6,
  '@block_three_progress_v1': 5,
  '@block_four_progress_v1': 5,
};

// Быстрые переходы по экранам — чтобы тестировщик не искал их вручную
const QUICK_LINKS = [
  { id: 'tasks', label: '📋 Задания', route: 'Tasks' },
  { id: 'games', label: '🎮 Мини-игры', route: 'MiniGamesScreen' },
  { id: 'bank', label: '🏦 Банк', route: 'Bank' },
  { id: 'town', label: '🏙️ Город', route: 'Town' },
  { id: 'toys', label: '🧸 Магазин игрушек', route: 'ToyShopScreen' },
  { id: 'food', label: '🍎 Еда', route: 'FoodShopScreen' },
  { id: 'world', label: '🌍 Мир', route: 'World' },
  { id: 'goals', label: '🎯 Цели', route: 'GoalsScreen' },
  { id: 'kitchen', label: '🍳 Кухня', route: 'Kitchen' },
  { id: 'history', label: '📅 История', route: 'History' },
];

export default function DemoPanel({ navigation, onShowResult }) {
  const [open, setOpen] = useState(false);
  const bank = useBank();
  const petCtx = usePet();
  const plan = useBudgetPlan();

  const unlockAll = async () => {
    try {
      const entries = BLOCK_KEYS.map((k) => [k, String(BLOCK_MAX[k])]);
      entries.push(['@block_one_finished', 'true']);
      await AsyncStorage.multiSet(entries);
      bank.setLevel?.(4);
      petCtx.setStage?.(3);
      bank.addCoins?.(1000);
      Alert.alert(
        '✅ Всё разблокировано',
        'Уровень 4, стадия «Взрослый», Мир/Цели открыты. Начислено +1000 🪙.\n\nВсе блоки помечены пройденными — можно открывать любой шаг в режиме просмотра.'
      );
    } catch (e) {
      console.error('unlockAll error:', e);
      Alert.alert('Ошибка', 'Не удалось разблокировать всё.');
    }
  };

  const resetTasks = async () => {
    try {
      await AsyncStorage.multiRemove([...BLOCK_KEYS, '@block_one_finished']);
      Alert.alert('🧹 Задания сброшены', 'Прогресс блоков очищен — можно проходить заново.');
    } catch (e) {
      console.error('resetTasks error:', e);
    }
  };

  const cyclePeriod = () => {
    if (!plan.currentPlan) {
      // если плана нет — создаём «эталонный» и сразу фиксируем период
      plan.completeDemoPeriod?.({ budget: 500, needs: 250, wants: 150, savings: 100 });
    } else {
      const p = plan.currentPlan;
      plan.completeDemoPeriod?.({
        budget: p.budget,
        needs: p.needs,
        wants: p.wants,
        savings: p.savings,
      });
    }
    Alert.alert(
      '🎬 Период прокручен',
      'В историю добавлен новый период со 100% выполнением плана.\n\nНажми «📊 Итоги периода», чтобы посмотреть результат.'
    );
  };

  const showResult = () => {
    // гарантируем, что есть что показывать
    if (!plan.currentPlan || !plan.currentFact) {
      plan.completeDemoPeriod?.({ budget: 500, needs: 250, wants: 150, savings: 100 });
    }
    setOpen(false);
    setTimeout(() => onShowResult?.(), 150);
  };

  const resetBudget = () => {
    Alert.alert('Сбросить бюджет?', 'План, факт и история периодов будут очищены.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Сбросить',
        style: 'destructive',
        onPress: () => {
          plan.resetPlan?.();
          Alert.alert('Готово', 'Бюджет и история периодов очищены.');
        },
      },
    ]);
  };

  const go = (route) => {
    setOpen(false);
    setTimeout(() => navigation.navigate(route), 150);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>🧪 ДЕМО</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>🧪 Демо-панель</Text>
            <Text style={styles.subtitle}>Быстрая проверка без прохождения игры</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {/* Прогресс */}
              <Text style={styles.section}>ПРОГРЕСС</Text>
              <TouchableOpacity style={styles.action} onPress={unlockAll} activeOpacity={0.8}>
                <Text style={styles.actionEmoji}>🔓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Разблокировать всё</Text>
                  <Text style={styles.actionHint}>Уровень 4, Мир, Цели, блоки + 1000 🪙</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.action}
                onPress={() => bank.addCoins?.(500)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionEmoji}>🪙</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>+500 монет</Text>
                  <Text style={styles.actionHint}>Баланс: {Math.floor(bank.balance)} 🪙</Text>
                </View>
              </TouchableOpacity>

              {/* Периоды */}
              <Text style={styles.section}>БЮДЖЕТ И ПЕРИОДЫ</Text>
              <TouchableOpacity style={styles.action} onPress={cyclePeriod} activeOpacity={0.8}>
                <Text style={styles.actionEmoji}>🎬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Прокрутить период</Text>
                  <Text style={styles.actionHint}>Добавить период в историю (100%)</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={showResult} activeOpacity={0.8}>
                <Text style={styles.actionEmoji}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Итоги периода</Text>
                  <Text style={styles.actionHint}>Открыть экран результатов</Text>
                </View>
              </TouchableOpacity>

              {/* Быстрые переходы */}
              <Text style={styles.section}>БЫСТРЫЙ ПЕРЕХОД</Text>
              <View style={styles.linksWrap}>
                {QUICK_LINKS.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={styles.linkChip}
                    onPress={() => go(l.route)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.linkText}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Сброс */}
              <Text style={styles.section}>СБРОС</Text>
              <TouchableOpacity style={styles.action} onPress={resetTasks} activeOpacity={0.8}>
                <Text style={styles.actionEmoji}>🧹</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Сбросить задания</Text>
                  <Text style={styles.actionHint}>Очистить прогресс всех блоков</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={resetBudget} activeOpacity={0.8}>
                <Text style={styles.actionEmoji}>📉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>Сбросить бюджет</Text>
                  <Text style={styles.actionHint}>План, факт и история периодов</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>Закрыть</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 70,
    right: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#7E57C2',
    borderRadius: 16,
    zIndex: 100,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#B39DDB',
  },
  fabText: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 0.5 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#EDE7F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#B39DDB',
    marginBottom: 14,
  },
  title: { fontSize: 23, fontWeight: '900', color: '#4527A0', textAlign: 'center' },
  subtitle: { fontSize: 17, color: '#5E35B1', textAlign: 'center', marginBottom: 14 },

  section: {
    fontSize: 17,
    fontWeight: '900',
    color: '#7E57C2',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#D1C4E9',
  },
  actionEmoji: { fontSize: 22, marginRight: 12 },
  actionTitle: { fontSize: 17, fontWeight: '800', color: '#311B92' },
  actionHint: { fontSize: 17, color: '#673AB7', marginTop: 2 },

  linksWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkChip: {
    backgroundColor: 'rgba(126,87,194,0.14)',
    borderWidth: 1.5,
    borderColor: '#7E57C2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  linkText: { fontSize: 17, fontWeight: '800', color: '#4527A0' },

  closeBtn: {
    backgroundColor: '#7E57C2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  closeText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
