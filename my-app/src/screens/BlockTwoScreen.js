import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCK_TWO_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Шаг 1: Секрет кармана', subtitle: 'Откуда берутся деньги' },
  { id: 2, type: 'quiz', title: 'Шаг 2: Ловушка Хотюна', subtitle: 'Охота за скидками' },
  { id: 3, type: 'quiz', title: 'Шаг 3: Монстр Одолжун', subtitle: 'Что такое долг' },
  { id: 4, type: 'quiz', title: 'Шаг 4: Кредитный капкан', subtitle: 'Ловушка для взрослых' },
  { id: 5, type: 'quiz', title: 'Шаг 5: Фин-щит агента', subtitle: 'Когда кредит оправдан' },
  { id: 6, type: 'quiz', title: 'Шаг 6: Суперприём Рассрочка', subtitle: 'Делим платежи на части' },
  { id: 7, type: 'quiz', title: 'Шаг 7: Коварные риски', subtitle: 'Опасно ли давать в долг' },
  { id: 8, type: 'sort', title: 'Задание 8: Экзамен Банкира', subtitle: 'Умные и глупые цели' },
  { id: 9, type: 'quiz', title: 'Шаг 9: Шпионский счёт', subtitle: 'Пересчитываем сдачу' },
  { id: 10, type: 'quiz', title: 'Шаг 10: Разведка цен', subtitle: 'Маркетплейс против лавки' },
  { id: 11, type: 'game', screen: 'GameBudgetPlanner', title: '🎮 Игра 1: Собери бюджет', subtitle: 'Распредели доходы и расходы' },
  { id: 12, type: 'game', screen: 'GameShopSimulator', title: '🎮 Игра 2: Симулятор магазина', subtitle: 'Проверка на прочность' },
];

const STORAGE_KEY = '@block_two_progress_v1';

export default function BlockTwoScreen({ navigation, route }) {
  const [completedStep, setCompletedStep] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
          if (savedStep) setCompletedStep(parseInt(savedStep, 10));
        } catch (e) {
          console.error('Ошибка загрузки прогресса Блока 2:', e);
        }
      };
      loadProgress();
    }, [])
  );

  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, completedStep.toString());
      } catch (e) {
        console.error('Ошибка сохранения прогресса Блока 2:', e);
      }
    };
    saveProgress();
  }, [completedStep]);

  useEffect(() => {
    if (route.params?.completedStep !== undefined) {
      setCompletedStep(prev => Math.max(prev, route.params.completedStep));
      navigation.setParams({ completedStep: undefined });
    }
  }, [route.params?.completedStep, navigation]);

  const handlePressItem = (item) => {
    const isCompleted = item.id <= completedStep;
    const isCurrent = item.id === completedStep + 1;

    if (isCompleted) {
      Alert.alert('Уже пройдено ✅', 'Этот шаг ты уже прошёл. Иди дальше!');
      return;
    }
    if (!isCurrent) {
      Alert.alert('Заблокировано 🔒', 'Сначала пройди предыдущий шаг!');
      return;
    }

    if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelTwoScreen', { startIndex: item.id - 1 });
    } else if (item.type === 'game') {
      navigation.navigate(item.screen, { stepId: item.id });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.backButtonText}>📋 Задания</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блок 2</Text>
        <View style={{ width: 110 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_TWO_ROUTINE.map((item) => {
          const isCompleted = item.id <= completedStep;
          const isCurrent = item.id === completedStep + 1;
          const isLocked = item.id > completedStep + 1;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                item.type === 'game' ? styles.gameCard : styles.quizCard,
                isCompleted && styles.completedCard,
                isLocked && styles.lockedCard,
              ]}
              onPress={() => handlePressItem(item)}
              activeOpacity={isLocked || isCompleted ? 1 : 0.8}
            >
              <View style={styles.cardInfo}>
                <Text style={[
                  styles.cardTitle,
                  isCompleted && styles.completedText,
                  isLocked && styles.lockedText,
                ]}>
                  {isCompleted ? `✅ ${item.title}` : isLocked ? `🔒 ${item.title}` : item.title}
                </Text>
                <Text style={[
                  styles.cardSubtitle,
                  isCompleted && styles.completedText,
                ]}>
                  {isCompleted ? 'Пройдено!' : isLocked ? 'Пройди прошлый уровень' : item.subtitle}
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
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { backgroundColor: '#558faa', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  backButtonText: { color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, elevation: 2 },
  quizCard: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  gameCard: { backgroundColor: '#EBF8FF', borderColor: '#BEE3F8' },
  completedCard: { backgroundColor: '#C8E6C9', borderColor: '#4CAF50' },
  lockedCard: { backgroundColor: '#E2E8F0', borderColor: '#CBD5E0', opacity: 0.6 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  completedText: { color: '#2E7D32' },
  lockedText: { color: '#A0AEC0' },
  cardSubtitle: { fontSize: 13, color: '#718096', marginTop: 4 },
  arrow: { fontSize: 16, color: '#A0AEC0', marginLeft: 10 },
  checkMark: { fontSize: 20, marginLeft: 10 },
});