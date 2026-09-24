import React, { useState, useEffect, useRef } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const GAME_DURATION = 30;
const COIN_SIZE = 56;
const HUD_HEIGHT = 90; // Высота верхней панели, чтобы монетки не лезли на кнопки

export default function CatchCoinGame({ navigation }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [isReady, setIsReady] = useState(false); // Новое состояние для задержки
  const [coins, setCoins] = useState([]);
  const idRef = useRef(0);

    // Функция запуска/перезапуска игры с задержкой 1 секунда
  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCoins([]);
    setRunning(false);
    setIsReady(false);

    // Ждем 1 секунду, показываем "Собирай монетки!", потом начинаем
    setTimeout(() => {
      setIsReady(true);
      setRunning(true);
    }, 1000);
  };


  // Запускаем игру при первом открытии экрана
  useEffect(() => {
    startGame();
  }, []);

  // Спавн монеток
  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      const id = idRef.current++;
      const x = Math.random() * (width - COIN_SIZE - 20) + 10;
      setCoins((prev) => [...prev, { id, x }]);
    }, 600);
    return () => clearInterval(spawn);
  }, [running]);

  // Таймер
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
  // Функция выхода с передачей прогресса (открываем шаг 8)
  const handleExitGame = () => {
    navigation.navigate('BlockOne', { highestCompletedStep: 7 });
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hud}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hudBtn}>
          <Text style={styles.hudBtnText}>Выход</Text>
        </TouchableOpacity>
        <Text style={styles.hudStat}>⏱ {timeLeft}s</Text>
        <Text style={styles.hudStat}>🪙 {score}</Text>
      </View>

      <View style={styles.playArea}>
        {/* Оверлей подготовки (1 секунда) */}
        {!isReady && (
          <View style={styles.readyOverlay}>
            <Text style={styles.readyText}>Собирай монетки 🪙</Text>
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

        {!running && (
          <View style={styles.overlay}>
            <Text style={styles.overTitle}>Игра окончена</Text>
            <Text style={styles.overScore}>Собрано монет: {score}</Text>
            <TouchableOpacity style={styles.btn} onPress={restart}>
              <Text style={styles.btnText}>Играть снова</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.btnText, styles.btnGhostText]}>Назад</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function FallingCoin({ x, onCatch, onMiss }) {
//   const y = useRef(new Animated.Value(-COIN_SIZE)).current;
//   const duration = 3500 + Math.random() * 1500;
// 🚀 ИЗМЕНЕНИЕ 1: Начинаем падение ниже верхней панели (HUD_HEIGHT)
  const startY = HUD_HEIGHT; 
  const y = useRef(new Animated.Value(startY)).current;
  
  // 🚀 ИЗМЕНЕНИЕ 2: Падают БЫСТРЕЕ (от 1.2 до 1.8 секунды вместо 3.5-5)
  const duration = 1200 + Math.random() * 600; 


  useEffect(() => {
    Animated.timing(y, {
      toValue: height, // Падают до самого низа экрана
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onMiss();
    });
  }, []);

  return (
    <Animated.View style={[styles.coin, { left: x, transform: [{ translateY: y }] }]}>
      <TouchableOpacity onPress={onCatch} activeOpacity={0.7} style={styles.coinTouch}>
        <Text style={styles.coinEmoji}>🪙</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#365d69', // Статичный фоновый цвет вместо темы
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 10,
  },
  hudBtn: {
    backgroundColor: '#5D4037',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hudBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hudStat: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  coin: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
  },
  coinTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinEmoji: {
    fontSize: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  overScore: {
    fontSize: 20,
    color: '#FFD700',
    marginBottom: 30,
  },
  btn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: width * 0.6,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  btnGhostText: {
    color: '#FFF',
  },
});
