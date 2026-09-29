import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_TWO_STEPS = [
  {
    id: 1,
    subTitle: 'Деньги не растут на деревьях',
    text: 'Родители ходят на работу, выполняют свои обязанности и получают за труд зарплату. Твой главный ресурс сейчас — это время и силы, а твоя главная «работа» — это учёба и помощь дома.',
    image: require('../../assets/job.png'),
    question: 'Откуда у родителей берутся деньги?',
    options: [
      { text: 'Их приносит аист вместе с зарплатой', isCorrect: false },
      { text: 'Они получают их за свой труд и работу', isCorrect: true },
      { text: 'Они находят их на улице каждый день', isCorrect: false },
    ],
    explanation: '💡 Верно! Деньги не появляются сами — их получают за работу. Родители ходят на работу и получают зарплату.',
    explanationWrong: '🤔 Подумай: Деньги дают за работу — это называется «зарплата».',
  },
  {
    id: 2,
    subTitle: 'Ловушка Хотюна «Супер-Скидки»',
    text: 'Коварный Хотюн пробрался в магазин и развесил огромные вывески: «СКИДКА 50%!» и «3 по 2!». Он пытается загипнотизировать, чтобы ты потратил все монеты. Но Финпиг знает: если вещь тебе изначально не нужна — даже со скидкой это потеря денег.',
    question: 'Что ты будешь делать?',
    image: require('../../assets/hotunsales.png'),
    options: [
      { text: 'Сразу бежать на кассу и скупать всё, пока скидка не кончилась', isCorrect: false },
      { text: 'Сделать вдох и спросить себя: «А мне это правда нужно?»', isCorrect: true },
      { text: 'Купить сразу три штуки и даже больше, ведь это выгодно', isCorrect: false },
    ],
    explanationWrong: 'Финпиг попромил потом у мамы леденец и у него была и Акула и леденец',
    successText: ''
  },
  {
    id: 3,
    subTitle: 'Монстр Долгов «Одолжун»',
    text: 'В магазине прячется хитрый монстр Одолжун. Он шепчет: «Попроси деньги в долг у друга на приставку!». Денежный долг — это когда ты берёшь чужие монеты на время и обязан вернуть ту же сумму.',
    question: 'Нужно ли Финпигу брать долг, если ему захотелось поиграть в приставку?',
    options: [
      { text: 'Да, ведь деньги потом можно не возвращать', isCorrect: false },
      { text: 'Нет, лучше не брать в долг большие суммы без обсуждения с родителями по поводу чего-то дорогого', isCorrect: true },
      { text: 'Да,потому что долг можно вообще не отдавать, если просто убежать', isCorrect: false },
    ],
    explanation: '💡 Верно! Финпиг поговорил с родителями и они обещали подарить ему на День Рождения приставку. Финпиг счастлив',
    explanationWrong: '🤔 Финпиг попросил у друга и купил себе приставку. Сначала он был счастлив, но потом стал грустным. Из-за того, что у него нет накоплений, ему приходиться отказываться от сладкого и других мелочей,которые важны ему, чтобы вернуть долг',
  },
  {
    id: 4,
    subTitle: 'Шпионский счёт сдачи',
    text: 'Ты покупаешь яблоко за 10 монет и сувенир за 30 монет. Ты даёшь торговцу монету в 100 единиц. Одолжун пытается отвлечь тебя, чтобы ты не посчитал сдачу! Всегда проверяй чек и пересчитывай монеты прямо у лавки.',
    question: 'Сколько монет должен вернуть тебе честный продавец?',
    image: require('../../assets/shopsnow.png'),
    options: [
      { text: '60 монет', isCorrect: true },
      { text: 'Ничего', isCorrect: false },
      { text: '40 монет', isCorrect: false },
    ],
    successText: '💡 Верно! Яблоко + сувенир = 10 + 30 = 40 монет. Ты дал 100. Сдача = 100 − 40 = 60 монет.Финпиг счастлив, его не обманули',
    explanationWrong: '🤔 Посчитай: 10 + 30 = 40 монет — это покупки. Ты дал 100. Сдача = 100 − 40 = 60 монет.Тебя Обманули! Финпиг расстроился',
  },
  {
    id: 5,
    type: 'tap',
    subTitle: 'Покупки в интернете',
    text: 'Ты нашёл на маркетплейсе супер-скин или шпионский гаджет. Хотюн шепчет: «Купи сам потихоньку, пока родители не видят!».Любые онлайн-платежи совершаются ТОЛЬКО вместе с родителями.',
    prompt: 'Что делать? Нажми на правильное действие.',
    items: [
      { id: 'alone', emoji: '💳', label: 'Купить сам', isCorrect: false, explanation: '⚠️ Нельзя! Без взрослых вводить карту в интернете опасно. Финпиг оплатил карточкой и все деньги родителей списались' },
      { id: 'parents', emoji: '👨‍👩‍👧', label: 'Вместе с родителями', isCorrect: true },
      { id: 'friend', emoji: '👦', label: 'С друзьями', isCorrect: false, explanation: '⚠️ Друзья не помогут — карта и пароли только для взрослых. У родителей друзей Финпига списались все деньги с карты' },
    ],
    successText: '💡 Верно! Онлайн-покупки делают только вместе с родителями. Так безопасно.',
  },
  {
    id: 6,
    type: 'sort',
    subTitle: 'Проверка Банкира',
    text: 'Директор банка выдаёт кредиты только на серьёзные цели, полезные семье. Помоги банкиру расставить цели от самых важных (наверху) до капризов Хотюна (внизу):',
    question: 'Расположи цели от самой важной до самой ненужной:',
    image: require('../../assets/credittrap.png'),
    initialItems: [
      { id: 'goal4', text: 'Покупка пятого светящегося поп-ита, потому что Хотюн так хочет' },
      { id: 'goal1', text: 'Покупка квартиры для семьи, чтобы у каждого была своя комната' },
      { id: 'goal2', text: 'Оплата учёбы старшего брата' },
      { id: 'goal3', text: 'Покупка огромной плюшевой акулы на все деньги' },
    ],
    correctOrder: ['goal1', 'goal2', 'goal3', 'goal4'],
    explanation: '💡 Верно! Самое важное — жильё и учёба. Потом — приятные покупки. А капризы Хотюна — в самом конце.',
  },
];



const STORAGE_KEY = '@block_two_progress_v1';

export default function LevelTwoScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const bank = useBank();
  const reviewMode = route.params?.reviewMode ?? false;
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(reviewMode);
  const [score, setScore] = useState(0);
  // const [savedAnswers, setSavedAnswers] = useState({});
  // const [savedSortOrders, setSavedSortOrders] = useState({});
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);

  const step = LEVEL_TWO_STEPS[currentStepIndex];



  useEffect(() => {
    if (!step) return;
    if (step.type === 'sort') {
      if (reviewMode) {
        const correctItems = step.correctOrder.map(correctId =>
          step.initialItems.find(item => item.id === correctId)
        );
        setSortItems(correctItems);
        setIsSortCorrect(true);
        setIsAnswered(true);
      } else {
        setSortItems(step.initialItems);
        setIsAnswered(false);
        setIsSortCorrect(false);
      }
    } else {
      if (reviewMode) {
        setIsAnswered(true);
        const correctOption = step.options.find(opt => opt.isCorrect);
        setSelectedOption(correctOption);
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }
    setShowCorrectHint(false);
  }, [currentStepIndex, reviewMode, step]);


  const saveProgress = async (stepId) => {
     if (reviewMode) return;
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

     const handleOptionPress = async (option) => {
  if (isAnswered || reviewMode) return;
  setSelectedOption(option);
  setIsAnswered(true);
  if (!reviewMode) await saveProgress(currentStepIndex + 1);

  const text =
    option.explanation ||
    (option.isCorrect
      ? (step.explanation || step.successText || 'Верно! Так держать.')
      : (step.explanationWrong || 'Правильный ответ подсвечен зелёным. Подумай, почему так.'));

  if (option.isCorrect) {
    setScore(prev => prev + 1);
    if (bank?.addCoins) bank.addCoins(20);
    Alert.alert('🎉 +20 монет!', text);
  } else {
    Alert.alert('⚠️ Не совсем', text);
  }
};
// ─── Интерактив (tap) ───
const handleTap = async (item) => {
  if (tapDone || reviewMode) return;

  if (item.isCorrect) {
    const newPicked = [...picked, item.id];
    setPicked(newPicked);
    const correctIds = step.items.filter(i => i.isCorrect).map(i => i.id);

    if (newPicked.length === correctIds.length) {
      setTapDone(true);
      setIsAnswered(true);
      setScore(prev => prev + 1);
      if (!reviewMode) {
        await saveProgress(currentStepIndex + 1);
        if (bank?.addCoins) bank.addCoins(20);
      }
      Alert.alert(
        '🎉 Верно! +20 монет',
        step.successText || 'Отлично!'
      );
    }
  } else {
    setWrong([...wrong, item.id]);
    const wrongText =
      item.explanation ||
      step.explanationWrong ||
      'Подумай ещё — что безопаснее?';
    Alert.alert('⚠️ Не то', wrongText);
  }
};

  const moveUp = (index) => {
    if (index === 0 || isAnswered || reviewMode) return;
    const newItems = [...sortItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setSortItems(newItems);
  };

  const moveDown = (index) => {
    if (index === sortItems.length - 1 || isAnswered || reviewMode) return;
    const newItems = [...sortItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setSortItems(newItems);
  };

  const checkSortOrder = async () => {
  if (reviewMode) return;
  const userOrder = sortItems.map(item => item.id);
  const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
  setIsAnswered(true);
  await saveProgress(currentStepIndex + 1);

  if (isCorrect) {
    setIsSortCorrect(true);
    setScore(prev => prev + 1);
    if (bank?.addCoins) bank.addCoins(20);
    Alert.alert(
      '🎉 +20 монет',
      step.explanation || 'Порядок правильный!'
    );
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

    const handleNextStep = async () => {
    if (!reviewMode) {
      const stepId = currentStepIndex + 1;
      await saveProgress(stepId);
    }
    if (currentStepIndex < LEVEL_TWO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (reviewMode) {
        navigation.navigate('BlockTwoScreen');
      } else {
        navigation.navigate('BlockTwoScreen', { completedStep: LEVEL_TWO_STEPS.length });
      }
    }
  };

   const handleExit = async () => {
    if (reviewMode) {
      navigation.navigate('BlockTwoScreen');
      return;
    }
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
        <Text style={styles.mainTitle}>{currentStepIndex + 1} из {LEVEL_TWO_STEPS.length}</Text>
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
          </View>
        ) : step.type === 'tap' ? (
          <View style={styles.itemsRow}>
            {step.items.map((item) => {
              const isPicked = picked.includes(item.id);
              const isWrong = wrong.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.tapItem,
                    isPicked && styles.tapItemCorrect,
                    isWrong && styles.tapItemWrong,
                  ]}
                  onPress={() => handleTap(item)}
                  disabled={isPicked || tapDone}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tapEmoji}>{item.emoji}</Text>
                  <Text style={styles.tapLabel}>{item.label}</Text>
                  {isPicked && <Text style={styles.tapCheck}>✅</Text>}
                  {isWrong && <Text style={styles.tapCheck}>⚠️</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          step.options.map((option, optIndex) => {
              let buttonStyle = styles.optionButton;
              if (reviewMode) {
                if (option.isCorrect) {
                  buttonStyle = { ...styles.optionButton, backgroundColor: '#C8E6C9', borderColor: '#4CAF50' };
                }
              } else if (isAnswered) {
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
                  disabled={isAnswered || reviewMode}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {(isAnswered || reviewMode) && (
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNextStep}
          >
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
  container: { 
    flex: 1, 
    backgroundColor: '#fcfcfc75', 
    paddingTop: 30 
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  backButton: { 
    backgroundColor: '#33864e', 
    paddingHorizontal: 8, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  backText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 20
  },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#238828', 
    textAlign: 'center', 
    flex: 1, 
    marginLeft: 0, 
  },
  scoreText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFE082' 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },

  storyCard: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 20, 
    borderWidth: 2, 
    borderColor: '#38944f' 
  },
  subTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#020202', 
    marginBottom: 8 
  },
  storyImage: { 
    width: '100%', 
    height: 160, 
    borderRadius: 12, 
    marginBottom: 10 
  },
  storyText: { 
    fontSize: 20, 
    color: '#333', 
    lineHeight: 22,
    textAlign: 'justify',
  },

  questionCard: { 
    backgroundColor: '#4f926b3a', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 15,
    borderColor: '#389950',
  },
  questionText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1a1919', 
    marginBottom: 15 
  },
  optionButton: { 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: '#238f50' 
  },
  optionText: { 
    fontSize: 20, 
    color: '#333', 
    fontWeight: '500' 
  },

  sortContainer: { 
    marginBottom: 10 
  },
  sortCard: { 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: '#E0D4B7', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  sortCardText: { 
    fontSize: 20, 
    color: '#333', 
    fontWeight: '500', 
    flex: 1, 
    paddingRight: 10 
  },
  sortButtons: { 
    flexDirection: 'row' 
  },
  arrowBtn: { 
    padding: 5, 
    marginLeft: 5 
  },
  arrowText: { 
    fontSize: 20 
  },
  checkButton: { 
    backgroundColor: '#3b71af', 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10 
  },
  checkButtonText: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },

  hintText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2E7D32', 
    textAlign: 'center', 
    marginBottom: 10, 
    fontStyle: 'italic' 
  },
  nextButton: { 
    backgroundColor: '#29cecebd', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 0, 
  },
  nextButtonText: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  savedIndicator: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  itemsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
},
tapItem: {
  width: '30%',
  aspectRatio: 1,
  backgroundColor: '#FFF',
  borderRadius: 16,
  borderWidth: 2,
  borderColor: '#238f50',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  padding: 8,
  minHeight: 48,
},
tapItemCorrect: { backgroundColor: '#C8E6C9', borderColor: '#4CAF50' },
tapItemWrong: { backgroundColor: '#FFCDD2', borderColor: '#F44336' },
tapEmoji: { fontSize: 38, marginBottom: 4 },
tapLabel: { fontSize: 13, color: '#333', fontWeight: '600', textAlign: 'center' },
tapCheck: { position: 'absolute', top: 4, right: 6, fontSize: 18 },
});
