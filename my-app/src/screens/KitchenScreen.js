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
const SWIPE_THRESHOLD = 80;

const PRODUCTS = [
  { id: '1', name: 'Борщ', image: require('../../assets/Food/borsh.png') },
  { id: '2', name: 'Яблоко', image: require('../../assets/Food/apple.png') },
  { id: '3', name: 'Бутерброд', image: require('../../assets/Food/buterbrod.png') },
  { id: '4', name: 'Морс и малина', image: require('../../assets/Food/mors.png') },
  { id: '5', name: 'Спагетти', image: require('../../assets/Food/pasta.png') },
  { id: '6', name: 'Печеньки', image: require('../../assets/Food/cookies.png') },
  { id: '7', name: 'Круасан', image: require('../../assets/Food/croissant.png') },
  { id: '8', name: 'Блинчики', image: require('../../assets/Food/pancake.png') },
  { id: '9', name: 'Салат', image: require('../../assets/Food/salade.png') },
  { id: '10', name: 'Сок', image: require('../../assets/Food/applejuice.png') },
  { id: '11', name: 'Бургер', image: require('../../assets/Food/burger.png') },
  { id: '12', name: 'Торт', image: require('../../assets/Food/cake.png') },
  { id: '13', name: 'Газировка', image: require('../../assets/Food/cola.png') },
  { id: '14', name: 'Каша', image: require('../../assets/Food/porrige.png') },
  { id: '15', name: 'Вареники', image: require('../../assets/Food/varenniki.png') },
  { id: '16', name: 'Йогурт', image: require('../../assets/Food/yogurt.png') },
];

export default function KitchenScreen({ navigation }) {
  const petCtx = usePet();

  const [eaten, setEaten] = useState({});
  const FlatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ─── Картинка питомца из контекста ───
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  // ─── Свайп ВПРАВО → обратно на Home ───
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
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

  const handleFeed = (name) => {
    petCtx.feedPet();
    alert(`Ты покормил питомца: ${name} 🍽️\nСытость восстановлена!`);
  };

  const renderFoodItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.foodCard}
        activeOpacity={0.8}
        onPress={() => handleFeed(item.name)}
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
          {/* Питомец — увеличен */}
          <Image source={petImage} style={styles.petImage} />

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

          <Text style={styles.swipeHint}>свайпни вправо, чтобы вернуться →</Text>
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
    bottom: 220,
    width: 260,       // было 210
    height: 260,      // было 210
    resizeMode: 'contain',
    zIndex: 1,
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