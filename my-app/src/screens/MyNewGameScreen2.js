import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext'; 

const { width, height } = Dimensions.get('window');
const GAME_EVENTS = [
  { id: 'e1', text: 'Покупка продуктов на неделю 🥦', target: 'essential', desc: 'Еда — это обязательный расход!', points: 10 },
  { id: 'e2', text: 'Подарок на День Рождения 🎁', target: 'savings', desc: 'Подарки лучше отложить в копилку!', points: 10 },
  { id: 'e3', text: 'Новый яркий поп-ит у кассы 🧸', target: 'wants', desc: 'Игрушки не из списка — это хотелки!', points: 10 },
  { id: 'e4', text: 'Оплата аренды квартиры и ЖКХ 🏠', target: 'essential', desc: 'Жилье — самый важный обязательный расход!', points: 10 },
  { id: 'e5', text: 'Карманные деньги от дедушки 🪙', target: 'savings', desc: 'Отправляем в сбережения!', points: 10 },
  { id: 'e6', text: 'Огромное ведро попкорна в кино 🍿', target: 'wants', desc: 'Развлечения — это мимолетные хотелки.', points: 10 },
  { id: 'salary', text: '💰 ЗАРПЛАТА! 💰', target: 'double', desc: 'Зарплату нужно распределить и в Обязательное, и в Копилку!', points: 20 },
  { id: 'cashback', text: '✨ КЭШБЭК В БАНКЕ ✨', target: 'savings', desc: 'Ура! Проценты за то, что ты хранила деньги на карте.', points: 15 },
  { id: 'emergency_tooth', text: '🚨 СЛОМАЛСЯ ЗУБ! 🚨', target: 'emergency', desc: 'Экстренная ситуация! Нужны деньги из копилки!', points: 30 },
  { id: 'emergency_flood', text: '🌊 ПОТОП У СОСЕДЕЙ! 🌊', target: 'emergency', desc: 'Треснула труба, нужно срочно оплатить ремонт соседям!', points: 40 },
  { id: 'emergency_phone', text: '📱 РАЗБИЛСЯ ТЕЛЕФОН! 📱', target: 'emergency', desc: 'Экран вдребезги! Нужен срочный ремонт в сервисе!', points: 30 },
];

export default function GameSortExpenses({ navigation }) {
  const bank = useBank(); // Подключили твой банк!
  const [gameState, setGameState] = useState('instruction');
  const [currentEventIndex, setCurrentTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [savings, setSavings] = useState(0);
  const [salaryStep, setSalaryStep] = useState(1);

  const fallAnimation = useRef(new Animated.Value(-100)).current;
  const currentEvent = GAME_EVENTS[currentEventIndex];

  const startFalling = () => {
    fallAnimation.setValue(-100);
    Animated.timing(fallAnimation, {
      toValue: height * 0.40, // Падает до уровня ведер
      duration: 6000, // 6 секунд на подумать ребенку
      useNativeDriver: false, // false, так как анимируем свойство top
    }).start(({ finished }) => {
      if (finished) handleTimeout();
    });
  };

  useEffect(() => {
    if (gameState === 'playing') startFalling();
    return () => fallAnimation.stopAnimation();
  }, [currentEventIndex, gameState]);

  const handleTimeout = () => {
    fallAnimation.stopAnimation();
    setSavings(prev => Math.max(0, prev - 1));
    Alert.alert('Время вышло! ⏱️', 'Монстр Хотюн украл это событие. Копилка пустеет!', [
      { text: 'Дальше', onPress: nextEvent }
    ]);
  };

  const nextEvent = () => {
    setSalaryStep(1);
    if (currentEventIndex < GAME_EVENTS.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      fallAnimation.stopAnimation();
      setGameState('win');
    }
  };

  const handleBucketPress = (bucketType) => {
    if (gameState !== 'playing') return;
    fallAnimation.stopAnimation();

    // Логика Зарплаты (нужно нажать сначала Обязательное, потом Копилка)
    if (currentEvent.target === 'double') {
      if (salaryStep === 1 && bucketType === 'essential') {
        setSalaryStep(2);
        setScore(prev => prev + 5);
        // Запускаем допадение для второго шага
        Animated.timing(fallAnimation, { toValue: height * 0.40, duration: 3000, useNativeDriver: false }).start();
        return;
      } else if (salaryStep === 2 && bucketType === 'savings') {
        setSavings(prev => prev + 4);
        setScore(prev => prev + 10);
        Alert.alert('Отлично! 🎯', 'Зарплата успешно распределена!', [{ text: 'Ура', onPress: nextEvent }]);
        return;
      } else {
        setGameState('gameover');
        return;
      }
    }

    // Логика Экстренных ситуаций (клиstandard только на Копилку и если есть заначка)
    if (currentEvent.target === 'emergency') {
      if (bucketType === 'savings') {
        if (savings >= 2) {
          setSavings(prev => prev - 2);
          setScore(prev => prev + 15);
          Alert.alert('Щит сработал! 🛡️', 'Ты оплатила лечение из копилки!', [{ text: 'Фух!', onPress: nextEvent }]);
        } else {
          Alert.alert('Банкрот! 😭', 'В копилке нет денег на экстренную ситуацию!');
          setGameState('gameover');
        }
      } else {
        setGameState('gameover');
      }
      return;
    }

    // Стандартная логика обычных ведер
    if (bucketType === currentEvent.target) {
      setScore(prev => prev + 10);
      if (bucketType === 'savings') setSavings(prev => prev + 1);
      Alert.alert('Правильно! ✅', currentEvent.desc, [{ text: 'Идем дальше', onPress: nextEvent }]);
    } else {
      if (bucketType === 'wants') {
        Alert.alert('Ой! ❌', 'Ты потратила деньги на Хотелки вместо важного!', [{ text: 'Поняла', onPress: nextEvent }]);
        setSavings(prev => Math.max(0, prev - 1));
      } else {
        Alert.alert('Не туда! ❌', currentEvent.desc, [{ text: 'Понятно', onPress: nextEvent }]);
      }
    }
  };

  const handleStartGame = () => {
    setGameState('playing');
    setCurrentTaskIndex(0);
    setScore(0);
    setSavings(0);
    setSalaryStep(1);
  };

  const handleWinFinish = async () => {
    try {
      // НАЧИСЛЯЕМ ЗАРАБОТАННЫЕ МОНЕТЫ В БАНК ТЕРМИНАТОРА! 💰
      if (score > 0 && bank && typeof bank.addCoins === 'function') {
        bank.addCoins(Math.floor(score / 2)); // Даем половину от набранных очков в виде чистых монет
      }

      const saved = await AsyncStorage.getItem('@block_one_progress_v1');
      const current = saved ? parseInt(saved, 10) : 0;
      if (8 > current) {
        await AsyncStorage.setItem('@block_one_progress_v1', '8');
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса игры 2:', e);
    }
    navigation.navigate('BlockOneScreen');
  };

  // --- РАЗМЕТКА ИНТЕРФЕЙСА (БЛОК RETURN) ---
  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🏆 Очки: {score}</Text>
        <Text style={styles.headerText}>🐷 Копилка: {savings} 🪙</Text>
        <Text style={styles.bankText}>💰 Счет: {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
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
          <TouchableOpacity style={styles.btn} onPress={handleStartGame}>
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
          <TouchableOpacity style={styles.btn} onPress={handleWinFinish}>
            <Text style={styles.btnText}>Завершить шаг ✅</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ЭКРАН 4: ПРОИГРЫШ (ИСПРАВЛЕНО: ТЕПЕРЬ ОН ТУТ ОДИН!) */}
      {gameState === 'gameover' && (
        <View style={styles.centerOverlay}>
          <Text style={[styles.title, { color: '#e74c3c' }]}>Игра окончена ❌</Text>
          <Text style={styles.desc}>Бюджет разрушен! Ты совершила ошибку в распределении или у тебя не хватило денег в копилке на экстренный случай.</Text>
          
          {/* Кнопка Попробовать снова */}
          <TouchableOpacity style={styles.btn} onPress={handleStartGame}>
            <Text style={styles.btnText}>Попробовать снова 🔄</Text>
          </TouchableOpacity>
          
          {/* Кнопка Выйти */}
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#7f8c8d', marginTop: 12 }]} 
            onPress={() => navigation.navigate('BlockOneScreen')}
          >
            <Text style={styles.btnText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Глубокий космический фон
    paddingTop: 50,
  },
  
  // ШАПКА ИГРЫ
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#162447',
    borderBottomWidth: 3,
    borderColor: '#00b4d8', // Яркий неоновый бортик
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bankText: {
    color: '#f1c40f', // Золотой счет банка
    fontSize: 14,
    fontWeight: 'bold',
  },

  // ЭКРАНЫ: ИНСТРУКЦИЯ, ПОБЕДА, ПРОИГРЫШ
  centerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#1a1a2e',
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
    fontSize: 15,
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
    backgroundColor: '#00b4d8', // Яркая бирюзовая кнопка
    paddingVertical: 15,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#00b4d8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
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
    backgroundColor: '#1f1f3a', // Темная подложка карточки, чтобы текст выделялся
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00b4d8', // Неоновый контур
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  fallingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Белый читаемый текст события
    textAlign: 'center',
    lineHeight: 22,
  },
  subStepText: {
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 15,
  },
});
