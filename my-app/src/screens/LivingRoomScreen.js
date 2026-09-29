import React, { useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, PanResponder, Dimensions } from 'react-native';
import { TouchableOpacity } from '../components/ui';

const { width } = Dimensions.get('window');
const SWIPE_ACTIVATE = 15;
const SWIPE_THRESHOLD = 40;

export default function LivingRoomScreen({ navigation }) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > SWIPE_ACTIVATE &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          navigation.navigate('Home');
        }
      },
    })
  ).current;

  return (
    <ImageBackground
      source={require('../../assets/livingroom.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.mainContainer} {...panResponder.panHandlers}>
        <View style={styles.content}>
          <Text style={styles.title}>Гостиная</Text>

          {/* 🎮 Мини-игры */}
          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => navigation.navigate('MiniGamesScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameEmoji}>🎮</Text>
            <Text style={styles.gameText}>Мини-игры</Text>
          </TouchableOpacity>

          {/* 🎒 Мои покупки */}
          <TouchableOpacity
            style={[styles.gameButton, styles.shopButton]}
            onPress={() => navigation.navigate('PurchasedItems')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameEmoji}>🎒</Text>
            <Text style={styles.gameText}>Мои покупки</Text>
          </TouchableOpacity>

          <Text style={styles.swipeHint}>свайп вправо → домой</Text>
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
    backgroundColor: '#1E88E5',
    paddingTop: 0,
  },
  mainContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.2,
    marginTop: 10,
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
    marginTop: 510,
    borderRadius: 24,
    gap: 10,
    borderWidth: 2,
    borderColor: '#1f31d4',
    minHeight: 48,
  },
  shopButton: {
    marginTop: 20,
    backgroundColor: '#42a4f5bd',
    borderColor: '#1976D2',
  },
  gameEmoji: { fontSize: 28 },
  gameText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  swipeHint: {
    marginTop: 20,
    fontSize: 17,
    color: '#FFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});