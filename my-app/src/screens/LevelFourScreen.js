import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const LEVEL_FOUR_STEPS = [
  {
    id: 1,
    subTitle: 'Первые заработки',
    text: 'Деньги можно не только получать от родителей, но и зарабатывать самому. Помочь соседке с выгулом собаки, продать старые игрушки или сделать поделки на продажу. Главное — делать это честно и с пользой.',
    question: 'Какой способ заработать карманные деньги самый честный и полезный?',
    options: [
      { text: 'Попросить деньги у незнакомцев на улице', isCorrect: false },
      { text: 'Выполнять дополнительную работу по дому', isCorrect: true },
      { text: 'Найти кошелек и оставить его себе', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Правило 4-х копилок',
    text: 'Умные люди делят любые полученные деньги на 4 части: 1) Траты (на мелкие радости), 2) Накопления (на большую цель), 3) Инвестиции (чтобы деньги работали), 4) Благотворительность (помощь другим).',
    question: 'Зачем нужна копилка "Благотворительность"?',
    options: [
      { text: 'Чтобы хвастаться, что ты добрый', isCorrect: false },
      { text: 'Чтобы помогать тем, кому это действительно нужно, и делать мир лучше', isCorrect: true },
      { text: 'Чтобы копить на новые игры', isCorrect: false }
    ]
  },
  {
    id: 3,
    subTitle: 'Осторожно, мошенники!',
    text: 'В интернете и даже на улице есть хитрые люди, которые хотят обманом забрать твои деньги или данные карты. Они могут писать: "Вы выиграли миллион, нажми сюда!" или просить код из СМС. Никогда и никому не сообщай свои данные',
    question: 'Что делать, если в игре пишут: "Введи номер карты мамы, чтобы получить бесплатные алмазы"?',
    options: [
      { text: 'Быстро ввести данные, пока предложение действует', isCorrect: false },
      { text: 'Сразу закрыть игру и рассказать родителям о мошенниках', isCorrect: true },
      { text: 'Ввести данные своей старой карты', isCorrect: false }
    ]
  },
  {
    id: 4,
    type: 'sort',
    subTitle: 'Задание 4: Распредели бюджет',
    text: 'Ты получил 100 монет в подарок. Распредели их по правильным категориям от самой важной для будущего до наименее важной.',
    question: 'Расположи категории от самой важной до наименее важной (сверху вниз):',
    initialItems: [
      { id: 'cat3', text: '3. Инвестиции (пусть деньги растут)' },
      { id: 'cat1', text: '1. Накопления на важную цель (велосипед)' },
      { id: 'cat4', text: '4. Мелкие траты на сладости прямо сейчас' },
      { id: 'cat2', text: '2. Благотворительность (помощь приюту для животных)' },
    ],
    correctOrder: ['cat1', 'cat2', 'cat3', 'cat4']
  },
  {
    id: 5,
    subTitle: 'Что такое инфляция?',
    text: 'Инфляция — это когда цены в магазинах медленно растут, а деньги обесцениваются. Сегодня мороженое стоит 50 монет, а через год может стоить 60. Поэтому деньги нельзя просто хранить под матрасом — их нужно грамотно распределять или класть в банк под процент.',
    question: 'Как инфляция влияет на наши деньги?',
    options: [
      { text: 'Деньги становятся тяжелее', isCorrect: false },
      { text: 'Цены растут, и на ту же сумму денег можно купить меньше товаров', isCorrect: true },
      { text: 'Деньги начинают размножаться сами по себе', isCorrect: false }
    ]
  },
  {
    id: 6,
    subTitle: 'Финал: Мой финансовый план',
    text: 'Поздравляю! Ты прошел все вопросы. Настоящий финансовый агент всегда знает: откуда приходят деньги, куда они уходят, и как защитить их от Хотюна и мошенников. Составь свой план и следуй ему.',
    question: 'Что самое главное в управлении личными финансами?',
    options: [
      { text: 'Тратить всё сразу, чтобы не украли', isCorrect: false },
      { text: 'Планировать доходы и расходы, копить на цели и быть осторожным', isCorrect: true },
      { text: 'Никому не говорить о деньгах и прятать их в лесу', isCorrect: false }
    ]
  }
];

export default function LevelFourScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [savedSortOrders, setSavedSortOrders] = useState({});
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);
  
  const step = LEVEL_FOUR_STEPS[currentStepIndex];

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const ans = await AsyncStorage.getItem('@block_four_answers_v1');
        const sorts = await AsyncStorage.getItem('@block_four_sorts_v1');
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
  },[currentStepIndex, step, savedAnswers, savedSortOrders]);

//   const saveProgress = async (stepId) => {
//     try {
//       await AsyncStorage.setItem('@block_four_progress_v1', stepId.toString());
//     } catch (e) {
//       console.error('Ошибка сохранения прогресса Блока 4:', e);
//     }
//   };

  const handleOptionPress = (option, optIndex) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    saveAnswer(currentStepIndex, optIndex);
    if (option.isCorrect) {
      setScore(prev => prev + 1);
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
    const userOrder = sortItems.map(item => item.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
    setIsAnswered(true);
    saveSortOrder(currentStepIndex, userOrder);
    if (isCorrect) {
      setIsSortCorrect(true);
      setScore(prev => prev + 1);
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

  const saveAnswer = async (qIndex, optIndex) => {
    const updated = { ...savedAnswers, [qIndex]: optIndex };
    setSavedAnswers(updated);
    await AsyncStorage.setItem('@block_four_answers_v1', JSON.stringify(updated));
  };

  const saveSortOrder = async (qIndex, order) => {
    const updated = { ...savedSortOrders, [qIndex]: order };
    setSavedSortOrders(updated);
    await AsyncStorage.setItem('@block_four_sorts_v1', JSON.stringify(updated));
  };

  const saveProgress = async (stepId) => {
    try {
      const savedStep = await AsyncStorage.getItem('@block_four_progress_v1'); 
      const currentSaved = savedStep ? parseInt(savedStep, 10) : 1;
      if (stepId > currentSaved) {
        await AsyncStorage.setItem('@block_four_progress_v1', stepId.toString());
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса:', e);
    }
  };


  const handleNextStep = () => {
    const stepToUnlock = currentStepIndex + 2;
    saveProgress(stepToUnlock);
    if (currentStepIndex < LEVEL_FOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowCorrectHint(false);
    } else {
      saveProgress(LEVEL_FOUR_STEPS.length + 1);
      Alert.alert(
        'Блок 4 пройден', 
        `Ты настоящий Финансовый Гуру. Результат: ${score + (isSortCorrect ? 1 : 0)} из ${LEVEL_FOUR_STEPS.length}.`,
        [{ 
          text: 'Круто!', 
          onPress: () => {
            navigation.goBack(); 
          } 
        }]
      );
    }
  };

  const handleExit = async () => {
    await saveProgress(currentStepIndex + 1);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Блок 4: Шаг {currentStepIndex + 1} из {LEVEL_FOUR_STEPS.length}</Text>
        <Text style={styles.scoreText}>🪙 {score * 10}</Text>
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
                <Text style={styles.hintText}>✨ Смотри, как надо было:</Text>
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
                  <Text style={styles.checkButtonText}>Проверить план 🔍</Text>
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
              {currentStepIndex === LEVEL_FOUR_STEPS.length - 1 ? 'Финиш' : 'Дальше'}
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