import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BLOCK_ONE_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Откуда взялись деньги?', subtitle: 'Откуда взялись деньги?' },
  { id: 2, type: 'quiz', title: 'Почему появились деньги?', subtitle: 'Почему появились деньги?' },
  { id: 3, type: 'quiz', title: 'Сбережения', subtitle: 'Сбережения' },
  { id: 4, type: 'quiz', title: 'Копим на мечту', subtitle: 'Копим на мечту' },
  { id: 5, type: 'sort', title: 'План «Подарок маме»', subtitle: 'План «Подарок маме»' },
  { id: 6, type: 'quiz', title: 'Осторожно  фальшивка', subtitle: 'Осторожно фальшивка' },
  { id: 7, type: 'quiz', title: 'Ловушка Монстра «Хотюна»', subtitle: 'Ловушка Монстра «Хотюна»' },
  { id: 8, type: 'quiz', title: 'Нужды и Хотелки', subtitle: 'Нужды и Хотелки' },
  { id: 9, type: 'quiz', title: 'Обман в магазине', subtitle: 'Обман в магазине' },
  { id: 10, type: 'quiz', title: 'Экзамен Банкира', subtitle: 'Экзамен Банкира' },
  { id: 11, type: 'quiz', title: 'Супермаркет', subtitle: 'Супермаркет' },
  { id: 12, type: 'quiz', title: 'Спецоперация в автобусе', subtitle: 'Спецоперация в автобусе' },
  { id: 13, type: 'sort', title: 'Эволюция денег', subtitle: 'Эволюция денег' },
  { id: 14, type: 'quiz', title: 'Тайна  кошелька', subtitle: 'Тайна  кошелька' },
  { id: 15, type: 'quiz', title: 'Невидимые монеты ', subtitle: 'Невидимые монеты ' },
  { id: 16, type: 'quiz', title: 'Чек-ап расходов ', subtitle: 'Чек-ап расхов ' },
];



const STORAGE_KEY = '@block_one_progress_v1';

export default function BlockOneScreen({ navigation }) {
  const [completedStep, setCompletedStep] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
          const currentStepInt = (savedStep ? parseInt(savedStep, 10) : 0);

          setCompletedStep(currentStepInt);
          //Если прошли 6 вопросов ставим флаг
          if (currentStepInt >= BLOCK_ONE_ROUTINE.length) {
            await AsyncStorage.setItem('@block_one_finished', 'true');
          }
        } catch (e) {
          console.error('Ошибка загрузки прогресса Блока 1:', e);
        }
      };
      loadProgress();
    }, [])
  );

  const handlePressItem = (item) => {
    const isCompleted = item.id <= completedStep;
    const isCurrent = item.id === completedStep + 1;
    if (isCompleted) {
      if (item.type === 'quiz') {
        navigation.navigate('LevelOneScreen', { 
          startIndex: item.id - 1, 
          reviewMode: true 
        });
      }
      return;
    }
    // if (isCompleted) {
    //   Alert.alert('Уже пройдено ', 'Этот шаг ты уже прошёл');
    //   return;
    // }
    if (!isCurrent) {
      Alert.alert('Заблокировано 🔒', 'Сначала пройди предыдущий шаг');
      return;
    }
    if (item.type === 'quiz') {
      navigation.navigate('LevelOneScreen', { startIndex: item.id - 1 });
    // } else if (item.type === 'game') {
    //   navigation.navigate(item.screen, { stepId: item.id });
    }
  };
   
    const handleGoToBlockTwo = async () => {
    try {
      await AsyncStorage.setItem('@block_one_finished', 'true');
      navigation.navigate('Tasks', { unlockBlockTwo: true });
    } catch (e) {
      console.error(e);
    }
  };

   const isBlockFinished = completedStep >= BLOCK_ONE_ROUTINE.length;


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.backButtonText}>Задания</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блок 1</Text>
        <View style={{ width: 110 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_ONE_ROUTINE.map((item) => {
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
