import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';  
import { useBank } from '../context/BankContext'; 

const { width, height } = Dimensions.get('window');
const GAME_DURATION = 30;
const COIN_SIZE = 70; 
const HUD_HEIGHT = 90;

export default function CatchCoinGame({ navigation }) {
  const bank = useBank(); 
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [coins, setCoins] = useState([]);
  const idRef = useRef(0);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCoins([]);
    setRunning(false);
    setIsReady(false);

    setTimeout(() => {
      setIsReady(true);
      setRunning(true);
    }, 1000);
  };

  useEffect(() => {
    startGame();
  }, []);


  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      const id = idRef.current++;
      const x = Math.random() * (width - COIN_SIZE - 20) + 10;
      setCoins((prev) => [...prev, { id, x }]);
    }, 700); 
    return () => clearInterval(spawn);
  }, [running]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const removeCoin = (id) => setCoins((prev) => prev.filter((c) => c.id !== id));

  const catchCoin = (id) => {
    if (!running) return;
    setScore((s) => s + 1);
    removeCoin(id);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCoins([]); 
    setRunning(true);
  };
  const handleFinishGame = async () => {
    try {
      if (score > 0 && bank && typeof bank.addCoins === 'function') {
        bank.addCoins(score);
      }
      const saved = await AsyncStorage.getItem('@block_one_progress_v1');
      const current = saved ? parseInt(saved, 10) : 0;
      if (7 > current) {
        await AsyncStorage.setItem('@block_one_progress_v1', '7');
      }
    } catch (e) {
      console.error('Ошибка сохранения прогресса игры 1:', e);
    }
    navigation.navigate('BlockOneScreen');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hud}>
        <TouchableOpacity onPress={handleFinishGame} style={styles.hudBtn}>
          <Text style={styles.hudBtnText}>Выход</Text>
        </TouchableOpacity>
        <Text style={styles.hudStat}>⏱ {timeLeft}s</Text>
        <Text style={styles.hudStat}>🪙 {score}</Text>
      </View>
      <View style={styles.playArea}>
        {!isReady && (
          <View style={styles.readyOverlay}>
            <Text style={styles.readyText}>Приготовься... 🪙</Text>
          </View>
        )}
        {coins.map((coin) => (
          <FallingCoin
            key={coin.id}
            x={coin.x}
            onCatch={() => catchCoin(coin.id)}
            onMiss={() => removeCoin(coin.id)}
          />
        ))}
        {!running && isReady && (
          <View style={styles.overlay}>
            <Text style={styles.overTitle}>Игра окончена</Text>
            <Text style={styles.overScore}>Собрано монет: {score}</Text>
            <TouchableOpacity style={styles.btn} onPress={restart}>
              <Text style={styles.btnText}>Играть снова</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={handleFinishGame}
            >
              <Text style={[styles.btnText, styles.btnGhostText]}>Завершить шаг ✅</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
function FallingCoin({ x, onCatch, onMiss }) {
  const y = useRef(new Animated.Value(0)).current;
  const duration = 2000 + Math.random() * 1200; 

  useEffect(() => {
    Animated.timing(y, {
      toValue: height - HUD_HEIGHT, 
      duration,
      useNativeDriver: true, 
    }).start(({ finished }) => {
      if (finished) onMiss();
    });
  }, []);

  return (
    <Animated.View 
      style={[
        styles.coin, 
        { 
          transform: [
            { translateX: x }, 
            { translateY: y }
          ] 
        }
      ]}
    >
      <TouchableOpacity onPress={onCatch} activeOpacity={0.5} style={styles.coinTouch}>
        <Text style={styles.coinEmoji}>🪙</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', 
  },
  hud: {
    height: HUD_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#162447',
    borderBottomWidth: 2,
    borderColor: '#e43f5a',
    zIndex: 10,
  },
  hudBtn: {
    backgroundColor: '#e43f5a',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  hudBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hudStat: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
  },
  readyText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  coin: {
    position: 'absolute',
    top: 0, // Стартуют ровно из-под худ-панели
    width: COIN_SIZE,
    height: COIN_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinEmoji: {
    fontSize: 45, // Крупный классный эмодзи монетки
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 36, 71, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overTitle: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overScore: {
    fontSize: 20,
    color: '#f39c12',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  btn: {
    backgroundColor: '#00b4d8',
    width: '80%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00b4d8',
  },
  btnGhostText: {
    color: '#00b4d8',
  },
});
