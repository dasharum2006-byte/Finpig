import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDemo } from '../context/DemoContext';


const BLOCK_TWO_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Деньги не растут на деревьях', subtitle: 'Откуда берутся деньги' },
  { id: 2, type: 'quiz', title: 'Ловушка Хотюна «Супер-Скидки»', subtitle: 'Скидки — ловушка' },
  { id: 3, type: 'quiz', title: 'Монстр Долгов «Одолжун»', subtitle: 'Что такое долг' },
  { id: 4, type: 'quiz', title: 'Шпионский счёт сдачи', subtitle: 'Считай сдачу' },
  { id: 5, type: 'tap',  title: 'Покупки в интернете', subtitle: 'Онлайн — только со взрослыми' },
  { id: 6, type: 'sort', title: 'Проверка Банкира', subtitle: 'Цели — по важности' },
];

const STORAGE_KEY = '@block_two_progress_v1';

export default function BlockTwoScreen({ navigation, route }) {
  const { demoMode } = useDemo();
  const [completedStep, setCompletedStep] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
          let currentStepInt = savedStep ? parseInt(savedStep, 10) : 0;
          if (route.params?.completedStep !== undefined) {
            currentStepInt = Math.max(currentStepInt, route.params.completedStep);
            await AsyncStorage.setItem(STORAGE_KEY, currentStepInt.toString());
            navigation.setParams({ completedStep: undefined }); 
          } 
          setCompletedStep(currentStepInt);
        }
        catch (e) {
        console.error('Ошибка загрузки прогресса Блока 2:', e);
        }
      };
      loadProgress();
    }, [route.params?.completedStep, navigation])
  );
   
  
  // useEffect(() => {
  //   const saveProgress = async () => {
  //     try {
  //       await AsyncStorage.setItem(STORAGE_KEY, completedStep.toString());
  //     } catch (e) {
  //       console.error('Ошибка сохранения прогресса Блока 2:', e);
  //     }
  //   };
  //   saveProgress();
  // }, [completedStep]);

  // useEffect(() => {
  //   if (route.params?.completedStep !== undefined) {
  //     setCompletedStep(prev => Math.max(prev, route.params.completedStep));
  //     navigation.setParams({ completedStep: undefined });
  //   }
  // }, [route.params?.completedStep, navigation]);

  const handlePressItem = (item) => {
    const isCompleted = item.id <= completedStep;
    const isCurrent = item.id === completedStep + 1;

    if (isCompleted) {
      if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelTwoScreen', { startIndex: item.id - 1, reviewMode: true });
      // Alert.alert('Уже пройдено');
      // return;
    } return;
  }
    if (!isCurrent && !demoMode) {
      Alert.alert('Заблокировано 🔒', 'Сначала пройди предыдущий шаг');
      return;
    }
    if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelTwoScreen', { startIndex: item.id - 1 });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.backButtonText}>Задания</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блок 2</Text>
        <View style={{ width: 110 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_TWO_ROUTINE.map((item) => {
          const isCompleted = item.id <= completedStep;
          const isCurrent = item.id === completedStep + 1;
          const isLocked = !demoMode && item.id > completedStep + 1;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                styles.quizCard,
                isCompleted && styles.completedCard,
                isLocked && styles.lockedCard,
              ]}
              onPress={() => handlePressItem(item)}
              activeOpacity={isLocked  ? 1 : 0.8}
            >
              <View style={styles.cardInfo}>
                <Text style={[
                  styles.cardTitle,
                  isCompleted && styles.completedText,
                  isLocked && styles.lockedText,
                ]}>
                  {isCompleted ? `${item.title}` : isLocked ? `🔒 ${item.title}` : item.title}
                </Text>
                <Text style={[
                  styles.cardSubtitle,
                  isCompleted && styles.completedText,
                ]}>
                  {isCompleted ? 'Нажми, чтобы посмотреть ответы' : isLocked ? 'Пройди прошлый уровень' : item.subtitle}
                </Text>
              </View>
              {isCurrent && <Text style={styles.arrow}>▶</Text>}
              {isCompleted && <Text style={styles.checkMark}>✅</Text>}
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
    backgroundColor: '#EAF4FF', 
    paddingTop: 25, 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: { 
    backgroundColor: '#3e9250cb', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 12 
  },
  backButtonText: { 
    color: '#131212', 
    fontWeight: 'bold' 
  },
  headerTitle: { 
    fontSize: 26, 
    marginLeft: 35,
    fontWeight: 'bold', 
    color: '#0D47A1',
    textAlign: 'center', 
    flex: 1,            
    textAlignVertical: 'center',
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },

  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    elevation: 2,
  },
  quizCard: { 
    backgroundColor: '#FFF', 
    borderColor: '#EAF4FF' 
  },
  gameCard: { 
    backgroundColor: '#EBF8FF', 
    borderColor: '#BEE3F8' 
  },
  cardInfo: { 
    flex: 1,            
    alignItems: 'flex-start', 
  },
  cardTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#2D3748',
    textAlign: 'left'    
  },
  lockedText: { 
    color: '#7BA7D4' 
  },
  cardSubtitle: { 
    fontSize: 17, 
    color: '#1976D2', 
    marginTop: 4,
    textAlign: 'left'    
  },
  arrow: { 
    fontSize: 17, 
    color: '#7BA7D4', 
    marginLeft: 10,      
    marginTop: 0 
  },
  lockedCard: { 
    backgroundColor: '#EAF4FF', 
    borderColor: '#90CAF9', 
    opacity: 0.6 
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  completedText: {
    color: '#2E7D32',
  },
  checkMark: {
    fontSize: 18,
    marginLeft: 10,
  },
});
