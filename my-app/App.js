import { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

// Список картинок (замени на свои или на локальные require('./assets/...'))

const IMAGES = [
    { id: '1', source: require('./assets/image1.png') },
  { id: '2', source: require('./assets/image2.png') },
  { id: '3', source: require('./assets/image3.png') },
  { id: '4', source: require('./assets/image4.png') },
  { id: '5', source: require('./assets/image5.png') },
  { id: '6', source: require('./assets/image6.png') },
];

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
// ширина одного айтема: экран минус отступы по бокам минус gap между колонками
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

export default function App() {
  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedId(item.id)}
        style={[
          styles.card,
          { width: ITEM_WIDTH },
          isSelected && styles.cardSelected,
        ]}
      >
        <Image source={item.source} style={styles.image} />
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Каталог</Text>
        <Text style={styles.subtitle}>
          {selectedId ? 'Выбрано: 1' : 'Выберите изображение'}
        </Text>
      </View>

      {/* Сетка 2 колонки, скроллится */}
      <FlatList
        data={IMAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Фиксированный футер — не скроллится */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!selectedId}
          onPress={() => console.log('Выбрано:', selectedId)}
          style={[styles.button, !selectedId && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, !selectedId && styles.buttonTextDisabled]}>
            Выбрать
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  header: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#8b8b9a',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: GAP,
  },
  card: {
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1a1a24',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#7c5cff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c5cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#16161f',
    borderTopWidth: 1,
    borderTopColor: '#26262f',
  },
  button: {
    backgroundColor: '#7c5cff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#2a2a35',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#5a5a66',
  },
});