import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

const TASKS_DATA = [
  { id: 1, title: 'Блок 1: Основы', screen: 'BlockOneScreen', desc: 'Откуда берутся деньги' },
  { id: 2, title: 'Блок 2: Банковские хитрости', screen: 'BlockTwoScreen', desc: 'Кредиты, рассрочка' },
  { id: 3, title: 'Блок 3: Бюджет и цели', screen: 'BlockThreeScreen', desc: 'Нужды, хотелки и подушка безопасности' },
  { id: 4, title: 'Блок 4: Законы', screen: 'BlockFourScreen', desc: 'Первые доходы' },
];


const TOTAL_STEPS = {
  1: 6,   
  2: 15,   
  3: 13,   
  4: 5,  
};

const STORAGE_KEYS = {
  1: '@block_one_progress_v1',
  2: '@block_two_progress_v1',
  3: '@block_three_progress_v1',
  4: '@block_four_progress_v1',
};

export default function TasksScreen({ navigation }) {
  const [progress, setProgress] = useState({
    block1: 0,
    block2: 0,
    block3: 0,
    block4: 0,
  });

   const [isBlockOneFinishedFlag, setIsBlockOneFinishedFinishedFlag] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadAllProgress = async () => {
        try {
          const p1 = await AsyncStorage.getItem(STORAGE_KEYS[1]);
          const p2 = await AsyncStorage.getItem(STORAGE_KEYS[2]);
          const p3 = await AsyncStorage.getItem(STORAGE_KEYS[3]);
          const p4 = await AsyncStorage.getItem(STORAGE_KEYS[4]);

          const f1 = await AsyncStorage.getItem('@block_one_finished');

          setProgress({
            block1: p1 ? parseInt(p1, 10) : 0,
            block2: p2 ? parseInt(p2, 10) : 0,
            block3: p3 ? parseInt(p3, 10) : 0,
            block4: p4 ? parseInt(p4, 10) : 0,
          });
          setIsBlockOneFinishedFinishedFlag(f1 === 'true');
        } catch (error) {
          console.error('Ошибка проверки прогресса:', error);
        }
      };
      loadAllProgress();
    }, [])
  );

  // Блок N открыт, если все шаги блока N-1 пройдены
  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true;
    if (levelId === 2) return progress.block1 >= TOTAL_STEPS[1] || isBlockOneFinishedFlag;
    if (levelId === 3) return progress.block2 >= TOTAL_STEPS[2];
    if (levelId === 4) return progress.block3 >= TOTAL_STEPS[3]; 
    return false;
  };

  const isLevelCompleted = (levelId) => {
    if (levelId >= 1 && levelId <= 4 ) {
      return progress[`block${levelId}`] >= TOTAL_STEPS[levelId];
    }
    return false;
  };

  const handleSelectTask = (task) => {
    if (!isLevelUnlocked(task.id)) {
      Alert.alert('Уровень закрыт 🔒', `Сначала полностью пройди Блок ${task.id - 1}!`);
      return;
    }

    navigation.navigate(task.screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.cityBackButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.cityBackText}>← Назад</Text>
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
          const completed = isLevelCompleted(task.id);

          return (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                completed && styles.completedCard,
                !unlocked && styles.lockedCard,
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectTask(task)}
              disabled={!unlocked}
            >
              <View style={[
                styles.levelBadge,
                completed && styles.completedBadge,
                !unlocked && styles.lockedBadge,
              ]}>
                {/* <Text style={styles.levelBadgeText}>
                  {completed ? '' : !unlocked ? '' : task.id}
                </Text> */}
              </View>

              <View style={styles.taskInfo}>
                <Text style={[
                  styles.taskTitle,
                  completed && styles.completedText,
                  !unlocked && styles.lockedText,
                ]}>
                  {task.title}
                </Text>
                <Text style={[
                  styles.taskDescription,
                  completed && styles.completedText,
                  !unlocked && styles.lockedText,
                ]}>
                  {completed
                    ? 'Пройдено'
                    : !unlocked
                      ? 'Пройди предыдущий блок'
                      : task.desc}
                </Text>
              </View>

              <Text style={[
                styles.arrowIcon,
                completed && styles.completedText,
                !unlocked && styles.lockedText,
              ]}>
                {completed ? '✅' : unlocked ? '▶' : '🔒'}
              </Text>
            </TouchableOpacity>
            
          );
        })}
          <TouchableOpacity
          style={styles.glossaryBigBtn}
          onPress={() => navigation.navigate('Glossary')}
        >
          <Text style={styles.glossaryBigBtnText}>📖 Словарик</Text>
        </TouchableOpacity>
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 30,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width * 0.9,
    marginBottom: 35,
  },

  cityBackText: { fontSize: 20, color: 'black', fontWeight: '600', marginBottom: 12 },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0d0d0e',
    textAlign: 'center',
    marginBottom: 12,
  },
  glossaryBtn: {
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CFD8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glossaryBtnText: {
    fontSize: 18,
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#CFD8DC', 
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784', 
  },
  lockedCard: {
    backgroundColor: '#ECEFF1',
    borderColor: '#B0BEC5', 
    opacity: 0.6,
  },
  
  
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  completedText: {
    color: '#2E7D32',
  },
  lockedText: {
    color: '#78909C',
  },
  
  taskDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'justify', 
    lineHeight: 18,       
  },
  arrowIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
});
