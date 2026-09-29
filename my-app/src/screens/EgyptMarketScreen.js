import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, Alert, ImageBackground } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

export default function EgyptMarketScreen({ navigation }) {
  const petCtx = usePet();
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  const [coins, setCoins] = useState(350);

  // ✅ ИСПРАВЛЕНО: все картинки из assets/Food/
  const [shelf1Items, setShelf1Items] = useState([
    { id: 'statue', name: 'Статуэтка', price: 100, image: require('../../assets/Food/statue.png'), count: 2 },
    { id: 'cat', name: 'Кот', price: 80, image: require('../../assets/Food/cat.png'), count: 3 },
  ]);

  const [shelf2Items, setShelf2Items] = useState([
    { id: 'fresco', name: 'Фреска', price: 60, image: require('../../assets/Food/fresco.png'), count: 4 },
    { id: 'vase', name: 'Ваза', price: 40, image: require('../../assets/Food/vase.png'), count: 5 },
  ]);

  const handleBuyItem = (item, setShelf, shelfItems) => {
    if (coins < item.price) {
      Alert.alert('Упс', 'Недостаточно золотых монет для покупки.');
      return;
    }
    if (item.count <= 0) {
      Alert.alert('Закончилось', 'Этого товара больше нет в лавке.');
      return;
    }

    setCoins(coins - item.price);

    const updatedItems = shelfItems.map((i) => {
      if (i.id === item.id) return { ...i, count: i.count - 1 };
      return i;
    });
    setShelf(updatedItems);

    Alert.alert('Успешно!', `Вы купили "${item.name}" за ${item.price} монет.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ImageBackground
        source={require('../../assets/egyptshop.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('EgyptScreen')}
        >
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Лавка</Text>
        </View>

        {/* ПОЛКА 1 */}
        <View style={[styles.shelfContainer, styles.shelf1Position]}>
          {shelf1Items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleBuyItem(item, setShelf1Items, shelf1Items)}
            >
              <Image source={item.image} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>💰 {item.price}</Text>
              </View>
              <Text style={styles.countText}>Осталось: {item.count}</Text>
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
              <Image source={item.image} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>💰 {item.price}</Text>
              </View>
              <Text style={styles.countText}>Осталось: {item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Image source={petImage} style={styles.petImage} />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b8860b',
  },
  bg: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#0D47A1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  coinsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#0D47A1',
    zIndex: 10,
  },
  coinsText: {
    color: '#0D47A1',
    fontWeight: 'bold',
    fontSize: 17,
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
    backgroundColor: '#0D47A1',
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
    borderColor: '#0D47A1',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D47A1',
    textAlign: 'center',
  },
  priceTag: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  priceText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#856404',
  },
  countText: {
    fontSize: 17,
    color: '#777',
    marginTop: 4,
  },
  petImage: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
});