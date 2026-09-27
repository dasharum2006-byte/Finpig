import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCK_FIVE_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Вопрос 1: Что такое инвестиции?', subtitle: 'Как заставить деньги работать' },
  { id: 2, type: 'quiz', title: 'Вопрос 2: Акции и облигации', subtitle: 'Доли компаний и долги' },
  { id: 3, type: 'quiz', title: 'Вопрос 3: Пассивный доход', subtitle: 'Деньги, которые приходят сами' },
  { id: 4, type: 'sort', title: 'Задание 4: Стратегия инвестора', subtitle: 'Расставь по уровню риска' },
  { id: 5, type: 'quiz', title: 'Вопрос 5: Диверсификация', subtitle: 'Не клади все яйца в одну корзину' },
  { id: 6, type: 'quiz', title: 'Вопрос 6: Финальный экзамен', subtitle: 'Ты — настоящий Финансовый Гуру!' },
];

const STORAGE_KEY = '@block_five_progress_v1';

export default function BlockFiveScreen({ navigation, route }) {
  const [unlockedStep, setUnlockedStep] = useState(1);

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
          if (savedStep) {
            setUnlockedStep(parseInt(savedStep, 10));
          }
        } catch (e) {
          console.error('Ошибка загрузки прогресса Блока 5:', e);
        }
      };
      loadProgress();
    }, [])
  );

  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, unlockedStep.toString());
      } catch (e) {
        console.error('Ошибка сохранения прогресса Блока 5:', e);
      }
    };
    saveProgress();
  }, [unlockedStep]);

  useEffect(() => {
    if (route.params?.highestCompletedStep) {
      const nextStep = route.params.highestCompletedStep + 1;
      setUnlockedStep(prev => Math.max(prev, nextStep));
      navigation.setParams({ highestCompletedStep: undefined });
    }
  }, [route.params?.highestCompletedStep, navigation]);

  const handlePressItem = (item) => {
    if (item.id > unlockedStep) {
      Alert.alert('Заблокировано 🔒', 'Этот шаг пока закрыт. Пройди предыдущие задания');
      return;
    }

    if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelFiveScreen', { startIndex: item.id - 1 });
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
        <Text style={styles.headerTitle}>Блок 5</Text>
        <View style={{ width: 110 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_FIVE_ROUTINE.map((item) => {
          const isLocked = item.id > unlockedStep;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                item.type === 'game' ? styles.gameCard : styles.quizCard,
                isLocked && styles.lockedCard
              ]}
              onPress={() => handlePressItem(item)}
              activeOpacity={isLocked ? 1 : 0.8}
            >
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, isLocked && styles.lockedText]}>
                  {isLocked ? `🔒 ${item.title}` : item.title}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {isLocked ? "Пройди прошлый уровень" : item.subtitle}
                </Text>
              </View>
              {!isLocked && <Text style={styles.arrow}>▶</Text>}
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
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  lockedText: { color: '#A0AEC0' },
  cardSubtitle: { fontSize: 13, color: '#718096', marginTop: 4 },
  arrow: { fontSize: 16, color: '#A0AEC0', marginLeft: 10 },
  lockedCard: { backgroundColor: '#E2E8F0', borderColor: '#CBD5E0', opacity: 0.6 },
});