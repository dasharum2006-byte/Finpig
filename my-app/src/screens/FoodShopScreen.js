import React, {useState} from 'react'
import { StyleSheet,Text,View,Image,TouchableOpacity,Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

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

export default function FoodShopScreen() {
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
    <View style={styles.container}>
        {/* Шапка магазина */}
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
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginBottom: 30,
    backgroundColor: '#5D4037',
    borderRadius: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#8D6E63',
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
    backgroundColor: '#4E342E',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 3,
    borderColor: '#2D1510',
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
    backgroundColor: '#FFF8E1',
    width: '40%',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE082',
    shadowColor: '#000',
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
    color: '#5D4037',
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
    backgroundColor: '#8D6E63', 
    borderRadius: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: '#5D4037',
    marginTop: -5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
});