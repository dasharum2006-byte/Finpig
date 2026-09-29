import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePet } from '../context/PetContext';

export default function PurchasedItemsScreen({ navigation }) {
  const petCtx = usePet();
  console.log('PURCHASED INVENTORY:', petCtx.inventory); 
  const inventory = petCtx.inventory ?? [];

  const food = inventory.filter((i) => i.type === 'food');
  const toys = inventory.filter((i) => i.type === 'toy');
  console.log('FOOD:', food.length, 'TOYS:', toys.length);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎒 Мои покупки</Text>
        <Text style={styles.subtitle}>
          Всё, что ты купил в магазинах
        </Text>

        {/* Еда */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍎 Еда</Text>
          {food.length === 0 ? (
            <Text style={styles.emptyText}>Пока пусто — купи еду в продуктовом</Text>
          ) : (
            food.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemEmoji}>{item.img || '🍽️'}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
            ))
          )}
        </View>

        {/* Игрушки */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧸 Игрушки и украшения</Text>
          {toys.length === 0 ? (
            <Text style={styles.emptyText}>Пока пусто — купи в магазине игрушек</Text>
          ) : (
            toys.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemEmoji}>{item.img || '🧸'}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footerHint}>
          💡 Скоро можно будет поставить игрушки в гостиной
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { fontSize: 17, color: '#42A5F5', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: '#0D47A1', marginBottom: 6 },
  subtitle: { fontSize: 17, color: '#1976D2', marginBottom: 20 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#0D47A1', marginBottom: 12 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  itemEmoji: { fontSize: 32, marginRight: 12 },
  itemName: { flex: 1, fontSize: 17, color: '#0D47A1', fontWeight: '600' },
  itemQty: { fontSize: 17, color: '#1976D2', fontWeight: '800' },

  emptyText: { fontSize: 17, color: '#1976D2', fontStyle: 'italic' },

  footerHint: {
    marginTop: 12,
    fontSize: 17,
    color: '#1976D2',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});