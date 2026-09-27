import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

const LEVEL_ONE_STEPS = [
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
    id: 2, 
    subTitle: 'Почему появились деньги',
    text: 'У тебя есть плюшевая акула, которую тебе подарили. Вдруг на площадке ты увидел мальчика с вкусным леденцом-петушком на палочке. Тебе в эту секунду ужасно захотелось сладкого! Мальчик предлагает меняться: твоя акула в обмен на его леденец.',
    image: require('../../assets/pictirequestion/shark.png'),
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
    type: 'sort', 
    subTitle: 'Задание 6: План «Копим на компьютер» ',
    text: 'Чтобы купить  игровой компьютер, нужен четкий план действий. Расставь шаги в правильном порядке: от самого первого действия до покупки',
    question: 'Расположи шаги плана от начала до конца(сверху вниз):',
    initialItems: [
      { id: 'step4', text: '4. Регулярно откладывать деньги в конверт' },
      { id: 'step1', text: '1. Узнать точную цену компьютера в магазине ' },
      { id: 'step5', text: '5. Купить компьютер и радоваться покупке' },
      { id: 'step2', text: '2. Посчитать, сколько денег уже есть в копилке' },
      { id: 'step3', text: '3. Разделить сумму на недели и понять план ' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4', 'step5']
  },
   {
    id: 7,
    subTitle: 'Импульсивные траты',
    text: 'Ты шёл в магазин строго за хлебом, но по пути увидел крутой светящийся слайм. Магия Хотюна сработала, и ты купил его! Дома слайм покрылся пылью за полчаса, а деньги из кошелька исчезли. Такие покупки называют "импульсивными" — когда ты тратишь деньги под влиянием сиюминутной эмоции, не подумав.',
    // image: require('../../assets/pictirequestion/impulse.png'),
    imageStyle: 'storyImageImpulse',
    question: 'Что такое "импульсивная трата"?',
    options: [
      { text: 'Покупка нужной вещи, которую ты планировал целый месяц', isCorrect: false },
      { text: 'Покупка под влиянием эмоций, о которой потом часто жалеют', isCorrect: true },
      { text: 'Обмен старой игрушки на новую у друга на площадке', isCorrect: false }
    ]
  },
  {
    id: 8,
    subTitle: 'Личные деньги vs Общие деньги',
    text: 'У тебя есть карманные деньги, которые тебе подарили, — это твои личные деньги. Ты сам решаешь, копить их или купить вкусняшку. Но в каждой семье есть Семейный Бюджет. Это общие деньги, которые родители зарабатывают на работе, чтобы оплатить квартиру, купить продукты для всех и заправить машину.',
    // image: require('../../assets/pictirequestion/family_budget.png'),
    imageStyle: 'storyImageFamily',
    question: 'Из чего состоит Семейный Бюджет?',
    options: [
      { text: 'Из денег, которые заработали родители для общих нужд всей семьи', isCorrect: true },
      { text: 'Из золотых монет, которые пираты спрятали в Арктике', isCorrect: false },
      { text: 'Из карманных денег, которые ребёнок прячет в своей копилке', isCorrect: false }
    ]
  },
   {
    id: 9,
    subTitle: 'Сбережения в семейном бюджете',
    text: 'Продвинутые супер-агенты знают: семейные деньги нельзя тратить до копейки! Умные родители всегда направляют часть семейного бюджета в сбережения. Это "подушка безопасности". Если вдруг сломается холодильник или папе понадобится починить машину, семье не придется брать долги в банке — у них будут свои отложенные деньги.',
    // image: require('../../assets/pictirequestion/podushka.png'),
    imageStyle: 'storyImagePodushka',
    question: 'Зачем семье откладывать часть общего бюджета в сбережения?',
    options: [
      { text: 'Чтобы покупать только дорогие жвачки у Хотюна', isCorrect: false },
      { text: 'Чтобы иметь финансовую подушку безопасности на случай непредвиденных трат', isCorrect: true },
      { text: 'Чтобы в доме просто было много красивых бумажек в шкафу', isCorrect: false }
    ]
  },
  {
    id: 10,
    subTitle: 'Умный инвестор: Твои личные сбережения',
    text: 'Как стать продвинутым в финансах? Правило простое: каждый раз, когда тебе дают личные деньги (карманные или подарок от бабушки), не беги тратить их целиком. Отложи фиксированную часть (например, 20 копеек из каждого рубля) сразу в банк или копилку. Остальное можно тратить на маленькие радости. Так твоя цель приблизится очень быстро!',
    // image: require('../../assets/pictirequestion/piggy_smart.png'),
    imageStyle: 'storyImageSmart',
    question: 'Какое главное правило продвинутого накопления личных средств?',
    options: [
      { text: 'Откладывать часть от любых поступивших денег сразу, до того как начнешь их тратить', isCorrect: true },
      { text: 'Потратить всё в первый же час, а копить начать в следующем году', isCorrect: false },
      { text: 'Ждать, пока деньги закончатся, и собирать пустые фантики', isCorrect: false }
    ]
  },
  {
     id: 11,
    subTitle: 'Семейный виртуальный Конверт',
    text: 'Современные банки помогают копить не только детям, но и всей семье! В приложении банка родители могут создать общий виртуальный Конверт, например "На летнее путешествие к морю". В этот конверт могут скидывать деньги и мама, и папа, и даже ты со своих карманных денег, чтобы вместе быстрее исполнить большую общую мечту.',
    // image: require('../../assets/pictirequestion/family_envelope.png'),
    imageStyle: 'storyImageFamilyEnvelope',
    question: 'Как работает семейный виртуальный конверт в банке?',
    options: [
      { text: 'Вся семья может складывать туда деньги вместе на одну общую большую цель', isCorrect: true },
      { text: 'Туда можно отправлять только бумажные письма для Деда Мороза', isCorrect: false }
    ]
  }
];


export default function LevelOneScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
   const [savedAnswers, setSavedAnswers] = useState({});
  const [savedSortOrders, setSavedSortOrders] = useState({});
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const step = LEVEL_ONE_STEPS[currentStepIndex];
  const [showCorrectHint, setShowCorrectHint] = useState(false);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const ans = await AsyncStorage.getItem('@block_one_answers_v1');
        const sorts = await AsyncStorage.getItem('@block_one_sorts_v1');
        if (ans) setSavedAnswers(JSON.parse(ans));
        if (sorts) setSavedSortOrders(JSON.parse(sorts));
      } catch (e) { console.error(e); }
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
    setSelectedOption(option);
    setIsAnswered(true);
    saveAnswer(currentStepIndex, optionIndex);
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
  // const checkSortOrder = () => {
  //   const userOrder = sortItems.map(item => item.id);
  //   const isCorrect = JSON.stringify(userOrder) === JSON.stringify(step.correctOrder);
  //   setIsSortCorrect(isCorrect);
  //   setIsAnswered(true);
  //   if (isCorrect) {
  //     setScore(prev => prev + 1);
  //   }
  // };
  // const saveProgress = async (stepId) => {
  //   try {
  //     await AsyncStorage.setItem('@block_one_progress_v1', stepId.toString());
  //   } catch (e) {
  //     console.error('Ошибка сохранения прогресса:', e);
  //   }
  // };

  const saveProgress = async (stepId) => {
    try {
      const savedStep = await AsyncStorage.getItem('@block_one_progress_v1'); 
      const currentSaved = savedStep ? parseInt(savedStep, 10) : 1;
      if (stepId > currentSaved) {
        await AsyncStorage.setItem('@block_one_progress_v1', stepId.toString());
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса Блока 1:', e);
    }
  };

    const saveAnswer = async (qIndex, optIndex) => {
    const updated = { ...savedAnswers, [qIndex]: optIndex };
    setSavedAnswers(updated);
    await AsyncStorage.setItem('@block_one_answers_v1', JSON.stringify(updated));
  };

  const saveSortOrder = async (qIndex, order) => {
    const updated = { ...savedSortOrders, [qIndex]: order };
    setSavedSortOrders(updated);
    await AsyncStorage.setItem('@block_one_sorts_v1', JSON.stringify(updated));
  };
  const handleNextStep = () => {
    const stepToUnlock = (currentStepIndex === LEVEL_ONE_STEPS.length - 1) 
      ? 8 
      : currentStepIndex + 2;
    saveProgress(stepToUnlock);
    if (currentStepIndex < LEVEL_ONE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowCorrectHint(false);
    } else {
      Alert.alert(
        'Блок 1 пройден', 
        `Ты настоящий новичок-финансист. Результат: ${score + (isSortCorrect ? 1 : 0)} из ${LEVEL_ONE_STEPS.length}.`,
        [{ 
          text: 'Круто', 
          onPress: () => {
            navigation.goBack(); 
          } 
        }]
      );
    }
  };

  const handleExit = async () => {
    const stepToUnlock = (currentStepIndex === LEVEL_ONE_STEPS.length - 1 && isAnswered) 
      ? 8 
      : currentStepIndex + 1;
    await saveProgress(stepToUnlock);
    navigation.goBack();
  };

return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Уровень 1: Шаг {currentStepIndex + 1} из {LEVEL_ONE_STEPS.length}</Text>
        <Text style={styles.scoreText}>🪙 +{score * 10}</Text>
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
              {currentStepIndex === LEVEL_STEPS.length - 1 ? 'Финиш' : 'Дальше'}
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
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    savedIndicator: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});
