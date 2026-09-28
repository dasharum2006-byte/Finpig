import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';

const STEP = 50;

export default function BudgetPlanScreen({ onFinish, mode = 'plan' }) {
  const bank = useBank();
  const budgetPlanCtx = useBudgetPlan();

  const budget = bank.balance > 0 ? bank.balance : 500;

  const [needs, setNeeds] = useState(0);
  const [wants, setWants] = useState(0);
  const [savings, setSavings] = useState(0);

  const distributed = needs + wants + savings;
  const remaining = budget - distributed;
  const canConfirm = remaining === 0;

  const progressPercent = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.min(100, (distributed / budget) * 100);
  }, [distributed, budget]);


  if (mode === 'result') {
    return (
      <ResultView
        plan={budgetPlanCtx.currentPlan}
        fact={budgetPlanCtx.currentFact}
        onFinish={onFinish}
      />
    );
  }


  const increase = (setter, value) => {
    if (remaining <= 0) return;
    setter(value + STEP);
  };

  const decrease = (setter, value) => {
    if (value <= 0) return;
    setter(value - STEP);
  };

  const onConfirm = () => {
    if (!canConfirm) return;
    budgetPlanCtx.confirmPlan({ budget, needs, wants, savings });
    console.log('✅ План сохранён:', { budget, needs, wants, savings });
    onFinish?.();
  };

  const getRemainingText = () => {
    if (remaining > 0) return `Осталось распределить: ${remaining} 🪙`;
    if (remaining < 0) return `Ты превысил бюджет на ${Math.abs(remaining)} 🪙`;
    return 'Всё распределено ✅';
  };

  const getRemainingColor = () => {
    if (remaining > 0) return '#e8a87c';
    if (remaining < 0) return '#ff4d4d';
    return '#4caf50';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>План бюджета</Text>
          <Text style={styles.subtitle}>
            Давай распределим твои монеты на этот период
          </Text>
        </View>

        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>Твой бюджет</Text>
          <Text style={styles.budgetValue}>{budget} 🪙</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Куда распределим?</Text>

          <CategoryRow
            emoji="🍎"
            title="Нужное питомцу"
            hint="Еда и уход — без этого нельзя"
            value={needs}
            onPlus={() => increase(setNeeds, needs)}
            onMinus={() => decrease(setNeeds, needs)}
            plusDisabled={remaining <= 0}
            minusDisabled={needs <= 0}
          />

          <CategoryRow
            emoji="🎈"
            title="Хочется"
            hint="Игрушки и украшения"
            value={wants}
            onPlus={() => increase(setWants, wants)}
            onMinus={() => decrease(setWants, wants)}
            plusDisabled={remaining <= 0}
            minusDisabled={wants <= 0}
          />

          <CategoryRow
            emoji="💰"
            title="В копилку"
            hint="На твою мечту"
            value={savings}
            onPlus={() => increase(setSavings, savings)}
            onMinus={() => decrease(setSavings, savings)}
            plusDisabled={remaining <= 0}
            minusDisabled={savings <= 0}
          />
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: getRemainingColor() },
              ]}
            />
          </View>
          <Text style={[styles.remainingText, { color: getRemainingColor() }]}>
            {getRemainingText()}
          </Text>
        </View>

        {needs === 0 && (
          <View style={styles.petHint}>
            <Text style={styles.petHintText}>
              🐣 Мне нужна еда! Поставь хотя бы немного в «Нужное питомцу».
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !canConfirm && styles.confirmButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={!canConfirm}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.confirmText,
              !canConfirm && styles.confirmTextDisabled,
            ]}
          >
            {canConfirm ? '✅ Подтвердить план' : 'Распредели все монеты'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultView({ plan, fact, onFinish }) {
  if (!plan || !fact) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Нет данных о плане</Text>
        </View>
      </SafeAreaView>
    );
  }

  const calcScore = (planVal, factVal, category) => {
  if (planVal === 0 && factVal === 0) return 100;
  if (planVal === 0) return 0;

  if (category === 'savings') {
    if (factVal >= planVal) return 100;
    return Math.round((factVal / planVal) * 100);
  }

  if (category === 'wants') {
    if (factVal <= planVal) return 100;
    return Math.max(0, Math.round(100 - ((factVal - planVal) / planVal) * 100));
  }

  // needs
  if (factVal >= planVal) return 100;
  return Math.round((factVal / planVal) * 100);
};

const needsMatch = calcScore(plan.needs, fact.needs, 'needs');
const wantsMatch = calcScore(plan.wants, fact.wants, 'wants');
const savingsMatch = calcScore(plan.savings, fact.savings, 'savings');
const overall = Math.round((needsMatch + wantsMatch + savingsMatch) / 3);


  const getFeedback = (planVal, factVal, category) => {
  if (category === 'savings') {
    if (factVal >= planVal) return `Отложил ${factVal} — цель близко! ✅`;
    return `Накопил ${factVal} из ${planVal} — можно ещё подкопить`;
  }
  if (category === 'wants') {
    if (factVal <= planVal) return `Потратил ${factVal} из ${planVal} — умница! ✅`;
    return `Перерасход на ${factVal - planVal} ⚠️`;
  }
  // needs
  if (factVal >= planVal) return `Питомец сыт и доволен ✅`;
  return `Купил на ${planVal - factVal} меньше плана — питомец может быть голодным ⚠️`;
};

  const getOverallText = () => {
    if (overall >= 90) return 'Ты выполнил план! Питомец доволен. Так держать!';
    if (overall >= 70) return 'Хорошо! Немного отклонился от плана — это нормально.';
    if (overall >= 50) return 'Есть над чем поработать. В следующий раз попробуй точнее.';
    return 'План сильно отличается. В следующий период попробуй распределить внимательнее.';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>🐣 Период закончен!</Text>
          <Text style={styles.subtitle}>Смотрим, как получилось</Text>
        </View>

        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Итог</Text>
          <Text style={styles.overallValue}>План выполнен на {overall}%</Text>
          <View style={styles.overallTrack}>
            <View style={[styles.overallFill, { width: `${overall}%` }]} />
          </View>
        </View>

        <CategoryResult
          emoji="🍎" title="Нужное питомцу"
          plan={plan.needs} fact={fact.needs}
          feedback={getFeedback(plan.needs, fact.needs, 'needs')}
          match={needsMatch}
        />
        <CategoryResult
          emoji="🎈" title="Хочется"
          plan={plan.wants} fact={fact.wants}
          feedback={getFeedback(plan.wants, fact.wants, 'wants')}
          match={wantsMatch}
        />
        <CategoryResult
          emoji="💰" title="В копилку"
          plan={plan.savings} fact={fact.savings}
          feedback={getFeedback(plan.savings, fact.savings, 'savings')}
          match={savingsMatch}
        />

        <View style={styles.petFeedback}>
          <Text style={styles.petFeedbackText}>💬 {getOverallText()}</Text>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmText}>Понятно, дальше →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryResult({ emoji, title, plan, fact, feedback, match }) {
  const isGood = match >= 80;
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultTitle}>{title}</Text>
      </View>
      <View style={styles.resultValues}>
        <View style={styles.resultCol}>
          <Text style={styles.resultLabel}>План</Text>
          <Text style={styles.resultNumber}>{plan}</Text>
        </View>
        <View style={styles.resultCol}>
          <Text style={styles.resultLabel}>Факт</Text>
          <Text style={styles.resultNumber}>{fact}</Text>
        </View>
        <View style={styles.resultCol}>
          <Text style={styles.resultLabel}>Совпадение</Text>
          <Text style={[styles.resultNumber, { color: isGood ? '#4caf50' : '#e8a87c' }]}>
            {match}%
          </Text>
        </View>
      </View>
      <Text style={[styles.resultFeedback, { color: isGood ? '#4caf50' : '#e8a87c' }]}>
        {feedback}
      </Text>
    </View>
  );
}

function CategoryRow({
  emoji, title, hint, value, onPlus, onMinus, plusDisabled, minusDisabled,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowHint}>{hint}</Text>
        </View>
      </View>

      <View style={styles.rowControls}>
        <TouchableOpacity
          style={[styles.stepBtn, minusDisabled && styles.stepBtnDisabled]}
          onPress={onMinus}
          disabled={minusDisabled}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.rowValue}>{value}</Text>

        <TouchableOpacity
          style={[styles.stepBtn, plusDisabled && styles.stepBtnDisabled]}
          onPress={onPlus}
          disabled={plusDisabled}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 20 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: colors.textSecondary },

  budgetCard: {
    backgroundColor: colors.accent,
    borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 24,
  },
  budgetLabel: { color: '#fff', fontSize: 14, opacity: 0.9, marginBottom: 4 },
  budgetValue: { color: '#fff', fontSize: 32, fontWeight: '700' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },

  row: {
    backgroundColor: colors.cardBg,
    borderRadius: 16, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowEmoji: { fontSize: 28, marginRight: 12 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowControls: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnDisabled: { backgroundColor: '#ccc' },
  stepBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  rowValue: {
    minWidth: 60, textAlign: 'center',
    fontSize: 18, fontWeight: '700', color: colors.text,
    marginHorizontal: 8,
  },

  progressBlock: { marginVertical: 16 },
  progressTrack: {
    height: 16, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 8 },
  remainingText: { marginTop: 8, fontSize: 15, fontWeight: '600', textAlign: 'center' },

  petHint: { backgroundColor: '#fff7e6', borderRadius: 14, padding: 14, marginBottom: 16 },
  petHintText: { fontSize: 14, color: '#8a6d3b', lineHeight: 20 },

  confirmButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  confirmButtonDisabled: { backgroundColor: '#e0e0e0' },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  confirmTextDisabled: { color: '#999' },

  overallCard: {
    backgroundColor: colors.accent, borderRadius: 20,
    padding: 20, marginBottom: 24, alignItems: 'center',
  },
  overallLabel: { color: '#fff', fontSize: 14, opacity: 0.9, marginBottom: 4 },
  overallValue: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  overallTrack: {
    width: '100%', height: 12, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden',
  },
  overallFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },

  resultRow: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, marginBottom: 12 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultEmoji: { fontSize: 24, marginRight: 10 },
  resultTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  resultValues: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultCol: { flex: 1, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  resultNumber: { fontSize: 18, fontWeight: '700', color: colors.text },
  resultFeedback: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  petFeedback: {
    backgroundColor: '#fff7e6', borderRadius: 14, padding: 16, marginVertical: 16,
  },
  petFeedbackText: { fontSize: 15, color: '#8a6d3b', lineHeight: 22 },
});