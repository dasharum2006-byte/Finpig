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
const PET_SIZE = width * 0.7;
const DECAY_INTERVAL = 300;
const DECAY_STEP = 0.008;
const CLICK_STEP = 0.04;
const FLASH_DURATION = 180;
const EVO_FRAME_DURATION = 350;
const SWIPE_THRESHOLD = 80;
const MAX_STAGE = 3; // 0=яйцо, 1=мелкий, 2=подросток, 3=взрослый

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

  // ─── Стадия ───
  // stage 0 = яйцо, 1..3 = стадии питомца
  const currentStage = myPet?.stage ?? 0;
  const isMaxStage = currentStage >= MAX_STAGE;

  // ─── Картинка ───
  const petImage = myPet
    ? (currentStage === 0
        ? getEggImage(myPet.speciesId)
        : getPetImage(myPet.speciesId, myPet.variationId, currentStage - 1))
    : null;

  const petName = myPet?.name ?? 'Питомец';

  // ─── Свайп влево → кухня ───
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          navigation.navigate('Kitchen');
        }
      },
    })
  ).current;

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Падение шкалы, если не кликают
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

  // ─── Клик по питомцу/яйцу ───
  const handlePetClick = () => {
    if (evolving) return;
    if (isMaxStage) return; // финал — больше не растёт

    pulse();
    const next = Math.min(1, progressRef.current + CLICK_STEP);
    setProgress(next);
    if (next >= 1) triggerEvolution();
  };

  // ─── Эволюция: 0 → 1 → 2 → 3 ───
  const triggerEvolution = async () => {
    setEvolving(true);
    await wait(EVO_FRAME_DURATION);
    setFlash(true);
    await wait(FLASH_DURATION);
    setFlash(false);
    await wait(EVO_FRAME_DURATION);

    if (currentStage === 0) {
      // Яйцо → мелкий
      petCtx.hatchPet();       // hatched: true, stage: 1
    } else {
      // Мелкий → подросток → взрослый
      petCtx.evolvePet();      // stage + 1
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

  // Подсказка под питомцем
  const stageHint =
    currentStage === 0
      ? '← тапай по яйцу, чтобы вылупить'
      : isMaxStage
        ? '✨ Твой питомец вырос! ✨'
        : '← тапай по питомцу, чтобы растить';

  // Индикатор показывает пройденные стадии (0..3)
  // Точки: [1, 2, 3] — 3 точки. currentStage 1 → первая точка, 2 → две, 3 → три
  const showStageDots = currentStage >= 1;

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

              <View
                style={[
                  styles.hungerBadge,
                  petCtx.hunger <= 25 && styles.hungerBadgeDanger,
                ]}
              >
                <Text style={styles.hungerEmoji}>🍽️</Text>
                <Text
                  style={[
                    styles.hungerText,
                    petCtx.hunger <= 25 && styles.hungerTextDanger,
                  ]}
                >
                  {petCtx.hunger}%
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
                style={[styles.petImage, { transform: [{ scale }] }]}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Шкала — показывается, пока не финал */}
            {!isMaxStage && (
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            )}

            {/* Индикатор стадий (3 точки) — только после вылупления */}
            {showStageDots && (
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

            <Text style={styles.swipeHint}>{stageHint}</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Задания</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Town')}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
    backgroundColor: '#f1c40f',
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
  petImage: { width: PET_SIZE, height: PET_SIZE },

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

  swipeHint: { marginTop: 10, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, minWidth: 100 },
  actionEmoji: { fontSize: 26, marginBottom: 4 },
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
});