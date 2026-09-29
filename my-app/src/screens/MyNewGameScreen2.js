import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { useBank } from '../context/BankContext'; 
import { usePet } from '../context/PetContext';
import { backToLivingRoom } from '../navigation';

const { width, height } = Dimensions.get('window');
const GAME_EVENTS = [
  { id: 'e1', text: 'Покупка продуктов на неделю 🥦', target: 'essential', desc: 'Еда — это обязательный расход!', points: 10 },
  { id: 'e2', text: 'Подарок на День Рождения 🎁', target: 'savings', desc: 'Подарки лучше отложить в копилку!', points: 10 },
  { id: 'e3', text: 'Новый яркий поп-ит у кассы 🧸', target: 'wants', desc: 'Игрушки не из списка — это хотелки!', points: 10 },
  { id: 'e4', text: 'Оплата аренды квартиры и ЖКХ 🏠', target: 'essential', desc: 'Жилье — самый важный обязательный расход!', points: 10 },
  { id: 'e5', text: 'Карманные деньги от дедушки 🪙', target: 'savings', desc: 'Отправляем в сбережения!', points: 10 },
  { id: 'e6', text: 'Огромное ведро попкорна в кино 🍿', target: 'wants', desc: 'Развлечения — это мимолетные хотелки.', points: 10 },
  { id: 'salary', text: '💰 ЗАРПЛАТА! 💰', target: 'double', desc: 'Зарплату нужно распределить и в Обязательное, и в Копилку!', points: 20 },
  { id: 'cashback', text: '✨ КЭШБЭК В БАНКЕ ✨', target: 'savings', desc: 'Кэшбэк — это возврат части денег за покупки. Отложим его в копилку!', points: 15 },
  { id: 'emergency_tooth', text: '🚨 СЛОМАЛСЯ ЗУБ! 🚨', target: 'emergency', desc: 'Экстренная ситуация! Нужны деньги из копилки!', points: 30 },
  { id: 'emergency_flood', text: '🌊 ПОТОП У СОСЕДЕЙ! 🌊', target: 'emergency', desc: 'Треснула труба, нужно срочно оплатить ремонт соседям!', points: 40 },
  { id: 'emergency_phone', text: '📱 РАЗБИЛСЯ ТЕЛЕФОН! 📱', target: 'emergency', desc: 'Экран вдребезги! Нужен срочный ремонт в сервисе!', points: 30 },
];

export default function GameSortExpenses({ navigation }) {
  const bank = useBank(); // Подключили твой банк!
  const petCtx = usePet();
  const [gameState, setGameState] = useState('instruction');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [savings, setSavings] = useState(0);
  const [salaryStep, setSalaryStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const answerLockedRef = useRef(false);
  const rewardGrantedRef = useRef(false);
  const fallAnimation = useRef(new Animated.Value(-100)).current;
  const remainingTimeRef = useRef(6000);
  const currentEvent = GAME_EVENTS[currentEventIndex];
  const reward = Math.floor(score / 2);

  // Новый таймер только для нового события или второго этапа зарплаты.
  useEffect(() => {
    if (salaryStep === 1) fallAnimation.setValue(-100);
    remainingTimeRef.current = salaryStep === 2 ? 3000 : 6000;
    answerLockedRef.current = false;
  }, [currentEventIndex, salaryStep, gameState, fallAnimation]);

  useEffect(() => {
    if (gameState !== 'playing' || !isFocused || feedback) return;
    let active = true;
    const startedAt = Date.now();
    const animation = Animated.timing(fallAnimation, {
      toValue: height * 0.40,
      duration: remainingTimeRef.current,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (!active || !finished || answerLockedRef.current) return;
      answerLockedRef.current = true;
      setSavings(prev => Math.max(0, prev - 1));
      setFeedback({
        title: 'Время вышло! ⏱️',
        message: 'Монстр Хотюн украл это событие. Копилка потеряла 1 монету!',
      });
    });
    return () => {
      active = false;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - (Date.now() - startedAt));
      animation.stop();
    };
  }, [currentEventIndex, salaryStep, gameState, isFocused, feedback, fallAnimation]);

  useEffect(() => {
    if (gameState !== 'win' || !isLoaded || rewardGrantedRef.current) return;
    rewardGrantedRef.current = true;
    if (reward > 0) addCoins(reward);
  }, [gameState, isLoaded, reward, addCoins]);

  const nextEvent = () => {
    if (!feedback || !answerLockedRef.current) return;
    // Блокируем повторное нажатие кнопки «Дальше» в том же кадре.
    answerLockedRef.current = false;
    setFeedback(null);
    setSalaryStep(1);
    if (currentEventIndex < GAME_EVENTS.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
    } else {
      setGameState('win');
    }
  };

  const handleBucketPress = (bucketType) => {
    if (gameState !== 'playing' || !isLoaded || !isFocused || answerLockedRef.current) return;
    answerLockedRef.current = true;
    fallAnimation.stopAnimation();

    if (currentEvent.target === 'double') {
      if (salaryStep === 1 && bucketType === 'essential') {
        setSalaryStep(2);
      } else if (salaryStep === 2 && bucketType === 'savings') {
        setSavings(prev => prev + 4);
        setScore(prev => prev + currentEvent.points);
        setFeedback({ title: 'Отлично! 🎯', message: 'Зарплата успешно распределена!' });
      } else {
        setGameState('gameover');
      }
      return;
    }

    if (currentEvent.target === 'emergency') {
      if (bucketType === 'savings' && savings >= 2) {
        setSavings(prev => prev - 2);
        setScore(prev => prev + currentEvent.points);
        setFeedback({ title: 'Щит сработал! 🛡️', message: 'Непредвиденный расход оплачен: из копилки потрачено 2 монеты.' });
      } else {
        setGameState('gameover');
      }
      return;
    }

    if (bucketType === currentEvent.target) {
      setScore(prev => prev + currentEvent.points);
      if (bucketType === 'savings') setSavings(prev => prev + 1);
      setFeedback({ title: 'Правильно! ✅', message: currentEvent.desc });
    } else {
      if (bucketType === 'wants') setSavings(prev => Math.max(0, prev - 1));
      setFeedback({ title: 'Не туда! ❌', message: currentEvent.desc });
    }
  };

  const handleStartGame = () => {
    if (!isLoaded) return;
    fallAnimation.stopAnimation();
    answerLockedRef.current = false;
    rewardGrantedRef.current = false;
    setFeedback(null);
    setCurrentEventIndex(0);
    setScore(0);
    setSavings(0);
    setSalaryStep(1);
    setGameState('playing');
  };

  const handleWinFinish = () => {
    if (petCtx?.boostHappiness) petCtx.boostHappiness();
    // Начисляем заработанные монеты в банк
    if (score > 0 && bank && typeof bank.addCoins === 'function') {
      bank.addCoins(Math.floor(score / 2));
    }
    backToLivingRoom(navigation);
  };

  // --- РАЗМЕТКА ИНТЕРФЕЙСА (БЛОК RETURN) ---
  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🏆 Очки: {score}</Text>
        <Text style={styles.headerText}>🐷 Копилка: {savings} 🪙</Text>
        <Text style={styles.bankText}>💰 Счет: {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
        <TouchableOpacity style={styles.exitBtn} onPress={() => backToLivingRoom(navigation)}>
          <Text style={styles.exitBtnText}>✖ Выход</Text>
        </TouchableOpacity>
      </View>

      {/* ЭКРАН 1: ИНСТРУКЦИЯ */}
      {gameState === 'instruction' && (
        <View style={styles.centerOverlay}>
          <Text style={styles.title}>Собери бюджет 📊</Text>
          <Text style={styles.desc}>
            Сверху падают финансовые события. Твоя задача — успеть распределить их по правильным ведрам до того, как они упадут!{'\n\n'}
            🚨 Экстренные ситуации требуют денег из Копилки (нужно минимум 2 🪙)!{'\n'}
            💰 Зарплату нужно отправить сначала в Обязательное, а потом в Копилку!
          </Text>
          <TouchableOpacity style={styles.btn} disabled={!isLoaded} onPress={handleStartGame}>
            <Text style={styles.btnText}>Начать игру 🚀</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ЭКРАН 2: ИГРОВОЙ ПРОЦЕСС */}
      {gameState === 'playing' && currentEvent && (
        <View style={styles.playArea}>
          {/* Падающее облако с событием */}
          <Animated.View style={[styles.fallingCard, { top: fallAnimation }]}>
            <Text style={styles.fallingText}>{currentEvent.text}</Text>
            {currentEvent.target === 'double' && salaryStep === 2 && (
              <Text style={styles.subStepText}>👉 Теперь нажми Копилку!</Text>
            )}
          </Animated.View>

          {/* Зона Ведер (Кнопок) внизу */}
          <View style={styles.bucketsContainer}>
            <TouchableOpacity style={[styles.bucket, { backgroundColor: '#2ecc71' }]} onPress={() => handleBucketPress('essential')}>
              <Text style={styles.bucketEmoji}>🥦🏠</Text>
              <Text style={styles.bucketText}>Обязательное</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.bucket, { backgroundColor: '#f1c40f' }]} onPress={() => handleBucketPress('savings')}>
              <Text style={styles.bucketEmoji}>🐷🪙</Text>
              <Text style={styles.bucketText}>В копилку</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.bucket, { backgroundColor: '#e74c3c' }]} onPress={() => handleBucketPress('wants')}>
              <Text style={styles.bucketEmoji}>🧸🍿</Text>
              <Text style={styles.bucketText}>Хотелки</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* ЭКРАН 3: ПОБЕДА */}
      {gameState === 'win' && (
        <View style={styles.centerOverlay}>
          <Text style={styles.title}>Отличная работа! 🎉</Text>
          <Text style={styles.desc}>Ты успешно распределила весь бюджет и защитила сбережения от Монстра Хотюна!</Text>
          <Text style={styles.winScore}>Набрано очков: {score}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={handleWinFinish}
          >
            <Text style={styles.btnText}>Завершить ✅</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ЭКРАН 4: ПРОИГРЫШ (ИСПРАВЛЕНО: ТЕПЕРЬ ОН ТУТ ОДИН!) */}
      {gameState === 'gameover' && (
        <View style={styles.centerOverlay}>
          <Text style={[styles.title, { color: '#e74c3c' }]}>Игра окончена ❌</Text>
          <Text style={styles.desc}>Бюджет разрушен! Ты совершила ошибку в распределении или у тебя не хватило денег в копилке на экстренный случай.</Text>
          
          {/* Кнопка Попробовать снова */}
          <TouchableOpacity style={styles.btn} disabled={!isLoaded} onPress={handleStartGame}>
            <Text style={styles.btnText}>Попробовать снова 🔄</Text>
          </TouchableOpacity>
          
          {/* Кнопка Выйти */}
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#7f8c8d', marginTop: 12 }]} 
            onPress={() => backToLivingRoom(navigation)}
          >
            <Text style={styles.btnText}>В гостиную</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={Boolean(feedback) && isFocused} transparent animationType="fade" onRequestClose={nextEvent}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{feedback?.title}</Text>
            <Text style={styles.desc}>{feedback?.message}</Text>
            <TouchableOpacity style={styles.btn} onPress={nextEvent}>
              <Text style={styles.btnText}>Дальше</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexShrink: 1, gap: 6 },
  bankButton: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1c40f',
    flexShrink: 1,
  },
  rewardText: { color: '#f1c40f', fontSize: 18, textAlign: 'center', marginBottom: 24 },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#162447',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D47A1', // Глубокий космический фон
    paddingTop: 50,
  },
  
  // ШАПКА ИГРЫ
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#0D47A1',
    borderBottomWidth: 3,
    borderColor: '#1E88E5', // Яркий неоновый бортик
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  bankText: {
    color: '#f1c40f', // Золотой счет банка
    fontSize: 17,
    fontWeight: 'bold',
  },
  exitBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  exitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // ЭКРАНЫ: ИНСТРУКЦИЯ, ПОБЕДА, ПРОИГРЫШ
  centerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#0D47A1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 180, 216, 0.4)', // Легкое неоновое свечение заголовка
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  desc: {
    fontSize: 17,
    color: '#bfa3ff', // Приятный сиреневый текст для чтения
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  winScore: {
    fontSize: 24,
    color: '#2ecc71', // Зеленый для победных очков
    fontWeight: 'bold',
    marginBottom: 35,
  },
  btn: {
    backgroundColor: '#1E88E5', // Яркая бирюзовая кнопка
    paddingVertical: 15,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Делает текст на кнопках геймерским
    letterSpacing: 1,
  },

  // ИГРОВАЯ ЗОНА
  playArea: {
    flex: 1,
    position: 'relative',
  },
  
  // ПАДАЮЩАЯ КАРТОЧКА
  fallingCard: {
    position: 'absolute',
    left: width * 0.05,
    width: width * 0.9,
    backgroundColor: '#0D47A1', // Темная подложка карточки, чтобы текст выделялся
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E88E5', // Неоновый контур
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  fallingText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff', // Белый читаемый текст события
    textAlign: 'center',
    lineHeight: 22,
  },
  subStepText: {
    fontSize: 17,
    color: '#e74c3c', // Подсказка для Зарплаты вспыхивает красным
    fontWeight: 'bold',
    marginTop: 10,
    textTransform: 'uppercase',
  },

  // ВЁДРА (КНОПКИ) ВНИЗУ
  bucketsContainer: {
    position: 'absolute',
    bottom: 40, // Идеальный отступ снизу экрана смартфона
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
  },
  bucket: {
    width: (width - 50) / 3, // Математически ровный расчет ширины под любые экраны
    height: 110,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  bucketEmoji: {
    fontSize: 30, // Крупные сочные эмодзи на ведрах
    marginBottom: 6,
  },
  bucketText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 15,
  },
});
