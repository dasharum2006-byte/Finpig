import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_FIVE_STEPS = [
  {
    id: 1,
    subTitle: 'Что такое инвестиции?',
    text: 'Инвестиции — это когда ты отдаешь свои деньги в надежное место, чтобы они приносили еще больше денег. Например, ты даешь банку свои монеты, а он через год возвращает их с процентами. Твои деньги "работают", пока ты спишь.',
    question: 'Что главное отличает инвестиции от обычных трат?',
    options: [
      { text: 'Инвестиции приносят еще больше денег со временем', isCorrect: true },
      { text: 'Инвестиции — это просто покупка дорогих вещей', isCorrect: false },
      { text: 'Инвестиции нельзя вернуть никогда', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Акции и облигации',
    text: 'Акция — это маленькая доля в большой компании. Купив акцию, ты становишься совладельцем. Облигация — это когда ты даешь в долг компании или государству, а они возвращают деньги с процентами. Акции рискованнее, но могут принести больше.',
    question: 'Что ты получаешь, когда покупаешь акцию компании?',
    options: [
      { text: 'Бумажку с картинкой для коллекции', isCorrect: false },
      { text: 'Маленькую долю в этой компании и право на часть её прибыли', isCorrect: true },
      { text: 'Бесплатные товары из этого магазина', isCorrect: false }
    ]
  },
  {
    id: 3,
    subTitle: 'Пассивный доход',
    text: 'Пассивный доход — это деньги, которые приходят к тебе, даже когда ты ничего не делаешь. Например, ты сдал свою комнату в аренду, или получаешь проценты по вкладу в банке, или написал книгу, которая продается. Активный доход — это когда ты работаешь и получаешь зарплату.',
    question: 'Какой из примеров — это пассивный доход?',
    options: [
      { text: 'Зарплата за работу в магазине', isCorrect: false },
      { text: 'Проценты по банковскому вкладу, которые капают каждый месяц', isCorrect: true },
      { text: 'Деньги, которые дали родители на карманные расходы', isCorrect: false }
    ]
  },
  {
    id: 4,
    type: 'sort',
    subTitle: 'Задание 4: Стратегия инвестора ',
    text: 'У тебя есть 1000 монет. Расположи варианты вложений от самого надежного (сверху) до самого рискованного (снизу).',
    question: 'Расположи от самого надежного к самому рискованному (сверху вниз):',
    initialItems: [
      { id: 'inv3', text: 'Купить акции неизвестной компании-стартапа' },
      { id: 'inv1', text: 'Положить в банк под гарантированный процент' },
      { id: 'inv4', text: 'Вложить все в одну криптовалюту' },
      { id: 'inv2', text: 'Купить облигации крупной компании' },
    ],
    correctOrder: ['inv1', 'inv2', 'inv3', 'inv4']
  },
  {
    id: 5,
    subTitle: 'Диверсификация ',
    text: 'Главное правило инвестора: "Не клади все в одну корзину" Это называется диверсификация. Если ты вложишь все деньги в одну компанию, и она разорится — ты потеряешь всё. Но если распределишь по разным местам (банк, акции, недвижимость) — даже если одно прогорит, другие спасут.',
    question: 'Что такое диверсификация?',
    options: [
      { text: 'Вложить все деньги в самый выгодный проект', isCorrect: false },
      { text: 'Распределить деньги по разным надежным местам, чтобы снизить риск', isCorrect: true },
      { text: 'Спрятать деньги в разных карманах', isCorrect: false }
    ]
  },
  {
    id: 6,
    subTitle: 'Финальный экзамен',
    text: 'Поздравляю! Ты прошел все 5 блоков и стал настоящим Финансовым Гуру! Ты знаешь, откуда берутся деньги, как составлять бюджет, защищаться от мошенников, зарабатывать и даже инвестировать. Помни: деньги — это инструмент, и только ты решаешь, как им пользоваться!',
    question: 'Что самое важное понял за весь курс?',
    options: [
      { text: 'Деньги нужно тратить как можно быстрее', isCorrect: false },
      { text: 'Деньги — это инструмент, и ими нужно управлять с умом: планировать, копить, защищать и приумножать', isCorrect: true },
      { text: 'Финансы — это скучно и неинтересно', isCorrect: false }
    ]
  }
];

const STORAGE_KEY = '@block_five_progress_v1';

export default function LevelFiveScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const bank = useBank();
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [savedSortOrders, setSavedSortOrders] = useState({});
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);
  const step = LEVEL_FIVE_STEPS[currentStepIndex];

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const ans = await AsyncStorage.getItem('@block_five_answers_v1');
        const sorts = await AsyncStorage.getItem('@block_five_sorts_v1');
        if (ans) setSavedAnswers(JSON.parse(ans));
        if (sorts) setSavedSortOrders(JSON.parse(sorts));
      } catch (e) { console.error('Ошибка загрузки:', e); }
    };
    loadSaved();
  }, []);

  useEffect(() => {
    if (!step) return;

    if (step.type === 'sort') {
      const savedOrder = savedSortOrders[currentStepIndex];
      if (savedOrder) {
        const restored = savedOrder.map(id => step.initialItems.find(i => i.id === id)).filter(Boolean);
        setSortItems(restored);
        setIsAnswered(true);
        setIsSortCorrect(true);
        setShowCorrectHint(false);
      } else {
        setSortItems(step.initialItems);
        setIsAnswered(false);
        setIsSortCorrect(false);
      }
    } else {
      const savedAns = savedAnswers[currentStepIndex];
      if (savedAns !== undefined) {
        setSelectedOption(step.options[savedAns]);
        setIsAnswered(true);
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }
  }, [currentStepIndex, step, savedAnswers, savedSortOrders]);

  const handleOptionPress = (option, optionIndex) => {
    if (isAnswered) return;
    if (savedAnswers[currentStepIndex] !== undefined) return;
    setSelectedOption(option);
    setIsAnswered(true);
    saveAnswer(currentStepIndex, optionIndex);
    if (option.isCorrect) {
      setScore(prev => prev + 1);
      bank.addCoins(20);
      Alert.alert("+20 монет уже на твоём счёте");
    }
  };

  const moveUp = (index) => {
    if (index === 0 || isAnswered) return;
    const newItems = [...sortItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setSortItems(newItems);
  };

  const moveDown = (index) => {
    if (index === sortItems.length - 1 || isAnswered) return;
    const newItems = [...sortItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setSortItems(newItems);
  };

  const checkSortOrder = () => {
    if (savedSortOrders[currentStepIndex] !== undefined) return;
    const userOrder = sortItems.map(item => item.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
    setIsAnswered(true);
    saveSortOrder(currentStepIndex, userOrder);
    if (isCorrect) {
      setIsSortCorrect(true);
      setScore(prev => prev + 1);
      bank.addCoins(20);
      Alert.alert("+20 монет за правильный порядок");
    } else {
      setIsSortCorrect(false);
      setTimeout(() => {
        const correctItems = step.correctOrder.map(correctId =>
          step.initialItems.find(item => item.id === correctId)
        );
        setSortItems(correctItems);
        setIsSortCorrect(true);
        setShowCorrectHint(true);
      }, 1200);
    }
  };

  const saveProgress = async (stepId) => {
    try {
      const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
      const currentSaved = savedStep ? parseInt(savedStep, 10) : 1;
      if (stepId > currentSaved) {
        await AsyncStorage.setItem(STORAGE_KEY, stepId.toString());
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса Блока 5:', e);
    }
  };

  const saveAnswer = async (qIndex, optionIndex) => {
    const updated = { ...savedAnswers, [qIndex]: optionIndex };
    setSavedAnswers(updated);
    await AsyncStorage.setItem('@block_five_answers_v1', JSON.stringify(updated));
  };

  const saveSortOrder = async (qIndex, order) => {
    const updated = { ...savedSortOrders, [qIndex]: order };
    setSavedSortOrders(updated);
    await AsyncStorage.setItem('@block_five_sorts_v1', JSON.stringify(updated));
  };

  const handleNextStep = async () => {
    const nextStep = currentStepIndex + 2;

    if (currentStepIndex < LEVEL_FIVE_STEPS.length - 1) {
      await saveProgress(nextStep);
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowCorrectHint(false);
    } else {
      await saveProgress(7);
      navigation.navigate('BlockFiveScreen', { highestCompletedStep: 6 });
    }
  };

  const handleExit = async () => {
    await saveProgress(currentStepIndex + 1);
    navigation.navigate('BlockFiveScreen', { highestCompletedStep: currentStepIndex + 1 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Блок 5: Шаг {currentStepIndex + 1} из {LEVEL_FIVE_STEPS.length}</Text>
        <Text style={styles.scoreText}>🪙 {Math.floor(bank.balance)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step.subTitle}</Text>
          {step.image && <Image source={step.image} style={styles.storyImage} resizeMode="contain" />}
          <Text style={styles.storyText}>{step.text}</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{step.question}</Text>

          {step.type === 'sort' ? (
            <View style={styles.sortContainer}>
              {isAnswered && !isSortCorrect && showCorrectHint && (
                <Text style={styles.hintText}>Смотри, как надо было:</Text>
              )}

              {sortItems.map((item, index) => {
                let cardStyle = styles.sortCard;
                if (isAnswered) {
                  cardStyle = isSortCorrect
                    ? { ...styles.sortCard, backgroundColor: '#C8E6C9', borderColor: '#4CAF50' }
                    : { ...styles.sortCard, backgroundColor: '#FFCDD2', borderColor: '#F44336' };
                }

                return (
                  <View key={item.id} style={cardStyle}>
                    <Text style={styles.sortCardText}>{item.text}</Text>
                    {!isAnswered && (
                      <View style={styles.sortButtons}>
                        <TouchableOpacity style={styles.arrowBtn} onPress={() => moveUp(index)}>
                          <Text style={styles.arrowText}>🔼</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.arrowBtn} onPress={() => moveDown(index)}>
                          <Text style={styles.arrowText}>🔽</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}

              {!isAnswered && (
                <TouchableOpacity style={styles.checkButton} onPress={checkSortOrder}>
                  <Text style={styles.checkButtonText}>Проверить план</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            step.options.map((option, optionIndex) => {
              let buttonStyle = styles.optionButton;
              if (isAnswered) {
                if (option.isCorrect) {
                  buttonStyle = { ...styles.optionButton, backgroundColor: '#C8E6C9', borderColor: '#4CAF50' };
                } else if (selectedOption?.text === option.text) {
                  buttonStyle = { ...styles.optionButton, backgroundColor: '#FFCDD2', borderColor: '#F44336' };
                }
              }
              return (
                <TouchableOpacity
                  key={optionIndex}
                  style={buttonStyle}
                  onPress={() => handleOptionPress(option, optionIndex)}
                  activeOpacity={0.7}
                  disabled={isAnswered}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                  {isAnswered && savedAnswers[currentStepIndex] === optionIndex && (
                    <Text style={styles.savedIndicator}>Твой ответ</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === LEVEL_FIVE_STEPS.length - 1 ? 'Финиш' : 'Дальше'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#365d69', paddingTop: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  backButton: { backgroundColor: '#5D4037', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  mainTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFF', textAlign: 'center', flex: 1, marginHorizontal: 10 },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#FFE082' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  storyCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 2, borderColor: '#FFE082' },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
  storyImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  storyText: { fontSize: 14, color: '#333', lineHeight: 22 },

  questionCard: { backgroundColor: '#FFF8E1', padding: 15, borderRadius: 20, marginBottom: 20 },
  questionText: { fontSize: 15, fontWeight: 'bold', color: '#5D4037', marginBottom: 15 },
  optionButton: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#E0D4B7' },
  optionText: { fontSize: 14, color: '#333', fontWeight: '500' },

  sortContainer: { marginBottom: 10 },
  sortCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#E0D4B7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sortCardText: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1, paddingRight: 10 },
  sortButtons: { flexDirection: 'row' },
  arrowBtn: { padding: 5, marginLeft: 5 },
  arrowText: { fontSize: 18 },
  checkButton: { backgroundColor: '#3b71af', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  checkButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  hintText: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },
  nextButton: { backgroundColor: '#E65100', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  savedIndicator: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});