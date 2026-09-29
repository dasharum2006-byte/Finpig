import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, SafeAreaView, Dimensions, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

export default function EgyptBankScreen({ navigation }) {
  const petCtx = usePet();
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('EgyptScreen')}
        >
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>🪙 {coins}</Text>
          <Text style={styles.walletText}>💎 {crystals}</Text>
        </View>

        <Text style={styles.title}>Банк</Text>

        <View style={styles.papyrusContainer}>
          <Text style={styles.papyrusTitle}>📜 Курс Обмена</Text>
          <Text style={styles.papyrusText}>
            Приветствую, путник! Здесь ты можешь обменять редкие кристаллы, найденные в гробницах, на обычные золотые монеты для рынка.
          </Text>
          <Text style={styles.rateText}>1 Кристалл 💎 = 50 Монет 🪙</Text>
        </View>

        {/* Кнопка обмена — смещена выше */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.exchangeButton} onPress={handleExchangeCrystal}>
            <Text style={styles.buttonText}>Обменять 1 💎 на 50 🪙</Text>
          </TouchableOpacity>
        </View>

        {/* Питомец — по центру снизу, увеличен */}
        <Image source={petImage} style={styles.bankerImage} />
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
    backgroundColor: '#0D47A1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },

  walletContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#0D47A1',
    zIndex: 10,
    alignItems: 'flex-start',
  },
  walletText: { color: '#0D47A1', fontWeight: 'bold', fontSize: 17, marginVertical: 1 },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D47A1',
    marginTop: 110,
    textShadowColor: '#fff',
    textShadowRadius: 4,
  },

  papyrusContainer: {
    position: 'absolute',
    top: '26%',
    width: width * 0.78,           // ← шире, чтобы текст не сжимался
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // ← БЕЛАЯ ПОДЛОЖКА — не сливается с фоном
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(61, 37, 16, 0.3)',          // ← тонкая тёмная рамка
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  papyrusTitle: {
    fontSize: 22,                  // ← было 15, стало 22
    fontWeight: '900',
    color: '#2c1a08',              // ← почти чёрный — максимальный контраст
    marginBottom: 12,
    textAlign: 'center',
  },
  papyrusText: {
    fontSize: 17,                  // ← было 11, стало 17
    fontWeight: '700',
    color: '#1a0f05',              // ← почти чёрный текст
    textAlign: 'center',
    lineHeight: 24,                // ← было 15, стало 24
  },
  rateText: {
    fontSize: 20,                  // ← было 13, стало 20
    fontWeight: '900',
    color: '#ffffff',              // ← БЕЛЫЙ текст
    marginTop: 16,
    backgroundColor: '#b8860b',    // ← золотая плашка — выделяется
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
  },

  // ✅ Кнопка обмена — поднята выше (было bottom: 180)
  buttonsContainer: {
    position: 'absolute',
    bottom: 300,           // ← было 180, теперь выше
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
    borderColor: '#0D47A1',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: { fontSize: 17, fontWeight: 'bold', color: '#0D47A1' },

  // ✅ Питомец — по центру снизу, увеличен
  bankerImage: {
    position: 'absolute',
    bottom: 10,            // ← было 30, опущен чуть ниже
    alignSelf: 'center',   // ← было left: 20, теперь по центру
    width: 250,            // ← было 130, увеличен
    height: 250,           // ← было 130, увеличен
    resizeMode: 'contain',
  },
});