import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';

const BLOCK_TWO_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Вопрос 1: Откуда деньги?', subtitle: 'Труд и зарплата' },
  { id: 2, type: 'quiz', title: 'Вопрос 2: Нужды и Хотелки', subtitle: 'Учимся выбирать' },
  { id: 3, type: 'quiz', title: 'Вопрос 3: Подушка безопасности', subtitle: 'На черный день' },
  { id: 4, type: 'sort', title: 'Задание 4: План действий', subtitle: 'Копим на подарок' },
  { id: 5, type: 'quiz', title: 'Вопрос 5: Ловушка скидок', subtitle: 'Не ведись на маркетинг' },
  { id: 6, type: 'quiz', title: 'Вопрос 6: Что такое бюджет?', subtitle: 'Финальный экзамен' },
  
];

export default function BlockTwoScreen({ navigation, route }) {
  const [unlockedStep, setUnlockedStep] = useState(1);

  useEffect(() => {
    if (route.params?.highestCompletedStep) {
      const nextStep = route.params.highestCompletedStep + 1;
      if (nextStep > unlockedStep && nextStep <= BLOCK_TWO_ROUTINE.length) {
        setUnlockedStep(nextStep);
      }
      navigation.setParams({ highestCompletedStep: undefined });
    }
  }, [route.params?.highestCompletedStep, navigation, unlockedStep]);

  const handlePressItem = (item) => {
    if (item.id > unlockedStep) {
      Alert.alert('Заблокировано 🔒', 'Этот шаг пока закрыт. Пройди предыдущие задания!');
      return;
    }

    if (item.type === 'quiz' || item.type === 'sort') {
      navigation.navigate('LevelThreeScreen', { startIndex: item.id - 1 });
    } else if (item.type === 'game') {
      navigation.navigate(item.screen, { stepId: item.id });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Блок 2</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_TWO_ROUTINE.map((item) => {
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