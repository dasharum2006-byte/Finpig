import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useBank } from '../context/BankContext';

// Список предметов для угадывания цен
const ITEMS_DATA = [
  {
    id: 1,
    name: '🥛 Литр молока',
    image: require('../../assets/job.png'), // Замени на свою картинку молока
    correctPrice: 80,
    minPrice: 10,
    maxPrice: 200,
    step: 5
  },
  {
    id: 2,
    name: '💻 Новый игровой ноутбук',
    image: require('../../assets/job.png'), // Замени на свою картинку ноута
    correctPrice: 65000,
    minPrice: 10000,
    maxPrice: 150000,
    step: 1000
  },
  {
    id: 3,
    name: '🛴 Городской самокат',
    image: require('../../assets/job.png'), // Замени на свою картинку самоката
    correctPrice: 4500,
    minPrice: 500,
    maxPrice: 15000,
    step: 100
  }
];

export default function GamePriceGuesser({ navigation }) {
  const bank = useBank();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const item = ITEMS_DATA[currentItemIndex];

  // Стейт для текущего значения ползунка (стартует с середины диапазона)
  const [currentGuess, setCurrentValue] = useState((item.maxPrice + item.minPrice) / 2);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleCheckPrice = () => {
    setIsAnswered(true);
    
    // Считаем разницу в процентах от реальной цены
    const difference = Math.abs(currentGuess - item.correctPrice);
    const percentDiff = (difference / item.correctPrice) * 100;

    if (percentDiff <= 15) {
      // Угадал очень близко (погрешность до 15%)
      setFeedbackText('🔥 Красава! Ты отлично знаешь цену деньгам!');
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(30); // Даем сочную награду за точность
      }
    } else if (currentGuess > item.correctPrice) {
      // Назвал слишком большую цену
      setFeedbackText('⚠️ Ого, это слишком дорого! Тебя пытаются обмануть, вещь стоит дешевле.');
    } else {
      // Назвал слишком маленькую цену
      setFeedbackText('📉 Хм, слишком дёшево! Настоящая качественная вещь стоит дороже.');
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < ITEMS_DATA.length - 1) {
      const nextIndex = currentItemIndex + 1;
      const nextItem = ITEMS_DATA[nextIndex];
      setCurrentItemIndex(nextIndex);
      setCurrentValue((nextItem.maxPrice + nextItem.minPrice) / 2);
      setIsAnswered(false);
      setFeedbackText('');
    } else {
      Alert.alert('Игра окончена! 🏆', 'Ты прошёл все шпионские товары!', [
        { text: 'В меню игр', onPress: () => navigation.navigate('MiniGamesScreen') }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Выйти</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Угадай цену 👁️</Text>
        </View>
        <Text style={styles.scoreText}>🪙 {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
      </View>

      {/* Белый Квадрат с предметом (как книга) */}
      <View style={styles.storyCard}>
        <Text style={styles.subTitle}>Товар №{item.id}</Text>
        <Image source={item.image} style={styles.storyImage} resizeMode="contain" />
        <Text style={styles.storyText}>Перед тобой — {item.name}. Подумай хорошенько, сколько этот предмет может стоить в реальном магазине, чтобы Финпига не обсчитали злодеи!</Text>
      </View>

      {/* Блок управления ползунком */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>Твоё предположение:</Text>
        
        {/* Крупное отображение текущей цены на ползунке */}
        <Text style={styles.priceLabel}>{Math.floor(currentGuess)} рублей</Text>

        <Slider
          style={styles.slider}
          minimumValue={item.minPrice}
          maximumValue={item.maxPrice}
          step={item.step}
          value={currentGuess}
          onValueChange={setCurrentValue}
          disabled={isAnswered}
          minimumTrackTintColor="#E65100"
          maximumTrackTintColor="#E0D4B7"
          thumbTintColor="#5D4037"
        />

        {/* Подписи минимума и максимума по краям */}
        <View style={styles.rangeLabelsRow}>
          <Text style={styles.rangeText}>{item.minPrice} руб</Text>
          <Text style={styles.rangeText}>{item.maxPrice} руб</Text>
        </View>

        {/* Результат проверки */}
        {isAnswered && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.hintText}>{feedbackText}</Text>
            <Text style={styles.realPriceText}>Реальная цена: {item.correctPrice} рублей</Text>
          </View>
        )}
      </View>

      {/* Кнопки действий */}
      {!isAnswered ? (
        <TouchableOpacity style={styles.checkButton} onPress={handleCheckPrice}>
          <Text style={styles.checkButtonText}>Подтвердить цену ✅</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextItem}>
          <Text style={styles.nextButtonText}>
            {currentItemIndex === ITEMS_DATA.length - 1 ? 'Завершить 🏁' : 'Следующий товар ➡️'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#365d69', 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 15,
    position: 'relative',
    height: 50
  },
  backButton: { 
    backgroundColor: '#5D4037', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10,
    zIndex: 10
  },
  backButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 13 
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  scoreText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFE082',
    zIndex: 10
  },
  storyCard: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    marginHorizontal: 20,
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#FFE082' 
  },
  subTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#E65100', 
    marginBottom: 8 
  },
  storyImage: { 
    width: '100%', 
    height: 140, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  storyText: { 
    fontSize: 14, 
    color: '#333', 
    lineHeight: 20,
    textAlign: 'justify' // Выравнивание по краям книги
  },
  questionCard: { 
    backgroundColor: '#FFF8E1', 
    padding: 20, 
    borderRadius: 20, 
    marginHorizontal: 20,
    marginBottom: 15 
  },
  questionText: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#5D4037', 
    marginBottom: 10,
    textAlign: 'center'
  },
  priceLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 15
  },
  slider: {
    width: '100%',
    height: 40
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5
  },
  rangeText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: 'bold'
  },
  feedbackContainer: {
    marginTop: 15,
    alignItems: 'center',
    gap: 6
  },
  hintText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#2E7D32', 
    textAlign: 'center'
  },
  realPriceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#5D4037',
    fontStyle: 'italic'
  },
  checkButton: { 
    backgroundColor: '#3b71af', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginHorizontal: 20,
    marginTop: 5 
  },
  checkButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  nextButton: { 
    backgroundColor: '#E65100', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginHorizontal: 20,
    marginTop: 5 
  },
  nextButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
