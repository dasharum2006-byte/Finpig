import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  PanResponder,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';
import BudgetPlanScreen from './BudgetPlanScreen';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import { useDemo } from '../context/DemoContext';

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

// ─── Что открывается на каждом уровне ───
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
      bank.addCoins(500);
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
          <Text style={styles.amountValue}>500</Text>
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
    { id: 'bike', emoji: '🚲', title: 'Велосипед', cost: 500, color: '#42a4f5b6' },
    { id: 'scooter', emoji: '🛴', title: 'Самокат', cost: 300, color: '#66bb6ac2' },
    { id: 'gift', emoji: '🎁', title: 'Подарок', cost: 200, color: '#ff6f43b0' },
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

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const myPet = petCtx.pet;

  // ⭐ Стадия = уровень - 1 (Lv.1 = яйцо / stage 0)
  const currentStage = Math.max(0, bank.level - 1);
  const isMaxStage = currentStage >= MAX_STAGE;
  const petSize = PET_SIZES[currentStage] ?? PET_SIZES[0];

  // Синхронизируем stage в PetContext
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

  useEffect(() => {
    if (incomingPet) {
      petCtx.setNewPet(incomingPet);
      if (!petCtx.isOnboardingDone) {
        setOnboardingStep('intro');
      }
    }
  }, [incomingPet]);

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

  // Переход из мини-меню уровня
  const handleFeaturePress = (featureId) => {
    setLevelMenuOpen(false);

    // Блокировка Мира и Целей до Lv.3
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
  const isHungry = hungerDisplay <= 25;
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
            {/* ⭐ Верхняя панель: имя + ⚙️ слева, уровень/сердечки/голод/баланс справа */}
            <View style={styles.topBar}>
              {/* ЛЕВАЯ КОЛОНКА: имя питомца + кнопка настроек под ним */}
              <View style={styles.leftColumn}>
                <View style={styles.namePlate}>
                  <Text style={styles.petName}>{petName}</Text>
                </View>

                <TouchableOpacity
                  style={styles.settingsBadge}
                  onPress={() => navigation.navigate('Settings')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingsBadgeText}>⚙️</Text>
                </TouchableOpacity>
              </View>

              {/* ПРАВАЯ КОЛОНКА */}
              <View style={styles.rightColumn}>
                <View style={styles.rightTopRow}>
                  <TouchableOpacity
                    style={styles.levelBadge}
                    onPress={() => setLevelMenuOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.levelBadgeText}>Lv.{bank.level} ▾</Text>
                  </TouchableOpacity>

                  {demoMode && (
                    <TouchableOpacity
                      style={styles.plusBtn}
                      onPress={() => bank.levelUp()}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.plusBtnText}>+1</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.heartsRow}>
                    {[0, 1, 2].map((i) => (
                      <Text key={i} style={[styles.heart, i >= hearts && styles.heartEmpty]}>
                        {i < hearts ? '❤️' : '🤍'}
                      </Text>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.hungerBadge,
                    isHungry && styles.hungerBadgeDanger,
                  ]}
                >
                  <Text style={styles.hungerEmoji}>🍽️</Text>
                  <Text
                    style={[
                      styles.hungerText,
                      isHungry && styles.hungerTextDanger,
                    ]}
                  >
                    {hungerDisplay}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.balanceBadge}
                  onPress={() => navigation.navigate('Bank')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.balanceBadgeText}>
                    🪙 {bank.balance.toFixed(0)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Питомец */}
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

              {currentStage >= 1 && (
                <View style={styles.stageIndicator}>
                  {[1, 2, 3].map((s) => (
                    <View
                      key={s}
                      style={[
                        styles.stageDot,
                        s <= currentStage && styles.stageDotFilled,
                      ]}
                    />
                  ))}
                </View>
              )}

              <View style={styles.swipeHintsRow}>
                <Text style={styles.swipeHint}>← свайп влево: гостиная</Text>
                <Text style={styles.swipeHint}>свайп вправо: кухня →</Text>
              </View>
            </View>

            {/* Нижняя панель */}
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.actionEmoji}>📋</Text>
                <Text style={styles.actionText}>Задания</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Town')}
              >
                <Text style={styles.actionEmoji}>🏙️</Text>
                <Text style={styles.actionText}>Город</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => setOpenMenu('room')}>
                <Text style={styles.actionEmoji}>🏠</Text>
                <Text style={styles.actionText}>Комната</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ParentGateScreen')}
              >
                <Text style={styles.actionEmoji}>👨‍👩‍👧</Text>
                <Text style={styles.actionText}>Родителю</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </Animated.View>
      </View>

      {/* Демо-кнопка Итоги */}
      {demoMode && (
        <TouchableOpacity
          onPress={() => setShowBudgetResult(true)}
          style={{
            position: 'absolute',
            top: 100,
            right: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: '#4caf50',
            borderRadius: 12,
            zIndex: 100,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
            🧪 ДЕМО: Итоги
          </Text>
        </TouchableOpacity>
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
            backgroundColor: '#e8a87c',
            borderRadius: 12,
            zIndex: 100,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
            📊 Итоги периода
          </Text>
        </TouchableOpacity>
      )}

      {/* Модалка комнаты */}
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
  emptyText: { fontSize: 18, color: colors.text, marginBottom: 8, fontWeight: '600' },
  emptySubText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  emptyButton: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // ✅ НОВАЯ ЛЕВАЯ КОЛОНКА: имя + кнопка ⚙️ под ним
  leftColumn: {
    alignItems: 'flex-start',
    gap: 8,
  },

  namePlate: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  petName: { color: '#fff', fontSize: 18, fontWeight: '700' },

  rightColumn: { alignItems: 'flex-end', gap: 10 },
  rightTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  levelBadge: {
    backgroundColor: '#42A5F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  levelBadgeText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  plusBtn: {
    backgroundColor: '#2ecc71',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },

  heartsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 24,
  },
  heart: { fontSize: 20, marginHorizontal: 1 },
  heartEmpty: { opacity: 0.5 },

  hungerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  hungerBadgeDanger: { backgroundColor: '#ff4d4d' },
  hungerEmoji: { fontSize: 18 },
  hungerText: { fontSize: 16, fontWeight: '700', color: '#333' },
  hungerTextDanger: { color: '#fff' },

  balanceBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  balanceBadgeText: { fontSize: 18, fontWeight: '700', color: '#fff' },

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
    borderColor: colors.border,
  },
  stageDotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  swipeHintsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  swipeHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, minWidth: 70 },
  actionEmoji: { fontSize: 20, marginBottom: 4 },
  actionText: { fontSize: 13, color: colors.text, fontWeight: '600' },

  // ✅ ОБНОВЛЁННЫЙ STYLE: круглая кнопка 50×50, шрифт 26
  settingsBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  settingsBadgeText: {
    fontSize: 26,
  },

  // Intro / Onboarding
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
    color: '#3179b4',
    marginBottom: 8,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 18,
    color: '#6D4C41',
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
    color: '#4E342E',
    marginBottom: 2,
  },
  introCardText: {
    flex: 1,
    fontSize: 18,
    color: '#8D6E63',
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

  coinCircleBig: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFB74D',
    shadowColor: '#FFB74D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  coinEmojiBig: { fontSize: 80 },

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
    fontSize: 14,
    fontWeight: '600',
    color: '#E3F2FD',
    marginTop: 4,
    textAlign: 'center',
  },

  goalList: { width: '100%', marginBottom: 24 },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E3F2FD',
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
    color: '#2C3E50',
    marginBottom: 2,
  },
  goalCost: { fontSize: 14, color: '#7F8C8D' },
  goalCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  goalCheckText: { color: '#FFF', fontSize: 18, fontWeight: '900' },

  // Модалки
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
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
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  modalButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  roomScroll: { paddingVertical: 4, paddingRight: 8 },
  roomOption: {
    width: 110,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.cardBg,
  },
  roomOptionActive: { borderColor: colors.accent },
  roomThumb: { width: '100%', height: 110 },
  roomLabel: { fontSize: 12, textAlign: 'center', paddingVertical: 6, color: colors.text, fontWeight: '600' },
  roomCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomCheckText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Мини-меню уровня
  levelSheet: {
    backgroundColor: colors.background,
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
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  levelSheetSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  emptyFeatures: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    marginBottom: 8,
  },
  emptyFeaturesText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresList: { gap: 10, marginBottom: 8 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRowLocked: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  featureEmoji: { fontSize: 30, marginRight: 14 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  featureDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  featureArrow: { fontSize: 16, color: '#bbb' },
});

export default React.memo(HomeScreenInner);