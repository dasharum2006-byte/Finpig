import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';
const { width } = Dimensions.get('window');

const LEVEL_TWO_STEPS = [
  {
    id: 1,
    subTitle: 'Деньги не растут на деревьях',
    text: 'Родители ходят на работу, выполняют свои обязанности и получают за труд зарплату. Твой главный ресурс сейчас — это время и силы, а твоя главная "работа" — это учёба и  помощь дома.',
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
    text: 'Внимание! Коварный Хотюн пробрался в магазин и развесил огромные вывески: «СКИДКА 50%!» и «3 по цене 2!». Он пытается загипнотизировать тебя, чтобы ты потратил все монеты. Но Финпиг знает: если вещь тебе изначально была не нужна, то покупая её даже по скидке, ты просто теряешь деньги',
    // image: require('../../assets/hotunsales.png'),
    question: 'Как супер-агенту победить ловушку Хотюна с яркими скидками?',
    options: [
      { text: 'Сразу бежать на кассу и скупать всё, пока скидка не кончилась', isCorrect: false },
      { text: 'Включить защиту, сделать вдох и спросить себя: "А мне это правда нужно?"', isCorrect: true },
      { text: 'Купить сразу три штуки и даже больше, ведь это же выгодно', isCorrect: false },
    ]
  },
  {
    id: 3,
    subTitle: 'Монстр Долгов «Одолжун»',
    text: 'На детской площадке прячется хитрый монстр Одолжун. Он шепчет: "Возьми чужие монеты у друга на шоколадку, это же бесплатно!". Денежный долг — это когда ты берешь чужие монеты на время, и обязан вернуть ту сумму, которую взял. Брать легко, а отдавать трудно. Отдавать долг другу нужно строго в обещанный срок!',
    // image: require('../../assets/odolzhun.png'),
    question: 'Что шериф Финпиг говорит про денежный долг?',
    options: [
      { text: 'Это бесплатный подарок от друга, возвращать ничего не нужно', isCorrect: false },
      { text: 'Это чужие деньги, их берут на время и обязательно нужно вернуть вовремя', isCorrect: true },
      { text: 'Долг можно вообще не отдавать, если просто убежать', isCorrect: false }
    ]
  },
    {
    id: 4,
    subTitle: 'Одолжун и коварные риски',
    text: 'Когда ты даешь свои личные карманные монеты в долг другу, тебя подстерегает Финансовый Риск. Одолжун может загипнотизировать друга: тот потеряет кошелек или забудет про долг. Перед тем как одолжить кому-то деньги, подумай о рисках и реши, готов ли ты подождать когда друг вернет деньги.',
    image: require('../../assets/pinguinlook.png'),
    question: 'Что такое финансовый риск?',
    options: [
      { text: 'Это стопроцентная гарантия, что тебе вернут в три раза больше', isCorrect: false },
      { text: 'Это опасность того, что у должника возникнут проблемы и он не сможет вернуть долг вовремя', isCorrect: true },
      { text: 'Это секретный подарок, который выдает директор банка за доброту', isCorrect: false }
    ]
  },
  {
    id: 5,
    type: 'sort',
    subTitle: 'Проверка Банкира',
    text: 'Директор банка выдает кредиты только на серьезные цели, которые полезны семье. Помоги банкиру расставить цели от самых ВАЖНЫХ (наверху) до капризов Хотюна (внизу):',
    question: 'Расположи цели от самой важной до самой ненужной:',
    initialItems: [
      { id: 'goal4', text: 'Покупка пятого светящегося поп-ита, потому что Хотюн так хочет' },
      { id: 'goal1', text: 'Покупка квартиры для семьи, чтобы у каждого была своя комната' },
      { id: 'goal2', text: 'Оплата учебы старшего брата' },
      { id: 'goal3', text: 'Покупка огромной плюшевой акулы на все деньги' },
    ],
    correctOrder: ['goal1', 'goal2', 'goal3', 'goal4']
  },
  {
    id: 6,
    subTitle: 'Шпионский счет сдачи',
    text: 'Ты покупаешь яблоко за 10 монет и сувенир за 30 монет. Ты даешь торговцу монету в 100 единиц. Одолжун пытается отвлечь тебя, чтобы ты не посчитал сдачу! Всегда проверяй чек и пересчитывай монеты прямо у лавки.',
    // image: require('../../assets/shopsnow.png'),
    question: 'Сколько монет должен вернуть тебе честный продавец, если ты победил невнимательность?',
    options: [
      { text: '60 монет', isCorrect: true },
      { text: 'Ничего', isCorrect: false },
      { text: '40 монет', isCorrect: false }
    ]
  },
  {
    id: 7,
    subTitle: 'Разведка цен',
    text: 'Сравнение цен — главный враг Хотюна.',
    question: 'Хотюн шепчет: "Купи этот самокат в первой же лавке прямо сейчас". Но суперагент Финпиг включает режим разведки. Он сравнивает цены в разных магазинах и на современных маркетплейсах в интернете. Сравнение цен — главное оружие против Хотюна',
    options: [
      { text: 'Чтобы просто подольше походить по магазинам и устать', isCorrect: false },
      { text: 'Чтобы найти товар по выгодной цене и сэкономить деньги', isCorrect: true }
    ]
  },
     {
    id: 8,
    subTitle: 'Ловушка коварных ссылок',
    text: 'Внимание, кибератака! На игровом сайте всплыл яркий баннер: "КЛИКНИ СЮДА! Твой пингвин выиграл 5000 монет!". Коварный Хотюн пытается заманить тебя на подозрительный сайт-двойник. Клики по рекламным баннерам и переходы по неизвестным ссылкам — это самый быстрый способ поймать вирус, который украдет логины,пароли и все твои деньги',
    question: 'Что по инструкции Финпига нужно сделать, если в интернете всплыло окно с обещанием лёгких бесплатных монет?',
    options: [
      { text: 'Сразу кликнуть, ввести логин, пароль и номер карты для получения приза', isCorrect: false },
      { text: 'Ни в коем случае не кликать на баннер, закрыть страницу и сообщить родителям', isCorrect: true },
      { text: 'Переслать эту ссылку всем своим друзьям, чтобы они тоже кликнули', isCorrect: false }
    ]
  },
   {
    id: 9,
    subTitle: 'Шпионский шифр карты ',
    text: 'Вместо мешка с тяжёлыми монетами взрослые используют банковскую карту. Но Хотюн караулит и здесь! Он пытается подглядеть секретные элементы карты. Шериф Финпиг напоминает: никогда и никому нельзя говорить три цифры с обратной стороны карты (CVC-код) и пароль из СМС, даже если кто-то представляется директором банка!',
    // image: require('../../assets/pictirequestion/bank_card_spy.png'), 
    question: 'Какие данные банковской карты нужно держать в строжайшем секрете от всех?',
    options: [
      { text: 'Имя владельца карты, написанное на лицевой стороне', isCorrect: false },
      { text: 'ПИН-код, CVC-код сзади карты и секретные пароли из СМС от банка', isCorrect: true },
      { text: 'Название самого банка и цвет пластика', isCorrect: false }
    ]
  },
  {
    id: 10,
    subTitle: 'Секреты семейной базы',
    text: 'Коварный Одолжун пытается разузнать шпионские секреты твоей семьи. На детской площадке или в чате игры он выспрашивает: "А сколько зарабатывают твои родители? Где дома лежит заначка? А когда вы уедете в отпуск?". Шериф Финпиг предупреждает: доходы семьи, количество наличных денег в доме и планы поездок — это строго конфиденциальная информация. Рассказывать её посторонним людям нельзя ни в коем случае!',
    // image: require('../../assets/pictirequestion/hotun.jpg'),
    question: 'Как суперагент должен поступить, если чужой человек или друг в интернете расспрашивает о доходах родителей или местах хранения наличных денег?',
    options: [
      { text: 'Честно всё рассказать, чтобы похвастаться богатством', isCorrect: false },
      { text: 'Ничего не говорить, прекратить разговор и сразу рассказать родителям об этих расспросах', isCorrect: true },
      { text: 'Назвать случайные числа и придумать сказку', isCorrect: false }
    ]
  },
  {
    id: 11,
    subTitle: 'Ловушка "Срочно переведи монеты!"',
    text: 'Вдруг в соцсетях тебе пишет знакомый или друг: "Ой, я попал в беду, переведи мне скорее 100 монет на этот номер!". Или незнакомый взрослый у кассы просит: "Переведи мне со своей карты, а я тебе потом отдам". Настоящие взрослые НИКОГДА не попросят финансовой помощи или переводов у ребёнка! Это 100% взломанный аккаунт или уловка Хотюна.',
    // image: require('../../assets/pictirequestion/hotun.jpg'),
    question: 'Что нужно сделать, если в личные сообщения пришла экстренная просьба от друга срочно перевести деньги?',
    options: [
      { text: 'Быстро отправить монеты, ведь друзьям надо помогать без лишних вопросов', isCorrect: false },
      { text: 'Не переводить деньги. Заблокировать контакт и перезвонить другу по обычному телефону, чтобы проверить, не взломали ли его', isCorrect: true },
      { text: 'Начать плакать и просить монеты у незнакомцев на улице', isCorrect: false }
    ]
  },
  {
    id: 12,
    subTitle: 'Шпионский сейф для карты ',
    text: 'Детская банковская карта — это личный ключ от твоего цифрового кошелька. Хотюн ждёт, когда ты оставишь её на столе в школе, дашь подержать другу или положишь в задний карман брюк, откуда она легко выпадет. Финпиг даёт чёткую инструкцию: хранить карту нужно в безопасном месте, недоступном для посторонних глаз (в кошельке или закрытом кармане рюкзака), и никогда не передавать её в руки другим детям.',
    // image: require('../../assets/pictirequestion/bank_card_spy.png'),
    question: 'Какое правило безопасного хранения детской банковской карты является главным?',
    options: [
      { text: 'Носить карту в руке, чтобы все видели, какой ты крутой шпион', isCorrect: false },
      { text: 'Хранить карту в закрытом потайном кармане и никогда не давать её в руки посторонним и друзьям', isCorrect: true },
      { text: 'Оставлять карту на парте в школе, ведь одноклассники — твоя команда', isCorrect: false }
    ]
  },
  {
    id: 13,
    subTitle: 'Покупки в интернете',
    text: 'Ты нашёл на маркетплейсе супер-скин или шпионский гаджет. Хотюн шепчет: "Купи сам потихоньку, пока родители не видят!". Но правила этики и безопасности в цифровой среде гласят: ЛЮБЫЕ онлайн-платежи и покупки в интернете дети 7-11 лет должны совершать ТОЛЬКО вместе с родителями. Самостоятельный ввод карты на незнакомых сайтах приведёт к полной потере семейных сбережений.',
    // image: require('../../assets/pictirequestion/phone.jpg'),
    question: 'С кем суперагент имеет право совершать онлайн-покупки в интернет-магазинах?',
    options: [
      { text: 'Самостоятельно, ведь это мои личные карманные деньги', isCorrect: false },
      { text: 'Строго вместе с родителями или другими значимыми взрослыми', isCorrect: true },
      { text: 'С друзьями со двора, чтобы вместе выбрать лучший товар', isCorrect: false }
    ]
  },
  {
    id: 14,
    type: 'sort',
    subTitle: 'Валюты',
    text: 'Суперагент Финпиг отправляется в заграничную командировку! В каждой стране действуют свои национальные деньги — Иностранная Валюта. Чтобы расплатиться в Египте или Китае, нужно изучить курс валют и сопоставить страны с их монетами. Расположи валюты в правильном порядке (сверху вниз): Рубль, Доллар, Юань, Фунт',
    question: 'Наведи порядок на международной шпионской таможне (сверху вниз):',
    initialItems: [
      { id: 'step3', text: 'Валюта загадочного Китая 🇨🇳' },
      { id: 'step1', text: 'Российский Рубль 🇷🇺' },
      { id: 'step4', text: 'Монеты Великобритании 🇬🇧' },
      { id: 'step2', text: 'Валюта для поездок в США 🇺🇸' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4']
  },
  {
    id: 15,
    subTitle: 'Обмен валюты',
    text: 'Ты прилетел в другую страну, и у тебя в кармане только рубли, а в местном магазине просят юани. Чтобы пользоваться иностранными деньгами, их нужно обменять в банке. Банк меняет деньги по специальному правилу — это называется Валютный Курс (цена одной валюты, выраженная в другой). Курс постоянно меняется',
    // image: require('../../assets/pictirequestion/shopsnow.png'),
    question: 'Что такое "валютный курс", с которым сталкивается шпион в путешествиях?',
    options: [
      { text: 'Это специальный подарок, который иностранный банк выдаёт бесплатно', isCorrect: false },
      { text: 'Это цена одной валюты, по которой её можно обменять на другую валюту в банке', isCorrect: true },
      { text: 'Это общая сумма всех денег, которые лежат в кошельке у питомца', isCorrect: false }
    ]
  }
  
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
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(20);
      }
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

  // const finishCurrentStep = async () => {
  //     Alert.alert(
  //       'Блок 2 пройден',
  //       'Все 10 вопросов пройдены!',
  //       [{
  //         text: 'Круто',
  //         onPress: () => navigation.navigate('BlockTwoScreen', { completedStep: 10 })
  //       }]
  //     );
  //   }
  // };
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
        // ⭐ +1 уровень
        if (bank?.levelUp && bank.level < 3) {
          bank.levelUp();
        }
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
              {isAnswered && !isSortCorrect && showCorrectHint && (
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
});
