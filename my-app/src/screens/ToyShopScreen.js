import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Modal, ScrollView,
  ImageBackground, TouchableOpacity, Dimensions,
} from 'react-native';
import { usePet } from '../context/PetContext';
import { useBank } from '../context/BankContext';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import backgroundImage from '../../assets/fonshop.png';

const { width } = Dimensions.get('window');

// ─── БД товаров «Хочется» ───
const SHOP_TOY_DATA = [
  {
    id: 'toys', title: 'игрушки',
    shelves: [
      [{ id: 't1', name: 'мишка', price: 50, img: '🧸' }, { id: 't2', name: 'мячик', price: 30, img: '⚽' }],
      [{ id: 't3', name: 'машинка', price: 40, img: '🚗' }, { id: 't4', name: 'кукла', price: 45, img: '🪆' }],
    ],
  },
  {
    id: 'sweets', title: 'вкусняшки',
    shelves: [
      [{ id: 's1', name: 'мороженое', price: 15, img: '🍦' }, { id: 's2', name: 'бургер', price: 25, img: '🍔' }],
      [{ id: 's3', name: 'картошка фри', price: 20, img: '🍟' }, { id: 's4', name: 'пирожное', price: 35, img: '🧁' }],
    ],
  },
  {
    id: 'decor', title: 'украшения',
    shelves: [
      [{ id: 'd1', name: 'корона', price: 100, img: '👑' }, { id: 'd2', name: 'бантик', price: 30, img: '🎀' }],
      [{ id: 'd3', name: 'шляпа', price: 60, img: '🎩' }, { id: 'd4', name: 'шарик', price: 20, img: '🎈' }],
    ],
  },
];

export default function ToyShopScreen({ navigation }) {
  const bank = useBank();
  const pet = usePet();
  const budgetPlanCtx = useBudgetPlan();

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const getTotalCartItems = () => cart.reduce((t, i) => t + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const handleBuyProduct = (product) => {
    setPaymentError('');
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleIncrement = (id) => {
    setPaymentError('');
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  };

  const handleDecrement = (id) => {
    setPaymentError('');
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  // ─── Оплата ───
  const handlePay = () => {
    const totalCost = getTotalPrice();

    if (totalCost === 0) {
      setPaymentError('Корзина пуста, выбери что-нибудь');
      return;
    }
    if (bank.balance < totalCost) {
      setPaymentError('Не хватает монет. Заработай ещё!');
      return;
    }

    bank.setBalance(bank.balance - totalCost);

    // 👇 ВАЖНО: обновляем факт по категории «Хочется»
    budgetPlanCtx.updateFact('wants', totalCost);

    setCart([]);
    setPaymentError('');
    setIsCartVisible(false);
    alert('Покупка прошла! 🎉');
  };

  const currentCategory = SHOP_TOY_DATA[currentCategoryIndex];

  const handlePrev = () => {
    setCurrentCategoryIndex((i) => (i > 0 ? i - 1 : SHOP_TOY_DATA.length - 1));
  };
  const handleNext = () => {
    setCurrentCategoryIndex((i) => (i < SHOP_TOY_DATA.length - 1 ? i + 1 : 0));
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.cityBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cityBackEmoji}>🏙</Text>
          <Text style={styles.cityBackText}>В город</Text>
        </TouchableOpacity>

        <View style={styles.rightInfoColumn}>
          <View style={styles.coinContainer}>
            <Text style={styles.coinText}>🪙 {Math.floor(bank.balance)}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => { setPaymentError(''); setIsCartVisible(true); }}
          >
            <Text style={styles.cartEmoji}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalCartItems()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.showcase}>
        {currentCategory.shelves.map((shelf, si) => (
          <View key={si} style={styles.shelfContainer}>
            <View style={styles.productsRow}>
              {shelf.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleBuyProduct(product)}
                >
                  <Text style={styles.productEmoji}>{product.img}</Text>
                  <View style={styles.productFooterRow}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.productPriceContainer}>
                      <Text style={styles.productPrice}>{product.price}</Text>
                      <Text style={styles.coinMiniEmoji}>🪙</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.shelfLine} />
          </View>
        ))}
      </View>

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.arrowButton} onPress={handlePrev}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.categoryTitle}>{currentCategory.title}</Text>
        </View>
        <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isCartVisible} animationType="slide" transparent onRequestClose={() => setIsCartVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Твоя корзина 🛒</Text>
              <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                <Text style={styles.closeModalText}>❌</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.cartList}>
              {cart.length === 0 ? (
                <Text style={styles.emptyCartText}>Здесь пока пусто...</Text>
              ) : (
                cart.map((item) => (
                  <View key={item.id} style={styles.cartItemRow}>
                    <Text style={styles.cartItemEmoji}>{item.img}</Text>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemDescription}>{item.price} 🪙 за шт.</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity style={styles.controlButton} onPress={() => handleDecrement(item.id)}>
                        <Text style={styles.controlButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.controlButton} onPress={() => handleIncrement(item.id)}>
                        <Text style={styles.controlButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Итоговая стоимость: </Text>
                <Text style={styles.totalPriceText}>{getTotalPrice()} 🪙</Text>
              </View>
              {paymentError ? <Text style={styles.errorText}>{paymentError}</Text> : null}
              <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                <Text style={styles.payButtonText}>Оплатить 💳</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, paddingTop: 30 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: width * 0.9, zIndex: 10 },
  cityBackButton: { backgroundColor: '#57acddd5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 15, borderWidth: 2, borderColor: '#1778a5d8' },
  cityBackEmoji: { fontSize: 18, marginRight: 6 },
  cityBackText: { color: '#fff', fontWeight: '700' },
  rightInfoColumn: { flexDirection: 'column', alignItems: 'flex-end' },
  coinContainer: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FFE082', marginBottom: 10 },
  coinText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cartButton: { backgroundColor: '#5D4037', padding: 10, borderRadius: 50, borderWidth: 2, borderColor: '#8D6E63', position: 'relative' },
  cartEmoji: { fontSize: 24 },
  cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#00a5e6', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  showcase: { width: width * 0.9, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 10 },
  shelfContainer: { marginBottom: 25, width: '100%' },
  productsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 5, zIndex: 2 },
  productCard: { backgroundColor: '#e1fffdc4', width: '45%', borderRadius: 12, padding: 19, alignItems: 'center', borderWidth: 2, borderColor: '#5e8d8bd7' },
  productEmoji: { fontSize: 40, marginBottom: 6 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#1d1b1b', flex: 1, marginRight: 4 },
  productFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  productPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  productPrice: { fontSize: 13, color: '#E65100', fontWeight: 'bold', marginTop: 2 },
  coinMiniEmoji: { fontSize: 12, marginLeft: 2 },
  shelfLine: { height: 12, backgroundColor: '#3d88aaea', borderRadius: 6, width: '100%', borderWidth: 1, borderColor: '#474443', marginTop: -5 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width * 0.9, marginBottom: 30, backgroundColor: '#7abcc581', borderRadius: 15, padding: 5, borderWidth: 2, borderColor: '#85bdbd' },
  arrowButton: { paddingHorizontal: 15, paddingVertical: 10 },
  arrowText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  titleContainer: { flex: 1, alignItems: 'center' },
  categoryTitle: { fontSize: 20, color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF8E1', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '75%', borderTopWidth: 5, borderColor: '#47b7bb9d' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderColor: '#E0D4B7', paddingBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#5D4037' },
  closeModalText: { fontSize: 18 },
  cartList: { marginVertical: 10 },
  emptyCartText: { textAlign: 'center', color: '#8D6E63', fontSize: 16, marginVertical: 30, fontStyle: 'italic' },
  cartItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#FFE082' },
  cartItemEmoji: { fontSize: 30, marginRight: 12 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 16, fontWeight: 'bold', color: '#5D4037' },
  cartItemDescription: { fontSize: 13, color: '#8D6E63', marginTop: 2 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  controlButton: { paddingHorizontal: 12, paddingVertical: 6 },
  controlButtonText: { fontSize: 18, fontWeight: 'bold', color: '#E65100' },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#333', paddingHorizontal: 5 },
  modalFooter: { borderTopWidth: 2, borderColor: '#E0D4B7', paddingTop: 15, marginTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#5D4037' },
  totalPriceText: { fontSize: 22, fontWeight: 'bold', color: '#E65100' },
  errorText: { color: '#D32F2F', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, backgroundColor: '#FFEBEE', padding: 8, borderRadius: 8 },
  payButton: { backgroundColor: '#69b9b9fb', paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  payButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});