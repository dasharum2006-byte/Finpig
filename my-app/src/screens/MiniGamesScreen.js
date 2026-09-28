import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useBank } from '../context/BankContext'; 


const GAMES_DATA = [
  {
    id: 1,
    title: 'Собери бюджет',
    desc: 'Распредели доходы и расходы питомца',
    screen: 'GameBudgetPlanner',
    isAvailable: true,
  },
  {
    id: 2,
    title: 'Угадай цену',
    desc: 'Попробуй угадать реальную стоимость товаров и не дать обсчитать Финпига!',
    screen: 'GamePriceGuesser',
    isAvailable: true,
  },
  {
    id: 3,
    title: 'Анти-Скам Чат',
    desc: 'Раскуси уловки хитрых мошенников в переписке и защити свои сбережения!',
    screen: 'ScamGameScreen',
    isAvailable: true,
  },
  {
    id: 4,
    title: 'Валютное Мемори',
    desc: 'Ищи логические пары: сочетай флаги стран с их мультяшными купюрами!',
    screen: 'MemoryGame1Screen',
    isAvailable: true,
  },
  {
    id: 5,
    title: 'Ловля монеток',
    desc: 'Успей поймать как можно больше падающих монет за 30 секунд!',
    screen: 'MyNewGameScreen', 
    isAvailable: true,
  },
];


export default function MiniGamesScreen({ navigation }) {
  const bank = useBank();

  const handleLaunchGame = (game) => {
    if (!game.isAvailable) {
      Alert.alert('Скоро в игре!', 'Этот уровень находится в разработке.');
      return;
    }
    navigation.navigate(game.screen);
  };

  return (
    <View style={styles.container}>
      {/* Шапка экрана */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Мини-игры</Text>
        </View>

        <Text style={styles.scoreText}>🪙 {bank?.balance ? Math.floor(bank.balance) : 0}</Text>
      </View>

      {/* Список игр */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {GAMES_DATA.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[
              styles.card,
              game.isAvailable ? styles.activeCard : styles.lockedCard
            ]}
            onPress={() => handleLaunchGame(game)}
            activeOpacity={game.isAvailable ? 0.8 : 1}
          >
            <View style={styles.cardInfo}>
              <Text style={[
                styles.cardTitle,
                !game.isAvailable && styles.lockedText
              ]}>
                {game.isAvailable ? game.title : `🔒 ${game.title}`}
              </Text>
              <Text style={styles.cardSubtitle}>
                {game.isAvailable ? game.desc : 'Доступно в следующем обновлении'}
              </Text>
            </View>
            
            {game.isAvailable && <Text style={styles.arrow}>▶</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#365d69', 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 20,
    position: 'relative',
    height: 50
  },
  backButton: { 
    backgroundColor: '#5D4037', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 12,
    zIndex: 10
  },
  backButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  scoreText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFE082',
    zIndex: 10
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 14, 
    borderWidth: 2, 
    elevation: 3 
  },
  activeCard: { 
    backgroundColor: '#FFF', 
    borderColor: '#FFE082' 
  },
  lockedCard: { 
    backgroundColor: '#E2E8F0', 
    borderColor: '#CBD5E0', 
    opacity: 0.7 
  },
  cardInfo: { 
    flex: 1,
    alignItems: 'flex-start'
  },
  cardTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#5D4037' 
  },
  lockedText: { 
    color: '#718096' 
  },
  cardSubtitle: { 
    fontSize: 13, 
    color: '#718096', 
    marginTop: 4 
  },
  arrow: { 
    fontSize: 16, 
    color: '#5D4037', 
    marginLeft: 10 
  }
});
