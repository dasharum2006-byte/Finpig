import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView,ImageBackground, Alert} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
const {width} = Dimensions.get('window');

//6 уровней
const TASKS_DATA = [
  { id: 1, title: 'Блок 1: Основы', screen: 'BlockOneScreen', desc: 'Откуда берутся деньги' },
  { id: 2, title: 'Блок 2: Банковские хитрости', screen: 'BlockTwoScreen', desc: 'Кредиты, вклады и конверты' },
  { id: 3, title: 'Блок 3: Бюджет и цели', screen: 'BlockThreeScreen', desc: 'Нужды, хотелки и подушка безопасности' },
  { id: 4, title: 'Блок 4: Заработок и защита', screen: 'BlockFourScreen', desc: 'Первые доходы и защита от мошенников' },
  { id: 5, title: 'Блок 5: Инвестиции', screen: 'BlockFiveScreen', desc: 'Акции и  пассивный доход' },
  { id: 6, title: 'Блок 6: Финальный экзамен', screen: 'BlockSixScreen', desc: 'Скоро...' },
];

// Максимальное количество шагов в каждом блоке (для проверки завершения)
const MAX_STEPS = {
  1: 11, // В Блоке 1 у нас 11 вопросов
  2: 10, // В Блоке 2 у нас 10 вопросов
  3: 6,
  4: 6,
  5: 6,
};

export default function TasksScreen({ navigation }) {
  // Храним прогресс всех блоков
  const [progress, setProgress] = useState({
    block1: 1,
    block2: 1,
    block3: 1,
    block4: 1,
    block5: 1,
  });
    useFocusEffect(
    React.useCallback(() => {
      const loadAllProgress = async () => {
        try {
          const p1 = await AsyncStorage.getItem('@block_one_progress_v1');
          const p2 = await AsyncStorage.getItem('@block_two_progress_v1');
          const p3 = await AsyncStorage.getItem('@block_three_progress_v1');
          const p4 = await AsyncStorage.getItem('@block_four_progress_v1');
          const p5 = await AsyncStorage.getItem('@block_five_progress_v1');

          setProgress({
            block1: p1 ? parseInt(p1, 10) : 1,
            block2: p2 ? parseInt(p2, 10) : 1,
            block3: p3 ? parseInt(p3, 10) : 1,
            block4: p4 ? parseInt(p4, 10) : 1,
            block5: p5 ? parseInt(p5, 10) : 1,
          });
        } catch (error) {
          console.error('Ошибка проверки прогресса:', error);
        }
      };
      loadAllProgress();
    }, [])
  );
    // Функция проверки: открыт ли уровень?
  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true; // Первый уровень всегда открыт
    if (levelId === 2) return progress.block1 >= MAX_STEPS[1];
    if (levelId === 3) return progress.block2 >= MAX_STEPS[2];
    if (levelId === 4) return progress.block3 >= MAX_STEPS[3];
    if (levelId === 5) return progress.block4 >= MAX_STEPS[4];
    if (levelId === 6) return progress.block5 >= MAX_STEPS[5];
    return false;
  };

  const handleSelectTask = (task) => {
    if (!isLevelUnlocked(task.id)) {
      Alert.alert('Уровень закрыт 🔒', `Сначала полностью пройди Блок ${task.id - 1}!`);
      return;
    }

    if (task.id === 6) {
      Alert.alert('Скоро!', 'Этот уровень находится в разработке 🛠️');
      return;
    }

    // Переход на нужный экран
    navigation.navigate(task.screen);
  };

 return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.cityBackButton} 
          activeOpacity={0.7} 
          onPress={() => navigation.goBack()} 
        >
          <Text style={styles.cityBackText}>Назад</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageTitle}>Уровни</Text>
        <View style={{ width: 90 }} /> 
      </View>

      <ScrollView 
        style={styles.tasksList} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TASKS_DATA.map((task) => {
          const unlocked = isLevelUnlocked(task.id);

          return (
            <TouchableOpacity 
              key={task.id} 
              style={[
                styles.taskCard, 
                !unlocked && styles.lockedCard 
              ]} 
              activeOpacity={0.8}
              onPress={() => handleSelectTask(task)}
              disabled={!unlocked} 
            >
              <View style={[styles.levelBadge, !unlocked && styles.lockedBadge]}>
                <Text style={styles.levelBadgeText}>
                  {!unlocked ? '🔒' : task.id}
                </Text>
              </View>
              
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, !unlocked && styles.lockedText]}>
                  {task.title}
                </Text>
                <Text style={[styles.taskDescription, !unlocked && styles.lockedText]}>
                  {unlocked ? task.desc : 'Пройди предыдущий блок'}
                </Text>
              </View>

              <Text style={[styles.arrowIcon, !unlocked && styles.lockedText]}>
                {unlocked ? '▶' : '🔒'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4cb9da67',
    paddingTop: 50,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width * 0.9,
    marginBottom: 45,
  },
  cityBackButton: {
    backgroundColor: '#558faa',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1817174b',
  },
  cityBackEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  cityBackText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#151516', 
    textAlign: 'center',
    marginTop: 0,
  },
  tasksList: {
    width: width * 0.9,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', 
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#82dcff',
    // Тень
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lockedCard: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E0',
    opacity: 0.7,
  },
  levelBadge: {
    backgroundColor: '#0064e6',
    height: 45,
    width: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lockedBadge: {
    backgroundColor: '#94A3B8',
  },
  levelBadgeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  lockedText: {
    color: '#64748B',
  },
  taskDescription: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#252321',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});