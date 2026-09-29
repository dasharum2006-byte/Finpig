import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  Alert
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EgyptBankScreen({ navigation }) {
  const [coins, setCoins] = useState(350);
  const [crystals, setCrystals] = useState(5);

  const handleExchangeCrystal = () => {
    if (crystals < 1) {
      Alert.alert('Упс!', 'У тебя нет египетских кристаллов для обмена! 💎');
      return;
    }

    setCrystals(crystals - 1);
    setCoins(coins + 50);
    Alert.alert('Обмен завершен', 'Вы обменяли 1 Кристалл на 50 золотых монет.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ImageBackground
        source={require('../../assets/egyptbank.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('EgyptScreen')}>
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>🪙 {coins}</Text>
          <Text style={styles.walletText}>💎 {crystals}</Text>
        </View>

        {/* 🔧 ЗАГОЛОВОК ИЗМЕНЕН НА "БАНК" */}
        <Text style={styles.title}>Банк</Text>

        {/* 🔧 ТЕКСТ ВПИСАН В БЕЛОЕ ПОЛОТНО (СВИТОК) */}
        <View style={styles.papyrusContainer}>
          <Text style={styles.papyrusTitle}>📜 Курс Обмена</Text>
          <Text style={styles.papyrusText}>
            Приветствую, путник! Здесь ты можешь обменять редкие кристаллы, найденные в гробницах, на обычные золотые монеты для рынка.
          </Text>
          <Text style={styles.rateText}>1 Кристалл 💎 = 50 Монет 🪙</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.exchangeButton} onPress={handleExchangeCrystal}>
            <Text style={styles.buttonText}>Обменять 1 💎 на 50 🪙</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require('../../assets/Animals/Pinguin/Black/pinguin1_m.png')}
          style={styles.bankerImage}
        />

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b8860b' },
  bg: { flex: 1, alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#3d2510',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  walletContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#3d2510',
    zIndex: 10,
    alignItems: 'flex-start',
  },
  walletText: { color: '#3d2510', fontWeight: 'bold', fontSize: 14, marginVertical: 1 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3d2510',
    marginTop: 110,
    textShadowColor: '#fff',
    textShadowRadius: 4,
  },

  // 🔧 СКОРРЕКТИРОВАНО ПОЛОЖЕНИЕ ТЕКСТА НА ПОЛОТНЕ
  papyrusContainer: {
    position: 'absolute',
    top: '28%', // Сдвинуто немного вниз для центрирования на свитке
    width: width * 0.68, // Немного уменьшена ширина, чтобы текст не вылезал за края
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  papyrusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a2c11',
    marginBottom: 6,
  },
  papyrusText: {
    fontSize: 11, // Уменьшен шрифт для лучшего вписывания
    fontWeight: '600',
    color: '#5c3a21',
    textAlign: 'center',
    lineHeight: 15, // Уменьшен межстрочный интервал
  },
  rateText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#b8860b',
    marginTop: 10,
    backgroundColor: 'rgba(61, 37, 16, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  buttonsContainer: {
    position: 'absolute',
    bottom: 180,
    width: '100%',
    paddingHorizontal: 40,
  },
  exchangeButton: {
    width: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3d2510',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#3d2510' },

  bankerImage: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
});