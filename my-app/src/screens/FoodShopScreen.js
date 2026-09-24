import React, {useState} from 'react'
import { StyleSheet,Text,View,Image,Modal,ScrollView,ImageBackground,TouchableOpacity,Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
import backgroundImage from '../../assets/fonshop.png';


//БД товаров
const SHOP_FOOD_DATA = [
    {
    id: 'ready_food', title: 'готовая еда',
    shelves: [
        [{id:'b1',name:'борщ',price: 4,img:''},{id:'b2',name:'салат',price: 6,img:''}],
        [{id:'b3',name:'паста',price: 3,img:''},{id:'b4',name:'каша',price: 7,img:''}],
        [{id:'b5',name:'бутерброд',price: 5,img:''},{id:'b6',name:'бургер',price: 6,img:''}],
        ]
    },
    {
    id: 'vegetables_fruits', title: 'овощи и фрукты',
    shelves: [
        [{id:'a1',name:'помидор',price: 4,img:''},{id:'a2',name:'салат',price: 6,img:''}],
        [{id:'a3',name:'арбуз',price: 3,img:''},{id:'a4',name:'апельсин',price: 7,img:''}],
        [{id:'a5',name:'яблоко',price: 5,img:''},{id:'a6',name:'морковь',price: 6,img:''}],
        ]
    },
    {
    id: 'other', title: 'остальное',
    shelves: [
        [{id:'c1',name:'йогурт',price: 4,img:''},{id:'c2',name:'морс с малиной',price: 6,img:''}],
        [{id:'c3',name:'рыба',price: 3,img:''},{id:'c4',name:'сок',price: 7,img:''}],
        [{id:'c5',name:'',price: 5,img:''},{id:'c6',name:'',price: 6,img:''}],
        ]
    },
    {
    id: 'sweets', title: 'сладости',
    shelves: [
        [{id:'d1',name:'торт',price: 4,img:''},{id:'d2',name:'печенье',price: 6,img:''}],
        [{id:'d3',name:'',price: 3,img:''},{id:'d4',name:'',price: 7,img:''}],
        [{id:'d5',name:'',price: 5,img:''},{id:'d6',name:'',price: 6,img:''}],
        ]
    },
];
//Добавление ЛОгики для покупок - корзина и чек!!!!!!!!!!1
export default function FoodShopScreen({navigation}) {
    //индекс текущ активности
    const [currentCategoryIndex,setCurrentCategoryIndex] = useState(0);

    //Монеты  и товары в корзине
    //баланс монет пльзователя
    const [coins,setCoins] = useState(150);
    //массив товаров в корзине
    const [cart,setCart] = useState([]);
    //окно корзины открывается и закрывается
    const [isCartVisible, setIsCartVisible] = useState(false);
    //текст ошибли об оплате
    const [paymentError, setPaymentError] = useState('');

    //считаем общее количество товаров на значок
    const getTotalCartItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };
    //считаем стоимость для всей корзины
    const getTotalCartItenms = () => {
        return cart.reduce((total,item) => total + item.quantity, 0);
    };
    //итоговая стоимость всей корзины
    const getTotalPrice = () => {
        return cart.reduce((total,item) => total + (item.price * item.quantity),0);
    }
    //Добавление в корзину с полки пока что деньги не списываются
    const handleBuyProduct = (product) => {
        //сбрасываем старые ошибки
        setPaymentError('');
        setCart(prevCart => {
            const existingItemIndex = SVGAnimatedPreserveAspectRatio.findIndex(item => item,id === product.id);
            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                return newCart;
            } else {
                return [...prevCart, {...product,quantity: 1}];
            }
        });
    };
    //Плюсик внутри корзины
    const handleIncrement = (productId) => {
        setPaymentError('');
        setCart(prevCart =>
            prevCart.map(item => item.id === productId ? {...item,quantity:item.quantity + 1}:item)
        );
    };
    //Минус внутри корзины
    const handleDecrement = (productId) => {
        setPaymentError('');
        setCart(prevCart => {
            //если 0 штук товаров то удаляем его
            return prevCart.map(item => item.id === productId ? {...item,quantity:item.quantity - 1}:item)
            .filter(item => item.quantity > 0);
        });
    };
    //Логика оплаты всей корзины
    const handlePay = () => {
        const totalCost = getTotalPrice();

        if (totalCost === 0) {
            setPaymentError('Корзина пуста, сначала выбери пожалуйста продукты');
            return;
        }
        if (coins < totalCost) {
            setPaymentError('Не удалось провести оплату.На карте недостаточно денег');
            return;
        }
        //Если денег хватаем, то списываем всю сумму,затем очищаем корзину и закрываем ее
        setCoins(prev => prev - totalCost);
        setCart([]);
        setPaymentError('');
        setIsCartVisible(false);
        alert('Оплата прошла успешно.Продукты куплены');
    };

    //  САМ МАГАЗИН - ПОЛКИ И ЛИСТАНИЕ ТУДА СЮДА

    const currentCategory = SHOP_FOOD_DATA[currentCategoryIndex];
    //листание назад
    const handlePrev = () => {
        if (currentCategoryIndex > 0) {
            setCurrentCategoryIndex(currentCategoryIndex - 1);
        } else {
            //зацикливаемся на последнюю
            setCurrentCategoryIndex(SHOP_FOOD_DATA.length - 1);
        }
    };
    //функция когда листаешь вперед
    const handleNext = () => {
        if (currentCategoryIndex < SHOP_FOOD_DATA.length - 1) {
            setCurrentCategoryIndex(currentCategoryIndex + 1);
        } else {
            // зацикливаемся на первую
            setCurrentCategoryIndex(0); 
    }
};

return (
    // <View style={styles.container}>
    <ImageBackground
        source={backgroundImage} style={styles.container} resizeMode='cover'>
        
    <View style={styles.topBar}>
      
      {/* ЛЕВАЯ СТОРОНА: Кнопка возврата в город */}
      <TouchableOpacity 
        style={styles.cityBackButton} 
        activeOpacity={0.7} 
        onPress={() => navigation.goBack()} // Возвращает на предыдущую страницу (в город)
      >
        <Text style={styles.cityBackEmoji}>🏙</Text>
        <Text style={styles.cityBackText}>В город</Text>
      </TouchableOpacity>

      {/* ПРАВАЯ СТОРОНА: Вертикальный блок (Деньги, а под ними Корзина) */}
      <View style={styles.rightInfoColumn}>
        {/* Баланс монет */}
        <View style={styles.coinContainer}>
          <Text style={styles.coinText}>🪙 150</Text>
        </View>

        {/* Продуктовая корзина прямо под монетами */}
        <TouchableOpacity 
          style={styles.cartButton} 
          activeOpacity={0.7} 
        //   onPress={() => alert('Здесь откроется твоя корзина с едой')}
        // с помощью нажатия открываем корзину
        onPress={() => {setPaymentError('');
            setIsCartVisible(true);
            }}
        >
          <Text style={styles.cartEmoji}>🛒</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getTotalCartItems()}</Text>
          </View>
        </TouchableOpacity>
      </View>

    </View>


         {/* полки */}
            <View style={styles.showcase}>
                {currentCategory.shelves.map((shelf,shelfIndex) => (
                    <View key={shelfIndex} style={styles.shelfContainer}>

                        {/* на 2 полках продукты */}
                        <View style={styles.productsRow}>
                            {shelf.map((product) => (
                                <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.7} onPress={() => handleBuyProduct(product)}>
                                    <Text style={styles.productEmodji}>{product.img}</Text>
                                     
                                    <View style={styles.productFooterRow}>
                                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>

                                     <View style={styles.productPriceContainer}>
                                         <Text style={styles.productPrice}>{product.price}</Text>
                                        <Text style={styles.coinMiniEmoji}>🪙</Text>
                                    </View>
                                    </View>
                                </TouchableOpacity>
                                )
                            )
                         }
                        </View>
                        {/*полка */}
                        <View style={styles.shelfLine}/>
                        </View>
                    )
                )
            }
        </View>

        {/* переключатель */}
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
           
        {/* Окно всплывающее корзины с чеком */}
        <Modal visible={isCartVisible} animationType="slide" transparent={true}
        onRequestClose={() => setIsCartVisible(false)}>
            <View style={styles.modalOverlay}>
                 <View style={styles.modalContent}>
          {/* Шапка модалки */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Твоя корзина 🛒</Text>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsCartVisible(false)}>
              <Text style={styles.closeModalText}>❌</Text>
            </TouchableOpacity>
          </View>
          {/* Список товаров (Scrollable, если еды много) */}
          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <Text style={styles.emptyCartText}>Здесь пока пусто... добавь еду с полок</Text>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={styles.cartItemRow}>
                  {/*Иконка */}
                  <Text style={styles.cartItemEmoji}>{item.img || '📦'}</Text>
                  {/* Название и описание цены */}
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemDescription}>{item.price} 🪙 за шт.</Text>
                  </View>
                  {/*Блок управления количеством -  + */}
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
            {/*Итог и Кнопка оплаты */}
            <View style={styles.modalFooter}>
                <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Итоговая стоимость: </Text>
                <Text style={styles.totalPriceText}>{getTotalPrice()}🪙</Text>
                </View>
                {/*Вывод ошибки, если не хватает денег */}
                {paymentError ? (
                <Text style={styles.errorText}>{paymentError}</Text>) : null}
                <TouchableOpacity style={styles.payButton} activeOpacity={0.8} onPress={handlePay}>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginBottom: 30,
    backgroundColor: '#7abcc581',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#85bdbd',
  },
  arrowButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  showcase: {
    width: width * 0.9,
    // backgroundColor: '#cc725d',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    // borderWidth: 3,
    // borderColor: '#2D1510',
  },
  shelfContainer: {
    marginBottom: 25,
    width: '100%',
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 5,
    zIndex: 2, 
  },
  productCard: {
    backgroundColor: '#e1fffdc4',
    width: '45%',
    borderRadius: 12,
    padding: 19,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5e8d8bd7',
    shadowColor: '#c4c4c4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  productEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1d1b1b',
    textAlign: 'left',
    flex: 1,
    textAlign: 'left', 
    marginRight: 4, 
  },
  // Строка-контейнер в самом низу карточки
  productFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%',
    paddingHorizontal: 2,
  },
  // Контейнер для цены и монетки
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: 'bold',
    marginTop: 2,
  },
  shelfLine: {
    height: 12,
    backgroundColor: '#3d88aaea', 
    borderRadius: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: '#474443',
    marginTop: -5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
    topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: width * 0.9,
    marginBottom: 0,
    zIndex: 10,
  },
  // Кнопка города слева
  cityBackButton: {
    backgroundColor: '#57acddd5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1778a5d8',
    shadowColor: '#00000083',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  // Вертикальная колонка справа
  rightInfoColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end', 
  },
   coinContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: 10,
  },
  coinText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#5D4037',
    padding: 10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#8D6E63',
    position: 'relative',
  },
  cartEmoji: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#00a5e6',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Стили для модального окна корзины
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Затемняем задний фон магазина
    justifyContent: 'flex-end', // Прижимаем окно к низу экрана
  },
  modalContent: {
    backgroundColor: '#FFF8E1', // Светлый приятный цвет чековой бумаги
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '75%', // Чтобы корзина не перекрывала весь экран целиком
    borderTopWidth: 5,
    borderColor: '#47b7bb9d',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#E0D4B7',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  closeModalButton: {
    padding: 5,
  },
  closeModalText: {
    fontSize: 18,
  },
  cartList: {
    marginVertical: 10,
  },
  emptyCartText: {
    textAlign: 'center',
    color: '#8D6E63',
    fontSize: 16,
    marginVertical: 30,
    fontStyle: 'italic',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  cartItemEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  cartItemDescription: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 5,
  },
  modalFooter: {
    borderTopWidth: 2,
    borderColor: '#E0D4B7',
    paddingTop: 15,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  totalPriceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E65100',
  },
  errorText: {
    color: '#D32F2F', 
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  payButton: {
    backgroundColor: '#69b9b9fb', 
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});