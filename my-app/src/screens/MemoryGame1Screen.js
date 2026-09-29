import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';

import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { backToLivingRoom } from '../navigation';

const CARDS_DATA = [
  // ЕГИПЕТ
  {
    id: 1,
    pairId: 'EGP',
    type: 'text',
    content: '🇪🇬\nЕгипетский фунт',
  },
  {
    id: 2,
    pairId: 'EGP',
    type: 'image',
    content: require('../../assets/cards/egyptmoney.png'),
  },

  // ЕВРОСОЮЗ
  {
    id: 3,
    pairId: 'EUR',
    type: 'text',
    content: '🇪🇺\nЕвро',
  },
  {
    id: 4,
    pairId: 'EUR',
    type: 'image',
    content: require('../../assets/cards/euro.png'),
  },

  // КИТАЙ
  {
    id: 5,
    pairId: 'CNY',
    type: 'text',
    content: '🇨🇳\nЮань',
  },
  {
    id: 6,
    pairId: 'CNY',
    type: 'image',
    content: require('../../assets/cards/chinamoney.png'),
  },

  // ТУРЦИЯ
  {
    id: 7,
    pairId: 'TRY',
    type: 'text',
    content: '🇹🇷\nЛира',
  },
  {
    id: 8,
    pairId: 'TRY',
    type: 'image',
    content: require('../../assets/cards/turkymoney.png'),
  },

  // РОССИЯ
  {
    id: 9,
    pairId: 'RUB',
    type: 'text',
    content: '🇷🇺\nРубль',
  },
  {
    id: 10,
    pairId: 'RUB',
    type: 'image',
    content: require('../../assets/cards/russiamoney.png'),
  },

  // США
  {
    id: 11,
    pairId: 'USD',
    type: 'text',
    content: '🇺🇸\nДоллар США',
  },
  {
    id: 12,
    pairId: 'USD',
    type: 'image',
    content: require('../../assets/cards/dollar.png'),
  },
];

const TOTAL_PAIRS = CARDS_DATA.length / 2;

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function MemoryGame1Screen({ navigation }) {
  const bank = useBank();
  const petCtx = usePet();

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);

  // Не даём нажимать другие карты,
  // пока две неправильные карты открыты.
  const [isChecking, setIsChecking] = useState(false);

  // Защита от повторного запуска победного useEffect.
  const victoryHandledRef = useRef(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    victoryHandledRef.current = false;

    setCards(shuffleArray(CARDS_DATA));
    setSelectedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setIsChecking(false);
  };

  const handleCardPress = (index) => {
    if (isChecking) {
      return;
    }

    const card = cards[index];

    if (!card) {
      return;
    }

    // Нельзя нажать уже открытую или найденную карту.
    if (
      selectedCards.includes(index) ||
      matchedCards.includes(card.pairId) ||
      selectedCards.length >= 2
    ) {
      return;
    }

    const newSelected = [...selectedCards, index];

    setSelectedCards(newSelected);

    // Пока открыта только одна карта.
    if (newSelected.length !== 2) {
      return;
    }

    setMoves((prev) => prev + 1);

    const firstCard = cards[newSelected[0]];
    const secondCard = cards[newSelected[1]];

    if (!firstCard || !secondCard) {
      setSelectedCards([]);
      return;
    }

    // Пара найдена.
    if (firstCard.pairId === secondCard.pairId) {
      setMatchedCards((prev) => {
        // Дополнительная защита от дубликатов.
        if (prev.includes(firstCard.pairId)) {
          return prev;
        }

        return [...prev, firstCard.pairId];
      });

      setSelectedCards([]);
      return;
    }

    // Пара неправильная.
    setIsChecking(true);

    setTimeout(() => {
      setSelectedCards([]);
      setIsChecking(false);
    }, 1000);
  };

  useEffect(() => {
    if (
      cards.length === 0 ||
      matchedCards.length !== TOTAL_PAIRS ||
      victoryHandledRef.current
    ) {
      return;
    }

    victoryHandledRef.current = true;

    // Начисляем награду.
    try {
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(30);
      }
      if (petCtx?.boostHappiness) petCtx.boostHappiness();
    } catch (error) {
      console.error('Ошибка при начислении монет:', error);
    }

    // Небольшая задержка нужна, чтобы последняя
    // найденная пара успела отобразиться.
    const timer = setTimeout(() => {
      Alert.alert(
        'Победа! 🎉',
        `Вы нашли все пары за ${moves} ходов.\n\n+30 монет летят в твой кошелёк 🪙`,
        [
          {
            text: 'Играть снова',
            onPress: startNewGame,
          },
          {
            text: 'В гостиную',
            onPress: () => backToLivingRoom(navigation),
          },
        ],
        {
          cancelable: false,
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [matchedCards, cards.length, moves, bank]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButtonTop}
          onPress={() => backToLivingRoom(navigation)}
        >
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Валюты стран</Text>

        <View style={styles.bankBadge}>
          <Text style={styles.bankText}>
            🪙 {bank?.balance != null ? Math.floor(bank.balance) : 0}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Ходов: {moves}
      </Text>

      <View style={styles.grid}>
        {cards.map((card, index) => {
          const isOpened =
            selectedCards.includes(index) ||
            matchedCards.includes(card.pairId);

          return (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.8}
              disabled={
                isChecking ||
                matchedCards.includes(card.pairId)
              }
              style={[
                styles.card,
                isOpened
                  ? styles.cardOpened
                  : styles.cardClosed,
              ]}
              onPress={() => handleCardPress(index)}
            >
              {isOpened ? (
                card.type === 'image' ? (
                  <Image
                    source={card.content}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.cardText}>
                    {card.content}
                  </Text>
                )
              ) : (
                <Text style={styles.shirtText}>
                  ?
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={startNewGame}
      >
        <Text style={styles.buttonText}>
          Начать заново
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
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
    fontSize: 17,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D47A1',
  },

  bankBadge: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#FFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1c40f',
  },

  bankText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D47A1',
  },

  subtitle: {
    fontSize: 18,
    color: '#1976D2',
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },

  cardText: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0D47A1',
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
    fontSize: 17,
    fontWeight: 'bold',
  },
});