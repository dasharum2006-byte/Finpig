import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView,ImageBackground} from 'react-native';

const {width} = Dimensions.get('window');

//6 уровней
const TASKS_DATA = [
    {id:1,title: 'Уровень 1'},
    {id:2,title: 'Уровень 2'},
    {id:3,title: 'Уровень 3'},
    {id:4,title: 'Уровень 4'},
    {id:5,title: 'Уровень 5'},
    {id:6,title: 'Уровень 6'},
];

export default function TasksScreen({ navigation }) {
const handleSelectTask = (levelId) => {
  if (levelId === 1) {
    // Переходим на слой первого уровня
    navigation.navigate('LevelOne');
  } else {
    alert(`Уровень ${levelId} пока закрыт. Пройди первый уровень! 🔒`);
  }
};


  return (
    <View style={styles.container}>
      {/* ШАПКА*/}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.cityBackButton} 
          activeOpacity={0.7} 
          onPress={() => navigation.goBack()} //Назад 
        >
          <Text style={styles.cityBackText}>Назад</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageTitle}>Задания</Text>
        <View style={{ width: 90 }} /> {/* Пустышка для центровки заголовка */}
      </View>
      <ScrollView 
        style={styles.tasksList} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TASKS_DATA.map((task) => (
          <TouchableOpacity 
            key={task.id} 
            style={styles.taskCard} 
            activeOpacity={0.8}
            onPress={() => handleSelectTask(task.id)}
          >
            {/*Номер уровня */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{task.id}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.arrowIcon}>▶</Text>
            </View>
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
    paddingTop: 50,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width * 0.9,
    marginBottom: 20,
  },
  cityBackButton: {
    backgroundColor: '#5D4037',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#8D6E63',
  },
  cityBackEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  cityBackText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE082', 
    textAlign: 'center',
  },
  tasksList: {
    width: width * 0.9,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', 
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFE082',
    // Тень
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  levelBadge: {
    backgroundColor: '#E65100',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  levelBadgeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  taskDescription: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#8D6E63',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});