import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function LivingRoomScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require('../../assets/livingroom.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.mainContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Гостиная</Text>
          {/* <TouchableOpacity 
            style={styles.gameButton} 
            onPress={() => navigation.navigate('MiniGamesScreen')} 
            activeOpacity={0.8}
          > */}
            <Text style={styles.gameEmoji}>🎮</Text>
            <Text style={styles.gameText}>Мини-игры</Text>
          {/* </TouchableOpacity> */}
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 30, 
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // paddingBottom: 80, 
  },
  title: {
    fontSize: 32,
    fontWeight: '1000',
    color: '#FFF',
    letterSpacing: 1.2,
    marginTop: -40,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  gameButton: {
    backgroundColor: '#4e60c9bd', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 600,
    borderRadius: 24,
    gap: 10,
    borderWidth: 2,
    borderColor: '#1f31d4',
    shadowColor: '#000',
    elevation: 6,
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});