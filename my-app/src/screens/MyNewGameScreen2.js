import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

const GAME_EVENTS = [
  // === ОБЫЧНЫЕ СОБЫТИЯ (Для БД добавлены очки и влияние на баланс копилки) ===
  { 
    id: 'e1', 
    text: 'Покупка продуктов на неделю 🥦', 
    target: 'essential', 
    desc: 'Еда — это обязательный расход!',
    points: 10,
    savingsEffect: 0,
    db_category: 'essential_expenses'
  },
  { 
    id: 'e2', 
    text: 'Подарок на День Рождения 🎁', 
    target: 'savings', 
    desc: 'Подарки и карманные деньги лучше отложить в копилку!',
    points: 10,
    savingsEffect: 1, // Прибавляет 1 монетку в копилку
    db_category: 'income_savings'
  },
  { 
    id: 'e3', 
    text: 'Новый яркий поп-ит у кассы 🧸', 
    target: 'wants', 
    desc: 'Игрушки не из списка — это хотелки!',
    points: 10,
    savingsEffect: -1, // Ошибка в хотелках урежет копилку
    db_category: 'impulsive_wants'
  },
  { 
    id: 'e4', 
    text: 'Оплата аренды квартиры и ЖКХ 🏠', 
    target: 'essential', 
    desc: 'Жилье — самый важный обязательный расход!',
    points: 10,
    savingsEffect: 0,
    db_category: 'essential_expenses'
  },
  { 
    id: 'e5', 
    text: 'Карманные деньги от дедушки 🪙', 
    target: 'savings', 
    desc: 'Отправляем в сбережения!',
    points: 10,
    savingsEffect: 1,
    db_category: 'income_savings'
  },
  { 
    id: 'e6', 
    text: 'Огромное ведро попкорна в кино 🍿', 
    target: 'wants', 
    desc: 'Развлечения — это мимолетные хотелки.',
    points: 10,
    savingsEffect: -1,
    db_category: 'impulsive_wants'
  },
  
  // === СУПЕР-СОБЫТИЯ (Требуют особой игровой логики) ===
  { 
    id: 'salary', 
    text: '💰 ЗАРПЛАТА! 💰', 
    target: 'double', 
    desc: 'Зарплату нужно распределить и в Обязательное, и в Копилку!',
    points: 20,
    savingsEffect: 4, // Сильно пополняет сейф
    db_category: 'major_income'
  },
  { 
    id: 'cashback', 
    text: '✨ КЭШБЭК И ПРОЦЕНТЫ В БАНКЕ ✨', 
    target: 'savings', // Банк сам начислил деньги за умные траты
    desc: 'Ура! Банк вернул процент за то, что ты хранила деньги на карте. Прямиком в Копилку!',
    points: 15,
    savingsEffect: 2, 
    db_category: 'passive_income'
  },
  
  // === БОССЫ КРАХА БЮДЖЕТА (Экстренные ситуации, проверяющие копилку) ===
  { 
    id: 'emergency_tooth', 
    text: '🚨 СЛОМАЛСЯ ЗУБ! Срочно к врачу! 🚨', 
    target: 'emergency', 
    desc: 'Экстренная ситуация! Нужны деньги из копилки!',
    points: 30,
    savingsCost: 2, // Сколько монет спишется из копилки, если она не пуста
    db_category: 'emergency_risk'
  },
  { 
    id: 'emergency_flood', 
    text: '🌊 ПОТОП! Затопило соседей снизу! 🌊', 
    target: 'emergency', 
    desc: 'Ой-ой! Треснула труба в ванной, нужно срочно оплатить ремонт соседям!',
    points: 40,
    savingsCost: 3, // Этот босс сильнее, требует аж 3 монеты!
    db_category: 'emergency_risk'
  },
  { 
    id: 'emergency_phone', 
    text: '📱 СЛУЧАЙНО РАЗБИЛСЯ ТЕЛЕФОН! 📱', 
    target: 'emergency', 
    desc: 'Экран разбился вдребезги! Без связи нельзя, нужен срочный ремонт в сервисе!',
    points: 30,
    savingsCost: 2,
    db_category: 'emergency_risk'
  }
];


export default function GameSortExpenses({ route, navigation }) {
  const { onSuccess } = route.params || {};

  // Игровые стейты
  const [gameState, setGameState] = useState('instruction'); // 'instruction', 'playing', 'win', 'gameover'
  const [currentEventIndex, setCurrentTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [savings, setSavings] = useState(0); // Баланс нашей копилки
  
  // Стейт для двухэтапного распределения зарплаты
  const [salaryStep, setSalaryStep] = useState(1); // 1 - нужно в обязательное, 2 - в копилку

  // Анимация падения карточки
  const fallAnimation = React.useRef(new Animated.Value(-100)).current;

  const currentEvent = GAME_EVENTS[currentEventIndex];

  // Запуск падения карточки
  const startFalling = () => {
    fallAnimation.setValue(-100);
    Animated.timing(fallAnimation, {
      toValue: height * 0.45, // Падает до уровня корзин
      duration: 5000, // 5 секунд на принятие решения (для детей отлично)
      useNativeDriver: false,
    }).start(({ finished }) => {
      // Если анимация завершилась сама (игрок не успел нажать)
      if (finished) {
        handleTimeout();
      }
    });
  };

  // Игровой цикл
  useEffect(() => {
    if (gameState === 'playing') {
      startFalling();
    }
  }, [currentEventIndex, gameState]);

  // Если время вышло (карта упала)
  const handleTimeout = () => {
    fallAnimation.stopAnimation();
    Alert.alert('Время вышло! ⏱️', 'Монстр Хотюн украл это событие. Копилка пустеет!', [
      { text: 'Дальше', onPress: nextEvent }
    ]);
    setSavings(prev => Math.max(0, prev - 1));
  };

  // Переключение на следующее событие
  const nextEvent = () => {
    setSalaryStep(1); // Сброс шага зарплаты
    if (currentEventIndex < GAME_EVENTS.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      // Если прошли весь массив и не вылетели — это победа!
      fallAnimation.stopAnimation();
      setGameState('win');
    }
  };

  // Логика нажатия на корзины
  const handleBucketPress = (bucketType) => {
    if (gameState !== 'playing') return;

    fallAnimation.stopAnimation();

    // 1. ЛОГИКА СУПЕР-СОБЫТИЯ: ЗАРПЛАТА (double)
    if (currentEvent.target === 'double') {
      if (salaryStep === 1 && bucketType === 'essential') {
        setSalaryStep(2);
        setScore(prev => prev + 5);
        // Запускаем падение снова для второго шага
        Animated.timing(fallAnimation, { toValue: height * 0.45, duration: 3000, useNativeDriver: false }).start();
        return;
      } else if (salaryStep === 2 && bucketType === 'savings') {
        setSavings(prev => prev + 4); // Зарплата сильно пополняет копилку!
        setScore(prev => prev + 5);
        Alert.alert('Отлично! 🎯', 'Зарплата успешно распределена: и на счета, и в сбережения!', [{ text: 'Ура', onPress: nextEvent }]);
        return;
      } else {
        // Ошибка при распределении зарплаты
        setGameState('gameover');
        return;
      }
    }

    // 2. ЛОГИКА БОСС-СОБЫТИЯ: СЛОМАЛСЯ ЗУБ (emergency)
    if (currentEvent.target === 'emergency') {
      if (bucketType === 'savings') {
        if (savings >= 2) {
          setSavings(prev => prev - 2); // Списываем деньги на лечение
          setScore(prev => prev + 15);
          Alert.alert('Щит сработал! 🛡️', 'У тебя были сбережения в Копилке, и ты легко оплатила лечение зуба у врача!', [{ text: 'Фух, повезло!', onPress: nextEvent }]);
        } else {
          // Тот самый проигрыш, о котором ты просила!
          setGameState('gameover');
        }
      } else {
        // Если кинули зуб в хотелки или обязательное — штрафной проигрыш
        setGameState('gameover');
      }
      return;
    }

    // 3. ЛОГИКА ОБЫЧНЫХ СОБЫТИЙ
    if (bucketType === currentEvent.target) {
      setScore(prev => prev + 10);
      if (bucketType === 'savings') setSavings(prev => prev + 1);
      Alert.alert('Правильно! ✅', currentEvent.desc, [{ text: 'Идем дальше', onPress: nextEvent }]);
    } else {
      // Игрок ошибся корзиной
      if (bucketType === 'wants') {
        Alert.alert('Ой! ❌', 'Ты потратила деньги на Хотелки вместо важного! Копилка худеет.', [{ text: 'Поняла', onPress: nextEvent }]);
        setSavings(prev => Math.max(0, prev - 1));
      } else {
        Alert.alert('Не туда! ❌', currentEvent.desc, [{ text: 'Попробовать еще', onPress: () => startFalling() }]);
      }
    }
  };

  const handleStartGame = () => {
    setGameState('playing');
    setCurrentTaskIndex(0);
    setScore(0);
    setSavings(0);
  };

  const handleWinFinish = () => {
    if (onSuccess) onSuccess();
    navigation.goBack();
  };

  // ==============================================================
  // ЭКРАН ИНСТРУКЦИИ (ТО, ЧТО ТЫ ПРОСИЛА СКАЗАТЬ ВНАЧАЛЕ ТЕКСТОМ)
  // ==============================================================
  if (gameState === 'instruction') {
    return (
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>ЗАДАНИЕ: ФИНАНСОВЫЙ ЩИТ 🛡️</Text>
          <Text style={styles.instructionText}>
            Внимание, агент! Сверху будут падать разные жизненные события. Твоя задача — успеть распределить их по 3 корзинам снизу.{'\n\n'}
            ⚠️ <Text style={{fontWeight: 'bold', color: '#FFD700'}}>ВАЖНОЕ ПРАВИЛО:</Text>{'\n'}
            Когда падает <Text style={{fontWeight: 'bold'}}>ЗАРПЛАТА</Text> 💰, её нужно отправить сначала в корзину <Text style={{fontWeight: 'bold', color: '#81C784'}}>ОБЯЗАТЕЛЬНОЕ</Text>, а затем сразу в <Text style={{fontWeight: 'bold', color: '#FFB74D'}}>КОПИЛКУ</Text>!{'\n\n'}
            Береги Копилку! Если случится беда (например, <Text style={{fontWeight: 'bold', color: '#E57373'}}>сломается зуб</Text> 🚨), а в копилке не окажется монет, ты проиграешь!
          </Text>
          <TouchableOpacity style={styles.mainBtn} onPress={handleStartGame}>
            <Text style={styles.btnText}>Включить щит! 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==============================================================
  // ЭКРАН ИГРЫ (ПРОЦЕСС ПАДЕНИЯ)
  // ==============================================================
  if (gameState === 'playing') {
    return (
      <View style={styles.container}>
        {/* Табло счета сверху */}
        <View style={styles.topBar}>
          <Text style={styles.scoreText}>🏆 Очки: {score}</Text>
          <View style={styles.savingsBox}>
            <Text style={styles.savingsText}>🐷 Копилка: {savings} 🪙</Text>
          </View>
        </View>

        {/* Падающая карточка */}
        <Animated.View style={[styles.fallingCard, { top: fallAnimation }]}>
          <Text style={styles.eventText}>{currentEvent.text}</Text>
          {currentEvent.target === 'double' && (
            <Text style={styles.salarySubHint}>
              Шаг {salaryStep} из 2: {salaryStep === 1 ? 'Жми ОБЯЗАТЕЛЬНОЕ!' : 'Жми КОПИЛКУ!'}
            </Text>
          )}
        </Animated.View>

        {/* 3 КОРЗИНЫ ВНИЗУ ЭКРАНА */}
        <View style={styles.bucketsContainer}>
          <TouchableOpacity style={[styles.bucket, { backgroundColor: '#4CAF50' }]} onPress={() => handleBucketPress('essential')}>
            <Text style={styles.bucketEmoji}>🥦</Text>
            <Text style={styles.bucketText}>Обязательное</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bucket, { backgroundColor: '#FF9800' }]} onPress={() => handleBucketPress('savings')}>
            <Text style={styles.bucketEmoji}>🏦</Text>
            <Text style={styles.bucketText}>Копилка</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bucket, { backgroundColor: '#E91E63' }]} onPress={() => handleBucketPress('wants')}>
            <Text style={styles.bucketEmoji}>🧸</Text>
            <Text style={styles.bucketText}>Хотелки</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==============================================================
  // ЭКРАНЫ ФИНИША (ПОБЕДА / ПРОИГРЫШ)
  // ==============================================================
  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        {gameState === 'win' ? (
          <>
            <Text style={styles.title}>ПОБЕДА! 🏆🎉</Text>
            <Text style={styles.resultText}>Ты настоящий финансовый супергерой! Твой щит отразил все угрозы, а питомец гордится твоей копилкой! Награда х2 монет получена.</Text>
            
            {/* ВОТ ЭТУ КНОПКУ МЫ ВЕРНУЛИ НА МЕСТО: */}
            <TouchableOpacity style={styles.mainBtn} onPress={handleWinFinish}>
              <Text style={styles.btnText}>Забрать кубок 🏁</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: '#D32F2F' }]}>ИГРА ОКОНЧЕНА 🛑</Text>
            <Text style={styles.resultText}>
              Ой! Финансовый щит пробит!{'\n\n'}
              У тебя сломался зуб, а в копилке пусто, потому что все деньги ушли на мимолётные «Хотелки». Пришлось брать дорогой кредит. Давай попробуем ещё раз распределить средства умнее!
            </Text>
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#F44336' }]} onPress={handleStartGame}>
              <Text style={styles.btnText}>Попробовать снова 🔄</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  // Главный контейнер игры (глубокий сине-зеленый цвет для концентрации внимания)
  container: { 
    flex: 1, 
    backgroundColor: '#264653', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 40 
  },
  
  // Верхняя панель счета и кошелька
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: width * 0.9, 
    position: 'absolute', 
    top: 50 
  },
  scoreText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  savingsBox: { 
    backgroundColor: '#FFF9C4', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 15, 
    borderWidth: 2, 
    borderColor: '#FBC02D' 
  },
  savingsText: { 
    color: '#5D4037', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  
  // Падающая плашка с событием (в стиле тетриса)
  fallingCard: { 
    position: 'absolute', 
    left: width * 0.05, 
    width: width * 0.9, 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 22, 
    borderWidth: 3, 
    borderColor: '#FFE082', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 6 
  },
  eventText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center',
    lineHeight: 22
  },
  salarySubHint: { 
    fontSize: 13, 
    color: '#E65100', 
    fontWeight: 'bold', 
    marginTop: 10,
    backgroundColor: '#FFE082',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden'
  },

  // 3 корзины в самом низу экрана
  bucketsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: width * 0.96, 
    position: 'absolute', 
    bottom: 40 
  },
  bucket: { 
    width: '31%', 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.4)', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3, 
    elevation: 4 
  },
  bucketEmoji: { 
    fontSize: 32, 
    marginBottom: 6 
  },
  bucketText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },

  // Игровые окна (инструкция, победа, проигрыш)
  modalContent: { 
    backgroundColor: '#FFF', 
    width: width * 0.9, 
    padding: 24, 
    borderRadius: 28, 
    borderWidth: 3, 
    borderColor: '#FFE082', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#E65100', 
    marginBottom: 15, 
    textAlign: 'center',
    letterSpacing: 0.5
  },
  instructionText: { 
    fontSize: 14, 
    color: '#333', 
    lineHeight: 22, 
    marginBottom: 25, 
    textAlign: 'justify' 
  },
  resultText: { 
    fontSize: 15, 
    color: '#444', 
    lineHeight: 24, 
    textAlign: 'center', 
    marginBottom: 25 
  },
  
  // Главная большая кнопка в меню финиша/старта
  mainBtn: { 
    backgroundColor: '#2A9D8F', 
    paddingVertical: 16, 
    paddingHorizontal: 30, 
    borderRadius: 16, 
    width: '100%', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  btnText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
