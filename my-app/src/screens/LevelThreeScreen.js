import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_THREE_STEPS = [
 {
    id: 1,
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
    id: 2,
    subTitle: 'Суперприём Рассрочка',
    text: 'Представь: в магазине продается телефон  за 60 монет.Если копить очень долго, а телефон срочно нужен, ты можешь взять в рассрочку. Ты забираешь телефон сегодня, но платишь за него частями: например, по 20 монет каждый месяц без переплат банку.',
    // image: require('../../assets/rassrochkasmart.png'),
    question: 'Как работает «Рассрочка»?',
    options: [
      { text: 'Ты забираешь товар сразу, а платишь за него частями в течение нескольких месяцев без переплат', isCorrect: true },
      { text: 'Продавец дарит тебе телефон бесплатно, потому что ты агент Финпига', isCorrect: false },
      { text: 'Ты должен заплатить за велосипед три раза полную стоимость', isCorrect: false }
    ]
  },
    {
    id: 3,
    subTitle: 'Секрет Рассрочки от Финпига',
    text: 'Ты берёшь в Рассрочку крутой велик. Магазин может брать за это крошечный процент, разделяя сумму на части. Но суперагент Финпиг знает шпионский лайфхак досрочного погашения: если каждый месяц отдавать банку чуть больше монет, чем написано в минимальном чеке, ты закроешь долг гораздо быстрее и почти ничего не переплатишь!',
    // image: require('../../assets/rassrochkasmart.png'),
    question: 'Какой суперприём поможет суперагенту сэкономить монеты при выплате рассрочки?',
    options: [
      { text: 'Платить как можно меньше и растянуть долг на 100 лет', isCorrect: false },
      { text: 'Использовать досрочное погашение — отдавать каждый месяц чуть больше монет, чтобы быстрее закрыть долг и не переплачивать проценты', isCorrect: true },
      { text: 'Просто спрятаться от банка в Арктике и вообще перестать отдавать монеты', isCorrect: false }
    ]
  },
  {
    id: 4,
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
    id: 5,
    subTitle: 'Кредит — ловушка Хотюна',
    text: 'Когда взрослые хотят купить что-то очень большое (например, квартиру), они берут Кредит в банке. Но Хотюн караулит и тут! Он шепчет взрослым: "Возьмите кредит на огромный телевизор или золотой самокат!". Помни: Кредит — платная услуга. Банк дает деньги, но вернуть придется гораздо больше',
    // image: require('../../assets/credittrap.png'),
    question: 'Что нужно сделать, чтобы не попасть в ловушку Хотюна с кредитом?',
    options: [
      { text: 'Ничего, банк дарит эти деньги просто за красивую улыбку', isCorrect: false },
      { text: 'Понять, что кредит — это платная услуга, и возвращать придется больше, чем взял', isCorrect: true },
      { text: 'Брать кредит на любую новую игрушку, ведь отдавать можно через 100 лет', isCorrect: false }
    ]
  },
    {
    id: 6,
    subTitle: 'Капкан Хотюна',
    text: 'Хотюн шепчет тебе: "Возьми в банке Кредит и купи этот крутой шпионский самолёт прямо сейчас!". Самолёт стоит 200 монет. Ты берёшь кредит, но банк даёт деньги не бесплатно — за них капают проценты (плата за услугу). В итоге вместо 200 монет тебе придётся вернуть банку целых 320 монет! Твоя чистая переплата Хотюну составит целых 120 монет!',
    // image: require('../../assets/credittrap.png'),
    question: 'Почему за шпионский самолёт стоимостью 200 монет в итоге приходится отдавать 320 монет?',
    options: [
      { text: 'Банк ошибся в расчётах и случайно перепутал цифры в чеке', isCorrect: false },
      { text: 'Кредит — это платная услуга, и ты переплачиваешь банку Проценты за то, что взял чужие деньги', isCorrect: true },
      { text: 'Остальные 120 монет — это секретный подарок директору банка от Финпига', isCorrect: false }
    ]
  },
  {
    id: 7,
    subTitle: 'Умный щит Финпига',
    text: 'Когда кредит — это хорошо? Если мама с папой берут его в банке, чтобы купить машину, чтобы возить тебя в школу и ездить на работу — это умный поступок. Но если кредит берется под гипнозом Хотюна на супер-дорогую приставку, на которую в семье нет денег, такой кредит ухудшает положение и ворует сбережения.',
    question: 'В каком случае кредит оправдан?',
    options: [
      { text: 'Когда деньги берутся на дорогую приставку', isCorrect: false },
      { text: 'Когда они помогают семье или это принесет пользу в будущем', isCorrect: true },
      { text: 'Кредит полезен всегда, ведь тратить чужие деньги очень весело', isCorrect: false }
    ]
  },
    {
    id: 8,
    subTitle: 'Секрет Рассрочки от Финпига',
    text: 'Ты берёшь в Рассрочку крутой велик. Магазин может брать за это крошечный процент, разделяя сумму на части. Но суперагент Финпиг знает шпионский лайфхак досрочного погашения: если каждый месяц отдавать банку чуть больше монет, чем написано в минимальном чеке, ты закроешь долг гораздо быстрее и почти ничего не переплатишь!',
    // image: require('../../assets/rassrochkasmart.png'),
    question: 'Какой суперприём поможет суперагенту сэкономить монеты при выплате рассрочки?',
    options: [
      { text: 'Платить как можно меньше и растянуть долг на 100 лет', isCorrect: false },
      { text: 'Использовать досрочное погашение — отдавать каждый месяц чуть больше монет, чтобы быстрее закрыть долг и не переплачивать проценты', isCorrect: true },
      { text: 'Просто спрятаться от банка в Арктике и вообще перестать отдавать монеты', isCorrect: false }
    ]
  },
    {
    id: 9,
    subTitle: 'Секрет Рассрочки от Финпига',
    text: 'Представь: крутой самокат стоит 60 монет. У тебя нет всей суммы, и магазин предлагает Рассрочку на 6 месяцев по 10 монет в месяц. Но Хотюн добавил туда скрытое условие - дополнительную плату по 2 монеты каждый месяц! \n\nФинпиг включает суперприём «Досрочное погашение»: если вместо 10 монет ты будешь отдавать по 20 монет в месяц, то закроешь рассрочку всего за 3 месяца вместо 6! \n\nДавай посчитаем выгоду: \n• При обычной оплате (6 месяцев) ты переплатишь: 6 месяцев × 2 монеты = 12 монет. \n• При быстрой оплате (3 месяца) ты переплатишь всего: 3 месяца × 2 монеты = 6 монет. \n\nТвоя чистая шпионская экономия составит целых 6 монет!',
    // image: require('../../assets/rassrochkasmart.png'),
    question: 'Почему досрочное погашение рассрочки (по 20 монет вместо 10) помогает суперагенту сэкономить деньги?',
    options: [
      { text: 'Магазин делает скидку просто за то, что ты принёс монеты раньше времени', isCorrect: false },
      { text: 'Ты закрываешь долг быстрее, поэтому платишь скрытую комиссию Хотюна за меньшее количество месяцев и экономишь монеты', isCorrect: true },
      { text: 'Остальные монеты банк забирает себе в качестве штрафа за скорость', isCorrect: false }
    ]
  },
  {
    id: 10,
    type: 'sort',
    subTitle: 'Распредели бюджет',
    text: 'Ты получил 100 монет в подарок. Распредели их по правильным категориям от самой важной для будущего до наименее важной.',
    question: 'Расположи категории от самой важной до наименее важной (сверху вниз):',
    initialItems: [
      { id: 'cat3', text: 'Инвестиции (пусть деньги растут)' },
      { id: 'cat1', text: 'Накопления на важную цель (велосипед)' },
      { id: 'cat4', text: 'Мелкие траты на сладости прямо сейчас' },
    ],
    correctOrder: ['cat1', 'cat3', 'cat4']
  },
  {
    id: 11,
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
    id: 12,
    subTitle: 'Что такое «Взаймы»?',
    text: 'На детской площадке коварный монстр Одолжун шепчет тебе: "Возьми у друга 50 монет на новую жвачку, это же бесплатно!". Но суперагент Финпиг включает защиту и напоминает: взять монеты взаймы — это НЕ подарок! Взаймы — это когда ты берешь чужие деньги на время, но обязан вернуть точно такую же сумму обратно в обещанный срок. Брать чужое всегда легко, а вот отдавать потом придется свои личные заработанные монеты!',
    question: 'Что означает экономическое шпионское правило «взять монеты взаймы»?',
    options: [
      { text: 'Это бесплатный подарок от друга или банка, который можно не возвращать', isCorrect: false },
      { text: 'Это чужие деньги, которые ты берешь на время и обязан вернуть в строго обещанный срок', isCorrect: true },
      { text: 'Это способ быстро стать самым богатым агентом на площадке, ничего не делая', isCorrect: false }
    ]
  },
  {
    id: 13,
    subTitle: 'Капкан множества кредитов',
    text: 'Хотюн расставил опасную ловушку для взрослых. Он загипнотизировал маму и папу и шепчет им: "Возьмите кредит на огромный телевизор, потом кредит на золотой самокат, и еще кредит на супер-отпуск!". Финпиг бьет тревогу: брать много кредитов одновременно — это самый быстрый путь в долговую яму! Каждый новый кредит забирает из семейного бюджета кучу монет в виде переплаты по процентам.',
    question: 'Почему суперагенты Финпига категорически запрещают брать много кредитов одновременно?',
    options: [
      { text: 'Потому что банку станет скучно считать такое большое количество бумажных договоров', isCorrect: false },
      { text: 'Потому что платежи и проценты станут огромными, они заберут все доходы семьи, и монет не останется даже на еду', isCorrect: true },
      { text: 'Потому что тогда кошелек питомца станет слишком тяжелым от пластиковых карт', isCorrect: false }
    ]
  }

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

  const step = LEVEL_THREE_STEPS[currentStepIndex];

  useEffect(() => {
    if (!step) return;
    if (step.type === 'sort') {
      if (reviewMode) {
        // В режиме просмотра сразу выстраиваем верный порядок
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
      console.error('Ошибка прогресса Блока 3:', e);
    }
  };

   const handleOptionPress = async (option) => {
    if (isAnswered || reviewMode) return; 
    setSelectedOption(option);
    setIsAnswered(true);
     if (!reviewMode) {
    await saveProgress(currentStepIndex + 1); 
  }
    if (option.isCorrect) {
      setScore(prev => prev + 1);
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(20);
      }
      Alert.alert("+20 монет летят в твой кошелёк");
    }
  };

  const moveUp = (index) => {
    if (index === 0 || isAnswered || reviewMode) return;
    const newItems = [...sortItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setSortItems(newItems);
  };

  const moveDown = (index) => {
    if (index === sortItems.length - 1 || isAnswered || reviewMode) return;
    const newItems = [...sortItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
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
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(20);
      }
      Alert.alert("+20 монет за правильный план расходов!");
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
    if (currentStepIndex < LEVEL_THREE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (reviewMode) {
        navigation.navigate('BlockThreeScreen');
      } else {
        // ⭐ +1 уровень
        if (bank?.levelUp && bank.level < 4) {
          bank.levelUp();
        }
        navigation.navigate('BlockThreeScreen', { completedStep: LEVEL_THREE_STEPS.length });
      }
    }
  };

   

  const handleExit = async () => {
    navigation.navigate('BlockThreeScreen');
  };


  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>{reviewMode ? 'Выйти ' : 'Выйти'}</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>
          {reviewMode ? `Просмотр: ${currentStepIndex + 1} из ${LEVEL_THREE_STEPS.length}` : `${currentStepIndex + 1} из ${LEVEL_THREE_STEPS.length}`}
        </Text>
        <Text style={styles.scoreText}>🪙 {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
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
                  disabled={isAnswered || reviewMode}>
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
});
