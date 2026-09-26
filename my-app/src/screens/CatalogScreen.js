import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: PADDING, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  listContent: { paddingHorizontal: PADDING, paddingBottom: 16 },
  row: { justifyContent: 'space-between', marginBottom: GAP },
  card: {
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.cardBg,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardSelected: { borderColor: colors.accent },
  image: { width: '85%', height: '85%' },
  cardLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  buttonTextDisabled: { color: colors.disabledText },
});