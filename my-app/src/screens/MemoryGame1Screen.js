import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { useBank } from '../context/BankContext'; 

const CARDS_DATA = [
  // 1. ЕГИПЕТ (Вместо Крабс-доллара)
  { 
    id: 1, 
    pairId: 'EGP', 
    type: 'text', 
    content: '🇪🇬\nЕгипетский фунт'
  },
  { 
    id: 2, 
    pairId: 'EGP', 
    type: 'image', 
    content: require('../../assets/cards/egyptmoney.png') 
  },

  // 2. ЕВРОСОЮЗ
  { 
    id: 3, 
    pairId: 'EUR', 
    type: 'text', 
    content: '🇪🇺\nЕвро' 
  },
  { 
    id: 4, 
    pairId: 'EUR', 
    type: 'image', 
    content: require('../../assets/cards/euro.png') 
  },

  // 3. КИТАЙ
  { 
    id: 5, 
    pairId: 'CNY', 
    type: 'text', 
    content: '🇨🇳\nЮань' 
  },
  { 
    id: 6, 
    pairId: 'CNY', 
    type: 'image', 
    content: require('../../assets/cards/chinamoney.png') 
  },

  // 4. ЯПОНИЯ
  // { 
  //   id: 7, 
  //   pairId: 'JPY', 
  //   type: 'text', 
  //   content: '🇯🇵\nИена' 
  // },
  // { 
  //   id: 8, 
  //   pairId: 'JPY', 
  //   type: 'image', 
  //   content: require('../../assets/cards/japanmoney.png') 
  // },

  // 5. ТУРЦИЯ
  { 
    id: 7, 
    pairId: 'TRY', 
    type: 'text', 
    content: '🇹🇷\nЛира' 
  },
  { 
    id: 8, 
    pairId: 'TRY', 
    type: 'image', 
    content: require('../../assets/cards/turkymoney.png') 
  },
  { 
    id: 9, 
    pairId: 'RUB', 
    type: 'text', 
    content: '🇷🇺\nРубль' 
  },
  { 
    id: 10, 
    pairId: 'RUB', 
    type: 'image', 
    content: require('../../assets/cards/russiamoney.png') 
  },
  { id: 11, 
    pairId: 'USD', 
    type: 'text', 
    content: '🇺🇸\nДоллар США' },
  { id: 12, 
    pairId: 'USD', 
    type: 'image', 
    content: require('../../assets/cards/dollar.png') },
];



const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function MemoryGame1Screen({ navigation }) {
  const bank = useBank();
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]); 
  const [matchedCards, setMatchedCards] = useState([]);   
  const [moves, setMoves] = useState(0);                   

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setCards(shuffleArray(CARDS_DATA));
    setSelectedCards([]);
    setMatchedCards([]);
    setMoves(0);
  };

  const handleCardPress = (index) => {
    const card = cards[index];
    if (
      selectedCards.includes(index) || 
      matchedCards.includes(card.pairId) || 
      selectedCards.length >= 2
    ) {
      return;
    }

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);
    if (newSelected.length === 2) {
      setMoves(moves + 1);
      const firstCard = cards[newSelected[0]];
      const secondCard = cards[newSelected[1]];
        if (firstCard.pairId === secondCard.pairId) {
        setMatchedCards((prev) => [...prev, firstCard.pairId]);
        setSelectedCards([]); 
      } else {
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };


  useEffect(() => {
    if (matchedCards.length === 6 && cards.length > 0) {
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(30);
      }
      Alert.alert(`Вы нашли все пары за ${moves} ходов.\n\n+30 монет летят в твой кошелёк`, [
        { text: 'Играть снова', onPress: startNewGame }
      ]);
    }
  }, [matchedCards]);



      return (
    <View style={styles.container}>
       <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButtonTop} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      <Text style={styles.title}>Валюты стран</Text>
      <View style={styles.bankBadge}>
          <Text style={styles.bankText}>🪙 {bank?.coins ?? 0}</Text>
        </View>

      </View>
      <Text style={styles.subtitle}>Ходов: {moves}</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => {
          const isOpened = selectedCards.includes(index) || matchedCards.includes(card.pairId);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                isOpened ? styles.cardOpened : styles.cardClosed
              ]}
              onPress={() => handleCardPress(index)}>
              {isOpened ? (
                card.type === 'image' ? (
                  <Image 
                    source={card.content} 
                    style={styles.cardImage} 
                    resizeMode="contain" 
                  />
                ) : (
                  <Text style={styles.cardText}>{card.content}</Text>
                )
              ) : (
                <Text style={styles.shirtText}>?</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={styles.button} onPress={startNewGame}>
        <Text style={styles.buttonText}>Начать заново</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
    topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40, 
    position: 'relative',
    height: 50,
  },
  backButtonTop: {
    position: 'absolute',
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e74c3c', 
    borderRadius: 15,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  grid: {
    width: 340,
    height: 340, 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  card: {
    width: 78,   
    height: 78,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cardText: {
    fontSize: 10, 
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 14,
  },
  cardImage: {
  width: '100%',
  height: '100%',
},


  cardClosed: {
    backgroundColor: '#4A90E2',
  },
  cardOpened: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardBonus: {
    backgroundColor: '#FFE0B2',
    borderColor: '#FFA726',
    borderWidth: 2,
  },
  shirtText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
