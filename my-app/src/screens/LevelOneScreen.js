import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

// Сценарий игры для Уровня 1 (4 интерактивных задания)
const LEVEL_STEPS = [
  {
    id: 1,
    subTitle: 'Задание 1: Откуда взялись деньги? 🪙',
    text: 'Привет! Давным-давно денег не было. Если тебе нужен был топор, а у тебя была корова, тебе приходилось меняться! Но таскать с собой корову очень неудобно. Люди менялись ракушками, и камнями, пока не придумали металлические монеты и бумажные купюры. Деньги — это просто удобный инструмент для обмена!',
    question: 'Что люди использовали вместо денег в древности, чтобы меняться?',
    options: [
      { text: '📱 Смартфоны и пластиковые карты', isCorrect: false },
      { text: '🐚 Красивые ракушки, соль и шкуры', isCorrect: true },
      { text: '🍫 Шоколадки из супермаркета', isCorrect: false }
    ]
  },
  {
    id: 2,
    subTitle: 'Задание 2: Секрет сбережений 🏦',
    text: 'Сбережения — это деньги, которые ты НЕ потратил сразу, а отложил на будущее. Представь, что тебе подарили монетки. Если купить на всё конфеты, они закончатся за день. А если отложить часть, то через месяц можно купить классную настольную игру!',
    question: 'Зачем нужно делать сбережения (откладывать деньги)?',
    options: [
      { text: 'Чтобы они просто пылились в шкафу', isCorrect: false },
      { text: 'Чтобы купить что-то важное и крупное в будущем', isCorrect: true },
      { text: 'Чтобы поскорее всё потратить за один день', isCorrect: false }
    ]
  },
  {
    id: 3,
    subTitle: 'Задание 3: Финансовая цель и «Конверты» 🎯',
    text: 'Финансовая цель — это твоя мечта, на которую нужны деньги (например, велосипед). Чтобы её достичь, нужен план: сколько откладывать каждую неделю. А чтобы не перепутать деньги, в банках используют виртуальные «Конверты» (или накопительные счета). Отдельный конверт на велосипед, отдельный — на вкусняшки!',
    question: 'Что такое "Конверт" в современном банке?',
    options: [
      { text: 'Бумажный пакетик для писем с маркой', isCorrect: false },
      { text: 'Специальный счет, где деньги лежат на конкретную цель', isCorrect: true }
    ]
  },
  {
    id: 4,
    subTitle: 'Задание 4: Охота на Импульсивные траты 🛑',
    text: 'Импульсивные траты — это когда ты видишь у кассы яркую жвачку или игрушку, которую не планировал покупать, и кричишь: "Хочу прямо сейчас!". Из-за таких мелких трат наши конверты на главную мечту быстро пустеют. Главное правило: перед покупкой посчитай до 10 или подожди один день, чтобы понять, нужна ли тебе эта вещь на самом деле.',
    question: 'Как ребенку справиться с импульсивным желанием купить что-то?',
    options: [
      { text: 'Подождать один день и подумать, так ли важна эта вещь', isCorrect: true },
      { text: 'Упасть на пол в магазине и требовать её купить', isCorrect: false }
    ]
  }
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
          <Text style={styles.backText}>🚪 Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Уровень 1</Text>
        <Text style={styles.scoreText}>🪙 +{score * 10}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Карточка с историей */}
        <View style={styles.storyCard}>
          <Text style={styles.subTitle}>{step.subTitle}</Text>
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
    backgroundColor: '#365d69', 
    paddingTop: 50 
},
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 15 
},
  backButton: { 
    backgroundColor: '#5D4037', 
    padding: 8, 
    borderRadius: 10 
},
  backText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
},
  mainTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFF' 
},
  scoreText: { 
    fontSize: 18, 
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
    borderColor: '#FFE082' 
},
  subTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#E65100', 
    marginBottom: 8 
},
  storyText: { 
    fontSize: 15, 
    color: '#333', 
    lineHeight: 22 
},
  questionCard: { 
    backgroundColor: '#FFF8E1', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 20 
},
  questionText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#5D4037', 
    marginBottom: 15 
},
  optionButton: { 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: '#E0D4B7' 
},
  optionText: { 
    fontSize: 14, 
    color: '#333', 
    fontWeight: '500' 
},
  nextButton: { 
    backgroundColor: '#E65100', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10 
},
  nextButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
}
});
