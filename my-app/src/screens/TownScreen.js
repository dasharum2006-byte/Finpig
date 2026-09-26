import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

export default function TownScreen({ navigation }) {
  const petCtx = usePet();

  // ─── Картинка питомца из контекста ───
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ImageBackground
        source={require('../../assets/town1.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Город</Text>

          <View style={styles.buildingsContainer}>
            {/* Ряд 1 */}
            <View style={styles.buildingsRow}>
              <TouchableOpacity
                style={styles.buildingCard}
                onPress={() => navigation.navigate('FoodShop')}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.buildingEmoji}>🍏</Text>
                </View>
                <Text style={styles.buildingText}>Продуктовый магазин</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buildingCard}
                onPress={() => alert('Магазин откроется скоро!')}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.buildingEmoji}>🛍️</Text>
                </View>
                <Text style={styles.buildingText}>Магазин одежды</Text>
              </TouchableOpacity>
            </View>

            {/* Ряд 2 */}
            <View style={styles.buildingsRow}>
              <TouchableOpacity
                style={styles.buildingCard}
                onPress={() => navigation.navigate('Bank')}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.buildingEmoji}>🏦</Text>
                </View>
                <Text style={styles.buildingText}>Финансовый Банк</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buildingCard}
                onPress={() => navigation.navigate('World')}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.buildingEmoji}>🌍</Text>
                </View>
                <Text style={styles.buildingText}>Мир</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Питомец — увеличен */}
          <Image source={petImage} style={styles.petImage} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1128' },
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.06)',
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
    marginBottom: 25,
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
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  buildingsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 14,
  },
  buildingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buildingCard: {
    width: '48%',
    flexDirection: 'column',
    backgroundColor: 'rgba(76, 117, 206, 0.86)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#00f0ff',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emojiCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buildingEmoji: { fontSize: 26 },
  buildingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },

  petImage: {
    position: 'absolute',
    bottom: 20,       // было 30
    width: 220,       // было 160
    height: 220,      // было 160
    resizeMode: 'contain',
  },
});