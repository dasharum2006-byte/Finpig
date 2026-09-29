import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { backToLivingRoom } from '../navigation';

const { width } = Dimensions.get('window');

const EVENTS = [
  { id: 'e1', text: 'Зарплата родителей 💼', type: 'income', explain: 'Зарплата — это доход: деньги приходят в семью.' },
  { id: 'e2', text: 'Покупка продуктов на неделю 🍎', type: 'expense', explain: 'Продукты — обязательный расход.' },
  { id: 'e3', text: 'Карманные деньги от бабушки 🧧', type: 'income', explain: 'Подаренные деньги — это доход.' },
  { id: 'e4', text: 'Оплата проезда в автобусе 🚌', type: 'expense', explain: 'Проезд — это расход.' },
  { id: 'e5', text: 'Проценты по вкладу в банке 🏦', type: 'income', explain: 'Банк платит проценты — это доход.' },
  { id: 'e6', text: 'Новые наушники для игр 🎧', type: 'expense', explain: 'Наушники не из списка — расход (хотелка).' },
  { id: 'e7', text: 'Кэшбэк от банка за покупки ✨', type: 'income', explain: 'Кэшбэк возвращает часть денег — это доход.' },
  { id: 'e8', text: 'Оплата домашнего интернета 📶', type: 'expense', explain: 'Интернет — обязательный расход.' },
];

const POINTS_PER_CORRECT = 3;

export default function IncomeExpenseGameScreen({ navigation }) {
  const bank = useBank();
  const petCtx = usePet();

  const [state, setState] = useState('intro'); // intro | playing | done
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct, text }
  const [rewardGiven, setRewardGiven] = useState(false);
  const answeredRef = useRef(false);

  const event = EVENTS[index];

  const startGame = () => {
    setState('playing');
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setRewardGiven(false);
    answeredRef.current = false;
  };

  const answer = (choice) => {
    if (answeredRef.current) return; // уже ответили — ждём «Дальше»
    answeredRef.current = true;
    const isCorrect = choice === event.type;
    if (isCorrect) setScore((prev) => prev + POINTS_PER_CORRECT);
    setFeedback({ correct: isCorrect, text: event.explain });
  };

  const next = () => {
    if (index < EVENTS.length - 1) {
      setIndex((prev) => prev + 1);
      setFeedback(null);
      answeredRef.current = false;
    } else {
      setState('done');
    }
  };

  const grantReward = () => {
    if (rewardGiven) return;
    setRewardGiven(true);
    if (score > 0 && bank?.addCoins) bank.addCoins(score);
    if (petCtx?.boostHappiness) petCtx.boostHappiness();
    backToLivingRoom(navigation);
  };

  // ─── Интро ───
  if (state === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logo}>📈📉</Text>
          <Text style={styles.title}>Доход или расход?</Text>
          <Text style={styles.desc}>
            Финпиг учится вести семейный бюджет.{'\n\n'}
            Ты увидишь событие — реши, это <Text style={styles.green}>доход</Text> (деньги приходят)
            или <Text style={styles.red}>расход</Text> (деньги уходят).{'\n\n'}
            За каждый правильный ответ — {POINTS_PER_CORRECT} 🪙!
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
            <Text style={styles.primaryBtnText}>Начать игру 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => backToLivingRoom(navigation)}>
            <Text style={styles.ghostBtnText}>В гостиную</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Финал ───
  if (state === 'done') {
    const max = EVENTS.length * POINTS_PER_CORRECT;
    const good = score >= max * 0.7;
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.logo}>{good ? '🏆' : '💪'}</Text>
          <Text style={styles.title}>
            {good ? 'Отличный бухгалтер!' : 'Неплохо, попробуй ещё!'}
          </Text>
          <Text style={styles.winScore}>
            {score} из {max} очков
          </Text>
          <Text style={styles.desc}>
            {good
              ? 'Ты уверенно отличаешь доходы от расходов. Финпиг гордится тобой!'
              : 'Перечитай пояснения и попробуй снова — с каждым разом получается лучше!'}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={grantReward}>
            <Text style={styles.primaryBtnText}>Забрать {score} 🪙 и выйти</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={startGame}>
            <Text style={styles.ghostBtnText}>Играть снова 🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Игра ───
  const progress = Math.round(((index) / EVENTS.length) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={() => backToLivingRoom(navigation)}>
          <Text style={styles.exitBtnText}>✖ Выход</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {index + 1} / {EVENTS.length}
        </Text>
        <Text style={styles.headerScore}>🪙 {score}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.cardWrap}>
        <View style={styles.eventCard}>
          <Text style={styles.eventText}>{event.text}</Text>
        </View>

        {feedback && (
          <View style={[styles.feedbackBox, feedback.correct ? styles.feedbackOk : styles.feedbackBad]}>
            <Text style={styles.feedbackTitle}>
              {feedback.correct ? '✅ Верно!' : '❌ Не совсем'}
            </Text>
            <Text style={styles.feedbackText}>{feedback.text}</Text>
          </View>
        )}
      </View>

      {!feedback ? (
        <View style={styles.answersRow}>
          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: '#2ecc71' }]}
            onPress={() => answer('income')}
          >
            <Text style={styles.answerEmoji}>📈</Text>
            <Text style={styles.answerText}>Доход</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: '#e74c3c' }]}
            onPress={() => answer('expense')}
          >
            <Text style={styles.answerEmoji}>📉</Text>
            <Text style={styles.answerText}>Расход</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>
            {index === EVENTS.length - 1 ? 'Показать результат 🏁' : 'Дальше'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D47A1',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 64, marginBottom: 10 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    fontSize: 17,
    color: '#bfa3ff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  green: { color: '#2ecc71', fontWeight: 'bold' },
  red: { color: '#e74c3c', fontWeight: 'bold' },
  winScore: {
    fontSize: 24,
    color: '#f1c40f',
    fontWeight: 'bold',
    marginBottom: 12,
  },

  primaryBtn: {
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ghostBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  ghostBtnText: { color: '#1E88E5', fontSize: 17, fontWeight: 'bold' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exitBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  exitBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerScore: { color: '#f1c40f', fontSize: 17, fontWeight: 'bold' },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D47A1',
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: { height: '100%', backgroundColor: '#1E88E5', borderRadius: 4 },

  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  eventCard: {
    backgroundColor: '#0D47A1',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E88E5',
    minHeight: 160,
  },
  eventText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },

  feedbackBox: {
    marginTop: 18,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },
  feedbackOk: { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: '#2ecc71' },
  feedbackBad: { backgroundColor: 'rgba(231,76,60,0.15)', borderColor: '#e74c3c' },
  feedbackTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
  feedbackText: { color: '#e8e8ff', fontSize: 17, lineHeight: 21 },

  answersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  answerBtn: {
    width: (width - 56) / 2,
    height: 120,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  answerEmoji: { fontSize: 40, marginBottom: 6 },
  answerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
