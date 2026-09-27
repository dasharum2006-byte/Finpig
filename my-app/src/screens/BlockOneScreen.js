import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCK_ONE_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Вопрос 1: Что такое бартер?', subtitle: 'История древних монеток' },
  { id: 2, type: 'quiz', title: 'Вопрос 2: Акула на конфету', subtitle: 'Выгодный ли обмен?' },
  { id: 3, type: 'quiz', title: 'Вопрос 3: Секрет сбережений', subtitle: 'Защита от Тратозавра' },
  { id: 4, type: 'quiz', title: 'Вопрос 4: Финансовая цель', subtitle: 'Копим на велик' },
  { id: 5, type: 'quiz', title: 'Вопрос 5: Ловушка Хотюна', subtitle: 'Борьба с хотелками' },
  { id: 6, type: 'quiz', title: 'Вопрос 6: Правило бюджета', subtitle: 'Главный закон кошелька' },
  { id: 7, type: 'game', screen: 'MyNewGameScreen', title: '🎮 Финансовый щит', subtitle: 'Развиваем ловкость' },
  { id: 8, type: 'game', screen: 'MyNewGameScreen2', title: '🎮 Сортируй расходы', subtitle: 'Полочки «Важное» и «Хотелки»' },
];

const STORAGE_KEY = '@block_one_progress_v1';

export default function BlockOneScreen({ navigation }) {
  const [completedStep, setCompletedStep] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedStep = await AsyncStorage.getItem(STORAGE_KEY);
          setCompletedStep(savedStep ? parseInt(savedStep, 10) : 0);
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
      Alert.alert('Уже пройдено ✅', 'Этот шаг ты уже прошёл. Иди дальше!');
      return;
    }
    if (!isCurrent) {
      Alert.alert('Заблокировано 🔒', 'Сначала пройди предыдущий шаг!');
      return;
    }

    if (item.type === 'quiz') {
      navigation.navigate('LevelOneScreen', { startIndex: item.id - 1 });
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