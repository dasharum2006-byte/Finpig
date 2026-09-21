import { useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

const SWIPE_THRESHOLD = 80;

const PRODUCTS = [
  { id: '1', name: 'Морковь',  emoji: '🥕' },
  { id: '2', name: 'Яблоко',   emoji: '🍎' },
  { id: '3', name: 'Рыба',     emoji: '🐟' },
  { id: '4', name: 'Молоко',   emoji: '🥛' },
  { id: '5', name: 'Хлеб',     emoji: '🍞' },
  { id: '6', name: 'Мёд',      emoji: '🍯' },
  { id: '7', name: 'Орехи',    emoji: '🥜' },
  { id: '8', name: 'Банан',    emoji: '🍌' },
  { id: '9', name: 'Сыр',      emoji: '🧀' },
  { id: '10', name: 'Вода',    emoji: '💧' },
];

export default function KitchenScreen({ navigation }) {
  const [eaten, setEaten] = useState({});

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

  const toggleEaten = (id) => {
    setEaten((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }) => {
    const isEaten = !!eaten[item.id];
    return (
      <View style={styles.row}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={[styles.name, isEaten && styles.nameEaten]} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity
          style={[styles.eatButton, isEaten && styles.eatButtonDone]}
          onPress={() => toggleEaten(item.id)}
        >
          <Text style={styles.eatButtonText}>{isEaten ? 'Съедено' : 'Съесть'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ImageBackground
          source={require('../../assets/kitchen.png')}
          style={styles.bg}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>🍳 Кухня</Text>

            <FlatList
              data={PRODUCTS}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <Text style={styles.swipeHint}>свайпни вправо, чтобы вернуться →</Text>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bg: { flex: 1 },

  overlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 12 },

  list: { paddingBottom: 24 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emoji: { fontSize: 26, marginRight: 12 },

  name: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },
  nameEaten: { textDecorationLine: 'line-through', color: colors.textSecondary },

  eatButton: { backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  eatButtonDone: { backgroundColor: colors.disabled },
  eatButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingBottom: 8,
  },
});