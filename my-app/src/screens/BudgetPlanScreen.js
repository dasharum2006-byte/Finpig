import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';
const STEP = 50;


export default function BudgetPlanScreen({ onFinish, mode = 'plan' }) {
  const bank = useBank();
  const budgetPlanCtx = useBudgetPlan();
   const petCtx = usePet();  
    const myPet = petCtx.pet;
  const currentStage = myPet?.stage ?? 0;
  const petImage = myPet
    ? (currentStage === 0
        ? getEggImage(myPet.speciesId)
        : getPetImage(myPet.speciesId, myPet.variationId, currentStage - 1))
    : null;
  const petName = myPet?.name ?? 'Питомец';
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
  if (remaining > 0) return '#90CAF9';  
  if (remaining < 0) return '#EF5350';   
  return '#42A5F5';                
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
        {petImage && (
    <View style={styles.petBlock}>
      <Image
        source={petImage}
        style={styles.petImageBudget}
        resizeMode="contain"
      />
      <Text style={styles.petNameBudget}>{petName} ждёт план!</Text>
    </View>
  )}

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
  // ─── Общий контейнер ───
  container: { flex: 1, backgroundColor: '#E3F2FD' },   // ← светло-голубой фон
  scroll: { padding: 20, paddingBottom: 40 },

  // ─── Header ───
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0D47A1', marginBottom: 6 },
  subtitle: { fontSize: 18, color: '#1976D2', lineHeight: 20 },

  // ─── Budget card (500 монет) ───
  budgetCard: {
    backgroundColor: '#42A5F5',        // ← голубая карточка
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  budgetLabel: { color: '#E3F2FD', fontSize: 14, opacity: 0.95, marginBottom: 4 },
  budgetValue: { color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: 1 },

  // ─── Section ───
  section: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 12,
  },

  // ─── Category row (🍎🎈💰) ───
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#90CAF9',            // ← голубая обводка
    minHeight: 72,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowEmoji: { fontSize: 28, marginRight: 12 },
  rowTitle: { fontSize: 17, fontWeight: '800', color: '#0D47A1' },
  rowHint: { fontSize: 17, color: '#1976D2', marginTop: 2 },

  // ─── Кнопки +/- ───
  rowControls: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#42A5F5',        // ← голубая
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stepBtnDisabled: { backgroundColor: '#BBDEFB', shadowOpacity: 0 },   // ← светлее
  stepBtnText: { color: '#FFF', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  rowValue: {
    minWidth: 60,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#0D47A1',
    marginHorizontal: 8,
  },

  // ─── Прогресс-бар ───
  progressBlock: { marginVertical: 5 },
  progressTrack: {
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(66, 165, 245, 0.15)',   // ← светло-голубой фон
    overflow: 'hidden',
  },
  
  progressFill: { height: '100%', borderRadius: 8 },
  remainingText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ─── Подсказка от питомца ───
  petHint: {
    backgroundColor: '#E1F5FE',         // ← очень светлый голубой
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#81D4FA',
  },
  petHintText: { fontSize: 14, color: '#01579B', lineHeight: 20 },

  // ─── Кнопка «Подтвердить» ───
  confirmButton: {
    backgroundColor: '#42A5F5',         // ← голубая
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#BBDEFB',         // ← светло-голубая
    shadowOpacity: 0,
  },
  confirmText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  confirmTextDisabled: { color: '#E3F2FD' },

  // ─── ResultView (итоги) ───
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#1976D2' },

  overallCard: {
    backgroundColor: '#42A5F5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  overallLabel: { color: '#E3F2FD', fontSize: 14, opacity: 0.95, marginBottom: 4 },
  overallValue: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  overallTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  overallFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 6 },

  resultRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#90CAF9',            // ← голубая обводка
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultEmoji: { fontSize: 24, marginRight: 10 },
  resultTitle: { fontSize: 16, fontWeight: '800', color: '#0D47A1' },
  resultValues: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultCol: { flex: 1, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: '#1976D2', marginBottom: 4 },
  resultNumber: { fontSize: 18, fontWeight: '900', color: '#0D47A1' },
  resultFeedback: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  petFeedback: {
    backgroundColor: '#E1F5FE',
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#81D4FA',
  },
  petFeedbackText: { fontSize: 15, color: '#01579B', lineHeight: 22 },
  petBlock: {
  alignItems: 'center',
  marginBottom: 16,
},
petImageBudget: {
  width: 140,
  height: 140,
  marginBottom: 8,
},
petNameBudget: {
  fontSize: 16,
  fontWeight: '700',
  color: '#0D47A1',
  textAlign: 'center',
},
});