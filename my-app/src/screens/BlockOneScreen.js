import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { TouchableOpacity } from '../components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDemo } from '../context/DemoContext';

const BLOCK_ONE_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Почему появились деньги?', subtitle: 'Акула и леденец' },
  { id: 2, type: 'tap',  title: 'Спецоперация в автобусе', subtitle: 'Оплати проезд' },
  { id: 3, type: 'tap',  title: 'Супермаркет', subtitle: 'Собери корзину по списку' },
  { id: 4, type: 'tap',  title: 'Осторожно: фальшивка', subtitle: 'Что делать с подозрительной купюрой' },
  { id: 5, type: 'sort', title: 'План «Подарок маме»', subtitle: 'Расставь шаги по порядку' },
  { id: 6, type: 'sort', title: 'Эволюция денег', subtitle: 'От древности до цифровых' },
];

const STORAGE_KEY = '@block_one_progress_v1';

export default function BlockOneScreen({ navigation }) {
  const { demoMode } = useDemo();
  const [completedStep, setCompletedStep] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
          const currentStepInt = (savedStep ? parseInt(savedStep, 10) : 0);
          setCompletedStep(currentStepInt);
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
      // Прошёл — можно посмотреть ответы (review)
      navigation.navigate('LevelOneScreen', {
        startIndex: item.id - 1,
        reviewMode: true,
      });
      return;
    }

    if (!isCurrent && !demoMode) {
      Alert.alert('Заблокировано 🔒', 'Сначала пройди предыдущий шаг');
      return;
    }

    // Текущее задание — открываем
    navigation.navigate('LevelOneScreen', { startIndex: item.id - 1 });
  };

  const isBlockFinished = completedStep >= BLOCK_ONE_ROUTINE.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Text style={styles.backButtonText}>Задания</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блок 1</Text>
        <View style={{ width: 110 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {BLOCK_ONE_ROUTINE.map((item) => {
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
              activeOpacity={isLocked ? 1 : 0.8}
              disabled={isLocked}
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
                  {isCompleted
                    ? 'Нажми, чтобы посмотреть ответы'
                    : isLocked
                      ? 'Пройди прошлый уровень'
                      : item.subtitle}
                </Text>
              </View>
              {isCurrent && <Text style={styles.arrow}>▶</Text>}
              {isCompleted && <Text style={styles.checkMark}>✅</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Кнопка «В Блок 2» — когда всё пройдено */}
        {/* {isBlockFinished && (
          <TouchableOpacity
            style={styles.nextBlockBtn}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.nextBlockBtnText}>🎉 Блок 1 пройден! К заданиям</Text>
          </TouchableOpacity>
        )} */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#EAF4FF', // Чистый аккуратный светлый фон
    paddingTop: 50, // Выровняли верхний отступ под остальные экраны
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 25,
  },
  backButton: { 
    backgroundColor: '#607D8B', // Приятный стальной цвет, как на экране Tasks
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#455A64', // Чёткая контурная линия для кнопки
  },
  backButtonText: { 
    color: '#FFF', // Белый текст на стальном фоне читается гораздо лучше
    fontWeight: 'bold',
    fontSize: 17,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#0D47A1',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },

  // БАЗОВАЯ КАРТОЧКА (ИСПРАВЛЕНО: ТЕНЕЙ НЕТ, ЧЁТКАЯ РАМКА BORDER LINE)
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 12, 
    borderWidth: 2, // Жирненький аккуратный контур
  },
  quizCard: { 
    backgroundColor: '#FFFFFF', 
    borderColor: '#90CAF9' // Спокойный базовый серый контур
  },
  cardInfo: { 
    flex: 1,            
    alignItems: 'flex-start', 
  },
  cardTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#0D47A1',
  },
  
  // КНИЖНЫЙ СТИЛЬ ПОДЗАГОЛОВКА 📖
  cardSubtitle: { 
    fontSize: 17, 
    color: '#7F8C8D', 
    marginTop: 4,
    textAlign: 'justify', // Текст распределяется ровно по краям
    lineHeight: 18,       // Межстрочный интервал
  },
  
  // ЗАКРЫТАЯ КАРТОЧКА
  lockedCard: { 
    backgroundColor: '#E3F2FD', 
    borderColor: '#90CAF9', 
    opacity: 0.6 
  },
  lockedText: { 
    color: '#78909C' 
  },
  
  // ПРОЙДЕННАЯ КАРТОЧКА
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  completedText: {
    color: '#2E7D32',
  },

  arrow: { 
    fontSize: 17, 
    color: '#78909C', 
    marginLeft: 10,      
  },
  checkMark: {
    fontSize: 18,
    marginLeft: 10,
  },
    // СТИЛИ ДЛЯ КНОПКИ ПЕРЕХОДА К СЛЕДУЮЩЕМУ БЛОКУ (БЕЗ ТЕНЕЙ, С КОНТУРОМ)
  nextBlockBtn: {
    backgroundColor: '#E8F5E9', // Мягкий пастельный зеленый
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4CAF50', // Яркий зеленый контур (border line)
  },
  nextBlockBtnText: {
    color: '#2e7d329c', // Глубокий темно-зеленый текст
    fontSize: 17,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Геймерский заглавный стиль текста
    letterSpacing: 0.5,
  },

});
