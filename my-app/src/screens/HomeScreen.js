import React, { useState, useEffect, useRef } from 'react';
import {View,Text,Image,ImageBackground,TouchableOpacity,StyleSheet,Modal, Pressable,Animated,
  Dimensions,ScrollView,PanResponder,ActivityIndicator} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';
import BudgetPlanScreen from './BudgetPlanScreen';
const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBudgetPlan } from '../context/BudgetPlanContext';
import { useDemo } from '../context/DemoContext';
import { LinearGradient } from 'expo-linear-gradient';

const PET_SIZE_BASE = width * 0.6;

const PET_SIZES = {
  0: PET_SIZE_BASE * 0.7,
  1: PET_SIZE_BASE * 1.0,
  2: PET_SIZE_BASE * 1.35,
  3: PET_SIZE_BASE * 1.75,
};

const DECAY_INTERVAL = 300;
const DECAY_STEP = 0.008;
const CLICK_STEP = 0.04;
const FLASH_DURATION = 180;
const EVO_FRAME_DURATION = 350;
const MAX_STAGE = 3;
const SWIPE_ACTIVATE = 8;
const SWIPE_THRESHOLD = 40;

const ROOMS = [
  { id: 'room1', source: require('../../assets/Rooms/room.png'), label: 'Комната 1' },
  { id: 'room2', source: require('../../assets/Rooms/room2.png'), label: 'Комната 2' },
  { id: 'room3', source: require('../../assets/Rooms/room3.png'), label: 'Комната 3' },
];

function OnboardingFlow({ step, pet, onNext, onFinish, navigation }) {
  if (step === 'intro') return <IntroScreen pet={pet} onNext={() => onNext('budget')} />;
  if (step === 'budget') return <StartBudgetScreen onNext={() => onNext('goal')} />;
  if (step === 'goal')   return <GoalScreen onNext={() => onNext('plan')} />;
  if (step === 'plan')   return <BudgetPlanScreen onFinish={onFinish} />;

  return null;
}
function IntroScreen({ onNext, pet }) {
  const petImage = pet
    ? getEggImage(pet.speciesId)
    : null;

  return (
    <ImageBackground
      source={require('../../assets/1.png')}
      style={styles.introContainer}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.introScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Питомец сверху — можно оставить, можно убрать */}
        {petImage && (
          <Image
            source={petImage}
            style={styles.introPetImage}
            resizeMode="contain"
          />
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

        <TouchableOpacity
          style={styles.introButton}
          onPress={onNext}
          activeOpacity={0.85}
        >
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
      <ScrollView
        contentContainerStyle={styles.introScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Монетка большая */}
        <View style={styles.coinCircleBig}>
          <Text style={styles.coinEmojiBig}>🪙</Text>
        </View>

        {/* Заголовок */}
        <Text style={styles.introTitle}>Вот твои первые монеты!</Text>

        {/* Цифра 500 крупно */}
        <View style={styles.amountCard}>
          <Text style={styles.amountValue}>500</Text>
          <Text style={styles.amountLabel}>монет на первый период</Text>
        </View>

        {/* Карточка с объяснением */}
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

        {/* Кнопка */}
        <TouchableOpacity
          style={styles.introButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.introButtonText}>Дальше →</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

function GoalScreen({ onNext }) {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const GOALS = [
    { id: 'bike',     emoji: '🚲', title: 'Велосипед',     cost: 500, color: '#42a4f5b6' },
    { id: 'scooter',  emoji: '🛴', title: 'Самокат',       cost: 300, color: '#66bb6ac2' },
    { id: 'gift',     emoji: '🎁', title: 'Подарок',  cost: 200, color: '#ff6f43b0' },
  ];

  const handleSelect = (goal) => {
    setSelectedGoal(goal);
  };
const budgetPlanCtx = useBudgetPlan();
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
      <ScrollView
        contentContainerStyle={styles.introScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.introTitle}> Выбери свою цель</Text>
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
          style={[
            styles.introButton,
            !selectedGoal && styles.introButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedGoal}
          activeOpacity={0.85}
        >
          <Text style={[
            styles.introButtonText,
            !selectedGoal && styles.introButtonTextDisabled,
          ]}>
            {selectedGoal ? 'Составить план →' : 'Выбери цель'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

function HomeScreenInner({ route, navigation }) {
  const bank = useBank();
  const petCtx = usePet();
   const { demoMode } = useDemo();   
  const incomingPet = route?.params?.pet;
  const [openMenu, setOpenMenu] = useState(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evolving, setEvolving] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hearts] = useState(3);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const progressRef = useRef(0);
  const decayTimer = useRef(null);
  const budgetPlanCtx = useBudgetPlan();
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const [onboardingDone, setOnboardingDone] = useState(petCtx.isOnboardingDone ?? false);
  const [showBudgetResult, setShowBudgetResult] = useState(false);  
  const [showNewPlan, setShowNewPlan] = useState(false);  
  const myPet = petCtx.pet;
  const currentStage = myPet?.stage ?? 0;
  const isMaxStage = currentStage >= MAX_STAGE;
  const petSize = PET_SIZES[currentStage] ?? PET_SIZES[0];

  
  
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
        // Свайп вправо → Кухня
        Animated.timing(translateX, {
          toValue: width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0);
          navigation.navigate('Kitchen');
        });
      } else if (g.dx < -SWIPE_THRESHOLD) {
        // Свайп влево → Гостиная
        Animated.timing(translateX, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0);
          navigation.navigate('LivingRoomScreen');
        });
      } else {
        // Не дотянул — вернуть на место
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  })
).current;

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    decayTimer.current = setInterval(() => {
      if (evolving || isMaxStage) return;
      if (progressRef.current > 0) {
        const next = Math.max(0, progressRef.current - DECAY_STEP);
        setProgress(next);
      }
    }, DECAY_INTERVAL);
    return () => clearInterval(decayTimer.current);
  }, [evolving, isMaxStage]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
  };

  const handlePetClick = () => {
    if (evolving) return;
    if (isMaxStage) return;

    pulse();
    const next = Math.min(1, progressRef.current + CLICK_STEP);
    setProgress(next);
    if (next >= 1) triggerEvolution();
  };

  const triggerEvolution = async () => {
    setEvolving(true);
    await wait(EVO_FRAME_DURATION);
    setFlash(true);
    await wait(FLASH_DURATION);
    setFlash(false);
    await wait(EVO_FRAME_DURATION);
    if (currentStage === 0) {
      petCtx.hatchPet();
    } else {
      petCtx.evolvePet();
    }

    setProgress(0);
    setEvolving(false);
  };

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const menus = {
    room: { title: '🏠 Комната', isRoomPicker: true },
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
  if (!petCtx.isLoaded) {
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

  const stageHint =
    currentStage === 0
      ? '← тапай по яйцу, чтобы вылупить'
      : isMaxStage
        ? 'Твой питомец вырос'
        : '← тапай по питомцу, чтобы растить';

  const hungerDisplay = Math.round(petCtx.hunger);
  const isHungry = hungerDisplay <= 25;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ImageBackground
          source={ROOMS[roomIndex].source}
          style={styles.room}
          resizeMode="cover"
        >
          <View style={styles.topBar}>
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

            <View style={styles.rightColumn}>
              <View style={styles.rightTopRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Lv.{bank.level}</Text>
                </View>
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
                {/* <TouchableOpacity
                onPress={handleFullReset}
                style={{ marginTop: 10, padding: 8, backgroundColor: '#ff4d4d', borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>СБРОС</Text>
              </TouchableOpacity> */}
                
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

            {/* {!isMaxStage && (
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            )} */}

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
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Задания</Text>
            </TouchableOpacity>
            
            
            {/* <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('LivingRoomScreen')}>
              <Text style={styles.actionEmoji}>🛋️</Text>
              <Text style={styles.actionText}>Гостинная</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Town')}
            >
              <Text style={styles.actionEmoji}>🏙️</Text>
              <Text style={styles.actionText}>Город</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('GoalsScreen')}
            >
              <Text style={styles.actionEmoji}>🎯</Text>
              <Text style={styles.actionText}>Цели</Text>
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
      </View>
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

      {flash && <View style={styles.flash} pointerEvents="none" />}

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
  namePlate: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  petName: { color: '#fff', fontSize: 18, fontWeight: '700' },

  rightColumn: { alignItems: 'flex-end', gap: 10 },
  rightTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  levelBadge: {
    backgroundColor: '#42A5F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  levelBadgeText: { fontSize: 16, fontWeight: '700', color: '#333' },

  heartsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
  },
  heart: { fontSize: 26, marginHorizontal: 2 },
  heartEmpty: { opacity: 0.5 },
// ─── Intro Screen ───
introContainer: { flex: 1 },
introScroll: {
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 24,
  paddingVertical: 40,
},

introPetImage: {
  width: 140,
  height: 140,
  marginBottom: 16,
},

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
  // textAlign: 'justify',
},

introCardsRow: {
  width: '100%',
  marginBottom: 28,
},

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
  alignItems: 'center',
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

  progressTrack: {
    marginTop: 14,
    width: width - 32,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 9 },

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

  swipeHint: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // bottomBar: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   paddingHorizontal: 0,
  //   paddingVertical: 14,
  //   backgroundColor: 'rgba(255,255,255,0.92)',
  //   borderTopLeftRadius: 24,
  //   borderTopRightRadius: 24,
  //   borderTopWidth: 1,
  //   borderTopColor: colors.border,
  // },
      bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 14,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  actionButton: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, minWidth: 70 },
  actionEmoji: { fontSize: 20, marginBottom: 4 },
  actionText: { fontSize: 13, color: colors.text, fontWeight: '600' },

  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', opacity: 0.9 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 220,
  },
  modalHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  modalButton: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 16 },
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
    onboardingWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    gap: 12,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  onboardingText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  onboardingLine: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginTop: 4,
  },
  onboardingButton: {
    marginTop: 24,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  onboardingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsBadge: {
  backgroundColor: 'rgba(255,255,255,0.85)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  marginTop: 8,
},
settingsBadgeText: {
  fontSize: 20,
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
// ─── StartBudgetScreen ───
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
coinEmojiBig: {
  fontSize: 80,
},

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
// ─── GoalScreen ───
goalList: {
  width: '100%',
  marginBottom: 24,
},

goalCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 16,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 3,
  borderColor: '#E3F2FD',           // ← светлая обводка по умолчанию
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
goalCost: {
  fontSize: 14,
  color: '#7F8C8D',
},

goalCheck: {
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 8,
},
goalCheckText: {
  color: '#FFF',
  fontSize: 18,
  fontWeight: '900',
},

introButtonDisabled: {
  backgroundColor: '#BBDEFB',
  shadowOpacity: 0.1,
},
introButtonTextDisabled: {
  color: '#E3F2FD',
}
});

export default React.memo(HomeScreenInner);