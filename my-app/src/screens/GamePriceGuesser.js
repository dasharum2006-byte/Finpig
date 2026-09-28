import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useBank } from '../context/BankContext'; 


const ITEMS_DATA = [
  {
    id: 1,
    name: 'Упаковка молока',
    // image: require('../../assets/job.png'), 
    correctPrice: 100,
    minPrice: 10,
    maxPrice: 2000,
    step: 5
  },
  {
    id: 2,
    name: 'Новый игровой ноутбук',
    // image: require('../../assets/job.png'), 
    correctPrice: 80000,
    minPrice: 1000,
    maxPrice: 150000,
    step: 500
  },
  {
    id: 3,
    name: 'Самокат трюковой',
    // image: require('../../assets/job.png'), 
    correctPrice: 5000,
    minPrice: 500,
    maxPrice: 15000,
    step: 50
  },
  {
    id: 4,
    name: 'Телевизор',
    // image: require('../../assets/job.png'), 
    correctPrice: 25000,
    minPrice: 500,
    maxPrice: 100000,
    step: 100
  },
  {
    id: 5,
    name: 'Новая машина',
    // image: require('../../assets/job.png'), 
    correctPrice: 900000,
    minPrice: 500,
    maxPrice: 2500000,
    step: 500
  },
    {
    id: 6,
    name: 'Макароны',
    // image: require('../../assets/job.png'), 
    correctPrice: 90,
    minPrice: 5,
    maxPrice: 1000,
    step: 1
  },
  {
    id: 7,
    name: 'Комикс про динозавров',
    // image: require('../../assets/job.png'), 
    correctPrice: 400,
    minPrice: 1,
    maxPrice: 10000,
    step: 5
  },
  {
    id: 8,
    name: 'Кукла',
    // image: require('../../assets/job.png'), 
    correctPrice: 2000,
    minPrice: 1,
    maxPrice: 10000,
    step: 100
  },
  {
  id: 9,
  name: 'Шоколадный батончик',
  // image: require('../../assets/cards/chocolate.png'), 
  correctPrice: 70,
  minPrice: 5,
  maxPrice: 1000,
  step: 5
},
{
  id: 10,
  name: 'Билет в кино',
  // image: require('../../assets/cards/cinema.png'), 
  correctPrice: 350,
  minPrice: 5,
  maxPrice: 1500,
  step: 50
},
{
  id: 11,
  name: 'Пицца Пепперони',
  // image: require('../../assets/cards/pizza.png'), 
  correctPrice: 650,
  minPrice: 200,
  maxPrice: 5000,
  step: 50
},
{
  id: 12,
  name: 'Беспроводные наушники',
  // image: require('../../assets/cards/headphones.png'), 
  correctPrice: 6000,
  minPrice: 1,
  maxPrice: 25000,
  step: 500
},
{
  id: 13,
  name: 'Трендовые кроссовки',
  // image: require('../../assets/cards/sneakers.png'), 
  correctPrice: 8000,
  minPrice: 90,
  maxPrice: 30000,
  step: 500
},
{
  id: 14,
  name: 'Настольная игра',
  // image: require('../../assets/cards/boardgame.png'), 
  correctPrice: 2500,
  minPrice: 300,
  maxPrice: 10000,
  step: 100
},
{
  id: 15,
  name: 'Современный смартфон',
  // image: require('../../assets/cards/phone.png'), 
  correctPrice: 20000,
  minPrice: 20,
  maxPrice: 500000,
  step: 1000
},
{
  id: 16,
  name: 'Игровая приставка',
  // image: require('../../assets/cards/console.png'), 
  correctPrice: 40000,
  minPrice: 500,
  maxPrice: 600000,
  step: 1000
},

{
  id: 17,
  name: 'Крутой игровой ПК',
  // image: require('../../assets/cards/pc.png'), 
  correctPrice: 150000,
  minPrice: 1000,
  maxPrice: 4000000,
  step: 5000
},
{
  id: 18,
  name: 'Поездка на море',
  // image: require('../../assets/cards/vacation.png'), 
  correctPrice: 120000,
  minPrice: 10,
  maxPrice: 1000000,
  step: 5000
},
{
  id: 19,
  name: 'Электросамокат',
  // image: require('../../assets/cards/scooter.png'), 
  correctPrice: 35000,
  minPrice: 2000,
  maxPrice: 1200000,
  step: 1000
},
{
  id: 20,
  name: 'Однокомнатная квартира',
  // image: require('../../assets/cards/flat.png'), 
  correctPrice: 9000000,
  minPrice: 100000,
  maxPrice: 150000000,
  step: 50000
}
];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function GamePriceGuesser({ navigation }) {
  const bank = useBank();
  const [gameItems, setGameItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentGuess, setCurrentValue] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  useEffect(() => {
    const selectedItems = getRandomItems(ITEMS_DATA, 6);
    setGameItems(selectedItems);
    if (selectedItems.length > 0) {
      const firstItem = selectedItems[0];
      setCurrentValue((firstItem.maxPrice + firstItem.minPrice) / 2);
    }
  }, []);
  const item = gameItems[currentItemIndex];
  const handleCheckPrice = () => {
    if (!item) return;
    setIsAnswered(true);
    const difference = Math.abs(currentGuess - item.correctPrice);
    const percentDiff = (difference / item.correctPrice) * 100;

    if (percentDiff <= 45) {
      setFeedbackText('🔥 Красава! Ты отлично знаешь цену деньгам!\n+30 монет прилетели на счёт');
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(30); 
      }
    } else if (currentGuess > item.correctPrice) {
      if (percentDiff > 90) {
        setFeedbackText('🚀🤯 Космически дорого! За эти деньги можно купить что-то в сто раз лучше! Настоящая цена намного ниже.');
      } else {
        setFeedbackText('⚠️ Ого, это слишком дорого! Тебя пытаются обмануть, вещь стоит дешевле.');
      }
    } else {
      if (percentDiff > 70) {
        setFeedbackText('За такие копейки нам это никто не продаст! Настоящая качественная вещь стоит НАМНОГО дороже.');
      } else {
        setFeedbackText('Хм, немного маловато! Настоящая качественная вещь стоит подороже.');
      }
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < gameItems.length - 1) {
      const nextIndex = currentItemIndex + 1;
      const nextItem = gameItems[nextIndex];
      setCurrentItemIndex(nextIndex);
      setCurrentValue((nextItem.maxPrice + nextItem.minPrice) / 2);
      setIsAnswered(false);
      setFeedbackText('');
    } else {
      Alert.alert(
        'Игра окончена 🏆', 
        'Ты отлично справился со всеми 6 товарами и помог Финпигу!', 
        [
          { text: 'В меню игр', onPress: () => navigation.navigate('MiniGamesScreen') }
        ]
      );
    }
  };

  // Пока массив случайных элементов пуст (доли секунды при старте), показываем заглушку
  if (gameItems.length === 0 || !item) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Загрузка товаров...</Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Выйти</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Угадай цену</Text>
        </View>
        <Text style={styles.scoreText}>🪙 {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
      </View>
      <View style={styles.storyCard}>
        <Text style={styles.subTitle}>Товар {item.id}</Text>
        <Image source={item.image} style={styles.storyImage} resizeMode="contain" />
        <Text style={styles.storyText}>Перед тобой — {item.name}. Подумай хорошенько, сколько этот предмет может стоить в реальном магазине, чтобы Финпига не обсчитали злодеи!</Text>
      </View>
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>Твоё предположение:</Text>
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
        <View style={styles.rangeLabelsRow}>
          <Text style={styles.rangeText}>{item.minPrice} руб</Text>
          <Text style={styles.rangeText}>{item.maxPrice} руб</Text>
        </View>
        {isAnswered && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.hintText}>{feedbackText}</Text>
            <Text style={styles.realPriceText}>Реальная цена: {item.correctPrice} рублей</Text>
          </View>
        )}
      </View>
      {!isAnswered ? (
        <TouchableOpacity style={styles.checkButton} onPress={handleCheckPrice}>
          <Text style={styles.checkButtonText}>Подтвердить цену</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextItem}>
          <Text style={styles.nextButtonText}>
            {currentItemIndex === ITEMS_DATA.length - 1 ? 'Завершить 🏁' : 'Следующий товар'}
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
    textAlign: 'justify' 
  },
    hintContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hintText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
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
