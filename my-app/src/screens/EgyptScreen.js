import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, Dimensions } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function EgyptScreen({ navigation }) {
  const petCtx = usePet();
  const currentStage = petCtx.pet?.stage ?? 0;

  const petImage = petCtx.pet
    ? (currentStage === 0
        ? getEggImage(petCtx.pet.speciesId)
        : getPetImage(petCtx.pet.speciesId, petCtx.pet.variationId, currentStage - 1))
    : require('../../assets/Animals/Pinguin/Black/pinguin1_m.png');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ImageBackground
        source={require('../../assets/egypt.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('World')}
          >
            <Text style={styles.backButtonText}>🗺️ На карту</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Древний Египет</Text>

          <View style={styles.buildingsContainer}>
            <TouchableOpacity
              style={styles.buildingCard}
              onPress={() => navigation.navigate('EgyptMarketScreen')}
            >
              <View style={styles.emojiCircle}>
                <Text style={styles.buildingEmoji}>🍏</Text>
              </View>
              <Text style={styles.buildingText}>Египетский рынок</Text>
            </TouchableOpacity>

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

          <Image source={petImage} style={styles.petImage} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6b800' },
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(230, 184, 0, 0.15)',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0D47A1',
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
    borderColor: '#0D47A1',
    zIndex: 10,
  },
  backButtonText: { color: '#0D47A1', fontWeight: 'bold', fontSize: 17 },
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0D47A1',
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
  buildingEmoji: { fontSize: 22 },
  buildingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0D47A1',
    textAlign: 'left',
  },
  petImage: {
    position: 'absolute',
    bottom: 40,
    width: 425,
    height: 425,
    resizeMode: 'contain',
  },
});