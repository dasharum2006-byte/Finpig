import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

// Теперь у нас полноценный список: 6 вопросов и 3 мини-игры по цепочке!
const BLOCK_ONE_ROUTINE = [
  { id: 1, type: 'quiz', title: 'Вопрос 1: Что такое бартер?', subtitle: 'История древних свинок 🪙' },
  { id: 2, type: 'quiz', title: 'Вопрос 2: Акула на конфету', subtitle: 'Выгодный ли обмен? 🦈' },
  { id: 3, type: 'quiz', title: 'Вопрос 3: Секрет сбережений', subtitle: 'Защита от Тратозавра 🏦' },
  { id: 4, type: 'quiz', title: 'Вопрос 4: Финансовая цель', subtitle: 'Копим на синий велик 🚲' },
  { id: 5, type: 'quiz', title: 'Вопрос 5: Ловушка Хотюна', subtitle: 'Борьба с хотелками 🛑' },
  { id: 6, type: 'quiz', title: 'Вопрос 6: Правило бюджета', subtitle: 'Главный закон кошелька 🧠' },
  
  // А вот твои будущие 3 мини-игры, которые откроются после вопросов!
  { id: 7, type: 'game', screen: 'GameCatchCoins', title: '🎮 Игра 1: Поймай монетки', subtitle: 'Развиваем ловкость' },
  { id: 8, type: 'game', screen: 'GameSortExpenses', title: '🎮 Игра 2: Сортируй расходы', subtitle: 'Полочки «Важное» и «Хотелки»' },
  { id: 9, type: 'game', screen: 'GameSafeBank', title: '🎮 Игра 3: Защити банкомат', subtitle: 'Финал Блока 1 🏆' },
];

export default function BlockOneScreen({ navigation }) {
  // По умолчанию открыт только первый вопрос
  const [openedLevels, setOpenedLevels] = useState([1]);

  const handleSelectRoutine = (item) => {
    if (!openedLevels.includes(item.id)) {
      alert('Этот этап заблокирован! Пройди предыдущие задания 🔒');
      return;
    }

    if (item.type === 'quiz') {
      // Переходим на экран викторины и передаем туда ID вопроса
      navigation.navigate('LevelOne', { 
        questionId: item.id,
        // Передаем функцию, которая откроет следующий уровень при правильном ответе
        onSuccess: () => setOpenedLevels(prev => [...prev, item.id + 1])
      });
    } else if (item.type === 'game') {
      // Переходим на конкретный экран мини-игры твоего друга
      navigation.navigate(item.screen, {
        onSuccess: () => setOpenedLevels(prev => [...prev, item.id + 1])
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Шапка Блока */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Назад в меню</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Блок 1: Карта приключений</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Список заданий и мини-игр идущих вниз */}
      <ScrollView style={styles.list} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BLOCK_ONE_ROUTINE.map((item) => {
          const isOpen = openedLevels.includes(item.id);
          
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.card, 
                !isOpen && styles.lockedCard, 
                item.type === 'game' && isOpen && styles.gameCard
              ]} 
              activeOpacity={0.8}
              onPress={() => handleSelectRoutine(item)}
            >
              <View style={[styles.badge, !isOpen && styles.lockedBadge, item.type === 'game' && styles.gameBadge]}>
                <Text style={styles.badgeText}>{isOpen ? item.id : '🔒'}</Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, item.type === 'game' && styles.gameTitleText]}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{isOpen ? item.subtitle : 'Заблокировано'}</Text>
              </View>
              
              <Text style={styles.arrowIcon}>▶</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#365d69', paddingTop: 50, alignItems: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: width * 0.9, marginBottom: 20 },
  backButton: { backgroundColor: '#3b71af', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  mainTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center', flex: 1 },
  list: { width: width * 0.9, flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  // Карточки
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', padding: 15, borderRadius: 18, marginBottom: 15, borderWidth: 2, borderColor: '#FFE082' },
  lockedCard: { backgroundColor: '#ECEFF1', borderColor: '#B0BEC5', opacity: 0.7 },
  gameCard: { backgroundColor: '#E8F5E9', borderColor: '#81C784' }, // Выделяем мини-игры зеленым цветом
  
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#5D4037' },
  gameTitleText: { color: '#1B5E20' },
  cardSubtitle: { fontSize: 12, color: '#8D6E63', marginTop: 2 },
  
  badge: { backgroundColor: '#E65100', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  lockedBadge: { backgroundColor: '#78909C' },
  gameBadge: { backgroundColor: '#2E7D32' },
  badgeText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  arrowIcon: { fontSize: 16, color: '#8D6E63', fontWeight: 'bold', marginLeft: 10 }
});
