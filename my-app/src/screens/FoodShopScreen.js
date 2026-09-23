import React, {useState} from 'react'
import { StyleSheet,Text,View,Image,ImageBackground,TouchableOpacity,Dimensions} from 'react-native';

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

export default function FoodShopScreen({navigation}) {
    //индекс текущ активности
    const [currentCategoryIndex,setCurrentCategoryIndex] = useState(0);

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
        {/* Шапка магазина */}
        {/* !!!!!!!!!!!поменять на реальную */}
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
          onPress={() => alert('Здесь откроется твоя корзина с едой!')}
        >
          <Text style={styles.cartEmoji}>🛒</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
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
                                <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.7}>
                                    <Text style={styles.productEmodji}>{product.img}</Text>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productPrice}>{product.price}</Text>
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
           
    </ImageBackground>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#3E2723', 
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
    width: '40%',
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
    marginBottom: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5e4740',
    textAlign: 'center',
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
    backgroundColor: '#29597494',
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
    alignItems: 'flex-end', // Прижимаем элементы к правому краю
  },
   coinContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Полупрозрачный черный фон, чтобы кошелек читался на любом фоне
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
});