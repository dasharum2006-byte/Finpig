import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

export default function ArcticScreen({ navigation }) {
  const petCtx = usePet();
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.bg, { backgroundColor: '#e0f7fa' }]}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('World')}>
            <Text style={styles.backButtonText}>🗺️ На карту</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Снежная Арктика</Text>

          <View style={styles.buildingsContainer}>
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('ArcticMarketScreen')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🐟</Text>
              </View>
              <Text style={styles.buildingText}>Ледяной Рынок</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('ArcticBankScreen')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🧊</Text>
              </View>
              <Text style={styles.buildingText}>Снежный Банк</Text>
            </TouchableOpacity>
          </View>

          <Image source={petImage} style={styles.petImage} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f7fa' },
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(224, 247, 250, 0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#006064',
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
  backButtonText: { color: '#006064', fontWeight: 'bold', fontSize: 14 },
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
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
  buildingEmoji: { fontSize: 22 },
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