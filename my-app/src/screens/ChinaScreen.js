import React, {useState} from 'react';
import {View,Text,StyleSheet,ImageBackground,Image,TouchableOpacity,Dimensions} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
const {width} = Dimensions.get('window');

export default function ChinaScreen({route, navigation}) {
    //Получаем параметр из навигации.Если зашли не через карту, по умолчанию false
    const { isFirstVisit } = route.params || {};
    const [showCookie, setShowCookie] = useState(isFirstVisit);
    const [fortuneText, setFortuneText] = useState('Нажми на печеньку,чтобы узнать предсказание');
    const [isBroken, setIsBroken] = useState(false);

    const fortunes = [
    '🎯 Тебя ждёт большое приключение',
    '🐼 Сегодня отличный день, чтобы съесть тортик',
    '✨ Твой питомец станет ещё сильнее и умнее',
    '🧧 Удача уже летит к тебе на крыльях дракона',
    '🌟 Маленькие шаги ведут к большим вершинам',
    ];
    //случайное предсказание
    const breakCookie = () => {
        if (isBroken) return; // Если уже сломали, второй раз нажать нельзя
        const randomIndex = Math.floor(Math.random()*fortunes.length);
        setFortuneText(fortunes[randomIndex]);
     setIsBroken(true);
    //Спустя 4 секунды после прочтения предсказания, печенье плавно исчезнет навсегда для этого захода
    setTimeout(() => {
      setShowCookie(false);
      //Сбрасываем параметр в навигации, чтобы при повторном открытии экрана печенье больше не рендерилось
      navigation.setParams({ isFirstVisit: false });
        }, 4000);
    };

    return (
        <SafeAreaView style={styles.container} edges={(['bottom'])}>
            <ImageBackground source={require('../../assets/China.jpg')} style={styles.bg} resizeMode='cover'>
        <Text style={styles.title}>Китай</Text>
        <Image source={require('../../assets/Animals/pinguin/black/pinguin1.png')} style={styles.petImage}/>


        {/* Кнопка "Назад на карту" в левом верхнем углу */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>◀ Карта</Text>
        </TouchableOpacity>

        {/* китайское печенье с предсказанием */}
        {showCookie ? (
        <View style={styles.interactiveCard}>
          <Text style={styles.fortuneTitle}>Печенье с предсказанием</Text>
          <Text style={styles.fortuneText}>{fortuneText}</Text>

        {!isBroken && (
          <TouchableOpacity style={styles.actionButton} onPress={breakCookie}>
            <Text style={styles.actionButtonText}>Открыть печеньку</Text>
          </TouchableOpacity>
        )}
        </View>
         ) : null}
        </ImageBackground>
    </SafeAreaView>
    ); 
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 60,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ff4d4db0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  petImage: {
    position: 'absolute',
    width: 210,
    height: 210,
    resizeMode: 'contain',
    marginTop: 390,
    zIndex: 5,
  },
  interactiveCard: {
    width: width * 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4d4d', // Красная китайская рамка
    marginBottom: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fortuneTitle: { fontSize: 18, fontWeight: 'bold', color: '#cc0000', marginBottom: 1 },
  fortuneText: { fontSize: 15, color: '#333', textAlign: 'center', marginVertical: 2, minHeight: 30 },
  actionButton: {
    backgroundColor: '#cc0000',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});