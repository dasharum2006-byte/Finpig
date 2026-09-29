import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { TouchableOpacity } from '../components/ui';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { backToLivingRoom } from '../navigation';

const { width, height } = Dimensions.get('window');

const GAME_DURATION = 30;
const COIN_SIZE = 70;
const HUD_HEIGHT = 90;

export default function CatchCoinGame({ navigation }) {
  const bank = useBank();
  const petCtx = usePet();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [coins, setCoins] = useState([]);

  const idRef = useRef(0);

  // Защита от двойного завершения
  const finishingRef = useRef(false);

  // Защита от двойного начисления награды
  const rewardGivenRef = useRef(false);

  // Таймер "Приготовься"
  const readyTimerRef = useRef(null);

  const startGame = () => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
    }

    finishingRef.current = false;
    rewardGivenRef.current = false;

    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCoins([]);
    setRunning(false);
    setIsReady(false);

    readyTimerRef.current = setTimeout(() => {
      setIsReady(true);
      setRunning(true);
    }, 1000);
  };

  useEffect(() => {
    startGame();

    return () => {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
      }
    };
  }, []);

  // Создание монет
  useEffect(() => {
    if (!running) {
      return;
    }

    const spawnInterval = setInterval(() => {
      const id = idRef.current++;

      const x =
        Math.random() * (width - COIN_SIZE - 20) + 10;

      setCoins((prev) => [
        ...prev,
        {
          id,
          x,
        },
      ]);
    }, 700);

    return () => {
      clearInterval(spawnInterval);
    };
  }, [running]);

  // Таймер игры
  useEffect(() => {
    if (!running) {
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [running]);

  const removeCoin = (id) => {
    setCoins((prev) =>
      prev.filter((coin) => coin.id !== id)
    );
  };

  const catchCoin = (id) => {
    if (!running) {
      return;
    }

    setScore((prev) => prev + 1);
    removeCoin(id);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCoins([]);

    finishingRef.current = false;
    rewardGivenRef.current = false;

    setIsReady(true);
    setRunning(true);
  };

  // Просто выйти, НЕ начисляя награду
  const handleExit = () => {
    setRunning(false);
    setCoins([]);

    backToLivingRoom(navigation);
  };

  // Завершить игру и получить награду
  const handleFinishGame = () => {
    // Не позволяем функции запуститься дважды
    if (finishingRef.current) {
      return;
    }

    finishingRef.current = true;

    if (petCtx?.boostHappiness) petCtx.boostHappiness();

    setRunning(false);
    setCoins([]);

    // Начисляем монеты только один раз
    if (
      !rewardGivenRef.current &&
      score > 0 &&
      bank &&
      typeof bank.addCoins === 'function'
    ) {
      rewardGivenRef.current = true;
      bank.addCoins(score);
    }

    backToLivingRoom(navigation);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <View style={styles.hud}>
        <TouchableOpacity
          onPress={handleExit}
          style={styles.hudBtn}
        >
          <Text style={styles.hudBtnText}>
            Выход
          </Text>
        </TouchableOpacity>

        <Text style={styles.hudStat}>
          ⏱ {timeLeft}s
        </Text>

        <Text style={styles.hudStat}>
          🪙 {score}
        </Text>
      </View>

      <View style={styles.playArea}>
        {!isReady && (
          <View style={styles.readyOverlay}>
            <Text style={styles.readyText}>
              Приготовься... 🪙
            </Text>
          </View>
        )}

        {running &&
          coins.map((coin) => (
            <FallingCoin
              key={coin.id}
              x={coin.x}
              onCatch={() =>
                catchCoin(coin.id)
              }
              onMiss={() =>
                removeCoin(coin.id)
              }
            />
          ))}

        {!running && isReady && (
          <View style={styles.overlay}>
            <Text style={styles.overTitle}>
              Игра окончена
            </Text>

            <Text style={styles.overScore}>
              Собрано монет: {score}
            </Text>

            <TouchableOpacity
              style={styles.btn}
              onPress={restart}
            >
              <Text style={styles.btnText}>
                Играть снова
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnGhost,
              ]}
              onPress={handleFinishGame}
            >
              <Text
                style={[
                  styles.btnText,
                  styles.btnGhostText,
                ]}
              >
                В гостиную ✅
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function FallingCoin({ x, onCatch, onMiss }) {
  const y = useRef(
    new Animated.Value(0)
  ).current;

  const animationRef = useRef(null);

  const durationRef = useRef(
    2000 + Math.random() * 1200
  );

  useEffect(() => {
    const animation = Animated.timing(y, {
      toValue: height - HUD_HEIGHT,
      duration: durationRef.current,
      useNativeDriver: true,
    });

    animationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        onMiss();
      }
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.coin,
        {
          transform: [
            {
              translateX: x,
            },
            {
              translateY: y,
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onCatch}
        activeOpacity={0.5}
        style={styles.coinTouch}
      >
        <Text style={styles.coinEmoji}>
          🪙
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D47A1',
  },

  hud: {
    height: HUD_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0D47A1',
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
    overflow: 'hidden',
  },

  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(26, 26, 46, 0.8)',
    zIndex: 20,
  },

  readyText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },

  coin: {
    position: 'absolute',
    top: 0,
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
    fontSize: 45,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(22, 36, 71, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 30,
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
    backgroundColor: '#1E88E5',
    width: '80%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },

  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1E88E5',
  },

  btnGhostText: {
    color: '#1E88E5',
  },
});
