import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';

const LEVEL_THREE_STEPS = [
  {
    id: 1,
    subTitle: 'Правило 4-х копилок',
    text: 'Умные люди делят любые полученные деньги на 4 части: 1) Траты (на мелкие радости), 2) Накопления (на большую цель), 3) Инвестиции (чтобы деньги работали), 4) Благотворительность (помощь другим).',
    question: 'Зачем нужна копилка «Благотворительность»?',
    options: [
      { text: 'Чтобы хвастаться, что ты добрый', isCorrect: false },
      { text: 'Чтобы помогать тем, кому это нужно, и делать мир лучше', isCorrect: true },
      { text: 'Чтобы копить на новые игры', isCorrect: false },
    ],
    explanation: '💡 Верно! Благотворительность — это помощь другим. Финпиг помог приюту для животных и стал радостным.',
    explanationWrong: '🤔 Подумай: Финпиг немного приуныл, ведь он мог помочь милому щенку.',
  },
  {
    id: 2,
    subTitle: 'Что такое инфляция?',
    text: 'Инфляция — это когда цены в магазинах медленно растут, а деньги обесцениваются. Сегодня мороженое стоит 50 монет, а через год может стоить 60. Поэтому деньги нельзя просто хранить под кроватью — их нужно грамотно распределять или класть в банк под процент.',
    question: 'Если Финпиг положит в банк под проценты небольшую сумму, он сможет накопить на велосипед?',
    options: [
      { text: 'Нет, не надо', isCorrect: false },
      { text: 'Да, так он сможет быстрее накопить на велосипед', isCorrect: true },
      { text: 'Нет, вообще не надо копить', isCorrect: false },
    ],
    explanation: '💡 Верно! Финпиг счастливый — вскоре он накопил на новый велосипед.',
    explanationWrong: '🤔 Подумай: инфляция — это рост цен. Велосипед может подорожать. А если деньги лежат в банке под проценты — их станет больше.',
  },
  {
    id: 3,
    type: 'pick',
    subTitle: 'Выбери правильную копилку',
    text: 'Ты получил 100 монет. Куда положить, чтобы накопить на велосипед?',
    question: 'Нажми на правильную копилку:',
    options: [
      { id: 'p1', emoji: '🍬', label: 'Сладости', isCorrect: false, explanation: '⚠️ Сладости съешь за день — велосипед не приблизится. Финпиг расстроится.' },
      { id: 'p2', emoji: '🏦', label: 'Копилка', isCorrect: true },
      { id: 'p3', emoji: '🎮', label: 'Игрушки', isCorrect: false, explanation: '⚠️ Игрушка — приятно, но велосипед важнее. Финпиг очень давно хотел велосипед.' },
    ],
    successText: '💡 Верно! Копилка — лучший путь к велосипеду!',
  },
  {
    id: 4,
    type: 'pick',
    subTitle: 'Что важнее?',
    text: 'У тебя 100 монет. Что купишь в первую очередь?',
    question: 'Нажми на правильный выбор:',
    options: [
      { id: 'food', emoji: '🍎', label: 'Еда', isCorrect: true },
      { id: 'toy', emoji: '🎮', label: 'Игрушка', isCorrect: false },
      { id: 'choco', emoji: '🍫', label: 'Шоколадка', isCorrect: false },
    ],
    successText: '💡 Верно! Сначала — обязательное (еда), потом — приятное. Финпиг покушал.',
    explanationWrong: '⚠️ Сначала нужно закрыть обязательное — еду. Игрушки и сладости — потом. Финпиг остался голодный.',
  },
  {
    id: 5,
    type: 'sort',
    subTitle: 'Распредели бюджет',
    text: 'Ты получил 100 монет в подарок. Распредели их по категориям — от самой важной для будущего до наименее важной.',
    question: 'Расположи категории от самой важной до наименее важной (сверху вниз):',
    initialItems: [
      { id: 'cat3', text: 'Инвестиции (пусть деньги растут)' },
      { id: 'cat1', text: 'Накопления на важную цель (велосипед)' },
      { id: 'cat4', text: 'Мелкие траты на сладости прямо сейчас' },
    ],
    correctOrder: ['cat1', 'cat3', 'cat4'],
    explanation: '💡 Верно! Сначала копим на важное (велосипед), потом — инвестиции. Сладости — в конце.',
  },
];

const STORAGE_KEY = '@block_three_progress_v1';

export default function LevelThreeScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const bank = useBank();
  const reviewMode = route.params?.reviewMode ?? false;

  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(reviewMode);
  const [score, setScore] = useState(0);
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);
  const [pickedItem, setPickedItem] = useState(null);

  const step = LEVEL_THREE_STEPS[currentStepIndex];

  useEffect(() => {
    if (!step) return;

    setPickedItem(null);
    setShowCorrectHint(false);

    if (step.type === 'sort') {
      if (reviewMode) {
        const correctItems = step.correctOrder.map((correctId) =>
          step.initialItems.find((item) => item.id === correctId)
        );
        setSortItems(correctItems);
        setIsSortCorrect(true);
        setIsAnswered(true);
      } else {
        setSortItems(step.initialItems);
        setIsAnswered(false);
        setIsSortCorrect(false);
      }
    } else if (step.type === 'pick') {
      setIsAnswered(false);
    } else {
      if (reviewMode) {
        setIsAnswered(true);
        const correctOption = step.options.find((opt) => opt.isCorrect);
        setSelectedOption(correctOption);
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }
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
      console.error('Ошибка прогресса Блока 3:', e);
    }
  };

  // ─── Тест ───
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
      setScore((prev) => prev + 1);
      if (bank?.addCoins) bank.addCoins(20);
      Alert.alert('🎉 +20 монет!', text);
    } else {
      Alert.alert('⚠️ Не совсем', text);
    }
  };

  // ─── Pick ───
  const handlePick = async (option) => {
    if (isAnswered || reviewMode) return;
    setPickedItem(option);
    setIsAnswered(true);
    if (!reviewMode) await saveProgress(currentStepIndex + 1);

    const text =
      option.explanation ||
      (option.isCorrect
        ? (step.successText || 'Верно!')
        : (step.explanationWrong || 'Подумай ещё.'));

    if (option.isCorrect) {
      setScore((prev) => prev + 1);
      if (bank?.addCoins) bank.addCoins(20);
      Alert.alert('🎉 +20 монет!', text);
    } else {
      Alert.alert('⚠️ Не совсем', text);
    }
  };

  // ─── Sort ───
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
    const userOrder = sortItems.map((item) => item.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
    setIsAnswered(true);
    await saveProgress(currentStepIndex + 1);

    if (isCorrect) {
      setIsSortCorrect(true);
      setScore((prev) => prev + 1);
      if (bank?.addCoins) bank.addCoins(20);
      Alert.alert('🎉 +20 монет', step.explanation || 'Правильный порядок!');
    } else {
      setIsSortCorrect(false);
      setTimeout(() => {
        const correctItems = step.correctOrder.map((correctId) =>
          step.initialItems.find((item) => item.id === correctId)
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

    if (currentStepIndex < LEVEL_THREE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (reviewMode) {
        navigation.navigate('BlockThreeScreen');
      } else {
        navigation.navigate('BlockThreeScreen', {
          completedStep: LEVEL_THREE_STEPS.length,
        });
      }
    }
  };

  const handleExit = () => {
    navigation.navigate('BlockThreeScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>
          {currentStepIndex + 1} из {LEVEL_THREE_STEPS.length}
        </Text>
        <Text style={styles.scoreText}>
          🪙 {bank?.balance ? Math.floor(bank.balance) : 0}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step.subTitle}</Text>
          {step.image && (
            <Image source={step.image} style={styles.storyImage} resizeMode="contain" />
          )}
          <Text style={styles.storyText}>{step.text}</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{step.question}</Text>

          {/* ═══ СОРТИРОВКА ═══ */}
          {step.type === 'sort' ? (
            <View style={styles.sortContainer}>
              {isAnswered && !isSortCorrect && showCorrectHint && !reviewMode && (
                <Text style={styles.hintText}>Смотри, как надо было:</Text>
              )}
              {sortItems.map((item, index) => {
                let cardStyle = styles.sortCard;
                if (reviewMode) {
                  cardStyle = { ...styles.sortCard, backgroundColor: '#C8E6C9', borderColor: '#4CAF50' };
                } else if (isAnswered) {
                  cardStyle = isSortCorrect
                    ? { ...styles.sortCard, backgroundColor: '#C8E6C9', borderColor: '#4CAF50' }
                    : { ...styles.sortCard, backgroundColor: '#FFCDD2', borderColor: '#F44336' };
                }
                return (
                  <View key={item.id} style={cardStyle}>
                    <Text style={styles.sortCardText}>{item.text}</Text>
                    {!isAnswered && !reviewMode && (
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
              {!isAnswered && !reviewMode && (
                <TouchableOpacity style={styles.checkButton} onPress={checkSortOrder}>
                  <Text style={styles.checkButtonText}>Проверить план</Text>
                </TouchableOpacity>
              )}
            </View>

          /* ═══ PICK ═══ */
          ) : step.type === 'pick' ? (
            <View style={styles.itemsRow}>
              {step.options.map((option) => {
                const isPicked = pickedItem?.id === option.id;
                let cardStyle = styles.tapItem;
                if (isAnswered && isPicked) {
                  cardStyle = option.isCorrect ? styles.tapItemCorrect : styles.tapItemWrong;
                }
                if (isAnswered && option.isCorrect && !isPicked) {
                  cardStyle = styles.tapItemCorrect;
                }
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={cardStyle}
                    onPress={() => handlePick(option)}
                    disabled={isAnswered || reviewMode}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tapEmoji}>{option.emoji}</Text>
                    <Text style={styles.tapLabel}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          /* ═══ ТЕСТ ═══ */
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
  // ─── Pick (картинки) — как в Блоках 1-2 ───
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