import { useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

// ─── Свайп: лёгкий ───
const SWIPE_ACTIVATE = 8;
const SWIPE_THRESHOLD = 40;

// Размеры по стадиям
const PET_SIZE_BASE = width * 0.6;
const PET_SIZES = {
  0: PET_SIZE_BASE * 0.7,
  1: PET_SIZE_BASE * 1.0,
  2: PET_SIZE_BASE * 1.35,
  3: PET_SIZE_BASE * 1.75,
};

// Отступ снизу для каждой стадии.
// Чем крупнее питомец — тем ниже его нужно опустить.
const PET_BOTTOM = {
  0: 220,
  1: 220,
  2: 200,
  3: 160,
};

// feedValue: сколько % голода прибавляет
const PRODUCTS = [
  // Полезное: +22%
  { id: '1',  name: 'Борщ',          image: require('../../assets/Food/borsh.png'),        feedValue: 22 },
  { id: '2',  name: 'Яблоко',        image: require('../../assets/Food/apple.png'),        feedValue: 22 },
  { id: '3',  name: 'Бутерброд',     image: require('../../assets/Food/buterbrod.png'),    feedValue: 22 },
  { id: '5',  name: 'Спагетти',      image: require('../../assets/Food/pasta.png'),        feedValue: 22 },
  { id: '8',  name: 'Блинчики',      image: require('../../assets/Food/pancake.png'),      feedValue: 22 },
  { id: '9',  name: 'Салат',         image: require('../../assets/Food/salade.png'),       feedValue: 22 },
  { id: '14', name: 'Каша',          image: require('../../assets/Food/porrige.png'),      feedValue: 22 },
  { id: '15', name: 'Вареники',      image: require('../../assets/Food/varenniki.png'),    feedValue: 22 },
  { id: '16', name: 'Йогурт',        image: require('../../assets/Food/yogurt.png'),       feedValue: 22 },

  // Вкусняшки: +10%
  { id: '4',  name: 'Морс и малина', image: require('../../assets/Food/mors.png'),         feedValue: 10 },
  { id: '6',  name: 'Печеньки',      image: require('../../assets/Food/cookies.png'),      feedValue: 10 },
  { id: '7',  name: 'Круасан',       image: require('../../assets/Food/croissant.png'),    feedValue: 10 },
  { id: '10', name: 'Сок',           image: require('../../assets/Food/applejuice.png'),   feedValue: 10 },
  { id: '11', name: 'Бургер',        image: require('../../assets/Food/burger.png'),       feedValue: 10 },
  { id: '12', name: 'Торт',          image: require('../../assets/Food/cake.png'),         feedValue: 10 },
  { id: '13', name: 'Газировка',     image: require('../../assets/Food/cola.png'),         feedValue: 10 },
];

export default function KitchenScreen({ navigation }) {
  const petCtx = usePet();

  const [eaten, setEaten] = useState({});
  const FlatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentStage = petCtx.pet?.stage ?? 0;
  const petSize = PET_SIZES[currentStage] ?? PET_SIZES[0];
  const petBottom = PET_BOTTOM[currentStage] ?? PET_BOTTOM[0];

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  // ─── Свайп ВЛЕВО → назад на Home ───
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > SWIPE_ACTIVATE &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          navigation.goBack();
        }
      },
    })
  ).current;

  const scrollLeft = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      FlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const scrollRight = () => {
    if (currentIndex < PRODUCTS.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      FlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const toggleEaten = (id) => {
    setEaten((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFeed = (item) => {
    petCtx.feedPet(item.feedValue);

    const bonus = item.feedValue >= 20 ? '🍲 Сытная еда!' : '🍬 Вкусняшка!';
    alert(
      `Ты покормил питомца: ${item.name}\n` +
      `${bonus} Сытость +${item.feedValue}%`
    );
  };

  const renderFoodItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.foodCard}
        activeOpacity={0.8}
        onPress={() => handleFeed(item)}
      >
        <Image source={item.image} style={styles.foodImage} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ImageBackground
          source={require('../../assets/kitchen.jpg')}
          style={styles.bg}
          resizeMode="cover"
        >
          {/* Питомец — размер и позиция зависят от стадии */}
          <Image
            source={petImage}
            style={[
              styles.petImage,
              { width: petSize, height: petSize, bottom: petBottom },
            ]}
          />

          <ImageBackground
            source={require('../../assets/table.png')}
            style={styles.tableBackground}
            resizeMode="contain"
          >
            <View style={styles.carouselContainer}>
              <TouchableOpacity
                style={[styles.arrowButton, currentIndex === 0 && styles.disabledArrow]}
                onPress={scrollLeft}
                disabled={currentIndex === 0}
              >
                <Text style={styles.arrowText}>◀</Text>
              </TouchableOpacity>

              <FlatList
                ref={FlatListRef}
                data={PRODUCTS}
                keyExtractor={(item) => item.id}
                renderItem={renderFoodItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={false}
                snapToAlignment="center"
                contentContainerStyle={styles.foodListContent}
                scrollEnabled={true}
                onMomentumScrollEnd={(e) => {
                  const offset = e.nativeEvent.contentOffset.x;
                  const index = Math.round(offset / 110);
                  setCurrentIndex(index);
                }}
              />

              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  currentIndex === PRODUCTS.length - 1 && styles.disabledArrow,
                ]}
                onPress={scrollRight}
                disabled={currentIndex === PRODUCTS.length - 1}
              >
                <Text style={styles.arrowText}>▶</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <Text style={styles.swipeHint}>← свайпни влево, чтобы вернуться</Text>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bg: { flex: 1, position: 'relative', alignItems: 'center' },

  petImage: {
    position: 'absolute',
    resizeMode: 'contain',
    zIndex: 1,
    // bottom задаётся inline в зависимости от стадии
  },

  tableBackground: {
    position: 'absolute',
    bottom: 0,
    width: 450,
    height: 775,
    justifyContent: 'flex-start',
    paddingTop: 545,
    zIndex: 2,
  },

  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: -20,
  },

  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledArrow: { backgroundColor: '#555', opacity: 0.5 },
  arrowText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  foodListContent: { alignItems: 'center', paddingHorizontal: 10 },
  foodCard: {
    width: 90,
    height: 90,
    borderRadius: 15,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  foodImage: { width: 95, height: 95, resizeMode: 'contain' },

  swipeHint: {
    position: 'absolute',
    top: 50,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
});