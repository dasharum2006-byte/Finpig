import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

export default function ArcticMarketScreen({ navigation }) {
  const petCtx = usePet();
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  const [coins, setCoins] = useState(400);

  const [shelf1Items, setShelf1Items] = useState([
    { id: 'fish', name: 'Свежая рыбка', price: 15, emoji: '🐟', count: 8 },
    { id: 'icecream', name: 'Полярный лед', price: 5, emoji: '🍧', count: 20 },
  ]);

  const [shelf2Items, setShelf2Items] = useState([
    { id: 'hat', name: 'Теплая ушанка', price: 80, emoji: '🪶', count: 3 },
    { id: 'coat', name: 'Зимняя шубка', price: 150, emoji: '🧥', count: 1 },
  ]);

  const handleBuyItem = (item, setShelf, shelfItems) => {
    if (coins < item.price) {
      Alert.alert('Ой-ой!', 'Не хватает золотых монеток. Загляни в Ледяной Обменник! ❄️');
      return;
    }
    if (item.count <= 0) {
      Alert.alert('Закончилось!', 'Этот товар уже раскупили другие пингвины.');
      return;
    }

    setCoins(coins - item.price);

    const updatedItems = shelfItems.map((i) => {
      if (i.id === item.id) return { ...i, count: i.count - 1 };
      return i;
    });
    setShelf(updatedItems);

    Alert.alert('Успешно! ❄️', `Вы приобрели "${item.name}" за ${item.price} монет.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.bg}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('ArcticScreen')}
        >
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Ледяной Рынок</Text>
        </View>

        {/* ПОЛКА 1 */}
        <View style={[styles.shelfContainer, styles.shelf1Position]}>
          {shelf1Items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleBuyItem(item, setShelf1Items, shelf1Items)}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>💰 {item.price}</Text>
              </View>
              <Text style={styles.countText}>В наличии: {item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ПОЛКА 2 */}
        <View style={[styles.shelfContainer, styles.shelf2Position]}>
          {shelf2Items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleBuyItem(item, setShelf2Items, shelf2Items)}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>💰 {item.price}</Text>
              </View>
              <Text style={styles.countText}>В наличии: {item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔧 УВЕЛИЧЕН питомец */}
        <Image source={petImage} style={styles.petImage} />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  bg: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#006064',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  coinsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#006064',
    zIndex: 10,
  },
  coinsText: {
    color: '#006064',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 110,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: '#006064',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shelfContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  shelf1Position: {
    top: '28%',
  },
  shelf2Position: {
    top: '52%',
  },
  itemCard: {
    width: width * 0.36,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#006064',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemEmoji: {
    fontSize: 32,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#006064',
    textAlign: 'center',
  },
  priceTag: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#b2ebf2',
  },
  priceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#006064',
  },
  countText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  // 🔧 УВЕЛИЧЕН питомец (было 140×140, стало 200×200)
  petImage: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});