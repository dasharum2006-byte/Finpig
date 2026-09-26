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

export default function ArcticBankScreen({ navigation }) {
  // Баланс игрока (Монеты и Ледяные Кристаллы)
  const [coins, setCoins] = useState(400);       
  const [iceCrystals, setIceCrystals] = useState(8); 

  // Функция: Обменять 1 Ледяной Кристалл на 60 Монет (в Арктике курс повыше!)
  const handleExchangeCrystal = () => {
    if (iceCrystals < 1) {
      Alert.alert('Упс!', 'У тебя закончились ледяные кристаллы для обмена! 🧊');
      return;
    }

    setIceCrystals(iceCrystals - 1);
    setCoins(coins + 60);
    Alert.alert('Обмен завершен! ❄️', 'Вы успешно обменяли 1 Ледяной Кристалл на 60 золотых монет.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Твой сгенерированный фон банка (arctic_bank.jpg) */}
      <ImageBackground
        // source={require('../../assets/arctic_bank.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Кнопка "Назад в город" */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Arctic')}>
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        {/* Кошелек в верхнем правом углу */}
        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>🪙 {coins}</Text>
          <Text style={styles.walletText}>💎 {iceCrystals}</Text>
        </View>

        {/* Заголовок */}
        <Text style={styles.title}>Ледяной Обменник</Text>

        {/* ТЕКСТ ПОВЕРХ ПРОЗРАЧНОГО БЛОКА ЛЬДА НА СТЕНЕ */}
        <View style={styles.iceBoardContainer}>
          <Text style={styles.boardTitle}>❄️ Полярный Курс ❄️</Text>
          <Text style={styles.boardText}>
            Добро пожаловать в самый надежный банк Севера! Обменивай редкие ледяные кристаллы на монеты, чтобы покупать припасы на рынке.
          </Text>
          <Text style={styles.rateText}>1 Кристалл 💎 = 60 Монет 🪙</Text>
        </View>

        {/* Кнопка обмена внизу экрана */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.exchangeButton} onPress={handleExchangeCrystal}>
            <Text style={styles.buttonText}>Обменять 1 💎 на 60 🪙</Text>
          </TouchableOpacity>
        </View>

        {/* Пингвин-банкир, стоящий СЛЕВА */}
        <Image
          source={require('../../assets/Animals/pinguin/black/pinguin1.png')} 
          style={styles.bankerImage}
        />

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f7fa' },
  bg: { flex: 1, alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#006064',
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#006064',
    zIndex: 10,
  },
  walletText: { color: '#006064', fontWeight: 'bold', fontSize: 14, marginVertical: 1 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#006064',
    marginTop: 110,
    textShadowColor: '#fff',
    textShadowRadius: 4,
  },
  
  // ПОЗИЦИОНИРОВАНИЕ ТЕКСТА СТРОГО НА ЛЕДЯНОЙ БЛОК (на стене)
  iceBoardContainer: {
    position: 'absolute',
    top: '26%', // Подкрути этот процент, чтобы текст сел ровно на нарисованный блок льда
    width: width * 0.72, 
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 6,
  },
  boardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006064',
    textAlign: 'center',
    lineHeight: 16,
  },
  rateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00838f',
    marginTop: 12,
    backgroundColor: 'rgba(0, 131, 143, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 131, 143, 0.2)',
  },

  // Блок кнопки обмена внизу экрана
  buttonsContainer: {
    position: 'absolute',
    bottom: 180, 
    width: '100%',
    paddingHorizontal: 40,
  },
  exchangeButton: {
    width: '100%',
    backgroundColor: '#b2ebf2',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#006064',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#006064' },

  // Банкир СЛЕВА внизу
  bankerImage: {
    position: 'absolute',
    bottom: 30,
    left: 20, 
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
});
