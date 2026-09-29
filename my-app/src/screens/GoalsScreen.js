import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';
// ─── 3 базовые цели: их нельзя удалять ───
const FIXED_GOALS = [
  { id: 'g1', title: 'Велосипед', emoji: '🚲', cost: 500 },
  { id: 'g2', title: 'Самокат',   emoji: '🛴', cost: 300 },
  { id: 'g3', title: 'Подарок', emoji: '🎁', cost: 200 },
];

export default function GoalsScreen({ navigation }) {
  const bank = useBank();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [mode, setMode] = useState(null); // 'deposit' | 'withdraw'

  // модалка «добавить свою цель»
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newCost, setNewCost] = useState('');

  const goals = [...FIXED_GOALS, ...(bank.customGoals ?? [])];
  const isFixedGoal = (id) => FIXED_GOALS.some((g) => g.id === id);

  // Находим существующий конверт по цели (или null)
  const findEnvelope = (goalId) =>
    bank.envelopes.find((e) => e.goal === goalId);

  const openDeposit = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setMode('deposit');
  };

  const openWithdraw = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setMode('withdraw');
  };

  const closeModal = () => {
    setSelectedGoal(null);
    setMode(null);
    setDepositAmount('');
  };

  const handleConfirm = () => {
    const amount = parseInt(depositAmount, 10);
    if (!amount || amount <= 0) return;

    const env = findEnvelope(selectedGoal.id);

    if (mode === 'deposit') {
      if (amount > bank.balance) {
        alert('Недостаточно монет на балансе');
        return;
      }
      if (env) {
        bank.transferToEnvelope(env.id, amount);
      } else {
        bank.createEnvelope(selectedGoal.id, amount);
      }
    } else if (mode === 'withdraw') {
      if (!env) return;
      if (amount > env.amount) {
        alert('Столько нет в копилке');
        return;
      }
      bank.withdrawFromEnvelope(env.id, amount);
    }

    closeModal();
  };

  const totalSaved = bank.envelopes.reduce((sum, e) => sum + e.amount, 0);

  const openAddGoal = () => {
    setNewTitle('');
    setNewEmoji('');
    setNewCost('');
    setAddOpen(true);
  };

  const handleAddGoal = () => {
    const cost = parseInt(newCost, 10);
    if (!newTitle.trim()) {
      alert('Придумай название цели');
      return;
    }
    if (!cost || cost <= 0) {
      alert('Укажи стоимость цели (число больше 0)');
      return;
    }
    bank.addCustomGoal({ title: newTitle, emoji: newEmoji, cost });
    setAddOpen(false);
  };

  const handleDeleteGoal = (goal) => {
    const env = findEnvelope(goal.id);
    const saved = env?.amount ?? 0;
    Alert.alert(
      'Удалить цель?',
      saved > 0
        ? `«${goal.title}» будет удалена, а ${saved} 🪙 вернутся на баланс.`
        : `«${goal.title}» будет удалена.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            if (env && saved > 0) bank.withdrawFromEnvelope(env.id, saved);
            bank.removeCustomGoal(goal.id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>💰 Мои цели</Text>
          <Text style={styles.subtitle}>
            Копи на что-то важное — понемногу каждый период
          </Text>
        </View>

        {/* Баланс + накоплено */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>На руках</Text>
            <Text style={styles.balanceValue}>{Math.floor(bank.balance)} 🪙</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>В копилках</Text>
            <Text style={[styles.balanceValue, { color: '#4caf50' }]}>
              {Math.floor(totalSaved)} 🪙
            </Text>
          </View>
        </View>

        {/* Список целей */}
        {goals.map((goal) => {
          const env = findEnvelope(goal.id);
          const saved = env?.amount ?? 0;
          const progress = Math.min(100, Math.round((saved / goal.cost) * 100));
          const done = saved >= goal.cost;
          const fixed = isFixedGoal(goal.id);

          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalSub}>
                    {saved} / {goal.cost} 🪙 {done ? '✅' : ''}
                  </Text>
                </View>
                {!fixed && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteGoal(goal)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Прогресс-бар */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: done ? '#4caf50' : colors.accent },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>

              {/* Кнопки */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                  onPress={() => openDeposit(goal)}
                >
                  <Text style={styles.actionBtnText}>+ Пополнить</Text>
                </TouchableOpacity>

                {saved > 0 && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#1E88E5' }]}
                    onPress={() => openWithdraw(goal)}
                  >
                    <Text style={styles.actionBtnText}>− Снять</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addGoalBtn} onPress={openAddGoal}>
          <Text style={styles.addGoalBtnText}>➕ Добавить свою цель</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Модалка ввода */}
      <Modal
        visible={!!selectedGoal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {mode === 'deposit' ? '💰 Пополнить' : '💸 Снять'} — {selectedGoal?.title}
            </Text>

            <Text style={styles.modalHint}>
              {mode === 'deposit'
                ? `На руках: ${Math.floor(bank.balance)} 🪙`
                : `В копилке: ${Math.floor(findEnvelope(selectedGoal?.id)?.amount ?? 0)} 🪙`}
            </Text>

            <TextInput
              style={styles.input}
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="Сколько монет?"
              keyboardType="number-pad"
              placeholderTextColor="#7BA7D4"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={closeModal}
              >
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                onPress={handleConfirm}
              >
                <Text style={styles.modalBtnText}>Готово</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка «Добавить свою цель» */}
      <Modal
        visible={addOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎯 Новая цель</Text>
            <Text style={styles.modalHint}>
              Придумай свою мечту — копи на неё вместе с Финпигом.{'\n'}
              Три базовые цели (велосипед, самокат, подарок) всегда на месте.
            </Text>

            <TextInput
              style={styles.input}
              value={newEmoji}
              onChangeText={setNewEmoji}
              placeholder="Эмодзи (необязательно), напр. 🎸"
              placeholderTextColor="#7BA7D4"
              maxLength={4}
            />
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Название цели, напр. Гитара"
              placeholderTextColor="#7BA7D4"
            />
            <TextInput
              style={styles.input}
              value={newCost}
              onChangeText={setNewCost}
              placeholder="Сколько монет нужно?"
              keyboardType="number-pad"
              placeholderTextColor="#7BA7D4"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={() => setAddOpen(false)}
              >
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                onPress={handleAddGoal}
              >
                <Text style={styles.modalBtnText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 20 },
  backBtn: { fontSize: 17, color: colors.accent, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 17, color: colors.textSecondary, marginTop: 6 },

  balanceCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#E3F2FD',
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  balanceLabel: { fontSize: 17, color: colors.textSecondary },
  balanceValue: { fontSize: 18, fontWeight: '700', color: colors.text },

  goalCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#E3F2FD',
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goalEmoji: { fontSize: 36, marginRight: 12 },
  goalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  goalSub: { fontSize: 17, color: colors.textSecondary, marginTop: 2 },

  progressTrack: {
    height: 14, borderRadius: 7, backgroundColor: '#E3F2FD',
    overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: 17, color: colors.textSecondary, marginBottom: 12 },

  btnRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    marginLeft: 8,
  },
  deleteBtnText: { fontSize: 18 },

  addGoalBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  addGoalBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  modalHint: { fontSize: 17, color: colors.textSecondary, marginBottom: 16 },
  input: {
    borderWidth: 2, borderColor: '#ddd', borderRadius: 12,
    padding: 14, fontSize: 18, color: colors.text, marginBottom: 20,
  },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});