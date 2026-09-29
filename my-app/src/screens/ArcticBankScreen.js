import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Dimensions, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

export default function ArcticBankScreen({ navigation }) {
  const petCtx = usePet();
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  const [coins, setCoins] = useState(400);
  const [iceCrystals, setIceCrystals] = useState(8);

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
      <View style={[styles.bg, { backgroundColor: '#EAF4FF' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('ArcticScreen')}>
          <Text style={styles.backButtonText}>⬅ В город</Text>
        </TouchableOpacity>

        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>🪙 {coins}</Text>
          <Text style={styles.walletText}>💎 {iceCrystals}</Text>
        </View>

        <Text style={styles.title}>Ледяной Обменник</Text>

        <View style={styles.iceBoardContainer}>
          <Text style={styles.boardTitle}>❄️ Полярный Курс ❄️</Text>
          <Text style={styles.boardText}>
            Добро пожаловать в самый надежный банк Севера! Обменивай редкие ледяные кристаллы на монеты, чтобы покупать припасы на рынке.
          </Text>
          <Text style={styles.rateText}>1 Кристалл 💎 = 60 Монет 🪙</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.exchangeButton} onPress={handleExchangeCrystal}>
            <Text style={styles.buttonText}>Обменять 1 💎 на 60 🪙</Text>
          </TouchableOpacity>
        </View>

        {/* 🔧 ЦЕНТРИРОВАН питомец */}
        <Image source={petImage} style={styles.bankerImage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#0D47A1',
    zIndex: 10,
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
  iceBoardContainer: {
    position: 'absolute',
    top: '26%',
    width: width * 0.72,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  boardTitle: { fontSize: 17, fontWeight: 'bold', color: '#004d40', marginBottom: 6 },
  boardText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D47A1',
    textAlign: 'center',
    lineHeight: 16,
  },
  rateText: {
    fontSize: 17,
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
  buttonsContainer: {
    position: 'absolute',
    bottom: 400,
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
    borderColor: '#0D47A1',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: { fontSize: 17, fontWeight: 'bold', color: '#0D47A1' },
  // 🔧 ЦЕНТРИРОВАН (убран left: 10, добавлен alignSelf: 'center')
  bankerImage: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});