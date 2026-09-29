import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';

const { width } = Dimensions.get('window');

const LEVEL_STEPS = [

  {
    id: 1,
    subTitle: 'Почему появились деньги?',
    text: 'У тебя есть большая плюшевая акула. На детской площадке ты увидел леденец у мальчика и захотел его съесть. Он предложил обмен: «Поменяй акулу на этот леденец».',
    image: require('../../assets/pictirequestion/shark.png'),
    question: 'Как ты думаешь, выгодно ли менять плюшевую акулу на леденец, если тебе захотелось сладкого?',
    options: [
      { text: 'Да, ведь я хочу леденец прямо сейчас', isCorrect: false },
      { text: 'Нет, акула стоит намного дороже. Это невыгодный обмен', isCorrect: true },
      { text: 'Да, акулу всё равно нельзя съесть', isCorrect: false },
    ],
  },

  // 2. ИНТЕРАКТИВ — автобус
  {
    id: 2,
    type: 'tap',
    subTitle: 'Спецоперация в автобусе',
    text: 'Финпигу нужно срочно добраться в шпионский штаб на автобусе. Коварный Одолжун шепчет: «Проскочи бесплатно, никто не заметит!».',
    prompt: 'Чем оплатить проезд? Нажми на нужный предмет в рюкзаке.',
    items: [
      { id: 'card', emoji: '💳', label: 'Карта', isCorrect: true },
      { id: 'candy', emoji: '🍬', label: 'Конфета', isCorrect: false },
      { id: 'phone', emoji: '📱', label: 'Телефон', isCorrect: true },
    ],
    successText: 'Правильно! Приложил карту к валидатору — оплата прошла, контролёр доволен.',
  },

  // 3. ИНТЕРАКТИВ — супермаркет
  {
    id: 3,
    type: 'tap',
    image: require('../../assets/pictirequestion/shark.png'),
    subTitle: 'Супермаркет',
    text: 'Суперагент Финпиг идёт за продуктами. Хотюн расставил у кассы ловушки — шоколадки и чипсы. Держись списка!',
    prompt: 'Что положишь в корзину? Нажми на нужное.Список покупок: Молоко,Шоколад,Хлеб и Яблоки',
    items: [
      { id: 'milk', emoji: '🥛', label: 'Молоко', isCorrect: true },
      { id: 'choco', emoji: '🍫', label: 'Шоколад', isCorrect: true },
      { id: 'bread', emoji: '🍞', label: 'Хлеб', isCorrect: true },
      { id: 'chips', emoji: '🍟', label: 'Картошка фри', isCorrect: false },
      { id: 'apple', emoji: '🍎', label: 'Яблоки', isCorrect: true },
    ],
    successText: 'Молодец! Собрал всё по списку — не поддался Хотюну!',
  },

  // 4. ИНТЕРАКТИВ — фальшивка
  {
    id: 4,
    type: 'tap',
    subTitle: 'Осторожно: фальшивка',
    text: 'Хотюн пытается подкинуть фальшивую купюру. Настоящие деньги имеют водяные знаки. Если сомневаешься — действуй по инструкции Финпига!',
    prompt: 'Что делать с подозрительной купюрой? Нажми на правильное действие.',
    items: [
      { id: 'buy', emoji: '🍬', label: 'Купить конфету', isCorrect: false },
      { id: 'show', emoji: '👨‍👩‍👧', label: 'Показать взрослым', isCorrect: true },
      { id: 'throw', emoji: '🗑️', label: 'Выбросить', isCorrect: false },
    ],
    successText: 'Верно! Если купюра странная — сразу к взрослым. Так безопаснее.',
  },

  // 5. СОРТИРОВКА — подарок маме
  {
    id: 5,
    type: 'sort',
    subTitle: 'План «Подарок маме»',
    text: 'Чтобы накопить на подарок маме и грамотно распределить карманные расходы, суперагенту нужен чёткий финансовый план. Расставь действия в правильном порядке.',
    question: 'Расположи шаги плана сверху вниз:',
    initialItems: [
      { id: 'step4', text: 'Купить подарок и порадовать маму на день рождения!' },
      { id: 'step1', text: 'Узнать точную стоимость подарка в интернет-магазине' },
      { id: 'step2', text: 'Посчитать, сколько недель осталось до праздника' },
      { id: 'step3', text: 'Регулярно откладывать часть карманных монет в копилку-сейф' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4'],
  },

  // 6. СОРТИРОВКА — эволюция денег
  {
    id: 6,
    type: 'sort',
    subTitle: 'Эволюция денег',
    text: 'Деньги бывают самыми разными. Расставь виды денег в правильном историческом порядке — от самых древних (наверху) до самых современных (внизу).',
    question: 'Расположи виды денег от древности до наших дней:',
    initialItems: [
      { id: 'step3', text: 'Электронные деньги — монеты на твоей банковской карте' },
      { id: 'step1', text: 'Древний бартер — обмен дровами, тканями, посудой' },
      { id: 'step4', text: 'Цифровые деньги — бесконтактная оплата телефоном и QR-кодами' },
      { id: 'step2', text: 'Наличные деньги — бумажные банкноты и металлические монеты' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4'],
  },
];

const STORAGE_KEY = '@block_one_progress_v1';

export default function LevelOneScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const reviewMode = route.params?.reviewMode ?? false;
  const bank = useBank();

  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(reviewMode);
  const [score, setScore] = useState(0);

  // Сортировка
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);

  // Интерактив (tap)
  const [picked, setPicked] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [tapDone, setTapDone] = useState(false);

  const step = LEVEL_STEPS[currentStepIndex];

  // ─── Сохранение прогресса ───
  const saveProgress = async (stepId) => {
    if (reviewMode) return;
    try {
      const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
      const currentSaved = savedStep ? parseInt(savedStep, 10) : 0;
      if (stepId > currentSaved) {
        await AsyncStorage.setItem(STORAGE_KEY, stepId.toString());
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса Блока 1:', e);
    }
  };


  useEffect(() => {
    if (!step) return;

    // Сброс интерактива
    setPicked([]);
    setWrong([]);
    setTapDone(false);
    setShowCorrectHint(false);

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
      }
    } else if (step.type === 'tap') {
      setIsAnswered(false);
    } else {
      // Обычный тест
      if (reviewMode) {
        setIsAnswered(true);
        const correctOption = step.options.find(opt => opt.isCorrect);
        setSelectedOption(correctOption);
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }
  }, [currentStepIndex, reviewMode, step]);

  // ─── Обычный тест ───
  const handleOptionPress = async (option) => {
    if (isAnswered || reviewMode) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (!reviewMode) await saveProgress(currentStepIndex + 1);

    if (option.isCorrect) {
      setScore(prev => prev + 1);
      if (bank?.addCoins) bank.addCoins(20);
      Alert.alert('🎉 +20 монет', 'Верно! Так держать.');
    } else {
      Alert.alert('⚠️ Не совсем', 'Правильный ответ подсвечен зелёным. Подумай, почему так.');
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
        Alert.alert('🎉 Верно! +20 монет', step.successText || 'Отлично!');
      }
    } else {
      setWrong([...wrong, item.id]);
      Alert.alert('⚠️ Не то', 'Подумай ещё — что в списке / что безопаснее?');
    }
  };

  // ─── Сортировка: движение ───
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
      Alert.alert('🎉 +20 монет', 'Порядок правильный!');
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

  // ─── Следующий шаг / завершение ───
  const handleNextStep = async () => {
    if (!reviewMode) {
      const stepId = currentStepIndex + 1;
      await saveProgress(stepId);
    }

    if (currentStepIndex < LEVEL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Завершили все вопросы
      if (!reviewMode) {
        if (bank?.addCoins) bank.addCoins(20);
        Alert.alert(
          'Отлично 🎉',
          `Все ${LEVEL_STEPS.length} вопросов пройдены! Тебе начислено ещё 20 монет.`,
          [{ text: 'К играм', onPress: () => navigation.navigate('BlockOneScreen') }]
        );
      } else {
        navigation.navigate('BlockOneScreen');
      }
    }
  };

  const handleExit = () => {
    navigation.navigate('BlockOneScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>
          {currentStepIndex + 1} из {LEVEL_STEPS.length}
        </Text>
        <Text style={styles.scoreText}>🪙 {Math.floor(bank.balance)}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Сцена */}
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step.subTitle}</Text>
          {step.image && (
            <Image
              source={step.image}
              style={styles.storyImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.storyText}>{step.text}</Text>
        </View>

        {/* Вопрос / задание */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {step.type === 'tap' ? step.prompt : step.question}
          </Text>

          {/* ТЕСТ */}
          {!step.type && step.options.map((option, index) => {
            let buttonStyle = styles.optionButton;
            if (isAnswered) {
              if (option.isCorrect) {
                buttonStyle = {
                  ...styles.optionButton,
                  backgroundColor: '#C8E6C9',
                  borderColor: '#4CAF50',
                };
              } else if (selectedOption?.text === option.text) {
                buttonStyle = {
                  ...styles.optionButton,
                  backgroundColor: '#FFCDD2',
                  borderColor: '#F44336',
                };
              }
            }
            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
                disabled={isAnswered}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}

          {/* ИНТЕРАКТИВ (TAP) */}
          {step.type === 'tap' && (
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
          )}

          {/* СОРТИРОВКА */}
          {step.type === 'sort' && (
            <View style={styles.sortContainer}>
              {isAnswered && !isSortCorrect && showCorrectHint && (
                <Text style={styles.hintText}>Смотри, как надо было:</Text>
              )}
              {sortItems.map((item, index) => {
                let cardStyle = styles.sortCard;
                if (isAnswered) {
                  cardStyle = isSortCorrect
                    ? {
                        ...styles.sortCard,
                        backgroundColor: '#C8E6C9',
                        borderColor: '#4CAF50',
                      }
                    : {
                        ...styles.sortCard,
                        backgroundColor: '#FFCDD2',
                        borderColor: '#F44336',
                      };
                }
                return (
                  <View key={item.id} style={cardStyle}>
                    <Text style={styles.sortCardText}>{item.text}</Text>
                    {!isAnswered && (
                      <View style={styles.sortButtons}>
                        <TouchableOpacity
                          style={styles.arrowBtn}
                          onPress={() => moveUp(index)}
                        >
                          <Text style={styles.arrowText}>🔼</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.arrowBtn}
                          onPress={() => moveDown(index)}
                        >
                          <Text style={styles.arrowText}>🔽</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}

              {!isAnswered && (
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={checkSortOrder}
                >
                  <Text style={styles.checkButtonText}>Проверить план</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Кнопка «Дальше» */}
        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === LEVEL_STEPS.length - 1
                ? 'Завершить вопросы 🎉'
                : 'Дальше'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc75', paddingTop: 30 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#33864e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#238828',
    textAlign: 'center',
    flex: 1,
  },
  scoreText: { fontSize: 22, fontWeight: 'bold', color: '#FFE082' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  storyCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#38944f',
  },
  subTitle: { fontSize: 20, fontWeight: 'bold', color: '#020202', marginBottom: 8 },
  storyImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 10 },
  storyText: { fontSize: 18, color: '#333', lineHeight: 24, textAlign: 'justify' },

  questionCard: {
    backgroundColor: '#4f926b3a',
    padding: 14,
    borderRadius: 20,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1919',
    marginBottom: 15,
  },

  // Тест
  optionButton: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#238f50',
    minHeight: 48,
    justifyContent: 'center',
  },
  optionText: { fontSize: 17, color: '#333', fontWeight: '500' },

  // Интерактив (tap)
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

  // Сортировка
  sortContainer: { marginBottom: 10 },
  sortCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0D4B7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  sortCardText: { fontSize: 16, color: '#333', fontWeight: '500', flex: 1, paddingRight: 10 },
  sortButtons: { flexDirection: 'row' },
  arrowBtn: { padding: 8, marginLeft: 4, minHeight: 48, justifyContent: 'center' },
  arrowText: { fontSize: 20 },
  checkButton: {
    backgroundColor: '#3b71af',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 48,
  },
  checkButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  hintText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },

  nextButton: {
    backgroundColor: '#29cece',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

