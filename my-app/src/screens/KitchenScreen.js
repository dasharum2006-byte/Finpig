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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

const{width} = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const PRODUCTS = [
  { id: '1', name: 'Борщ',image:require('../../assets/Food/borsh.png') },
  { id: '2', name: 'Яблоко',image:require('../../assets/Food/apple.png')},
  { id: '3', name: 'Бутерброд',image:require('../../assets/Food/buterbrod.png')},
  { id: '4', name: 'Морс и малина',image:require('../../assets/Food/mors.png')},
  { id: '5', name: 'Спагетти',image:require('../../assets/Food/pasta.png')},
  { id: '6', name: 'Печеньки',image:require('../../assets/Food/cookies.png')},
  { id: '7', name: 'Круасан',image:require('../../assets/Food/croissant.png')},
  { id: '8', name: 'Блинчики',image:require('../../assets/Food/pancake.png')},
  { id: '9', name: 'Салат',image:require('../../assets/Food/salade.png')},
  { id: '10', name: 'Сок',image:require('../../assets/Food/applejuice.png')},
  { id: '11', name: 'Бургер',image:require('../../assets/Food/burger.png')},
  { id: '12', name: 'Торт',image:require('../../assets/Food/cake.png')},
  { id: '13', name: 'Газировка',image:require('../../assets/Food/cola.png')},
  { id: '14', name: 'Каша',image:require('../../assets/Food/porrige.png')},
  { id: '15', name: 'Вареники',image:require('../../assets/Food/varenniki.png')},
  { id: '16', name: 'Йогурт',image:require('../../assets/Food/yogurt.png')},
];

export default function KitchenScreen({ navigation }) {
  const [eaten, setEaten] = useState({});
  const FlatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ─── Свайп ВПРАВО → обратно на Home (дом справа) ───
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

  //кнопки стрелки на столе
  const scrollLeft = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      FlatListRef.current?.scrollToIndex({index:nextIndex,animated:true});
    }
  };

  const scrollRight = () => {
    if (currentIndex < PRODUCTS.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      FlatListRef.current?.scrollToIndex({index:nextIndex,animated:true});
    }
  };

  //Добавить еще что у него сытость повышается у питомца!!!!!!!!
  const toggleEaten = (id) => {
    setEaten((prev) => ({ ...prev, [id]: !prev[id] }));
  };

   const feedPet = (name) => {
    alert(`Вы покормили питомца:${name}`);
  };
  const renderFoodItem = ({ item }) => {
    // const isEaten = !!eaten[item.id];

    return (
        <TouchableOpacity
          style={styles.foodCard} activeOpacity={0.8}  onPress={() => feedPet(item.name)}>
          <Image source={item.image} style={styles.foodImage}/>
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
          {/* Питомец сидит за столом */}
          <Image source={require('../../assets/Animals/pinguin/black/pinguin1.png')} style={styles.petImage}/>
          {/* Вырезанная скатерть */}
          <ImageBackground source={require('../../assets/table.png')} style={styles.tableBackground} resizeMode='contain'>
          {/* <View style={styles.overlay}>
            <Text style={styles.title}>🍳 Кухня</Text> */}
          {/* Крутящая штуковина на столе */}
          <View style={styles.carouselContainer}>
            {/* левая стрелка */}
            <TouchableOpacity
              style={[styles.arrowButton,currentIndex === 0 && styles.disabledArrow]}
              onPress={scrollLeft}
              disabled={currentIndex === 0}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            {/* лента с блюдами */}
            <FlatList
              ref={FlatListRef}
              data={PRODUCTS}
              keyExtractor={(item) => item.id}
              renderItem={renderFoodItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              snapToAlignment='center'
              contentContainerStyle={styles.foodListContent}
              scrollEnabled={true}
              onMomentumScrollEnd={ (e) => {
                const offset = e.nativeEvent.contentOffset.x;
                // 110 - ширина карточки еды с отступами получается
                const index = Math.round(offset / 110);
                setCurrentIndex(index);
              }}
            />
            {/* правая черная стрелка */}
            <TouchableOpacity style={[styles.arrowButton, currentIndex === PRODUCTS.length - 1 && styles.disabledArrow]}
            onPress={scrollRight}
            disabled={currentIndex === PRODUCTS.length - 1}>
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
  bg: { flex: 1, position:'relative', alignItems:'center' },
  petImage: {
    position: 'absolute',
    bottom: 220, //cажаем пингвина на стул 
    width: 210,
    height: 210,
    resizeMode: 'contain',
    zIndex: 1, //cлой под столом
  },
  //стол поверх питомца 
  tableBackground: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 775, //высота стола со скатертью 
    width: 450,
    justifyContent: 'flex-start',
    paddingTop: 545, //cдвигаем еду на верх
    zIndex: 2, //cлой над питомцем
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: -20, //тарелки легли на поверхность стола
  },

  //Черные круглые кнопки-стрелки
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
  disabledArrow: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  arrowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  //cписок блюд
  foodListContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  foodCard: {
    width: 90,
    height: 90,
    borderRadius: 15,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
 
  },
  foodImage: {
    width: 95,
    height: 95,
    resizeMode: 'contain',
  },
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
  // overlay: {
  //   flex: 1,
  //   paddingHorizontal: 16,
  //   paddingTop: 16,
  //   backgroundColor: 'rgba(255,255,255,0.55)',
  // },
  // title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 12 },
  // list: { paddingBottom: 24 },
  // row: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: 'rgba(255,255,255,0.92)',
  //   paddingHorizontal: 14,
  //   paddingVertical: 12,
  //   borderRadius: 14,
  //   marginBottom: 8,
  //   borderWidth: 1,
  //   borderColor: colors.border,
  // },
  // emoji: { fontSize: 26, marginRight: 12 },
  // name: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },
  // nameEaten: { textDecorationLine: 'line-through', color: colors.textSecondary },
  // eatButton: { backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  // eatButtonDone: { backgroundColor: colors.disabled },
  // eatButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  // swipeHint: {
  //   textAlign: 'center',
  //   fontSize: 12,
  //   color: colors.textSecondary,
  //   fontStyle: 'italic',
  //   paddingBottom: 8,
  // },
});