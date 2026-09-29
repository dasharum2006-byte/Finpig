import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';

import { useBank } from '../context/BankContext';

const CARDS_DATA = [
  // Р•Р“РРџР•Рў
  {
    id: 1,
    pairId: 'EGP',
    type: 'text',
    content: 'рџ‡Єрџ‡¬\nР•РіРёРїРµС‚СЃРєРёР№ С„СѓРЅС‚',
  },
  {
    id: 2,
    pairId: 'EGP',
    type: 'image',
    content: require('../../assets/cards/egyptmoney.png'),
  },

  // Р•Р’Р РћРЎРћР®Р—
  {
    id: 3,
    pairId: 'EUR',
    type: 'text',
    content: 'рџ‡Єрџ‡є\nР•РІСЂРѕ',
  },
  {
    id: 4,
    pairId: 'EUR',
    type: 'image',
    content: require('../../assets/cards/euro.png'),
  },

  // РљРРўРђР™
  {
    id: 5,
    pairId: 'CNY',
    type: 'text',
    content: 'рџ‡Ёрџ‡і\nР®Р°РЅСЊ',
  },
  {
    id: 6,
    pairId: 'CNY',
    type: 'image',
    content: require('../../assets/cards/chinamoney.png'),
  },

  // РўРЈР Р¦РРЇ
  {
    id: 7,
    pairId: 'TRY',
    type: 'text',
    content: 'рџ‡№рџ‡·\nР›РёСЂР°',
  },
  {
    id: 8,
    pairId: 'TRY',
    type: 'image',
    content: require('../../assets/cards/turkymoney.png'),
  },

  // Р РћРЎРЎРРЇ
  {
    id: 9,
    pairId: 'RUB',
    type: 'text',
    content: 'рџ‡·рџ‡є\nР СѓР±Р»СЊ',
  },
  {
    id: 10,
    pairId: 'RUB',
    type: 'image',
    content: require('../../assets/cards/russiamoney.png'),
  },

  // РЎРЁРђ
  {
    id: 11,
    pairId: 'USD',
    type: 'text',
    content: 'рџ‡єрџ‡ё\nР”РѕР»Р»Р°СЂ РЎРЁРђ',
  },
  {
    id: 12,
    pairId: 'USD',
    type: 'image',
    content: require('../../assets/cards/dollar.png'),
  },
];

const TOTAL_PAIRS = CARDS_DATA.length / 2;
const REWARD = 30;

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function MemoryGame1Screen({ navigation }) {
  const { balance, addCoins, isLoaded } = useBank();

  const [cards, setCards] = useState(() => shuffleArray(CARDS_DATA));
  const [showVictory, setShowVictory] = useState(false);
  const mismatchTimerRef = useRef(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);

  // РќРµ РґР°С‘Рј РЅР°Р¶РёРјР°С‚СЊ РґСЂСѓРіРёРµ РєР°СЂС‚С‹,
  // РїРѕРєР° РґРІРµ РЅРµРїСЂР°РІРёР»СЊРЅС‹Рµ РєР°СЂС‚С‹ РѕС‚РєСЂС‹С‚С‹.
  const [isChecking, setIsChecking] = useState(false);

  // Р—Р°С‰РёС‚Р° РѕС‚ РїРѕРІС‚РѕСЂРЅРѕРіРѕ Р·Р°РїСѓСЃРєР° РїРѕР±РµРґРЅРѕРіРѕ useEffect.
  const victoryHandledRef = useRef(false);

  useEffect(() => () => clearTimeout(mismatchTimerRef.current), []);

  const startNewGame = () => {
    clearTimeout(mismatchTimerRef.current);
    victoryHandledRef.current = false;
    setShowVictory(false);

    setCards(shuffleArray(CARDS_DATA));
    setSelectedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setIsChecking(false);
  };

  const handleCardPress = (index) => {
    if (!isLoaded || isChecking || victoryHandledRef.current) {
      return;
    }

    const card = cards[index];

    if (!card) {
      return;
    }

    // РќРµР»СЊР·СЏ РЅР°Р¶Р°С‚СЊ СѓР¶Рµ РѕС‚РєСЂС‹С‚СѓСЋ РёР»Рё РЅР°Р№РґРµРЅРЅСѓСЋ РєР°СЂС‚Сѓ.
    if (
      selectedCards.includes(index) ||
      matchedCards.includes(card.pairId) ||
      selectedCards.length >= 2
    ) {
      return;
    }

    const newSelected = [...selectedCards, index];

    setSelectedCards(newSelected);

    // РџРѕРєР° РѕС‚РєСЂС‹С‚Р° С‚РѕР»СЊРєРѕ РѕРґРЅР° РєР°СЂС‚Р°.
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

    // РџР°СЂР° РЅР°Р№РґРµРЅР°.
    if (firstCard.pairId === secondCard.pairId) {
      setMatchedCards((prev) => {
        // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ Р·Р°С‰РёС‚Р° РѕС‚ РґСѓР±Р»РёРєР°С‚РѕРІ.
        if (prev.includes(firstCard.pairId)) {
          return prev;
        }

        return [...prev, firstCard.pairId];
      });

      setSelectedCards([]);
      return;
    }

    // РџР°СЂР° РЅРµРїСЂР°РІРёР»СЊРЅР°СЏ.
    setIsChecking(true);

    mismatchTimerRef.current = setTimeout(() => {
      setSelectedCards([]);
      setIsChecking(false);
    }, 1000);
  };

  useEffect(() => {
    if (!isLoaded || matchedCards.length !== TOTAL_PAIRS || victoryHandledRef.current) {
      return;
    }

    // РўРѕР»СЊРєРѕ РѕРґРЅРѕ РЅР°С‡РёСЃР»РµРЅРёРµ Р·Р° РїР°СЂС‚РёСЋ, РґР°Р¶Рµ РїСЂРё РѕР±РЅРѕРІР»РµРЅРёРё РєРѕРЅС‚РµРєСЃС‚Р° Р±Р°РЅРєР°.
    victoryHandledRef.current = true;
    addCoins(REWARD);
    setShowVictory(true);
  }, [matchedCards.length, isLoaded, addCoins]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButtonTop}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>РќР°Р·Р°Рґ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bankBadge}
          onPress={() => navigation.navigate('Bank')}
          accessibilityRole="button"
          accessibilityLabel="РћС‚РєСЂС‹С‚СЊ Р±Р°РЅРєРѕРІСЃРєРёР№ СЃС‡С‘С‚"
        >
          <Text style={styles.bankText}>
            рџЏ¦ РЎС‡С‘С‚: {isLoaded ? `${balance.toFixed(2)} рџЄ™` : 'Р—Р°РіСЂСѓР·РєР°вЂ¦'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Р’Р°Р»СЋС‚С‹ СЃС‚СЂР°РЅ</Text>
      <Text style={styles.subtitle}>
        РҐРѕРґРѕРІ: {moves}
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
                !isLoaded || isChecking ||
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
          РќР°С‡Р°С‚СЊ Р·Р°РЅРѕРІРѕ
        </Text>
      </TouchableOpacity>
      <Modal
        visible={showVictory}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVictory(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>РњРѕР»РѕРґРµС†! рџЋ‰</Text>
            <Text style={styles.victoryText}>
              РўС‹ РїСЂРѕС€С‘Р» РёРіСЂСѓ! Р’СЃРµ РїР°СЂС‹ РЅР°Р№РґРµРЅС‹ Р·Р° {moves} С…РѕРґРѕРІ.
              {'\n\n'}+{REWARD} РјРѕРЅРµС‚ РЅР°С‡РёСЃР»РµРЅРѕ РЅР° С‚РІРѕР№ Р±Р°РЅРєРѕРІСЃРєРёР№ СЃС‡С‘С‚ рџЄ™
            </Text>
            <TouchableOpacity style={styles.button} onPress={startNewGame}>
              <Text style={styles.buttonText}>РРіСЂР°С‚СЊ СЃРЅРѕРІР°</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVictory(false)}
            >
              <Text style={styles.bankText}>Р—Р°РєСЂС‹С‚СЊ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  victoryText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#2c3e50',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 40,
    left: 0,
    height: 50,
  },

  backButtonTop: {

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

  bankBadge: {

    backgroundColor: '#FFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1c40f',
  },

  bankText: {
    fontSize: 14,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
