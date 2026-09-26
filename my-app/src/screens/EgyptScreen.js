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

export default function EgyptTownScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Фон древнего Египта с пирамидами (egypt_bg.jpg) */}
      <ImageBackground
        source={require('../../assets/egypt.png')} 
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Легкий песчано-золотой фильтр для атмосферности */}
        <View style={styles.overlay}>
          
          {/* Кнопка возврата на Карту Мира */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('WorldScreen')}>
            <Text style={styles.backButtonText}>🗺️ На карту</Text>
          </TouchableOpacity>

          {/* Главный заголовок экрана в египетском стиле */}
          <Text style={styles.title}>Древний Египет</Text>

          {/* Вертикальный контейнер кнопок (Column), поднятый наверх */}
          <View style={styles.buildingsContainer}>

            {/* 1. Египетский рынок */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('EgyptMarketScreen')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🍏</Text>
              </View>
              <Text style={styles.buildingText}>Египетский рынок</Text>
            </TouchableOpacity>

            {/* 2. Королевский Банк */}
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('EgyptBankScreen')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🏦</Text>
              </View>
              <Text style={styles.buildingText}>Королевский Банк</Text>
            </TouchableOpacity>

          </View>

          {/* Подросший тигрёнок, который ровно стоит на песчаной дороге внизу */}
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
    backgroundColor: '#e6b800' // Запасной золотисто-песочный цвет
  },
  bg: { 
    flex: 1 
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(230, 184, 0, 0.15)', // Мягкий золотистый фильтр, объединяющий картинку
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3d2510', // Темно-коричневый цвет египетских чернил
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    marginTop: 70,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3d2510',
    zIndex: 10,
  },
  backButtonText: { 
    color: '#3d2510', 
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Белые матовые кнопки, контрастные на желтом песке
    borderRadius: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3d2510',
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(61, 37, 16, 0.1)', 
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
    color: '#3d2510', 
    textAlign: 'left',
  },
  petImage: {
    position: 'absolute',
    bottom: 60, // Прочно зафиксирован на дороге внизу
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});
