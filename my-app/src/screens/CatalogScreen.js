import { useState, useCallback } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { SPECIES_LIST } from '../petsConfig';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

export default function CatalogScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);

  // Каждый раз при заходе на экран — сбрасываем выбор
  useFocusEffect(
    useCallback(() => {
      setSelectedId(null);
    }, [])
  );

  const handleConfirm = () => {
    const selected = SPECIES_LIST.find((s) => s.id === selectedId);
    if (!selected) return;
    navigation.navigate('PetName', {
      speciesId: selected.id,
      speciesName: selected.species,
    });
  };

  const handleForceReset = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Всё сброшено.');
      alert('Всё сброшено');
    } catch (e) {
      console.error('Reset error:', e);
    }
  };
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
        <Image source={item.egg} style={styles.image} resizeMode="contain" />
        <Text style={styles.cardLabel}>{item.species}</Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Каталог</Text>
        <Text style={styles.subtitle}>
          {selectedId ? 'Выбрано: 1' : 'Выберите яйцо'}
        </Text>
      </View>

      <FlatList
        data={SPECIES_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!selectedId}
          onPress={handleConfirm}
          style={[styles.button, !selectedId && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, !selectedId && styles.buttonTextDisabled]}>
            Выбрать
          </Text>
        </TouchableOpacity>
              {/* <TouchableOpacity
        onPress={handleForceReset}
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: '#ff4d4d',
          borderRadius: 8,
          zIndex: 100,
        }}
      > */} 
        {/* <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>СБРОС ВСЁ</Text>
      </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },                       // ← светло-голубой
  header: { paddingHorizontal: PADDING, paddingTop: 12, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#0D47A1', marginTop: 10},             // ← тёмно-голубой
  subtitle: { fontSize: 18, color: '#1976D2', marginTop: 8},               // ← средне-голубой
  listContent: { paddingHorizontal: PADDING, paddingBottom: 16 },
  row: { justifyContent: 'space-between', marginBottom: GAP },
  card: {
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',                                             // ← белые карточки
    borderWidth: 3,
    borderColor: '#90CAF9',                                                 // ← голубая обводка
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#42A5F5',                                                 // ← голубая тень
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSelected: {
    borderColor: '#1976D2',                                                 // ← тёмно-голубая обводка
    backgroundColor: '#E3F2FD',                                             // ← светло-голубой фон
  },
  image: { width: '85%', height: '85%' },
  cardLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#0D47A1',                                                       // ← тёмно-голубой текст
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1976D2',                                             // ← тёмно-голубой бейдж
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  footer: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#E3F2FD',                                             // ← тот же фон
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',                                              // ← голубая граница
  },
  button: {
    backgroundColor: '#42A5F5',                                             // ← голубая кнопка
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#BBDEFB',                                             // ← светлая
    shadowOpacity: 0,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  buttonTextDisabled: { color: '#E3F2FD' },
});