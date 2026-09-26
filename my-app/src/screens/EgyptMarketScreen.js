import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  Alert
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function EgyptMarketScreen({ navigation }) {
  // Симулируем баланс монет игрока (в реальной игре это будет идти из контекста или БД)
  const [coins, setCoins] = useState(350);

  // Список товаров для двух полок
  const [shelf1Items, setShelf1Items] = useState([
    { id: 'apple', name: 'Сочное яблоко', price: 20, emoji: '🍏', count: 5 },
    { id: 'date', name: 'Сладкий финик', price: 10, emoji: '🌴', count: 12 },
  ]);

  const [shelf2Items, setShelf2Items] = useState([
    { id: 'pot', name: 'Расписной кувшин', price: 70, emoji: '🏺', count: 2 },
    { id: 'papyrus', name: 'Папирус', price: 40, emoji: '📜', count: 4 },
  ]);

  // Функция покупки товара
  const handleBuyItem = (item, setShelf, shelfItems) => {
    if (coins < item.price) {
      Alert.alert('Упс', 'Недостаточно золотых монет для покупки.');
      return;
    }
    if (item.count <= 0) {
      Alert.alert('Закончилось', 'Этого товара больше нет в лавке.');
      return;
    }

    // Списываем монеты
    setCoins(coins - item.price);

    // Уменьшаем количество товара на полке
    const updatedItems = shelfItems.map(i => {
      if (i.id === item.id) return { ...i, count: i.count - 1 };
      return i;
    });
    setShelf(updatedItems);

    Alert.alert('Успешно!', `Вы купили "${item.name}" за ${item.price} монет.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Твой сгенерированный крупный план лавки (egypt_shop.jpg) */}
      <ImageBackground
        source={require('../../assets/egyptshop.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Кнопка "Назад в город" */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('EgyptScreen')}>
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        {/* Счётчик монет игрока в верхнем правом углу */}
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>

        {/* Вывеска магазина */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Восточная Лавка</Text>
        </View>

        {/* ПОЛКА 1 (Верхняя) */}
        <View style={[styles.shelfContainer, styles.shelf1Position]}>
          {shelf1Items.map(item => (
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
              <Text style={styles.countText}>Осталось: {item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ПОЛКА 2 (Нижняя) */}
        <View style={[styles.shelfContainer, styles.shelf2Position]}>
          {shelf2Items.map(item => (
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
              <Text style={styles.countText}>Осталось: {item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Персонаж (тигрёнок), который стоит по центру снизу, как покупатель */}
        <Image
          source={require('../../assets/Animals/pinguin/black/pinguin1.png')}
          style={styles.petImage}
        />

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#b8860b' 
  },
  bg: { 
    flex: 1 
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#3d2510',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
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
    borderColor: '#3d2510',
    zIndex: 10,
  },
  coinsText: { 
    color: '#3d2510', 
    fontWeight: 'bold', 
    fontSize: 16 
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
    backgroundColor: '#3d2510',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Контейнер полок
  shelfContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  // НАСТРОЙКА ВЫСОТЫ ПОЛОК ПОД ТВОЮ КАРТИНКУ
  shelf1Position: {
    top: '28%', // Высота первой полки (подкрути проценты, чтобы карточки встали ровно на нарисованную полку)
  },
  shelf2Position: {
    top: '52%', // Высота второй полки (подкрути проценты под вторую нарисованную полку)
  },
  itemCard: {
    width: width * 0.36,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3d2510',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemEmoji: { 
    fontSize: 32, 
    marginBottom: 2 
  },
  itemName: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#3d2510', 
    textAlign: 'center' 
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
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#856404' 
  },
  countText: { 
    fontSize: 10, 
    color: '#777', 
    marginTop: 4 
  },
  petImage: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
});
