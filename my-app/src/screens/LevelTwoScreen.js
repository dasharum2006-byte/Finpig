import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_TWO_STEPS = [
  {
    id: 1,
    subTitle: 'Деньги не растут на деревьях',
    text: 'Родители ходят на работу, выполняют свои обязанности и получают за это зарплату.',
    image: require('../../assets/job.png'),
    question: 'Откуда у родителей берутся деньги?',
    options: [
      { text: 'Их приносит аист вместе с зарплатой', isCorrect: false },
      { text: 'Они получают их за свой труд и работу', isCorrect: true },
      { text: 'Они находят их на улице каждый день', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Ловушка Хотюна «Супер-Скидки»',
    text: 'Внимание! Монстр Хотюн пробрался в магазин и развесил огромные вывески: «СКИДКА 50%!».',
    image: require('../../assets/hotunsales.png'),
    question: 'Как супер-агенту победить ловушку Хотюна с яркими скидками?',
    options: [
      { text: 'Сразу бежать на кассу и скупать всё', isCorrect: false },
      { text: 'Спросить себя: "А мне это правда нужно?"', isCorrect: true },
      { text: 'Купить сразу три штуки', isCorrect: false },
    ]
  },
  {
    id: 3,
    subTitle: 'Монстр Долгов «Одолжун»',
    text: 'На детской площадке прячется хитрый монстр Одолжун. Он шепчет: "Возьми чужие монеты у друга".',
    image: require('../../assets/odolzhun.png'),
    question: 'Что шериф Финпиг говорит про денежный долг?',
    options: [
      { text: 'Это бесплатный подарок', isCorrect: false },
      { text: 'Это чужие деньги, их нужно вернуть вовремя', isCorrect: true },
      { text: 'Долг можно не отдавать', isCorrect: false }
    ]
  },
  {
    id: 4,
    subTitle: 'Кредит — ловушка Хотюна',
    text: 'Когда взрослые хотят купить что-то очень большое, они берут Кредит в банке.',
    image: require('../../assets/credittrap.png'),
    question: 'Что нужно сделать, чтобы не попасть в ловушку с кредитом?',
    options: [
      { text: 'Ничего, банк дарит деньги', isCorrect: false },
      { text: 'Понять, что возвращать придётся больше, чем взял', isCorrect: true },
      { text: 'Брать кредит на всё подряд', isCorrect: false }
    ]
  },
  {
    id: 5,
    subTitle: 'Умный щит Финпига',
    text: 'Когда кредит — это хорошо? Если он помогает семье.',
    question: 'В каком случае кредит оправдан?',
    options: [
      { text: 'Когда деньги берутся на дорогую приставку', isCorrect: false },
      { text: 'Когда они помогают семье или в будущем', isCorrect: true },
      { text: 'Кредит полезен всегда', isCorrect: false }
    ]
  },
  {
    id: 6,
    subTitle: 'Рассрочка',
    text: 'Ты забираешь товар сегодня, но платишь частями без переплат.',
    image: require('../../assets/rassrochkasmart.png'),
    question: 'Как работает «Рассрочка»?',
    options: [
      { text: 'Забираешь товар сразу, платишь частями без переплат', isCorrect: true },
      { text: 'Продавец дарит товар', isCorrect: false },
      { text: 'Платишь тройную стоимость', isCorrect: false }
    ]
  },
  {
    id: 7,
    subTitle: 'Одолжун и риски',
    text: 'Когда даёшь в долг другу, тебя подстерегает Финансовый Риск.',
    image: require('../../assets/pinguinlook.png'),
    question: 'Что такое финансовый риск?',
    options: [
      { text: 'Гарантия вернуть в 3 раза больше', isCorrect: false },
      { text: 'Опасность, что долг не вернут вовремя', isCorrect: true },
      { text: 'Секретный подарок от банка', isCorrect: false }
    ]
  },
  {
    id: 8,
    type: 'sort',
    subTitle: 'Задание 8: Проверка Банкира',
    text: 'Расставь цели от самых важных до капризов.',
    question: 'Расположи цели от самой важной до самой ненужной:',
    initialItems: [
      { id: 'goal4', text: 'Покупка пятого светящегося поп-ита' },
      { id: 'goal1', text: 'Покупка квартиры для семьи' },
      { id: 'goal2', text: 'Оплата учебы старшего брата' },
      { id: 'goal3', text: 'Покупка плюшевой акулы на все деньги' },
    ],
    correctOrder: ['goal1', 'goal2', 'goal3', 'goal4']
  },
  {
    id: 9,
    subTitle: 'Шпионский счет сдачи',
    text: 'Яблоко 20 монет, сувенир 30. Даёшь 100. Сколько сдачи?',
    image: require('../../assets/shopsnow.png'),
    question: 'Сколько сдачи?',
    options: [
      { text: '50 монет', isCorrect: true },
      { text: 'Ничего', isCorrect: false },
      { text: '40 монет', isCorrect: false }
    ]
  },
  {
    id: 10,
    subTitle: 'Разведка цен',
    text: 'Сравнение цен — главный враг Хотюна.',
    question: 'Зачем сравнивать цены?',
    options: [
      { text: 'Чтобы устать', isCorrect: false },
      { text: 'Чтобы найти товар по выгодной цене', isCorrect: true }
    ]
  }
];

const STORAGE_KEY = '@block_two_progress_v1';

export default function LevelTwoScreen({ navigation, route }) {
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

  const step = LEVEL_TWO_STEPS[currentStepIndex];

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const ans = await AsyncStorage.getItem('@block_two_answers_v1');
        const sorts = await AsyncStorage.getItem('@block_two_sorts_v1');
        if (ans) setSavedAnswers(JSON.parse(ans));
        if (sorts) setSavedSortOrders(JSON.parse(sorts));
      } catch (e) { console.error(e); }
    };
    loadSaved();
  }, []);

  useEffect(() => {
    if (!step) return;
    if (step.type === 'sort') {
      setSortItems(step.initialItems);
      setIsAnswered(false);
      setIsSortCorrect(false);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [currentStepIndex]);

  const saveProgress = async (stepId) => {
    try {
      const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
      const currentSaved = savedStep ? parseInt(savedStep, 10) : 0;
      if (stepId > currentSaved) {
        await AsyncStorage.setItem(STORAGE_KEY, stepId.toString());
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса Блока 2:', e);
    }
  };

  const handleOptionPress = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option.isCorrect) {
      setScore(prev => prev + 1);
      bank.addCoins(20);
      Alert.alert("+20 монет уже на твоём счёте");
    }
  };

  const moveUp = (index) => {
    if (index === 0 || isAnswered) return;
    const newItems = [...sortItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setSortItems(newItems);
  };

  const moveDown = (index) => {
    if (index === sortItems.length - 1 || isAnswered) return;
    const newItems = [...sortItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setSortItems(newItems);
  };

  const checkSortOrder = () => {
    const userOrder = sortItems.map(item => item.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
    setIsAnswered(true);
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

  const finishCurrentStep = async () => {
    const stepId = currentStepIndex + 1;
    await saveProgress(stepId);

    if (currentStepIndex < LEVEL_TWO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      Alert.alert(
        'Блок 2 пройден! 🏆',
        'Все 10 вопросов пройдены!',
        [{
          text: 'Круто!',
          onPress: () => navigation.navigate('BlockTwoScreen', { completedStep: 10 })
        }]
      );
    }
  };

  const handleExit = async () => {
    const stepId = currentStepIndex;
    if (stepId > 0) await saveProgress(stepId);
    navigation.navigate('BlockTwoScreen', { completedStep: stepId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Блок 2: Шаг {currentStepIndex + 1} из {LEVEL_TWO_STEPS.length}</Text>
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
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.7}
                  disabled={isAnswered}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={finishCurrentStep}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === LEVEL_TWO_STEPS.length - 1 ? 'Завершить блок ' : 'Дальше'}
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
});