import { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank } from '../context/BankContext';
import { usePet } from '../context/PetContext';
import { getEggImage, getPetImage } from '../petsConfig';

const { width } = Dimensions.get('window');

// Размеры по стадиям: 0=яйцо, 1=мелкий, 2=подросток, 3=взрослый
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

// ─── Свайп: лёгкий, в любом месте экрана ───
const SWIPE_ACTIVATE = 8;    // px — минимальное движение для активации
const SWIPE_THRESHOLD = 40;  // px — минимальная длина для срабатывания

const ROOMS = [
  { id: 'room1', source: require('../../assets/Rooms/room.png'), label: 'Комната 1' },
  { id: 'room2', source: require('../../assets/Rooms/room2.png'), label: 'Комната 2' },
  { id: 'room3', source: require('../../assets/Rooms/room3.png'), label: 'Комната 3' },
];

export default function HomeScreen({ route, navigation }) {
  const bank = useBank();
  const petCtx = usePet();

  const incomingPet = route?.params?.pet;

  useEffect(() => {
    if (incomingPet) {
      petCtx.setNewPet(incomingPet);
    }
  }, [incomingPet]);

  const myPet = petCtx.pet;

  const [openMenu, setOpenMenu] = useState(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evolving, setEvolving] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hearts] = useState(3);

  const progressRef = useRef(0);
  const decayTimer = useRef(null);
  const scale = useRef(new Animated.Value(1)).current;

  const currentStage = myPet?.stage ?? 0;
  const isMaxStage = currentStage >= MAX_STAGE;
  const petSize = PET_SIZES[currentStage] ?? PET_SIZES[0];

  const petImage = myPet
    ? (currentStage === 0
        ? getEggImage(myPet.speciesId)
        : getPetImage(myPet.speciesId, myPet.variationId, currentStage - 1))
    : null;

  const petName = myPet?.name ?? 'Питомец';

  // ─── Свайп ВПРАВО → на кухню (лёгкий, в любом месте) ───
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > SWIPE_ACTIVATE &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          navigation.navigate('Kitchen');
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
          <Text style={styles.emptySubText}>Давай выберем яйцо!</Text>
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
        ? '✨ Твой питомец вырос! ✨'
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

              {/* <View
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
              </View> */}
              <View
              style={[
                styles.hungerBadge,
                isHungry && styles.hungerBadgeDanger,
              ]}
            >
              <View 
                style={[
                  styles.hungerProgressFill, 
                  isHungry && styles.hungerProgressFillDanger,
                  { height: `${hungerDisplay}%` } 
                ]} 
              />

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

            {!isMaxStage && (
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            )}

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

            <Text style={styles.swipeHint}>
              свайпни вправо, чтобы пойти на кухню →
            </Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Задания</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('World')}
            >
              <Text style={styles.actionEmoji}>🌍</Text>
              <Text style={styles.actionText}>Мир</Text>
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
          </View>
        </ImageBackground>
      </View>

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

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },
//   room: { flex: 1, justifyContent: 'space-between' },

//   emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
//   emptyText: { fontSize: 18, color: colors.text, marginBottom: 8, fontWeight: '600' },
//   emptySubText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
//   emptyButton: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
//   emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

//   topBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },
//   namePlate: {
//     backgroundColor: colors.accent,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 24,
//   },
//   petName: { color: '#fff', fontSize: 18, fontWeight: '700' },

//   rightColumn: { alignItems: 'flex-end', gap: 10 },
//   rightTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

//   levelBadge: {
//     backgroundColor: '#f1c40f',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//   },
//   levelBadgeText: { fontSize: 16, fontWeight: '700', color: '#333' },

//   heartsRow: {
//     flexDirection: 'row',
//     backgroundColor: 'rgba(255,255,255,0.85)',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 24,
//   },
//   heart: { fontSize: 26, marginHorizontal: 2 },
//   heartEmpty: { opacity: 0.5 },

//   hungerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#e0e0e0',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     gap: 6,
//   },
//   hungerBadgeDanger: { backgroundColor: '#ff4d4d' },
//   hungerEmoji: { fontSize: 18 },
//   hungerText: { fontSize: 16, fontWeight: '700', color: '#333' },
//   hungerTextDanger: { color: '#fff' },

//   balanceBadge: {
//     backgroundColor: colors.accent,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 20,
//   },
//   balanceBadgeText: { fontSize: 18, fontWeight: '700', color: '#fff' },

//   petWrapper: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingTop: 20,
//   },
//   petImage: {},

//   progressTrack: {
//     marginTop: 14,
//     width: width - 32,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: 'rgba(255,255,255,0.6)',
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 9 },

//   stageIndicator: {
//     flexDirection: 'row',
//     marginTop: 10,
//     gap: 8,
//   },
//   stageDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: 'rgba(255,255,255,0.6)',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   stageDotFilled: {
//     backgroundColor: colors.accent,
//     borderColor: colors.accent,
//   },

//   swipeHint: {
//     marginTop: 10,
//     fontSize: 12,
//     color: colors.textSecondary,
//     fontStyle: 'italic',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },

//   bottomBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 14,
//     backgroundColor: 'rgba(255,255,255,0.92)',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   actionButton: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, minWidth: 100 },
//   actionEmoji: { fontSize: 26, marginBottom: 4 },
//   actionText: { fontSize: 13, color: colors.text, fontWeight: '600' },

//   flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', opacity: 0.9 },

//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
//   modalSheet: {
//     backgroundColor: colors.background,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingHorizontal: 24,
//     paddingTop: 12,
//     paddingBottom: 32,
//     minHeight: 220,
//   },
//   modalHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 16 },
//   modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
//   modalButton: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 16 },
//   modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
//   roomScroll: { paddingVertical: 4, paddingRight: 8 },
//   roomOption: {
//     width: 110,
//     marginRight: 12,
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: 'transparent',
//     backgroundColor: colors.cardBg,
//   },
//   roomOptionActive: { borderColor: colors.accent },
//   roomThumb: { width: '100%', height: 110 },
//   roomLabel: { fontSize: 12, textAlign: 'center', paddingVertical: 6, color: colors.text, fontWeight: '600' },
//   roomCheck: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: colors.accent,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   roomCheckText: { color: '#fff', fontSize: 13, fontWeight: '700' },
// });
const styles = StyleSheet.create({

  container: { flex: 1 },
  room: { flex: 1, justifyContent: 'space-between' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 18, color: '#2C3E50', marginBottom: 8, fontWeight: '600' },
  emptySubText: { fontSize: 14, color: '#7F8C8D', marginBottom: 16 },
  emptyButton: { backgroundColor: '#FF6B8B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50, 
  },
  
  namePlate: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E4E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  petName: { color: '#2C3E50', fontSize: 16, fontWeight: '800' },

  rightColumn: { alignItems: 'flex-end', gap: 12 },
  rightTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

 
  levelBadge: {
    backgroundColor: '#FFD15C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E6B800',
  },
  levelBadgeText: { fontSize: 14, fontWeight: '800', color: '#5C4300' },


  heartsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E4E7EB',
  },
  heart: { fontSize: 20, marginHorizontal: 1 },
  heartEmpty: { opacity: 0.25 },


  hungerBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', 
    borderWidth: 3,
    borderColor: '#2ECC71', 
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', 
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  hungerBadgeDanger: { borderColor: '#E74C3C' },
  

  hungerProgressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(46, 204, 113, 0.25)', 
  },
  hungerProgressFillDanger: {
    backgroundColor: 'rgba(231, 76, 60, 0.3)', 
  },
  hungerEmoji: { fontSize: 24, zIndex: 2 }, 
  hungerText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#27AE60', 
    zIndex: 2, 
    marginTop: -2 
  },
  hungerTextDanger: { color: '#C0392B' },

  balanceBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#F1C40F',
  },
  balanceBadgeText: { fontSize: 15, fontWeight: '800', color: '#F39C12' },


  petWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  petImage: {
  
  },

  progressTrack: {
    marginTop: 14,
    width: '80%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E4E7EB',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#3498DB', borderRadius: 6 },

  stageIndicator: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 6,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  stageDotFilled: {
    backgroundColor: '#3498DB',
  },

  swipeHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  actionButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4, flex: 1 },
  actionEmoji: { fontSize: 24, marginBottom: 2 },
  actionText: { fontSize: 12, color: '#4B5563', fontWeight: '700' },

  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', opacity: 0.9 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 240,
  },
  modalHandle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#E5E7EB', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  modalButton: { backgroundColor: '#3498DB', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  roomScroll: { paddingVertical: 4, paddingRight: 8 },
  roomOption: {
    width: 110,
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roomOptionActive: { borderColor: '#3498DB' },
  roomThumb: { width: '100%', height: 110 },
  roomLabel: { fontSize: 12, textAlign: 'center', paddingVertical: 6, color: '#1F2937', fontWeight: '700' },
  roomCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomCheckText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
