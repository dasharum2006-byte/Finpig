import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_TWO_STEPS = [
  {
    id: 1,
    subTitle: 'Деньги не растут на деревьях',
    text: 'Родители ходят на работу, выполняют свои обязанности и получают за это зарплату. Твой главный ресурс сейчас — это время и силы, а главная "работа" — учеба и помощь дома.',
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
    text: 'Внимание! Монстр Хотюн пробрался в магазин и развесил огромные вывески: «СКИДКА 50%!» и «3 по цене 2!». Хотюн гипнотизирует тебя, чтобы ты потратил все деньги. Но Финпиг знает: если тебе не нужен этот товар, то даже со скидкой ты потеряешь деньги. Покупай только то, за чем пришёл.',
    image: require('../../assets/hotunsales.png'),
    question: 'Как супер-агенту победить ловушку Хотюна с яркими скидками?',
    options: [
      { text: 'Сразу бежать на кассу и скупать всё, пока скидка не кончилась', isCorrect: false },
      { text: 'Включить защиту, сделать вдох и спросить себя: "А мне это правда нужно?"', isCorrect: true },
      { text: 'Купить сразу три штуки, ведь это же со скидкой', isCorrect: false },
    ]
  },
  {
    id: 3,
    subTitle: 'Монстр Долгов «Одолжун»',
    text: 'На детской площадке прячется хитрый монстр Одолжун. Он шепчет: "Возьми чужие монеты у друга на шоколадку, это же бесплатно". Денежный долг — это когда ты берешь чужие деньги на время, но обязан потом вернуть их. Брать легко, а отдавать трудно. Лучше одалживать у друзей только в крайнем случае (например, если вы пошли в магазин за вкусняшками, которые недорого стоят), а ты забыл деньги. Отдавать долг нужно точно в обещанный срок.',
    image: require('../../assets/odolzhun.png'),
    imageStyle: 'storyImageDolg',
    question: 'Что шериф Финпиг говорит про денежный долг и Одолжуна?',
    options: [
      { text: 'Это бесплатный подарок от друга, возвращать ничего не нужно', isCorrect: false },
      { text: 'Это чужие деньги, их берут на время и обязательно нужно вернуть вовремя', isCorrect: true },
      { text: 'Долг можно вообще не отдавать, если просто убежать.', isCorrect: false }
    ]
  },
  {
    id: 4,
    subTitle: 'Кредит — ловушка Хотюна для взрослых',
    text: 'Когда взрослые хотят купить что-то очень большое (например, квартиру), они берут Кредит в банке. Но Хотюн караулит и тут! Он шепчет взрослым: "Возьмите кредит на огромный телевизор или золотой самокат!". Помни: Кредит — это платная услуга. Банк дает чужие деньги, но вернуть придется гораздо больше чем ты взял в банке. Если взять большой кредит на глупость, Хотюн заберет все семейные сбережения!',
    image: require('../../assets/credittrap.png'),
    imageStyle: 'storyImageCredit',
    question: 'Что нужно сделать родителям, чтобы не попасть в ловушку Хотюна с кредитом?',
    options: [
      { text: 'Ничего, банк дарит эти деньги просто так за красивую улыбку', isCorrect: false },
      { text: 'Понять, что кредит — это платная услуга, и возвращать придется больше, чем взял', isCorrect: true },
      { text: 'Брать кредит на любую новую игрушку, ведь отдавать можно через 100 лет', isCorrect: false }
    ]
  },
  {
    id: 5,
    subTitle: 'Умный щит Финпига vs Опасный кредит',
    text: 'Когда кредит — это хорошо? Если мама с папой берут кредит в банке, чтобы купить машину, чтобы отвозить тебя в школу и ездить на работу  — это умный поступок, который помогает семье. Но если кредит берется, потому что Хотюн загипнотизировал купить супер-дорогую приставку, на которую нет денег — такой кредит ухудшает положение и крадет много денег у семьи.',
    // image: require('../../assets/smartcredit.png'),
    imageStyle: 'storyImageSmartDebt',
    question: 'В каком случае кредит оправдан?',
    options: [
      { text: 'Когда деньги берутся на дорогую приставку или гору сладостей', isCorrect: false },
      { text: 'Когда они помогают семье или тебе это поможет в будущем', isCorrect: true },
      { text: 'Кредит полезен всегда, ведь тратить чужие монеты очень весело', isCorrect: false }
    ]
  },
  {
    id: 6,
    subTitle: 'Рассрочка — делим добычу Хотюна',
    text: 'Представь: в магазине продается крутой велосипед за 60 монет. У тебя нет всей суммы, и Хотюн уже тянет тебя взять опасный кредит. Но Финпиг шепчет: "Используй Рассрочку!". Это значит, что ты забираешь велосипед сегодня, но платишь за него частями: например, по 20 монет каждый месяц. За рассрочку не нужно переплачивать лишнего банку, если отдавать монеты строго вовремя!',
    image: require('../../assets/rassrochkasmart.png'),
    imageStyle: 'storyImageRassrochka',
    question: 'Как работает суперприем «Рассрочка»?',
    options: [
      { text: 'Ты забираешь товар сразу, а платишь за него частями в течение нескольких месяцев без переплат', isCorrect: true },
      { text: 'Продавец дарит тебе велосипед бесплатно, потому что ты агент Финпига', isCorrect: false },
      { text: 'Ты должен заплатить за велосипед три раза полную стоимость', isCorrect: false }
    ]
  },
  {
    id: 7,
    subTitle: 'Одолжун и коварные риски',
    text: 'Когда ты даешь свои личные карманные монеты в долг другу, тебя подстерегает Финансовый Риск. Одолжун может загипнотизировать друга: тот потеряет кошелек, забудет про долг или случайно потратит всё на жвачки. Поэтому Финпиг учит: перед тем как одолжить кому-то деньги, подумай о рисках и реши, готов ли ты подождать, если у друга случатся трудности.',
    image: require('../../assets/pinguinlook.png'),
    imageStyle: 'storyImageRisks',
    question: 'Что такое финансовый риск, когда ты даешь монеты в долг?',
    options: [
      { text: 'Это стопроцентная гарантия, что тебе вернут в три раза больше', isCorrect: false },
      { text: 'Это опасность того, что у должника возникнут проблемы и он не сможет вернуть долг вовремя', isCorrect: true },
      { text: 'Это секретный подарок, который выдает директор банка за доброту', isCorrect: false }
    ]
  },
  {
    id: 8,
    type: 'sort',
    subTitle: 'Задание 8: Проверка Банкира',
    text: 'Директор банка выдает кредиты только на серьезные цели, которые побеждают ловушки Хотюна и защищают семью. Помоги банкиру расставить цели от самых УМНЫХ и ВАЖНЫХ (наверху) до капризов Хотюна (внизу):',
    question: 'Расположи цели от самой важной до самой ненужной (сверху вниз):',
    initialItems: [
      { id: 'goal4', text: '4. Покупка пятого светящегося поп-ита, потому что Хотюн так хочет' },
      { id: 'goal1', text: '1. Покупка квартиры, чтобы семье было где жить' },
      { id: 'goal2', text: '2. Оплата учебы старшего брата в университете' },
      { id: 'goal3', text: '3. Покупка огромной плюшевой акулы на все деньги' },
    ],
    correctOrder: ['goal1', 'goal2', 'goal3', 'goal4']
  },
  {
    id: 9,
    subTitle: 'Шпионский счет сдачи',
    text: 'Ты покупаешь на рынке припасы: яблоко за 20 монет и сувенир за 30 монет. Ты даешь торговцу монету в 100 единиц. Одолжун пытается отвлечь тебя, чтобы ты не посчитал сдачу! Финпиг напоминает: всегда проверяй чек и пересчитывай монеты прямо у лавки. Если продавец ошибся, вежливо скажи ему об этом.',
    image: require('../../assets/shopsnow.png'),
    imageStyle: 'storyImageCount',
    question: 'Сколько монет должен вернуть тебе честный продавец, если ты победил невнимательность?',
    options: [
      { text: 'Продавец должен вернуть строго 50 монет сдачи', isCorrect: true },
      { text: 'Продавец не должен ничего возвращать', isCorrect: false },
      { text: 'Продавец должен вернуть 40 монет', isCorrect: false }
    ]
  },
  {
    id: 10,
    subTitle: 'Разведка цен: Маркетплейс против лавки',
    text: 'Хотюн шепчет: "Купи этот самокат в первой же лавке прямо сейчас!". Но суперагент Финпиг включает режим разведки. Он сравнивает цены в разных магазинах и на современных маркетплейсах в интернете и в обычных магазинах. Оказывается, точно такой же самокат в другой точке стоит гораздо дешевле. Сравнение цен — главный враг Хотюна.',
    // image: require('../../assets/compareshops.png'),
    imageStyle: 'storyImageCompareShops',
    question: 'Зачем шпионы Финпига сравнивают цены в разных местах перед покупкой?',
    options: [
      { text: 'Чтобы просто подольше походить по магазинам и устать', isCorrect: false },
      { text: 'Чтобы найти этот же товар по самой выгодной цене и спасти свои монеты', isCorrect: true }
    ]
  }
];



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


  const saveProgress = async (stepId) => {
    try {
      const savedStep = await AsyncStorage.getItem('@block_two_progress_v1'); 
      const currentSaved = savedStep ? parseInt(savedStep, 10) : 1;
      if (stepId > currentSaved) {
        await AsyncStorage.setItem('@block_two_progress_v1', stepId.toString());
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса Блока 2:', e);
    }
  };

    const saveAnswer = async (qIndex, optIndex) => {
    const updated = { ...savedAnswers, [qIndex]: optIndex };
    setSavedAnswers(updated);
    await AsyncStorage.setItem('@block_two_answers_v1', JSON.stringify(updated));
  };

    const saveSortOrder = async (qIndex, order) => {
    const updated = { ...savedSortOrders, [qIndex]: order };
    setSavedSortOrders(updated);
    await AsyncStorage.setItem('@block_two_sorts_v1', JSON.stringify(updated));
  };

  const handleOptionPress = (option, optionIndex) => {
    if (isAnswered) return;
    if (savedAnswers[currentStepIndex] !== undefined) {
      console.log("На этот вопрос уже отвечали");
      return; 
    }
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
    if (savedSortOrders[currentStepIndex] !== undefined) {
      console.log("Эта сортировка уже выполнена");
      return;
    }
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


  const handleNextStep = () => {
    const stepToUnlock = (currentStepIndex === LEVEL_TWO_STEPS.length - 1) 
      ? 12 
      : currentStepIndex + 2;

    saveProgress(stepToUnlock);

    if (currentStepIndex < LEVEL_TWO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowCorrectHint(false);
    } else {
      saveProgress(LEVEL_TWO_STEPS.length + 1);
      navigation.goBack(); 
    }
  };


  const handleExit = async () => {
    const stepToUnlock = (currentStepIndex === LEVEL_TWO_STEPS.length - 1 && isAnswered) 
      ? 12 
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
              {currentStepIndex === LEVEL_TWO_STEPS.length - 1 ? 'Финиш' : 'Дальше'}
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