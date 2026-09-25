import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

// Ровно 6 вопросов-шагов, и у каждого СВОЯ картинка из папки assets!
const LEVEL_STEPS = [
{
    id: 1,
    subTitle: 'Откуда взялись деньги?',
    text: 'Давным-давно не было денег. Если тебе нужны были дрова, то тебе тебе приходилось меняться.Люди могли обменивать дрова на горшки,горшки на свинок.',
    image: require('../../assets/pictirequestion/twopeoplepig.png'),
    imageStyle: 'storyImageTribe',
    question: 'Что люди использовали вместо денег в древности, чтобы меняться?',
    options: [
    { text: 'Смартфоны и дома', isCorrect: false },
    { text: 'Вещи, еду, домашних животных', isCorrect: true },
    { text: 'Шоколадки из супермаркета', isCorrect: false }
    ]
  },
{
    id: 2, // Поставь нужный порядковый номер в массиве
    subTitle: 'Почему появились деньги',
    text: 'У тебя есть плюшевая акула, которую тебе подарили. Вдруг на площадке ты увидел мальчика с вкусным леденцом-петушком на палочке. Тебе в эту секунду ужасно захотелось сладкого! Мальчик предлагает меняться: твоя акула в обмен на его леденец.',
    image: require('../../assets/pictirequestion/shark.png'),
    // Картинка с акулой и леденцом
    imageStyle: 'storyImageShark',
    question: 'Как ты думаешь, выгодно ли менять плюшевую акулу на леденец, если тебе захотелось сладкого?',
    options: [
    { text: 'Да, ведь я хочу конфету прямо сейчас', isCorrect: false },
    { text: 'Нет, акула стоит намного дороже.Это невыгодный обмен', isCorrect: true },
    { text: 'Да, акулу всё равно нельзя съесть', isCorrect: false }
    ]
  },
{
    id: 3,
    subTitle: 'Сбережения',
    text: 'Сбережения — это деньги, которые ты не потратил сразу, а отложил на будущее. Тебе подарили деньги. Если купить на них конфеты, деньги закончатся за день. А если положить их в копилку и каждый раз добавлять туда новые деньги, то скоро можно будет купить велосипед.',
    image: require('../../assets/pictirequestion/velosiped.png'),
    imageStyle: 'storyImagevelosiped',
    question: 'Зачем нужно откладывать деньги?',
    options: [
    { text: 'Чтобы они просто пылились в шкафу', isCorrect: false },
    { text: 'Чтобы купить что-то важное в будущем', isCorrect: true },
    { text: 'Чтобы поскорее всё потратить за один день', isCorrect: false }
    ]
  },
{
    id: 4,
    subTitle: 'Копим на мечту',
    text: 'Представь: ты очень хочешь новый телефон. Это твоя финансовая цель — большая покупка, для которой нужно накопить деньги. Можно откладывать понемногу каждую неделю и следить, как сумма растёт. А чтобы деньги не потерялись, в банке можно создать виртуальный «Конверт» — место для накоплений на конкретную мечту. Например, один конверт — на велосипед, другой — на подарок',
    image: require('../../assets/pictirequestion/phone.jpg'),
    imageStyle: 'storyImagephone',
    question: 'Что такое "Конверт" в современном банке?',
    options: [
    { text: 'Конвертик для писем с маркой', isCorrect: false },
    { text: 'Отдельный счет, где деньги лежат на конкретную цель', isCorrect: true }
    ]
  },
{
    id: 5,
    subTitle: 'Ловушка Монстра «Хотюна»',
    text: 'Внимание! В супермаркете у кассы прячется монстр — Хотюн. Он специально раскладывает на нижних полках самые яркие жвачки, поп-иты и шоколадки, чтобы загипнотизировать тебя и заставить купить. Хотюн охотится за твоими монетами, чтобы опустошить конверт с твоей главной мечтой. Твоё главное шпионское оружие против него — "Заклинание 10 секунд".',
    image: require('../../assets/pictirequestion/hotun.jpg'),
    imageStyle: 'storyImagehotun',
    question: 'Какой суперприем поможет агенту победить Хотюна у кассы магазина?',
    options: [
    { text: 'Упасть на пол и требовать купить жвачку, чтобы Хотюн испугался ', isCorrect: false },
    { text: 'Включить таймер на 10 секунд, сделать глубокий вдох и спросить себя: "Это моя цель или ловушка монстра?"', isCorrect: true },
    { text: 'Быстро съесть всё прямо в магазине, пока никто не видит', isCorrect: false }
    ]
  },
    {
    id: 6,
    type: 'sort', // Указываем новый тип задания
    subTitle: 'Задание 6: План «Копим на компьютер» 🖥️',
    text: 'Чтобы купить  игровой компьютер, нужен четкий план действий. Расставь шаги в правильном порядке: от самого первого действия до покупки',
    question: 'Расположи шаги плана от начала до конца(сверху вниз):',
    // Изначально перемешанный список для ребенка
    initialItems: [
      { id: 'step4', text: '4. Регулярно откладывать деньги в конверт 🪙' },
      { id: 'step1', text: '1. Узнать точную цену компьютера в магазине 💰' },
      { id: 'step5', text: '5. Купить компьютер и радоваться покупке! 🎉' },
      { id: 'step2', text: '2. Посчитать, сколько денег уже есть в копилке 🐷' },
      { id: 'step3', text: '3. Разделить сумму на недели и понять план 📆' },
    ],
    // Правильный порядок ID для проверки
    correctOrder: ['step1', 'step2', 'step3', 'step4', 'step5']
  }

];


export default function LevelOneScreen({ navigation, route }) {
  // Получаем индекс вопроса, на который нажали. Если не передали — стартуем с 0
  const startIndex = route.params?.startIndex ?? 0;
  
  // Устанавливаем стартовый индекс в состояние
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Состояние для интерактивной сортировки 6-го шага
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const step = LEVEL_STEPS[currentStepIndex];
  const [showCorrectHint, setShowCorrectHint] = useState(false);

  // Инициализируем список для сортировки, если это задание 6
  useEffect(() => {
    if (step && step.type === 'sort') {
      setSortItems(step.initialItems);
      setIsAnswered(false);
    }
  }, [currentStepIndex]);

  const handleOptionPress = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  // Движение элемента вверх по списку
  const moveUp = (index) => {
    if (index === 0 || isAnswered) return;
    const newItems = [...sortItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setSortItems(newItems);
  };

  // Движение элемента вниз по списку
  const moveDown = (index) => {
    if (index === sortItems.length - 1 || isAnswered) return;
    const newItems = [...sortItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setSortItems(newItems);
  };

  // 🌟 ВОЛШЕБНАЯ ФУНКЦИЯ ПРОВЕРКИ С АВТО-ИСПРАВЛЕНИЕМ 🌟
  const checkSortOrder = () => {
    const userOrder = sortItems.map(item => item.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
    
    setIsAnswered(true); // Сразу блокируем кнопки и показываем результат

    if (isCorrect) {
      setIsSortCorrect(true);
      setScore(prev => prev + 1);
    } else {
      setIsSortCorrect(false); // Сначала показываем КРАСНЫЙ цвет (ошибка)
      
      // Через 1.2 секунды автоматически перестраиваем в ПРАВИЛЬНЫЙ порядок и делаем ЗЕЛЕНЫМ
      setTimeout(() => {
        const correctItems = step.correctOrder.map(correctId => 
          step.initialItems.find(item => item.id === correctId)
        );
        setSortItems(correctItems);
        setIsSortCorrect(true); // Теперь карточки станут зелеными
        setShowCorrectHint(true); // Показываем надпись "Смотри, как надо было"
      }, 1200);
    }
  };
  // Проверка правильности сортировки плана
  // const checkSortOrder = () => {
  //   const userOrder = sortItems.map(item => item.id);
  //   const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
  //   setIsSortCorrect(isCorrect);
  //   setIsAnswered(true);
  //   if (isCorrect) {
  //     setScore(prev => prev + 1);
  //   }
  // };
    const handleNextStep = () => {
    if (currentStepIndex < LEVEL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowCorrectHint(false);
    } else {
      // 🌟 СОХРАНЯЕМ ПРОХОЖДЕНИЕ БЛОКА 1 В ПАМЯТЬ
      AsyncStorage.setItem('blockOneCompleted', 'true');
            Alert.alert(
        'Победа! 🏆', 
        `Уровень пройден! Твой результат: ${score + (isSortCorrect ? 1 : 0)} из ${LEVEL_STEPS.length}. На твой баланс начислено 50 монет!`,
        [{ 
          text: 'Круто!', 
          onPress: () => {
            // ЯВНО говорим карте, что мы прошли 6-й шаг и открываем 7-й (первую игру)
            navigation.navigate('BlockOneScreen', { highestCompletedStep: 6 }); 
          } 
        }]
      );
    }
  };

return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Уровень 1: Шаг {currentStepIndex + 1} из 6</Text>
        <Text style={styles.scoreText}>🪙 +{score * 10}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Карточка с историей */}
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step.subTitle}</Text>
          {step.image && <Image source={step.image} style={styles.storyImage} resizeMode="contain" />}
          <Text style={styles.storyText}>{step.text}</Text>
        </View>

        {/* Интерактивный блок */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{step.question}</Text>
          
          {/* ЕСЛИ ТИП ЗАДАНИЯ — СОРТИРОВКА ПЛАНА */}
          {step.type === 'sort' ? (
            <View style={styles.sortContainer}>
              {/* Подсказка, которая появляется, если ребенок ошибся */}
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
            // ОБЫЧНЫЙ ТЕСТ (Варианты ответов для шагов 1-5)
            step.options.map((option, index) => {
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
                  key={index}
                  style={buttonStyle}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.7}
                  isabled={isAnswered}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Кнопка Далее */}
        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === LEVEL_STEPS.length - 1 ? 'Финиш ' : 'Дальше '}
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
  mainTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#FFE082' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  storyCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 2, borderColor: '#FFE082' },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
  storyImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  storyText: { fontSize: 14, color: '#333', lineHeight: 22 },
  
  questionCard: { backgroundColor: '#20201e', padding: 15, borderRadius: 20, marginBottom: 20 },
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
  nextButton: { backgroundColor: '#E65100', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
