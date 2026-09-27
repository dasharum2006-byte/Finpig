import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_THREE_STEPS = [
  {
    id: 1,
    subTitle: 'Деньги не растут на деревьях ',
    text: 'Деньги не появляются в кошельке сами по себе. Родители ходят на работу, выполняют свои обязанности и получают за это зарплату. Твой главный ресурс сейчас — это время и силы, а главная "работа" — учеба и помощь дома.',
    question: 'Откуда у родителей берутся деньги?',
    options: [
      { text: 'Их приносит аист вместе с зарплатой', isCorrect: false },
      { text: 'Они получают их за свой труд и работу', isCorrect: true },
      { text: 'Они находят их на улице каждый день', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Нужды и Хотелки ',
    text: 'Все траты делятся на две группы. «Нужды» — это то, без чего нельзя прожить: еда, одежда, жилье, лекарства. «Хотелки» — это то, что приятно иметь, но можно и без этого обойтись: десятая машинка, сладкая газировка или новая игра.',
    question: 'Что из этого относится к «Нуждам»?',
    options: [
      { text: 'Новый чехол для телефона с блестками', isCorrect: false },
      { text: 'Зимняя куртка, потому что старая мала', isCorrect: true },
      { text: 'Большой набор мармеладных мишек', isCorrect: false }
    ]
  },
  {
    id: 3,
    subTitle: 'Подушка безопасности',
    text: 'Иногда случаются неожиданные вещи: сломался телефон, заболел кот или порвались кроссовки. Чтобы не паниковать, умные люди откладывают немного денег в «подушку безопасности». Это заначка на черный день, которую лучше не трогать без реальной причины.',
    question: 'Для чего нужна «подушка безопасности»?',
    options: [
      { text: 'Чтобы спать на ней было мягче', isCorrect: false },
      { text: 'Для непредвиденных и срочных расходов', isCorrect: true },
      { text: 'Чтобы хвастаться перед друзьями', isCorrect: false }
    ]
  },
  {
    id: 4,
    type: 'sort',
    subTitle: 'Задание 4: План «Подарок маме» ',
    text: 'Ты хочешь сделать маме классный подарок на день рождения, но у тебя пока нет денег. Составь правильный план действий, чтобы заработать и купить подарок',
    question: 'Расположи шаги от начала до конца (сверху вниз):',
    initialItems: [
      { id: 'step3', text: 'Выполнять дела и откладывать деньги в копилку' },
      { id: 'step1', text: 'Придумать подарок и узнать его точную цену' },
      { id: 'step4', text: 'Купить подарок, красиво упаковать и вручить' },
      { id: 'step2', text: 'Договориться с родителями о помощи по дому за вознаграждение' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4']
  },
  {
    id: 5,
    subTitle: 'Ловушка «Супер-Скидки»',
    text: 'Магазины очень хитрые. Они пишут огромными буквами «СКИДКА 50%!» или «3 по цене 2!». Но если тебе не нужен этот товар, то даже со скидкой ты просто теряешь деньги. Покупай только то, что планировал.',
    question: 'Как правильно реагировать на яркую скидку?',
    options: [
      { text: 'Сразу бежать и покупать, пока не разобрали!', isCorrect: false },
      { text: 'Спросить себя: "А мне это правда нужно?"', isCorrect: true },
      { text: 'Купить три штуки, потому что это выгодно', isCorrect: false },
    ]
  },
  {
    id: 6,
    subTitle: 'Финал: Что такое Бюджет? ',
    text: 'Поздравляю, ты дошел до конца! Бюджет — это простой план: сколько денег ты получаешь (доходы) и на что ты их тратишь (расходы). Если доходы больше расходов — ты молодец, можно откладывать на мечту',
    question: 'Что такое семейный бюджет?',
    options: [
      { text: 'План доходов и расходов семьи', isCorrect: true },
      { text: 'Название дорогого телефона', isCorrect: false },
      { text: 'Список всех подарков на Новый год', isCorrect: false }
    ]
  }
];

const STORAGE_KEY = '@block_three_progress_v1';

export default function LevelThreeScreen({ navigation, route }) {
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

  const step = LEVEL_THREE_STEPS[currentStepIndex];

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const ans = await AsyncStorage.getItem('@block_three_answers_v1');
        const sorts = await AsyncStorage.getItem('@block_three_sorts_v1');
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

  const handleOptionPress = (option, optIndex) => {
    if (isAnswered) return;
    if (savedAnswers[currentStepIndex] !== undefined) return;
    setSelectedOption(option);
    setIsAnswered(true);
    saveAnswer(currentStepIndex, optIndex);
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
      console.error('Ошибка сохранения прогресса Блока 3:', e);
    }
  };

  const saveAnswer = async (qIndex, optIndex) => {
    const updated = { ...savedAnswers, [qIndex]: optIndex };
    setSavedAnswers(updated);
    await AsyncStorage.setItem('@block_three_answers_v1', JSON.stringify(updated));
  };

  const saveSortOrder = async (qIndex, order) => {
    const updated = { ...savedSortOrders, [qIndex]: order };
    setSavedSortOrders(updated);
    await AsyncStorage.setItem('@block_three_sorts_v1', JSON.stringify(updated));
  };

  const handleNextStep = async () => {
    const nextStep = currentStepIndex + 2;

    if (currentStepIndex < LEVEL_THREE_STEPS.length - 1) {
      await saveProgress(nextStep);
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowCorrectHint(false);
    } else {
      await saveProgress(7);
      navigation.navigate('BlockThreeScreen', { highestCompletedStep: 6 });
    }
  };

  const handleExit = async () => {
    await saveProgress(currentStepIndex + 1);
    navigation.navigate('BlockThreeScreen', { highestCompletedStep: currentStepIndex + 1 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Блок 3: Шаг {currentStepIndex + 1} из {LEVEL_THREE_STEPS.length}</Text>
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
            step.options.map((option, optIndex) => {
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
                  key={optIndex}
                  style={buttonStyle}
                  onPress={() => handleOptionPress(option, optIndex)}
                  activeOpacity={0.7}
                  disabled={isAnswered}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                  {isAnswered && savedAnswers[currentStepIndex] === optIndex && (
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
              {currentStepIndex === LEVEL_THREE_STEPS.length - 1 ? 'Финиш' : 'Дальше'}
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