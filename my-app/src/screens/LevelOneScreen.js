import React, { useState } from 'react';
import { StyleSheet, Text,Image, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

// Сценарий игры для Уровня 1 
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
      { text: 'Чтобы купить что-то важное  в будущем', isCorrect: true },
      { text: 'Чтобы поскорее всё потратить за один день', isCorrect: false }
    ]
  },
  {
    id: 4,
    subTitle: 'Копим на мечту',
    text: 'Представь: ты очень хочешь новый телефон. Это твоя финансовая цель — большая покупка, для которой нужно накопить деньги. Можно откладывать понемногу каждую неделю и следить, как сумма растёт. А чтобы деньги не потерялись, в банке можно создать виртуальный «Конверт» —  место для накоплений на конкретную мечту. Например, один конверт — на велосипед, другой — на подарок',
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
];

export default function LevelOneScreen({ navigation }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const step = LEVEL_STEPS[currentStepIndex];

  const handleOptionPress = (option) => {
    if (isAnswered) return; // Запрещаем менять ответ
    setSelectedOption(option);
    setIsAnswered(true);
    if (option.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextStep = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    
    if (currentStepIndex < LEVEL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Конец уровня
      alert(`Уровень пройден,твой результат: ${score + (selectedOption?.isCorrect ? 1 : 0)} из ${LEVEL_STEPS.length}. На твой баланс начислено 50 монет`);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Уровень 1</Text>
        <Text style={styles.scoreText}>🪙 +{score * 10}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Карточка с историей */}
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step.subTitle}</Text>
          <Image 
            source={step.image} 
            style={[styles.commonImageSettings, styles[step.imageStyle]]}
            resizeMode="contain" 
          />

          <Text style={styles.storyText}>{step.text}</Text>
        </View>

        {/* Блок вопроса */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{step.question}</Text>

          {/* Варианты ответов */}
          {step.options.map((option, index) => {
            let buttonStyle = styles.optionButton;
            let textStyle = styles.optionText;

            if (isAnswered) {
              if (option.isCorrect) {
                buttonStyle = { ...styles.optionButton, backgroundColor: '#C8E6C9', borderColor: '#4CAF50' }; // Зеленый для правильного
              } else if (selectedOption?.text === option.text) {
                buttonStyle = { ...styles.optionButton, backgroundColor: '#FFCDD2', borderColor: '#F44336' }; // Красный для ошибки
              }
            }
            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Кнопка Далее */}
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
  container: { 
    flex: 1, 
    backgroundColor: '#3c89a0dc', 
    paddingTop: 30 
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  backButton: { 
    backgroundColor: '#3b71af', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  backText: { 
    color: '#FFF', 
    fontWeight: 'bold',
    fontSize: 14
  },
  mainTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 5
  },
  scoreText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#83817a',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    overflow: 'hidden'
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  storyCard: { 
    backgroundColor: '#FFF', 
    padding: 10, 
    width: '100%',
    borderRadius: 24, 
    marginBottom: 20, 
    borderWidth: 2, 
    overflow: 'hidden',
    borderColor: '#82aeff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  subTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#006be6', 
    marginBottom: 1,
    textAlign: 'center',
    paddingHorizontal: 18,
  },


  commonImageSettings: {
    alignSelf: 'center',
    borderRadius: 16, 
    marginBottom: 1,
  },
  storyText: { 
    fontSize: 18, 
    color: '#333', 
    lineHeight: 24, 
    fontWeight: '500',
    textAlign: 'justify',
    // marginLeft: 10,
  },
  storyImageTribe: {  
    width: '90%', 
    height: 170, 
  },
  storyImageShark: {  
    width: '100%', 
    height: 160, 
  },
  storyImagehotun: {  
    width: '100%', 
    height: 160, 
  },


  storyImagevelosiped: {
    width: '100%',
    height: 170,
  },

storyImagephone: {
    width: '100%',
    height: 170,
  },
    questionCard: { 
    backgroundColor: '#ebeaea', 
    padding: 15, 
    borderRadius: 24, 
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#a8a8a6'
  },
  questionText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#37415d', 
    marginBottom: 5,
    marginTop: -4,
    lineHeight: 22,
    textAlign: 'justify',
  },
  optionButton: { 
    backgroundColor: '#FFF', 
    padding: 10, 
    borderRadius: 14, 
    marginBottom: 5, 
    borderWidth: 2, 
    borderColor: '#8b8b89',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  optionText: { 
    fontSize: 14, 
    color: '#333', 
    fontWeight: '600',
    lineHeight: 20
  },
  nextButton: { 
    backgroundColor: '#E65100', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  nextButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
