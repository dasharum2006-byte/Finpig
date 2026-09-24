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
  ActivityIndicator, // Добавил для экрана загрузки
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//добавили 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const PET_SIZE = width * 0.7;
const DECAY_INTERVAL = 300;
const DECAY_STEP = 0.008;
const CLICK_STEP = 0.04;
const FLASH_DURATION = 180;
const EVO_FRAME_DURATION = 350;
const SWIPE_THRESHOLD = 80;

const ROOMS = [
  { id: 'room1', source: require('../../assets/Rooms/room.png'), label: 'Комната 1' },
  { id: 'room2', source: require('../../assets/Rooms/room2.png'), label: 'Комната 2' },
  { id: 'room3', source: require('../../assets/Rooms/room3.png'), label: 'Комната 3' },
];

export default function HomeScreen({ route, navigation }) {
  // 1. МАКСИМАЛЬНО БЕЗОПАСНО достаём параметры (даже если route пустой, ошибки не будет)
  const navItem = route?.params?.item;
  const navPetName = route?.params?.petName;
  // const { item, petName } = route.params || {};

  //добавила ---
  const [localPet, setLocalPet] = useState(null);
  const [localPetName, setLocalPetName] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Блокируем экран, пока читаем память

  const [openMenu, setOpenMenu] = useState(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evolved, setEvolved] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hearts] = useState(3);

  const progressRef = useRef(0);
  const decayTimer = useRef(null);
  const scale = useRef(new Animated.Value(1)).current;

  // Определяем, какого питомца показывать: из навигации (если только что выбрали) или из памяти
  const activePet = navItem || localPet;
  const activePetName = navPetName || localPetName;

//Изменила строку
  const PET_BASE = activePet?.source;
  const PET_EVOLVED = require('../../assets/Animals/pinguin/black/pinguin1.png');


  // ─── 1. ЗАГРУЗКА ПИТОМЦА ИЗ ПАМЯТИ ПРИ СТАРТЕ ───
  useEffect(() => {
    loadSavedPet();
  }, []);

  const loadSavedPet = async () => {
    try {
      const savedPet = await AsyncStorage.getItem('currentPet');
      const savedName = await AsyncStorage.getItem('currentPetName');
      if (savedPet && savedName) {
        setLocalPet(JSON.parse(savedPet));
        setLocalPetName(savedName);
      }
    } catch (error) {
      console.error('Ошибка загрузки питомца:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 2. СОХРАНЕНИЕ ПИТОМЦА, ЕСЛИ ОН ПРИШЁЛ ИЗ НАВИГАЦИИ (например, из Каталога) ───
  useEffect(() => {
    if (navItem && navPetName) {
      savePetToStorage(navItem, navPetName);
    }
  }, [navItem, navPetName]);

  const savePetToStorage = async (pet, name) => {
    try {
      await AsyncStorage.setItem('currentPet', JSON.stringify(pet));
      await AsyncStorage.setItem('currentPetName', name);
      setLocalPet(pet);
      setLocalPetName(name);
    } catch (error) {
      console.error('Ошибка сохранения питомца:', error);
    }
  };

  // Функция для сброса питомца (если захочешь сделать кнопку "Сменить питомца")
  const clearPet = async () => {
    await AsyncStorage.removeItem('currentPet');
    await AsyncStorage.removeItem('currentPetName');
    setLocalPet(null);
    setLocalPetName('');
    navigation.navigate('Catalog'); // Или экран создания питомца
  };

  // ─── Свайп ВЛЕВО → на кухню (кухня слева от дома) ───
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          //хз тут надо поменять petName -> activePetname
          navigation.navigate('Kitchen', { item: activePet, petName: activePetName });
        }
      },
    })
  ).current;

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    decayTimer.current = setInterval(() => {
      if (evolving || evolved) return;
      if (progressRef.current > 0) {
        const next = Math.max(0, progressRef.current - DECAY_STEP);
        setProgress(next);
      }
    }, DECAY_INTERVAL);
    return () => clearInterval(decayTimer.current);
  }, [evolving, evolved]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
  };

  const handlePetClick = () => {
    if (evolving || evolved) return;
    pulse();
    const next = Math.min(1, progressRef.current + CLICK_STEP);
    setProgress(next);
    if (next >= 1) triggerEvolution();
  };

  const triggerEvolution = async () => {
    setEvolving(true);
    await wait(EVO_FRAME_DURATION);
    await wait(EVO_FRAME_DURATION);
    setFlash(true);
    await wait(FLASH_DURATION);
    setFlash(false);
    setEvolved(true);
    setEvolving(false);
  };

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const petSource = evolved ? PET_EVOLVED : PET_BASE;

  const menus = {
    // tasks: { title: '📋 Задания', text: 'Скоро тут появятся задания для питомца.' },
    room: { title: '🏠 Комната', isRoomPicker: true },
  };
 // ─── 3. ЭКРАН ЗАГРУЗКИ (пока читаем память) ───
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.emptyText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── 4. ЕСЛИ ПИТОМЦА НЕТ НИ В ПАМЯТИ, НИ В НАВИГАЦИИ ───
  if (!activePet) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Питомец не выбран</Text>
          <Text style={styles.emptySubText}>Давай выберем или создадим нового!</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Catalog')} // <-- Сюда можно поставить экран создания питомца
          >
            <Text style={styles.emptyButtonText}>Выбрать питомца</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // if (!item) {
  //   return (
  //     <SafeAreaView style={styles.container} edges={['bottom']}>
  //       <View style={styles.emptyState}>
  //         <Text style={styles.emptyText}>Питомец не выбран</Text>
  //         <TouchableOpacity
  //           style={styles.emptyButton}
  //           onPress={() => navigation.navigate('Catalog')}
  //         >
  //           <Text style={styles.emptyButtonText}>В каталог</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ImageBackground source={ROOMS[roomIndex].source} style={styles.room} resizeMode="cover">
          <View style={styles.topBar}>
            <View style={styles.namePlate}>
              {/* Изменила строку */}
              <Text style={styles.petName}>{activePetName}</Text>
            </View>
            <View style={styles.heartsRow}>
              {[0, 1, 2].map((i) => (
                <Text key={i} style={[styles.heart, i >= hearts && styles.heartEmpty]}>
                  {i < hearts ? '❤️' : '🤍'}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.petWrapper}>
            <TouchableOpacity activeOpacity={0.9} onPress={handlePetClick}>
              <Animated.Image
                source={petSource}
                style={[styles.petImage, { transform: [{ scale }] }]}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {!evolved && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            )}

            <Text style={styles.swipeHint}>← свайпни влево, чтобы пойти на кухню</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Задания</Text>
            </TouchableOpacity>
            {/* КНОПКА С ЗЕМЛЕЙ путешествие по странам */}
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.navigate('World')}>
              <Text style={styles.actionEmoji}>🌍</Text>
              <Text style={styles.actionText}>Мир</Text>
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

                {menus[openMenu].isRoomPicker ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.roomScroll}
                  >
                    {ROOMS.map((r, idx) => (
                      <TouchableOpacity
                        key={r.id}
                        style={[styles.roomOption, idx === roomIndex && styles.roomOptionActive]}
                        onPress={() => {
                          setRoomIndex(idx);
                          setOpenMenu(null);
                        }}
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
                ) : (
                  <Text style={styles.modalText}>{menus[openMenu].text}</Text>
                )}

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
  emptyText: { fontSize: 18, color: colors.text, marginBottom: 16 },
  emptyButton: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  namePlate: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  petName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heartsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heart: { fontSize: 20, marginHorizontal: 2 },
  heartEmpty: { opacity: 0.5 },
//опустила питомца - flex-end
  petWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingTop: 20 },
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

  swipeHint: { marginTop: 10, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 120,
  },
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
  modalText: { fontSize: 16, color: colors.textSecondary, lineHeight: 22, marginBottom: 24 },
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