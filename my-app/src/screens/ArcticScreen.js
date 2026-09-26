import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ArcticScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Фон Арктики со снегами и айсбергами (arctic_bg.jpg) */}
      <ImageBackground
        // source={require('../../assets/arctic_bg.jpg')} 
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Мягкий зимний фильтр */}
        <View style={styles.overlay}>
          
          {/* Кнопка возврата на Карту Мира */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('WorldScreen')}>
            <Text style={styles.backButtonText}>🗺️ На карту</Text>
          </TouchableOpacity>

          {/* Главный заголовок экрана */}
          <Text style={styles.title}>Снежная Арктика</Text>

          {/* Вертикальный контейнер кнопок (Column) */}
          <View style={styles.buildingsContainer}>

            {/* 1. Ледяной Рынок */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('ArcticMarket')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🐟</Text>
              </View>
              <Text style={styles.buildingText}>Ледяной Рынок</Text>
            </TouchableOpacity>

            {/* 2. Снежный Банк */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('ArcticBank')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🧊</Text>
              </View>
              <Text style={styles.buildingText}>Снежный Банк</Text>
            </TouchableOpacity>

          </View>

          {/* Твой пингвин, который идеально впишется в эту заснеженную локацию */}
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
    backgroundColor: '#e0f7fa' // Запасной светло-голубой цвет
  },
  bg: { 
    flex: 1 
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(224, 247, 250, 0.1)', // Легкий полярный оверлей
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#006064', // Глубокий океанический сине-зеленый цвет
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    marginTop: 70,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#006064',
    zIndex: 10,
  },
  backButtonText: { 
    color: '#006064', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  buildingsContainer: {
    flexDirection: 'column', 
    width: '100%',
    paddingHorizontal: 25, 
    alignItems: 'center',
  },
  buildingCard: {
    flexDirection: 'row', 
    width: width * 0.85, 
    height: 65, 
    backgroundColor: 'rgba(255, 255, 255, 0.92)', // Яркие зимние контрастные кнопки
    borderRadius: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#006064',
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 96, 100, 0.08)', 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15, 
  },
  buildingEmoji: { 
    fontSize: 22 
  },
  buildingText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#006064', 
    textAlign: 'left',
  },
  petImage: {
    position: 'absolute',
    bottom: 60, 
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});
