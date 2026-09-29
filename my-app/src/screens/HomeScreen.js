import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Modal, Animated, Dimensions, ScrollView, PanResponder, ActivityIndicator, Alert } from 'react-native';
import { TouchableOpacity, Pressable } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';
import BudgetPlanScreen from './BudgetPlanScreen';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import { useDemo } from '../context/DemoContext';
import DemoPanel from '../components/DemoPanel';


const { width } = Dimensions.get('window');

const PET_SIZE_BASE = width * 0.6;

const PET_SIZES = {
  0: PET_SIZE_BASE * 0.7,
  1: PET_SIZE_BASE * 1.0,
  2: PET_SIZE_BASE * 1.35,
  3: PET_SIZE_BASE * 1.75,
};

const MAX_STAGE = 3;
const SWIPE_ACTIVATE = 8;
const SWIPE_THRESHOLD = 40;

const ROOMS = [
  { id: 'room1', source: require('../../assets/Rooms/room.png'), label: 'Комната 1' },
  { id: 'room2', source: require('../../assets/Rooms/room2.png'), label: 'Комната 2' },
  { id: 'room3', source: require('../../assets/Rooms/room3.png'), label: 'Комната 3' },
];

const LEVEL_FEATURES = {
  1: [
    { id: 'tasks', emoji: '📋', title: 'Задания', desc: 'Пройди блок 1' },
    { id: 'town',  emoji: '🏙️', title: 'Город',   desc: 'Магазины и банк' },
    { id: 'bank',  emoji: '🏦', title: 'Банк',    desc: 'Счёт и конверт' },
    { id: 'room',  emoji: '🏠', title: 'Комната', desc: 'Сменить комнату' },
    { id: 'world', emoji: '🌍', title: 'Мир',     desc: '🔒 Откроется на Lv.3' },
    { id: 'goals', emoji: '🎯', title: 'Цели',    desc: '🔒 Откроется на Lv.3' },
  ],
  2: [
    { id: 'tasks', emoji: '📋', title: 'Задания', desc: 'Пройди блок 1' },
    { id: 'town',  emoji: '🏙️', title: 'Город',   desc: 'Магазины и банк' },
    { id: 'bank',  emoji: '🏦', title: 'Банк',    desc: 'Счёт и конверт' },
    { id: 'room',  emoji: '🏠', title: 'Комната', desc: 'Сменить комнату' },
    { id: 'world', emoji: '🌍', title: 'Мир',     desc: '🔒 Откроется на Lv.3' },
    { id: 'goals', emoji: '🎯', title: 'Цели',    desc: '🔒 Откроется на Lv.3' },
  ],
  3: [
    { id: 'tasks', emoji: '📋', title: 'Задания', desc: 'Пройди блок 1' },
    { id: 'town',  emoji: '🏙️', title: 'Город',   desc: 'Магазины и банк' },
    { id: 'bank',  emoji: '🏦', title: 'Банк',    desc: 'Счёт и конверт' },
    { id: 'room',  emoji: '🏠', title: 'Комната', desc: 'Сменить комнату' },
    { id: 'world', emoji: '🌍', title: 'Мир',     desc: 'Путешествия и страны' },
    { id: 'goals', emoji: '🎯', title: 'Цели',    desc: 'Копи на мечту' },
  ],
  4: [
    { id: 'tasks', emoji: '📋', title: 'Задания', desc: 'Пройди блок 1' },
    { id: 'town',  emoji: '🏙️', title: 'Город',   desc: 'Магазины и банк' },
    { id: 'bank',  emoji: '🏦', title: 'Банк',    desc: 'Счёт и конверт' },
    { id: 'room',  emoji: '🏠', title: 'Комната', desc: 'Сменить комнату' },
    { id: 'world', emoji: '🌍', title: 'Мир',     desc: 'Путешествия и страны' },
    { id: 'goals', emoji: '🎯', title: 'Цели',    desc: 'Копи на мечту' },
    { id: 'credit', emoji: '💳', title: 'Кредит', desc: 'Взять в банке' },
  ],
};

const STAGE_NAMES = ['Яйцо', 'Малыш', 'Подросток', 'Взрослый'];

// ─── Онбординг ───
function OnboardingFlow({ step, pet, onNext, onFinish, navigation }) {
  if (step === 'intro') return <IntroScreen pet={pet} onNext={() => onNext('budget')} />;
  if (step === 'budget') return <StartBudgetScreen onNext={() => onNext('goal')} />;
  if (step === 'goal') return <GoalScreen onNext={() => onNext('plan')} />;
  if (step === 'plan') return <BudgetPlanScreen onFinish={onFinish} />;
  return null;
}

function IntroScreen({ onNext, pet }) {
  const petImage = pet ? getEggImage(pet.speciesId) : null;

  return (
    <ImageBackground
      source={require('../../assets/1.png')}
      style={styles.introContainer}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
        {petImage && (
          <Image source={petImage} style={styles.introPetImage} resizeMode="contain" />
        )}

        <Text style={styles.introTitle}>Привет</Text>
        <Text style={styles.introSubtitle}>
          Я твой питомец. Заботиться обо мне просто — у тебя есть монеты,
          и ты решаешь, куда их тратить.
        </Text>

        <View style={styles.introCardsRow}>
          <View style={styles.introCard}>
            <View style={[styles.introIconCircle, { backgroundColor: '#FFE5D4' }]}>
              <Text style={styles.introIcon}>🍎</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introCardTitle}>Нужное</Text>
              <Text style={styles.introCardText}>Еда и уход — без этого мне плохо</Text>
            </View>
          </View>

          <View style={styles.introCard}>
            <View style={[styles.introIconCircle, { backgroundColor: '#E5F0FF' }]}>
              <Text style={styles.introIcon}>🎈</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introCardTitle}>Хочется</Text>
              <Text style={styles.introCardText}>Игрушки — приятно, но можно подождать</Text>
            </View>
          </View>

          <View style={styles.introCard}>
            <View style={[styles.introIconCircle, { backgroundColor: '#E5FFE8' }]}>
              <Text style={styles.introIcon}>💰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introCardTitle}>В копилку</Text>
              <Text style={styles.introCardText}>На твою мечту</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.introButton} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.introButtonText}>Понятно →</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

function StartBudgetScreen({ onNext }) {
  const bank = useBank();

  const handleNext = () => {
    if (bank.balance === 0) {
      bank.addCoins(100);
    }
    onNext();
  };

  return (
    <ImageBackground
      source={require('../../assets/1.png')}
      style={styles.introContainer}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.coinCircleBig}>
          <Text style={styles.coinEmojiBig}>🪙</Text>
        </View>

        <Text style={styles.introTitle}>Вот твои первые монеты!</Text>

        <View style={styles.amountCard}>
          <Text style={styles.amountValue}>100</Text>
          <Text style={styles.amountLabel}>монет на первый период</Text>
        </View>

        <View style={styles.introCard}>
          <View style={[styles.introIconCircle, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.introIcon}>💡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introCardTitle}>Ты сам решишь</Text>
            <Text style={styles.introCardText}>
              Сколько потратить на нужное, сколько на желаемое, а сколько отложить. Главное — не потратить больше, чем есть.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.introButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.introButtonText}>Дальше →</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

function GoalScreen({ onNext }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const budgetPlanCtx = useBudgetPlan();

  const GOALS = [
    { id: 'g1', emoji: '🚲', title: 'Велосипед', cost: 500, color: '#42a4f5b6' },
    { id: 'g2', emoji: '🛴', title: 'Самокат', cost: 300, color: '#66bb6ac2' },
    { id: 'g3', emoji: '🎁', title: 'Подарок', cost: 200, color: '#ff6f43b0' },
  ];

  const handleSelect = (goal) => setSelectedGoal(goal);

  const handleNext = () => {
    if (!selectedGoal) return;
    budgetPlanCtx.setGoal(selectedGoal);
    onNext();
  };

  return (
    <ImageBackground
      source={require('../../assets/1.png')}
      style={styles.introContainer}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.introTitle}>Выбери свою цель</Text>
        <Text style={styles.introSubtitle}>
          На что ты хочешь накопить? Выбери мечту — и мы составим план.
        </Text>

        <View style={styles.goalList}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoal?.id === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && {
                    borderColor: goal.color,
                    backgroundColor: goal.color + '15',
                  },
                ]}
                onPress={() => handleSelect(goal)}
                activeOpacity={0.8}
              >
                <View style={[styles.goalIconCircle, { backgroundColor: goal.color + '25' }]}>
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalCost}>Стоит {goal.cost} 🪙</Text>
                </View>

                {isSelected && (
                  <View style={[styles.goalCheck, { backgroundColor: goal.color }]}>
                    <Text style={styles.goalCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.introButton, !selectedGoal && styles.introButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedGoal}
          activeOpacity={0.85}
        >
          <Text style={[styles.introButtonText, !selectedGoal && styles.introButtonTextDisabled]}>
            {selectedGoal ? 'Составить план →' : 'Выбери цель'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

// ─── Главный экран ───
function HomeScreenInner({ route, navigation }) {
  const bank = useBank();
  const petCtx = usePet();
  const { demoMode } = useDemo();
  const budgetPlanCtx = useBudgetPlan();

  const incomingPet = route?.params?.pet;

  const [openMenu, setOpenMenu] = useState(null);
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [hearts] = useState(3);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(petCtx.isOnboardingDone ?? false);
  const [showBudgetResult, setShowBudgetResult] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showSwipeHints, setShowSwipeHints] = useState(false);
  const [showTaskBadge, setShowTaskBadge] = useState(true);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const myPet = petCtx.pet;

  const currentStage = Math.max(0, bank.level - 1);
  const isMaxStage = currentStage >= MAX_STAGE;
  const petSize = PET_SIZES[currentStage] ?? PET_SIZES[0];

  useEffect(() => {
    if (!myPet) return;
    if (myPet.stage !== currentStage) {
      petCtx.setStage(currentStage);
    }
  }, [currentStage, myPet?.stage]);

  useFocusEffect(
    React.useCallback(() => {
      bank.checkLevelUp();
    }, [bank])
  );

  const petImage = myPet
    ? (currentStage === 0
        ? getEggImage(myPet.speciesId)
        : getPetImage(myPet.speciesId, myPet.variationId, currentStage - 1))
    : null;

  const petName = myPet?.name ?? 'Питомец';

  const hasSpending = budgetPlanCtx.currentFact && (
    budgetPlanCtx.currentFact.needs > 0 ||
    budgetPlanCtx.currentFact.wants > 0 ||
    budgetPlanCtx.currentFact.savings > 0
  );

  // Накоплено по цели из регистрации (связь с копилками/банком)
  const goalId = budgetPlanCtx.goal?.id;
  const goalAlias = { bike: 'g1', scooter: 'g2', gift: 'g3' }[goalId] ?? goalId;
  const goalSaved = (bank.envelopes ?? [])
    .filter((e) => e.goal === goalAlias)
    .reduce((s, e) => s + e.amount, 0);

  useEffect(() => {
    if (incomingPet) {
      petCtx.setNewPet(incomingPet);
      if (!petCtx.isOnboardingDone) {
        setOnboardingStep('intro');
      }
    }
  }, [incomingPet]);

  // Подсказки про свайпы показываем только один раз — после первого выбора питомца
  useEffect(() => {
    if (!onboardingDone) return;
    let active = true;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('@swipe_hint_seen_v1');
        if (seen !== 'true' && active) {
          setShowSwipeHints(true);
          await AsyncStorage.setItem('@swipe_hint_seen_v1', 'true');
        }
      } catch (e) {
        // не критично
      }
    })();
    return () => { active = false; };
  }, [onboardingDone]);

  // Кнопка «Продолжить задания» видна 3 секунды после входа на экран
  useFocusEffect(
    React.useCallback(() => {
      setShowTaskBadge(true);
      const t = setTimeout(() => setShowTaskBadge(false), 3000);
      return () => clearTimeout(t);
    }, [])
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > SWIPE_ACTIVATE &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            navigation.navigate('Kitchen');
          });
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            navigation.navigate('LivingRoomScreen');
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
  };

  const handlePetClick = () => {
    pulse();
  };

  const menus = {
    room: { title: '🏠 Комната', isRoomPicker: true },
  };

  const handleFeaturePress = (featureId) => {
    setLevelMenuOpen(false);

    if (bank.level < 3 && (featureId === 'world' || featureId === 'goals')) {
      setTimeout(() => {
        Alert.alert('🔒 Заблокировано', 'Откроется на Lv.3');
      }, 200);
      return;
    }

    setTimeout(() => {
      if (featureId === 'tasks') navigation.navigate('Tasks');
      else if (featureId === 'town') navigation.navigate('Town');
      else if (featureId === 'bank') navigation.navigate('Bank');
      else if (featureId === 'room') setOpenMenu('room');
      else if (featureId === 'world') navigation.navigate('World');
      else if (featureId === 'goals') navigation.navigate('GoalsScreen');
      else if (featureId === 'credit') navigation.navigate('Bank');
    }, 150);
  };

  if (showBudgetResult) {
    return (
      <BudgetPlanScreen
        mode="result"
        onFinish={() => {
          setShowBudgetResult(false);
          setShowNewPlan(true);
        }}
      />
    );
  }

  if (showNewPlan) {
    return (
      <BudgetPlanScreen
        mode="plan"
        onFinish={() => {
          setShowNewPlan(false);
          budgetPlanCtx.finishPeriod?.();
        }}
      />
    );
  }

  if (onboardingStep !== null && !onboardingDone) {
    return (
      <OnboardingFlow
        step={onboardingStep}
        pet={myPet}
        onNext={(nextStep) => setOnboardingStep(nextStep)}
        onFinish={() => {
          petCtx.setOnboardingDone(true);
          setOnboardingDone(true);
          setOnboardingStep(null);
        }}
        navigation={navigation}
      />
    );
  }

  if (!petCtx.isLoaded || !bank.isLoaded) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.emptyText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!myPet) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Питомец не выбран</Text>
          <Text style={styles.emptySubText}>Давай выберем его</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Catalog')}
          >
            <Text style={styles.emptyButtonText}>В каталог</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hungerDisplay = Math.round(petCtx.hunger);
  const happinessDisplay = Math.round(petCtx.happiness ?? 100);
  const isHungry = hungerDisplay <= 25;
  const isSad = happinessDisplay <= 25;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const features = LEVEL_FEATURES[bank.level] ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
          <ImageBackground
            source={ROOMS[roomIndex].source}
            style={styles.room}
            resizeMode="cover"
          >
            <View style={styles.topBar}>
              {/* Верхняя строка: имя, сердечки, «Мой план», монеты, настройки */}
              <View style={styles.topRow}>
                <View style={styles.namePlate}>
                  <Text style={styles.petName} numberOfLines={1}>{petName}</Text>
                </View>

                <View style={styles.heartsRow}>
                  {[0, 1, 2].map((i) => (
                    <Text key={i} style={[styles.heart, i >= hearts && styles.heartEmpty]}>
                      {i < hearts ? '❤️' : '🤍'}
                    </Text>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.planChip}
                  onPress={() => navigation.navigate('BudgetPlanScreen')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.planChipText} numberOfLines={1}>Мой план</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.coinChip}
                  onPress={() => navigation.navigate('Bank')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.coinChipText} numberOfLines={1}>🪙 {Math.floor(bank.balance)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconSquare}
                  onPress={() => navigation.navigate('Settings')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.iconSquareEmoji}>⚙️</Text>
                </TouchableOpacity>
              </View>

              {/* Вторая строка: копилка слева, цель справа */}
              <View style={styles.topBarBottom}>
                <TouchableOpacity
                  style={styles.infoChip}
                  onPress={() => navigation.navigate('Bank')}
                  activeOpacity={0.8}
                >
                  <View style={styles.chipIconBox}>
                    <Text style={styles.chipEmoji}>🏦</Text>
                  </View>
                  <View style={styles.chipTextWrap}>
                    <Text style={styles.chipLabel}>Копилка</Text>
                    <Text style={styles.chipValue}>
                      {(bank.envelopes ?? []).reduce((s, e) => s + e.amount, 0)} 🪙
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 🎯 Цель — открывает экран целей (копилки связаны с банком) */}
                {budgetPlanCtx.goal && (
                  <TouchableOpacity
                    style={styles.goalChipTop}
                    onPress={() => navigation.navigate('GoalsScreen')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.goalChipTopEmoji}>{budgetPlanCtx.goal.emoji}</Text>
                    <View style={styles.goalChipTopInfo}>
                      <Text style={styles.goalChipTopText} numberOfLines={1}>
                        {budgetPlanCtx.goal.title}
                      </Text>
                      <Text style={styles.goalChipTopSub}>
                        {Math.floor(goalSaved)} / {budgetPlanCtx.goal.cost}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.petWrapper}>
              <TouchableOpacity activeOpacity={0.9} onPress={handlePetClick}>
                <Animated.Image
                  source={petImage}
                  style={[
                    styles.petImage,
                    { width: petSize, height: petSize },
                    { transform: [{ scale }] },
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {showTaskBadge && (
                <TouchableOpacity
                  style={styles.taskBadge}
                  onPress={() => navigation.navigate('Tasks')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.taskBadgeText}>Продолжить задания</Text>
                </TouchableOpacity>
              )}
              {showSwipeHints && (
                <View style={styles.swipeHintsRow}>
                  <Text style={styles.swipeHint}>← свайп влево: гостиная</Text>
                  <Text style={styles.swipeHint}>свайп вправо: кухня →</Text>
                </View>
              )}
            </View>

            {/* ─── Счастье и Еда над меню ─── */}
            <View style={styles.bottomHud}>
              <View style={styles.miniStatus}>
                <Text style={styles.miniStatusIcon}>😊</Text>
                <View style={styles.statusBarBg}>
                  <View
                    style={[
                      styles.statusBarFill,
                      {
                        width: `${clamp(happinessDisplay)}%`,
                        backgroundColor: isSad ? '#EF5350' : '#4FC3F7',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.miniStatusValue, isSad && styles.statusValueDanger]}>
                  {happinessDisplay}%
                </Text>
              </View>

              <View style={styles.miniStatus}>
                <Text style={styles.miniStatusIcon}>🍽️</Text>
                <View style={styles.statusBarBg}>
                  <View
                    style={[
                      styles.statusBarFill,
                      {
                        width: `${clamp(hungerDisplay)}%`,
                        backgroundColor: isHungry ? '#EF5350' : '#1976D2',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.miniStatusValue, isHungry && styles.statusValueDanger]}>
                  {hungerDisplay}%
                </Text>
              </View>
            </View>

            <View style={styles.bottomBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bottomBarContent}
              >
                <TouchableOpacity
                  style={[styles.actionButton, styles.levelAction]}
                  onPress={() => setLevelMenuOpen(true)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.actionIconBox, styles.levelIconBox]}>
                    <Text style={styles.levelIconText}>{bank.level}</Text>
                  </View>
                  <Text style={styles.actionText}>Уровень</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tasks')}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionEmoji}>📋</Text>
                  </View>
                  <Text style={styles.actionText}>Задания</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Town')}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionEmoji}>🏙️</Text>
                  </View>
                  <Text style={styles.actionText}>Город</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('History')}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionEmoji}>📅</Text>
                  </View>
                  <Text style={styles.actionText}>История</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => setOpenMenu('room')}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionEmoji}>🏠</Text>
                  </View>
                  <Text style={styles.actionText}>Комната</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MiniGamesScreen')}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionEmoji}>🎮</Text>
                  </View>
                  <Text style={styles.actionText}>Игры</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ParentGateScreen')}>
                  <View style={styles.actionIconBox}>
                    <Text style={styles.actionEmoji}>👨‍👩‍👧</Text>
                  </View>
                  <Text style={styles.actionText}>Родителю</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ImageBackground>
        </Animated.View>
      </View>

      {demoMode && (
        <DemoPanel
          navigation={navigation}
          onShowResult={() => setShowBudgetResult(true)}
        />
      )}

      {!demoMode && currentStage >= MAX_STAGE && hasSpending && !budgetPlanCtx.periodCompleted && (
        <TouchableOpacity
          onPress={() => setShowBudgetResult(true)}
          style={{
            position: 'absolute',
            bottom: 110,
            right: 20,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: '#1E88E5',
            borderRadius: 12,
            zIndex: 100,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
            📊 Итоги периода
          </Text>
        </TouchableOpacity>
      )}

      {/* Модалка выбора комнаты */}
      <Modal
        visible={openMenu !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setOpenMenu(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenMenu(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            {openMenu && (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{menus[openMenu].title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomScroll}>
                  {ROOMS.map((r, idx) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.roomOption, idx === roomIndex && styles.roomOptionActive]}
                      onPress={() => { setRoomIndex(idx); setOpenMenu(null); }}
                    >
                      <Image source={r.source} style={styles.roomThumb} />
                      <Text style={styles.roomLabel}>{r.label}</Text>
                      {idx === roomIndex && (
                        <View style={styles.roomCheck}>
                          <Text style={styles.roomCheckText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.modalButton} onPress={() => setOpenMenu(null)}>
                  <Text style={styles.modalButtonText}>Закрыть</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Мини-меню уровня */}
      <Modal
        visible={levelMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelMenuOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLevelMenuOpen(false)}>
          <Pressable style={styles.levelSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <Text style={styles.levelSheetTitle}>Уровень {bank.level}</Text>
            <Text style={styles.levelSheetSubtitle}>
              Стадия: {STAGE_NAMES[currentStage]}
            </Text>

            {features.length === 0 ? (
              <View style={styles.emptyFeatures}>
                <Text style={styles.emptyFeaturesText}>
                  🔒 На этом уровне пока ничего не открыто.{'\n\n'}
                  Пройди Блок 1 в заданиях, чтобы повысить уровень!
                </Text>
              </View>
            ) : (
              <View style={styles.featuresList}>
                {features.map((f) => {
                  const isLocked =
                    bank.level < 3 && (f.id === 'world' || f.id === 'goals');

                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.featureRow, isLocked && styles.featureRowLocked]}
                      onPress={() => handleFeaturePress(f.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.featureEmoji}>{f.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.featureTitle}>{f.title}</Text>
                        <Text style={styles.featureDesc}>{f.desc}</Text>
                      </View>
                      <Text style={styles.featureArrow}>
                        {isLocked ? '🔒' : '▶'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setLevelMenuOpen(false)}
            >
              <Text style={styles.modalButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#90CAF9' },
  room: { flex: 1, justifyContent: 'space-between' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 18, color: '#0D47A1', marginBottom: 8, fontWeight: '800' },
  emptySubText: { fontSize: 17, color: '#1976D2', marginBottom: 16 },
  emptyButton: { backgroundColor: '#1976D2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  topBar: {
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 10,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  topBarBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftColumn: { alignItems: 'flex-start', gap: 6, maxWidth: '58%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(227,242,253,0.95)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#42A5F5',
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexShrink: 1,
  },
  coinChipText: { fontSize: 17, fontWeight: '900', color: '#0D47A1' },
  namePlate: {
    backgroundColor: 'rgba(227,242,253,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#42A5F5',
    maxWidth: 92,
    flexShrink: 1,
  },
  petName: { color: '#0D47A1', fontSize: 17, fontWeight: '900' },
  planChip: {
    backgroundColor: 'rgba(227,242,253,0.95)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#42A5F5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planChipText: { fontSize: 17, fontWeight: '900', color: '#0D47A1' },
  goalChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(227,242,253,0.95)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#42A5F5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: 140,
    flexShrink: 1,
  },
  goalChipTopEmoji: { fontSize: 18, marginRight: 5 },
  goalChipTopInfo: { flexShrink: 1 },
  goalChipTopText: { fontSize: 17, fontWeight: '900', color: '#0D47A1', flexShrink: 1 },
  goalChipTopSub: { fontSize: 17, fontWeight: '700', color: '#1976D2' },

  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(227,242,253,0.92)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#90CAF9',
    minWidth: 118,
  },
  goalChip: { minWidth: 0, width: 140 },
  chipIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(66,165,245,0.18)',
    borderWidth: 1.5,
    borderColor: '#42A5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipEmoji: { fontSize: 20 },
  chipTextWrap: { flex: 1 },
  chipLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1976D2',
    letterSpacing: 0.4,
  },
  chipValue: { fontSize: 17, fontWeight: '900', color: '#0D47A1' },
  chipSub: { fontSize: 17, color: '#1976D2', fontWeight: '700', marginTop: 1 },

  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(227,242,253,0.95)',
    borderWidth: 2,
    borderColor: '#42A5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquareEmoji: { fontSize: 22 },

  rightColumn: { alignItems: 'flex-end', gap: 10 },
  rightTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  levelBadge: {
    backgroundColor: '#42A5F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  levelBadgeText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  plusBtn: {
    backgroundColor: '#2ecc71',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtnText: { fontSize: 17, fontWeight: '900', color: '#fff' },

  heartsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(227,242,253,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#42A5F5',
    gap: 3,
    flexShrink: 1,
  },
  heart: { fontSize: 18 },
  heartEmpty: { opacity: 0.35 },

  // ─── Строка голода + кнопка −10% ───
  hungerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  minusHungerBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  minusHungerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  hungerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BBDEFB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  hungerBadgeDanger: { backgroundColor: '#EF5350' },
  hungerEmoji: { fontSize: 18 },
  hungerText: { fontSize: 17, fontWeight: '800', color: '#0D47A1' },
  hungerTextDanger: { color: '#fff' },

  // ─── Еда / Счастье над меню (вертикально, без подписей) ───
  bottomHud: {
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 8,
  },
  miniStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniStatusIcon: { fontSize: 20 },
  miniStatusValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    minWidth: 48,
    textAlign: 'right',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statusValueDanger: { color: '#D32F2F' },
  statusBarBg: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    borderColor: '#90CAF9',
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  balanceBadge: {
    backgroundColor: '#42A5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  balanceBadgeText: { fontSize: 18, fontWeight: '800', color: '#fff' },

  petWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 20,
  },
  petImage: {},

  stageIndicator: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  stageDotFilled: {
    backgroundColor: '#0D47A1',
    borderColor: '#0D47A1',
  },

  swipeHintsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  swipeHint: {
    fontSize: 17,
    color: '#FFFFFF',
    fontStyle: 'italic',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  taskBadge: {
    backgroundColor: 'rgba(13,71,161,0.78)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: 10,
  },
  taskBadgeText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  bottomBar: {
    backgroundColor: 'rgba(227,242,253,0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderTopColor: '#90CAF9',
    paddingVertical: 8,
  },
  bottomBarContent: {
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  actionButton: {
    alignItems: 'center',
    width: 70,
    marginRight: 10,
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(66,165,245,0.15)',
    borderWidth: 2,
    borderColor: '#42A5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionEmoji: { fontSize: 24 },
  actionText: { fontSize: 17, color: '#0D47A1', fontWeight: '800', textAlign: 'center' },

  // Кнопка «Уровень» — первая в меню, на белом фоне
  levelAction: {
    width: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#1E88E5',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  levelIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF4FF',
    borderWidth: 2,
    borderColor: '#1E88E5',
    marginBottom: 4,
  },
  levelIconText: { fontSize: 26, fontWeight: '900', color: '#0D47A1' },

  settingsBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  settingsBadgeText: {
    fontSize: 20,
  },
  settingsBadgeText: { fontSize: 20 },

  // ─── Intro / Onboarding ───
  introContainer: { flex: 1 },
  introScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  introPetImage: { width: 140, height: 140, marginBottom: 16 },
  introTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0D47A1',
    marginBottom: 8,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 18,
    color: '#1976D2',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  introCardsRow: { width: '100%', marginBottom: 28 },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#90CAF9',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  introButton: {
    backgroundColor: '#42A5F5',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  introIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  introIcon: { fontSize: 28 },
  introCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 2,
  },
  introCardText: {
    flex: 1,
    fontSize: 18,
    color: '#1976D2',
    textAlign: 'justify',
    lineHeight: 18,
  },
  introButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  introButtonDisabled: { backgroundColor: '#BBDEFB', shadowOpacity: 0.1 },
  introButtonTextDisabled: { color: '#E3F2FD' },

  // ─── Монетка ───
  coinCircleBig: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#42A5F5',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  coinEmojiBig: { fontSize: 80 },

  // ─── Карточка 500 монет ───
  amountCard: {
    backgroundColor: '#42A5F5',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 240,
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  amountValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  amountLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E3F2FD',
    marginTop: 4,
    textAlign: 'center',
  },

  // ─── Цели ───
  goalList: { width: '100%', marginBottom: 24 },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#90CAF9',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 80,
  },
  goalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  goalEmoji: { fontSize: 32 },
  goalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 2,
  },
  goalCost: { fontSize: 17, color: '#1976D2' },
  goalCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  goalCheckText: { color: '#FFF', fontSize: 18, fontWeight: '900' },

  // ─── Модалки ───
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 220,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#90CAF9',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0D47A1', marginBottom: 12 },
  modalButton: {
    backgroundColor: '#42A5F5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // ─── Комнаты ───
  roomScroll: { paddingVertical: 4, paddingRight: 8 },
  roomOption: {
    width: 110,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
  },
  roomOptionActive: { borderColor: '#42A5F5' },
  roomThumb: { width: '100%', height: 110 },
  roomLabel: { fontSize: 17, textAlign: 'center', paddingVertical: 6, color: '#0D47A1', fontWeight: '700' },
  roomCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#42A5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomCheckText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // ─── Мини-меню уровня ───
  levelSheet: {
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 260,
  },
  levelSheetTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0D47A1',
    textAlign: 'center',
    marginBottom: 4,
  },
  levelSheetSubtitle: {
    fontSize: 17,
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  emptyFeatures: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  emptyFeaturesText: {
    fontSize: 17,
    color: '#1976D2',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresList: { gap: 10, marginBottom: 8 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  featureRowLocked: {
    backgroundColor: '#E3F2FD',
    opacity: 0.7,
  },
  featureEmoji: { fontSize: 30, marginRight: 14 },
  featureTitle: { fontSize: 17, fontWeight: '800', color: '#0D47A1' },
  featureDesc: { fontSize: 17, color: '#1976D2', marginTop: 2 },
  featureArrow: { fontSize: 17, color: '#42A5F5' },
});

export default React.memo(HomeScreenInner);


