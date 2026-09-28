import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCK_THREE_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Правило 4-х копилок', subtitle: 'Правило 4-х копилок' },
  { id: 2, type: 'quiz', title: 'Суперприём Рассрочка', subtitle: 'Суперприём Рассрочка' },
  { id: 3, type: 'quiz', title: 'Секрет Рассрочки от Финпига', subtitle: 'Секрет Рассрочки от Финпига' },
  { id: 4, type: 'quiz', title: 'Что такое инфляция?', subtitle: 'Что такое инфляция?' },
  { id: 5, type: 'quiz', title: 'Кредит — ловушка Хотюна', subtitle: 'Кредит — ловушка Хотюна' },
  { id: 6, type: 'quiz', title: 'Капкан Хотюна', subtitle: 'Капкан Хотюна' },
  { id: 7, type: 'quiz', title: 'Умный щит Финпига', subtitle: 'Умный щит Финпига' },
  { id: 8, type: 'quiz', title: 'Секрет Рассрочки от Финпига', subtitle: 'Секрет Рассрочки от Финпига' },
  { id: 9, type: 'sort', title: 'Распредели бюджет', subtitle: 'Распредели бюджет' },
   { id: 10, type: 'sort', title: 'Распредели бюджет', subtitle: 'Распредели бюджет' },
  { id: 11, type: 'quiz', title: 'Что такое инфляция?', subtitle: 'Что такое инфляция?' },
  { id: 12, type: 'quiz', title: 'Что такое «Взаймы»?', subtitle: 'Что такое «Взаймы»?' },
  { id: 13, type: 'quiz', title: 'Капкан множества кредитов', subtitle: 'Капкан множества кредитов' },
];


const STORAGE_KEY = '@block_three_progress_v1';

export default function BlockThreeScreen({ navigation, route }) {
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
        } catch (e) {
          console.error('Ошибка загрузки прогресса Блока 3:', e);
        }
      };
      loadProgress();
    }, [route.params?.completedStep, navigation])
  );


  const handlePressItem = (item) => {
    const isCompleted = item.id <= completedStep;
    const isCurrent = item.id === completedStep + 1;
    if (isCompleted) {
    if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelThreeScreen', { startIndex: item.id - 1, reviewMode: true });
      }
      return;
    }
    if (!isCurrent) {
      Alert.alert('Заблокировано 🔒', 'Сначала пройди предыдущий шаг');
      return;
    }

    if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelThreeScreen', { startIndex: item.id - 1 });
    } 
  };

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.backButtonText}>Задания</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блок 3</Text>
        <View style={{ width: 110 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_THREE_ROUTINE.map((item) => {
          const isCompleted = item.id <= completedStep;
          const isCurrent = item.id === completedStep + 1;
          const isLocked = item.id > completedStep + 1;

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
              activeOpacity={isLocked ? 1 : 0.8}
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
                  isCompleted && styles.completedSubText,
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
    backgroundColor: '#F5F7FA', 
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
    color: '#333',
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
    borderColor: '#E2E8F0' 
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
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#2D3748',
    textAlign: 'left'    
  },
  lockedText: { 
    color: '#A0AEC0' 
  },
  cardSubtitle: { 
    fontSize: 13, 
    color: '#718096', 
    marginTop: 4,
    textAlign: 'left'    
  },
  arrow: { 
    fontSize: 16, 
    color: '#A0AEC0', 
    marginLeft: 10,      
    marginTop: 0 
  },
  lockedCard: { 
    backgroundColor: '#E2E8F0', 
    borderColor: '#CBD5E0', 
    opacity: 0.6 
  },
});
