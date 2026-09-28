import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBank } from '../context/BankContext';

const { width } = Dimensions.get('window');

const LEVEL_STEPS = [
  {
    id: 1,
    subTitle: 'Откуда взялись деньги?',
    text: 'Давным-давно никаких монет и банкнот не было. Людям в прошлом приходилось меняться! Если тебе нужны были дрова для костра, ты менял их на глиняные горшки, а горшки — на домашних свинок. Такой обмен вещами называется бартером. Но таскать с собой кучу свинок для обмена было ужасно неудобно!',
    image: require('../../assets/pictirequestion/twopeoplepig.png'),
    question: 'Что люди использовали вместо денег в древности, чтобы меняться?',
    options: [
      { text: 'Смартфоны и дома', isCorrect: false },
      { text: 'Любые вещи, еду, домашних животных', isCorrect: true },
      { text: 'Шоколадки из супермаркета', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Почему появились деньги?',
    text: 'У тебя есть большая  плюшевая акула. На детской площадке ты увидел леденец у мальчика и захотел его съесть. Он тебе предложил обмен - : "Поменяй акулу на этот леденец.',
    image: require('../../assets/pictirequestion/shark.png'),
    question: 'Как ты думаешь, выгодно ли менять плюшевую акулу на леденец, если тебе захотелось сладкого?',
    options: [
      { text: 'Да, ведь я хочу леденец прямо сейчас', isCorrect: false },
      { text: 'Нет, акула стоит намного дороже. Это невыгодный обмен', isCorrect: true },
      { text: 'Да, акулу всё равно нельзя съесть', isCorrect: false }
    ]
  },
  {
    id: 3,
    subTitle: 'Сбережения',
    text: 'Сбережения — это деньги, которые ты не потратил сразу, а отложил на будущее. Тебе подарили деньги. Если купить на них конфеты, деньги закончатся за день. А если положить их в копилку и каждый раз добавлять туда новые деньги, то скоро можно будет купить велосипед.',
    image: require('../../assets/pictirequestion/velosiped.png'),
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
    text: 'Представь: ты очень хочешь новый телефон. Это твоя финансовая цель — большая покупка, для которой нужно накопить деньги. Можно откладывать понемногу каждую неделю и следить, как сумма растёт. А чтобы деньги не потерялись, в банке можно создать виртуальный «Конверт» — место для накоплений на конкретную мечту.',
    // image: require('../../assets/pictirequestion/phone.jpg'),
    question: 'Что такое "Конверт" в современном банке?',
    options: [
      { text: 'Конвертик для писем с маркой', isCorrect: false },
      { text: 'Отдельный счет, где деньги лежат на конкретную цель', isCorrect: true }
    ]
  },
   {
    id: 5,
    type: 'sort',
    subTitle: 'Задание 5: План «Подарок маме»',
    text: 'Чтобы накопить на подарок маме и грамотно распределить карманные расходы, суперагенту нужен четкий финансовый план. Расставь действия в правильном порядке (от подготовки до финала):',
    question: 'Расположи шаги шпионского плана сверху вниз:',
    initialItems: [
      { id: 'step4', text: 'Купить подарок и порадовать маму на день рождения!' },
      { id: 'step1', text: 'Узнать точную стоимость подарка в интернет-магазине' },
      { id: 'step2', text: 'Посчитать, сколько недель осталось до праздника' },
      { id: 'step3', text: 'Регулярно откладывать часть карманных монет в копилку-сейф' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4']
  },
  {
    id: 6,
    subTitle: 'Осторожно: Фальшивка',
    text: 'Иногда Хотюн пытается подкинуть фальшивые, ненастоящие купюры. Настоящие деньги имеют водяные знаки, которые видно. Финпиг даёт чёткую шпионскую инструкцию: если тебе кажется, что бумажная купюра странная или поддельная, её обязательно нужно показать взрослым!',
    // image: require('../../assets/pictirequestion/fake_money_trap.png'), 
    question: 'Что по шпионской инструкции Финпига нужно сделать, если ты обнаружил подозрительную или фальшивую купюру?',
    options: [
      { text: 'Попробовать быстро купить на неё конфет, пока продавец не заметил', isCorrect: false },
      { text: 'Ничего не покупать и сразу обратиться за помощью к родителям или взрослым', isCorrect: true },
      { text: 'Выбросить её в урну на улице и никому об этом не говорить', isCorrect: false }
    ]
  },
  {
    id: 7,
    subTitle: 'Ловушка Монстра «Хотюна»',
    text: 'Внимание! В супермаркете у кассы прячется монстр — Хотюн. Он специально раскладывает на нижних полках самые яркие жвачки, поп-иты и шоколадки, чтобы загипнотизировать тебя и заставить купить. Твоё главное шпионское оружие против него — "Заклинание 10 секунд".',
    // image: require('../../assets/pictirequestion/hotun.jpg'),
    question: 'Какой суперприем поможет агенту победить Хотюна у кассы магазина?',
    options: [
      { text: 'Упасть на пол и требовать купить жвачку', isCorrect: false },
      { text: 'Включить таймер на 10 секунд и спросить себя: "Это моя цель или ловушка?"', isCorrect: true },
      { text: 'Быстро съесть всё прямо в магазине', isCorrect: false }
    ]
  },
    {
    id: 8,
    subTitle: 'Нужды и Хотелки',
    text: 'Суперагент Финпиг начинает расследование! Чтобы эффективно управлять бюджетом, нужно строго разделять траты. Нужды — это то, без чего нельзя прожить (еда, лекарства, оплата жилья). Хотелки — это капризы, которые подкидывает Хотюн (новые скины в играх, гора жвачек, гигантские плюшевые игрушки).',
    question: 'Что из этого списка является обязательной "Нуждой", которую необходимо оплатить в первую очередь?',
    options: [
      { text: 'Покупка новой игровой приставки по скидке от Хотюна', isCorrect: false },
      { text: 'Полезные продукты питания, оплата проезда и сезонная одежда', isCorrect: true },
      { text: 'Огромный праздничный торт и пять пачек мармелада', isCorrect: false }
    ]
  },
   {
    id: 9,
    subTitle: 'Обман в магазине',
    text: 'Ты проверил чек у кассы и заметил, что хитрый Одолжун загипнотизировал продавца! Тебе пробили лишнюю жвачку, которую ты не брал, или неправильно посчитали сдачу. Cуперагенты никогда не устраивают истерик и не плачут. Нужно спокойно и вежливо показать чек продавцу и объяснить, где допущена ошибка.',
    // image: require('../../assets/pictirequestion/shopsnow.png'), 
    question: 'Что по инструкции Финпига нужно сделать, если тебя обсчитали или обманули на кассе?',
    options: [
      { text: 'Устроить громкий скандал, начать кричать на весь магазин и плакать', isCorrect: false },
      { text: 'Спокойно, вежливо показать чек продавцу и попросить пересчитать сдачу или вернуть деньги за лишний товар', isCorrect: true },
      { text: 'Ничего не говорить, обидеться, уйти домой и больше никогда не покупать еду', isCorrect: false }
    ]
  },
  {
    id: 10,
    subTitle: 'Экзамен Банкира',
    text: 'Если после оплаты всех обязательных нужд в конце месяца у вас в кошельке остались свободные монеты ты победил Тратозавра и Хотюна. Остаток монет — это не повод сразу бежать за чипсами, это супер-возможность  достигнуть твою главную цель или мечту.',
    question: 'Куда правильнее всего направить оставшиеся в конце месяца свободные монеты?',
    options: [
      { text: 'Сразу спустить всё на мелкие пластиковые безделушки у кассы', isCorrect: false },
      { text: 'Отправить в конверт накоплений на большую мечту или пополнить подушку безопасности', isCorrect: true },
      { text: 'Закопать в песок во дворе и надеяться, что вырастет денежное дерево', isCorrect: false }
    ]
  },
   {
    id: 11,
    subTitle: 'Супермаркет',
    text: 'Суперагент Финпиг отправляется на закупку припасов. Хотюн раскидал у кассы ловушки — шоколадки и дорогие чипсы. Чтобы покупать продукты питания выгодно и не тратить лишнего, нужно всегда заранее составлять список покупок дома, сытно поесть перед выходом и строго сравнивать цены за один килограмм товара',
    // image: require('../../assets/pictirequestion/shopsnow.png'),
    question: 'Какое главное правило поможет агенту выгодно купить продукты питания в магазине и победить Хотюна?',
    options: [
      { text: 'Брать самые дорогие товары на верхних полках, потому что они самые вкусные', isCorrect: false },
      { text: 'Идти в магазин сытым, строго со списком покупок и сравнивать цену товара по весу и качеству', isCorrect: true },
      { text: 'Скупать все сладости у кассы, на которых наклеен яркий значок скидки', isCorrect: false }
    ]
  },
  {
    id: 12,
    subTitle: 'Спецоперация в автобусе',
    text: 'Финпигу нужно срочно добраться в шпионский штаб на общественном транспорте (автобусе или метро). Коварный Одолжун шепчет: "Проскочи бесплатно без билета, никто не заметит!". Но Финпиг предупреждает: оплата проезда — это обязанность каждого пассажира. Самый безопасный способ оплатить проезд — приложить детскую банковскую карту или специальную транспортную карту к валидатору у двери.',
    // image: require('../../assets/pictirequestion/fake_money_trap.png'),
    question: 'Как суперагент должен правильно и безопасно оплатить свой проезд в общественном транспорте?',
    options: [
      { text: 'Попробовать проехать "зайцем" бесплатно и спрятаться от контролёра за сиденьем', isCorrect: false },
      { text: 'Приложить свою банковскую или транспортную карту к валидатору и дождаться зелёной галочки оплаты', isCorrect: true },
      { text: 'Отдать наличные монеты случайному пассажиру в салоне автобуса', isCorrect: false }
    ]
  },
  {
    id: 13,
    type: 'sort',
    subTitle: 'Эволюция денег',
    text: 'Деньги бывают самыми разными, и шпион должен уметь распознавать их виды. Расставь виды денег в правильном историческом порядке — от самых древних (наверху) до самых современных цифровых технологий (внизу):',
    question: 'Расположи виды денег от древности до наших дней (сверху вниз):',
    initialItems: [
      { id: 'step3', text: 'Электронные деньги — монеты на твоей банковской карте' },
      { id: 'step1', text: 'Древний Бартер — обмен дровами,тканями,посудой' },
      { id: 'step4', text: 'Цифровые деньги — бесконтактная оплата телефоном и QR-кодами' },
      { id: 'step2', text: 'Наличные деньги — бумажные банкноты и металлические монеты ' },
    ],
    correctOrder: ['step1', 'step2', 'step3', 'step4']
  },
  {
    id: 14,
    subTitle: 'Тайна  кошелька',
    text: 'Наличные деньги — это то, что мы можем потрогать руками. Бумажные прямоугольники называются банкнотами или купюрами, а металлические кругляши — монетами. Хотюн пытается запутать тебя и подменить понятия. Помни: у каждой банкноты есть свой Номинал — число, написанное на ней (например, 100 рублей или 500 рублей), которое показывает её реальную силу и стоимость в магазине.',
    // image: require('../../assets/pictirequestion/fake_money_trap.png'),
    question: 'Что такое "номинал" бумажной банкноты, которую ты держишь в руках?',
    options: [
      { text: 'Размер бумажки и длина защитной нити внутри неё', isCorrect: false },
      { text: 'Числовое значение, написанное на купюре, которое показывает её денежную стоимость', isCorrect: true },
      { text: 'Год, в котором эта банкнота была напечатана на станке', isCorrect: false }
    ]
  },
  {
    id: 15,
    subTitle: 'Невидимые монеты ',
    text: 'Безналичные деньги — это монеты, которые лежат в банке на твоём цифровом счёте. Ты не можешь потрогать их руками, но они отображаются на экране смартфона и на твоей детской карте. Одолжун уверяет, что безналичные деньги ненастоящие и их можно тратить на любую ерунду. Не верь ему! Безналичные деньги имеют точно такую же ценность, как и бумажные в кошельке.',
    // image: require('../../assets/pictirequestion/phone.jpg'),
    question: 'Чем безналичные деньги на карте отличаются от наличных монет в твоем кармане?',
    options: [
      { text: 'Они полностью бесплатные и их не нужно зарабатывать на работе', isCorrect: false },
      { text: 'Они хранятся в цифровом виде на банковском счёте, и мы управляем ими с помощью карты или телефона', isCorrect: true },
      { text: 'На них нельзя купить настоящую еду в обычном магазине у дома', isCorrect: false }
    ]
  },
  {
    id: 16,
    subTitle: 'Чек-ап расходов ',
    text: 'После того как ты купил продукты на 40 монет и оплатил проезд на автобусе за 10 монет, продавец выдаёт тебе бумажную ленту — Чек. Чек — это твой официальный документ суперагента. Он доказывает, что ты честно оплатил покупку. Всегда забирай и сохраняй чеки, чтобы в конце недели пересчитать свои расходы и проверить, не обсчитал ли тебя Хотюн!',
    // image: require('../../assets/pictirequestion/shopsnow.png'),
    question: 'Зачем суперагенту Финпигу нужно обязательно брать и изучать магазинный чек?',
    options: [
      { text: 'Чтобы просто сделать из него бумажный самолётик и запустить во дворе', isCorrect: false },
      { text: 'Чтобы контролировать свои расходы, проверять правильность цен и иметь доказательство покупки', isCorrect: true },
      { text: 'Чтобы показать его Хотюну и напугать монстра цифрами', isCorrect: false }
    ]
  }
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

  const [sortItems, setSortItems] = useState([]);
  const [isSortCorrect, setIsSortCorrect] = useState(false);
  const step = LEVEL_STEPS[currentStepIndex];
  const [showCorrectHint, setShowCorrectHint] = useState(false);

  useEffect(() => {
    if (step && step.type === 'sort') {
      setSortItems(step.initialItems);
      setIsAnswered(false);
    }
  }, [currentStepIndex]);
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
    if (step) {
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
    }
  }, [currentStepIndex, reviewMode, step]);


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
    if (index === 0 || isAnswered || reviewMod) return;
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
    if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(20);
      }
  }
    if (currentStepIndex < LEVEL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      // setSelectedOption(null);
      // setIsAnswered(false);
      // setShowCorrectHint(false);
    } else {
      if (reviewMode) {
        navigation.navigate('BlockOneScreen');
      // bank.addCoins(20);
      } else {
      Alert.alert(
        'Отлично 🎉',
        `Все ${LEVEL_STEPS.length} вопросов пройдены! На твой баланс начислено 20 монет`,
        [{
          text: 'К играм',
          onPress: () => navigation.navigate('BlockOneScreen')
         }]
        );
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
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>{currentStepIndex + 1} из {LEVEL_STEPS.length}</Text>
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
                  disabled={isAnswered}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === LEVEL_STEPS.length - 1 ? 'Завершить вопросы 🎉' : 'Дальше'}
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
