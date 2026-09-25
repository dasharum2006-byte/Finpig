import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TownScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Фон города */}
      <ImageBackground
        source={require('../../assets/town1.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Голубо-синий тонирующий слой */}
        <View style={styles.overlay}>
          
          {/* Кнопка "Домой" в верхнем левом углу */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>

          {/* Главный заголовок экрана */}
          <Text style={styles.title}>Город</Text>

          {/* Вертикальный контейнер (Column) с кнопками, поднятый наверх */}
          <View style={styles.buildingsContainer}>

            {/* 1. Продуктовый магазин */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('FoodShop')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🍏</Text>
              </View>
              <Text style={styles.buildingText}>Продуктовый магазин</Text>
            </TouchableOpacity>

            {/* 2. Магазин одежды */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => alert('Магазин откроется скоро!')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🛍️</Text>
              </View>
              <Text style={styles.buildingText}>Магазин одежды</Text>
            </TouchableOpacity>

            {/* 3. Банк */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('Bank')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🏦</Text>
              </View>
              <Text style={styles.buildingText}>Финансовый Банк</Text>
            </TouchableOpacity>

          </View>

          {/* Питомец, гуляющий по городу (зафиксирован внизу экрана) */}
          <Image
            source={require('../../assets/Animals/pinguin/black/pinguin1.png')}
            style={styles.petImage}
          />

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a1128' 
  },
  bg: { 
    flex: 1 
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.06)', // Синий фильтр для приглушения деталей фона
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f5fafa', 
    letterSpacing: 2,
    
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: 50,
    marginBottom: 25, // Отступ снизу до кнопок
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.15)', 
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00f0ff',
    zIndex: 10,
  },
  backButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  buildingsContainer: {
    flexDirection: 'column', // Выстраиваем кнопки строго вертикально
    width: '100%',
    paddingHorizontal: 25, // Боковые отступы от краев экрана
    alignItems: 'center',
  },
  buildingCard: {
    flexDirection: 'row', // Внутри кнопки эмодзи и текст теперь идут в ряд
    width: width * 0.85, // Кнопка занимает большую часть ширины экрана
    height: 65, // Фиксированная аккуратная высота
    backgroundColor: 'rgba(76, 117, 206, 0.86)', // Матовое стекло
    borderRadius: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 14, // Промежуток между кнопками по вертикали
    shadowColor: '#00f0ff', 
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15, // Отступ справа от эмодзи до текста
  },
  buildingEmoji: { 
    fontSize: 22 
  },
  buildingText: { 
    fontSize: 16, // Увеличили размер шрифта для длинных строковых кнопок
    fontWeight: '600', 
    color: '#ffffff', 
    textAlign: 'left',
  },
  petImage: {
    position: 'absolute',
    bottom: 50, // Опустили питомца вниз, так как сверху освободилось место
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
});