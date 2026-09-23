import React from 'react';
import {View,Text,StyleSheet,ImageBackground,Image,TouchableOpacity,Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');


export default function TownScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Фон города */}
      <ImageBackground 
        source={require('../../assets/shopchina.jpg')} 
        style={styles.bg}
        resizeMode="cover"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButtonText}>🏠 Домой</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Город</Text>

        {/* Питомец гуляет по городу */}
        <Image 
          source={require('../../assets/Animals/pinguin/black/pinguin1.png')} 
          style={styles.petImage}
        />

        {/* Контейнер строго под три твои кнопки */}
        <View style={styles.buildingsContainer}>
          
          {/* 1. Продуктовый магазин */}
          <TouchableOpacity style={styles.buildingCard} onPress={() => navigation.navigate('FoodShop')}>
            <Text style={styles.buildingEmoji}>🍏</Text>
            <Text style={styles.buildingText}>Продуктовый</Text>
          </TouchableOpacity>

          {/* 2. Обычный Магазин одежды/сувениров */}
          <TouchableOpacity style={styles.buildingCard} onPress={() => alert('Магазин откроется скоро!')}>
            <Text style={styles.buildingEmoji}>🛍️</Text>
            <Text style={styles.buildingText}>Магазин</Text>
          </TouchableOpacity>

          {/* 3. Банк */}
          <TouchableOpacity style={styles.buildingCard} onPress={() => alert('Банк откроется скоро!')}>
            <Text style={styles.buildingEmoji}>🏦</Text>
            <Text style={styles.buildingText}>Банк</Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#4a90e2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  petImage: {
    position: 'absolute',
    bottom: 160, // Высота пингвина над кнопками, настрой под свой фон
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  buildingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 40, // Отступ снизу экрана
  },
  buildingCard: {
    width: width * 0.28, // Размер подстроен, чтобы 3 кнопки встали идеально в ряд
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingEmoji: { fontSize: 32, marginBottom: 5 },
  buildingText: { fontSize: 11, fontWeight: 'bold', color: '#333', textAlign: 'center' },
});