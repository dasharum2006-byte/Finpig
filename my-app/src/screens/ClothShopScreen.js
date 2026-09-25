import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';

const { width } = Dimensions.get('window');

// База данных одежды и аксессуаров (с привязкой к уровню питомца!)
const CLOTHES_DATA = [
  // === ДЛЯ ЦЫПЛЕНКА (1 УРОВЕНЬ) ===
  { 
    id: 'hat_magic', 
    name: 'Шляпа мага 🎩', 
    price: 40, 
    minLevel: 1, 
    skinKey: 'magic_chick',
    desc: 'Превратит твоего цыпленка в волшебника!' 
  },
  { 
    id: 'glasses_cool', 
    name: 'Крутые очки 🕶️', 
    price: 25, 
    minLevel: 1, 
    skinKey: 'cool_chick',
    desc: 'Самый стильный цыпленок на площадке.' 
  },
  { 
    id: 'bow_tie', 
    name: 'Красная бабочка 🎀', 
    price: 15, 
    minLevel: 1, 
    skinKey: 'gentleman_chick',
    desc: 'Настоящий джентльмен.' 
  },

  // === ДЛЯ ПОДРОСШЕГО ПИТОМЦА (2-3 УРОВЕНЬ) ===
  { 
    id: 'hoodie_green', 
    name: 'Зелёное худи 🟢', 
    price: 60, 
    minLevel: 2, // БЛОКИРОВКА! Доступно только со 2 уровня
    skinKey: 'green_hoodie_pet',
    desc: 'Уютная толстовка для подросшего питомца.' 
  },
  { 
    id: 'shirt_gold', 
    name: 'Золотая рубашка 🟡', 
    price: 100, 
    minLevel: 3, 
    skinKey: 'gold_shirt_pet',
    desc: 'Королевский стиль для настоящих мастеров финансов!' 
  }
];

export default function ClothShopScreen({ navigation }) {
  // Локальные стейты для демонстрации (на хакатоне перенесите в глобальный стейт города!)
  const [coins, setCoins] = useState(150); // Кошелек игрока
  const [petLevel, setPetLevel] = useState(1); // Текущий уровень твоего питомца (поменяй на 2 для теста!)
  const [boughtItems, setBoughtItems] = useState([]); // Список купленных вещей
  const [activeSkin, setActiveSkin] = useState('base'); // Надетый прямо сейчас скин

  const handleBuyItem = (item) => {
    // 1. Проверяем уровень питомца
    if (petLevel < item.minLevel) {
      alert(`🔒 Этот товар заблокирован! Твой питомец должен вырасти до ${item.minLevel} уровня.`);
      return;
    }

    // 2. Если вещь уже куплена — просто надеваем её
    if (boughtItems.includes(item.id)) {
      setActiveSkin(item.skinKey);
      alert(`👕 Ты надела на питомца: ${item.name}`);
      return;
    }

    // 3. Если покупаем первый раз — проверяем деньги
    if (coins < item.price) {
      alert('Недостаточно монет на карте! 🪙🛑');
      return;
    }

    // 4. Списываем деньги и добавляем в гардероб
    setCoins(prev => prev - item.price);
    setBoughtItems(prev => [...prev, item.id]);
    setActiveSkin(item.skinKey);
    alert(`🎉 Поздравляем с покупкой! ${item.name} теперь в гардеробе и надета на питомца.`);
  };

  const handleRemoveClothes = () => {
    setActiveSkin('base');
    alert('Питомец снова без одежды 🐣');
  };

  return (
    <View style={styles.container}>
      {/* ВЕРХНЯЯ ПАНЕЛЬ ШОПА */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>🏙 В город</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Гардероб 👑</Text>
        <View style={styles.coinBox}>
          <Text style={styles.coinText}>🪙 {coins}</Text>
        </View>
      </View>

      {/* ИНФО-ПАНЕЛЬ О ПИТОМЦЕ */}
      <View style={styles.petInfoCard}>
        <Text style={styles.petLevelText}>📈 Твой питомец: <Text style={{fontWeight: 'bold', color: '#E65100'}}>{petLevel} уровень</Text></Text>
        <Text style={styles.activeSkinText}>Надето сейчас: {activeSkin === 'base' ? 'Обычный вид 🐣' : 'Модный образ 😎'}</Text>
        {activeSkin !== 'base' && (
          <TouchableOpacity style={styles.stripBtn} onPress={handleRemoveClothes}>
            <Text style={styles.stripBtnText}>Снять одежду ❌</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* СПИСОК ОДЕЖДЫ */}
      <ScrollView style={styles.shopList} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {CLOTHES_DATA.map((item) => {
          const isLoked = petLevel < item.minLevel;
          const isBought = boughtItems.includes(item.id);
          const isEquipped = activeSkin === item.skinKey;

          return (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.itemCard, 
                isLoked && styles.lockedCard,
                isEquipped && styles.equippedCard
              ]}
              activeOpacity={0.8}
              onPress={() => handleBuyItem(item)}
            >
              {/* Левая сторона: Эмодзи/Иконка вещи */}
              <View style={styles.iconContainer}>
                <Text style={styles.itemEmoji}>{isLoked ? '🔒' : item.name.split(' ').pop()}</Text>
              </View>

              {/* Центр: Название и описание */}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{isLoked ? `Доступно со 2 уровня (когда питомец вырастет)` : item.desc}</Text>
              </View>

              {/* Правая сторона: Кнопка цены / статуса */}
              <View style={styles.actionBlock}>
                {isLoked ? (
                  <View style={styles.lockBadge}><Text style={styles.lockBadgeText}>Lvl {item.minLevel}</Text></View>
                ) : isEquipped ? (
                  <View style={styles.equippedBadge}><Text style={styles.equippedBadgeText}>Надето</Text></View>
                ) : isBought ? (
                  <View style={styles.wearBadge}><Text style={styles.wearBadgeText}>Надеть</Text></View>
                ) : (
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{item.price} 🪙</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3e2723', paddingTop: 50, alignItems: 'center' }, // Уютный коричневый фон примерочной
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: width * 0.9, marginBottom: 15 },
  backButton: { backgroundColor: '#5d4037', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#8d6e63' },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFE082' },
  coinBox: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FFE082' },
  coinText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  // Панель статуса питомца
  petInfoCard: { backgroundColor: '#FFF8E1', width: width * 0.9, padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 2, borderColor: '#FFE082', alignItems: 'center' },
  petLevelText: { fontSize: 15, color: '#5D4037' },
  activeSkinText: { fontSize: 13, color: '#757575', marginTop: 4 },
  stripBtn: { backgroundColor: '#D32F2F', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  stripBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  // Список товаров
  shopList: { width: width * 0.9, flex: 1 },
  scrollContent: { paddingBottom: 30 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 18, marginBottom: 12, borderWidth: 2, borderColor: '#E0D4B7' },
  lockedCard: { backgroundColor: '#E0E0E0', borderColor: '#BDBDBD', opacity: 0.7 },
  equippedCard: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  
  iconContainer: { backgroundColor: '#F5F5F5', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemEmoji: { fontSize: 26 },
  itemInfo: { flex: 1, paddingRight: 4 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#5D4037' },
  itemDesc: { fontSize: 11, color: '#8D6E63', marginTop: 2, lineHeight: 15 },
  
  // Бейджи статусов справа
  priceBadge: { backgroundColor: '#FFB74D', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  priceText: { color: '#5D4037', fontWeight: 'bold', fontSize: 13 },
  wearBadge: { backgroundColor: '#3b71af', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  wearBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  equippedBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  equippedBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  lockBadge: { backgroundColor: '#78909C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  lockBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
});
