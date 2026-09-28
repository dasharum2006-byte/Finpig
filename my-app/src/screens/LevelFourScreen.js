import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_FOUR_STEPS = [
  {
    id: 1,
    subTitle: 'Права шпиона-потребителя ',
    text: 'Ты купил на рынке гаджет для питомца, но он сломался на следующий день. Хотюн шепчет: "Ты сам виноват, забудь про монеты!". У каждого покупателя есть Права потребителя. Это законное право на качественный товар. Если вещь оказалась бракованной, ты имеешь полное право вежливо попросить продавца заменить её или вернуть монеты.',
    question: 'Какое главное право есть у суперагента при покупке любого товара или услуги?',
    options: [
      { text: 'Право громко кричать и требовать закрыть магазин', isCorrect: false },
      { text: 'Право на качество, безопасность товара и на возврат монет в случае брака', isCorrect: true },
      { text: 'Право забрать любой другой товар бесплатно без спроса', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Зачем платить налоги?',
    text: 'Одолжун ворчит: "Зачем государство собирает налоги? Налоги — это когда у тебя забирают часть монет!". Финпиг включает радар и объясняет: налоги — это обязательные взносы, которые идут на общее благо. Без налогов в твоем игровом городе не построили бы школы, поликлиники, парки для питомцев и не отремонтировали бы дороги.',
    question: 'Почему налоги важны для каждого жителя и для государства?',
    options: [
      { text: 'Чтобы у директора банка было как можно больше золотых монет в подвале', isCorrect: false },
      { text: 'Они идут на строительство и поддержку важных для всех объектов: школ, больниц, дорог и парков', isCorrect: true },
      { text: 'Они нужны просто для красоты и украшения главного здания в городе', isCorrect: false }
    ]
  },
  {
    id: 3,
    subTitle: 'Официальная разведка',
    text: 'Хотюн создал сайт-подделку, который выглядит точь-в-точь как твой Ледяной Банк, и пытается выведать пароли. Перед тем как вводить данные, всегда проверяй адрес сайта в интернете. Официальные сайты госорганов и крупных финансовых организаций (например, Банка России) всегда имеют специальный знак проверки (синюю галочку в поиске) и защищённый замочек в адресной строке.',
    question: 'Как шпион Финпига может отличить официальный и безопасный сайт от опасной подделки Хотюна?',
    options: [
      { text: 'Посмотреть, насколько там яркие картинки со скидками и анимациями', isCorrect: false },
      { text: 'Проверить наличие защищённого адреса (замочка), синей галочки верификации и точного названия без опечаток', isCorrect: true },
      { text: 'Если сайт открылся очень быстро, значит, он точно настоящий', isCorrect: false }
    ]
  },
  {
    id: 4,
    type: 'sort',
    subTitle: 'Госуслуги',
    text: 'В современной цифровой среде многие услуги можно получить онлайн, не выходя из дома — через официальные цифровые сервисы (например, Госуслуги). Расставь шаги шпионской записи питомца на приём к врачу или запись в кружок программирования в правильном порядке (сверху вниз):',
    question: 'Построй правильный алгоритм получения онлайн-услуги (сверху вниз):',
    initialItems: [
      { id: 'step3', text: 'Выбрать нужную услугу (запись к врачу или в кружок)' },
      { id: 'step1', text: 'Открыть официальное проверенное приложение или сайт цифровых услуг' },
      { id: 'step4', text: 'Получить подтверждение и электронный талон на приём' },
      { id: 'step2', text: 'Ввести свои секретные и защищённые данные для входа (логин и пароль)' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4']
  },
  {
    id: 5,
    subTitle: 'Секретный агент',
    text: 'Вдруг в мессенджере тебе пишет аккаунт с аватаркой полиции или директора школы и требует: "Срочно переведи монеты на наш безопасный счёт, на твоих родителей заведено дело!". Финпиг перехватывает сигнал: мошенники очень часто выдают себя за представителей государственных органов, чтобы напугать тебя! Настоящая полиция или банк никогда не будут писать детям в чатах и требовать переводы монет.',
    question: 'Как правильно поступить, если кто-то в чате игры выдаёт себя за полицию или важного начальника и требует деньги?',
    options: [
      { text: 'Испугаться, выполнить команду и быстро отправить монеты на их счёт', isCorrect: false },
      { text: 'Ничего не отправлять, заблокировать чат и сразу всё рассказать родителям для проверки', isCorrect: true },
      { text: 'Начать спорить с ними и пытаться доказать, что они неправы', isCorrect: false }
    ]
  }

];


const STORAGE_KEY = '@block_four_progress_v1';

export default function LevelFourScreen({ navigation, route }) {
  const startIndex = route.params?.startIndex ?? 0;
  const reviewMode = route.params?.reviewMode ?? false;
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(reviewMode);
  const [score, setScore] = useState(0);
  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);
  const bank = useBank();
  const step = LEVEL_FOUR_STEPS[currentStepIndex];

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
      console.error('Ошибка сохранения прогресса Блока 4:', e);
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
      Alert.alert("Отлично! 🧩", "+20 монет за правильный порядок!");
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

    if (currentStepIndex < LEVEL_FOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (reviewMode) {
        navigation.navigate('BlockFourScreen');
      } else {
        navigation.navigate('BlockFourScreen', { completedStep: LEVEL_FOUR_STEPS.length });
      }
    }
  };



  const handleExit = async () => {
    navigation.navigate('BlockFourScreen');
  };

    return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
          <Text style={styles.backText}>{reviewMode ? 'Выйти ' : 'Выйти'}</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>
          {reviewMode ? `Просмотр: ${currentStepIndex + 1} из ${LEVEL_FOUR_STEPS.length}` : `${currentStepIndex + 1} из ${LEVEL_FOUR_STEPS.length}`}
        </Text>
        <Text style={styles.scoreText}>🪙 {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step?.subTitle}</Text>
          {step?.image && <Image source={step.image} style={styles.storyImage} resizeMode="contain" />}
          <Text style={styles.storyText}>{step?.text}</Text>
        </View>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{step?.question}</Text>

          {step?.type === 'sort' ? (
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
                  <Text style={styles.checkButtonText}>Проверить план 🔍</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            step?.options?.map((option, optIndex) => {
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
                  disabled={isAnswered || reviewMode} >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View> 
            {(isAnswered || reviewMode) && (
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
