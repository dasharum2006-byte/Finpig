//Экран загрузки
import React, { useState, useEffect,useRef} from 'react';
import { StyleSheet, Text, View, Image, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';

//Навигация
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
//Экраны
import CatalogScreen from './src/screens/CatalogScreen';
import WorldScreen from './src/screens/WorldScreen';
import PetNameScreen from './src/screens/PetNameScreen';
import HomeScreen from './src/screens/HomeScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import ChinaScreen from './src/screens/ChinaScreen'; 
import TownScreen from './src/screens/TownScreen'; 
import FoodShopScreen from './src/screens/FoodShopScreen';
import TasksScreen from './src/screens/TaskScreen';
import BlockOneScreen from './src/screens/BlockOneScreen';
import LevelOneScreen from './src/screens/LevelOneScreen';
import MyNewGameScreen from './src/screens/MyNewGameScreen';
import { colors } from './src/theme';
import BlockTwoScreen from './src/screens/BlockTwoScreen';
import LevelTwoScreen from './src/screens/LevelTwoScreen';
import BlockThreeScreen from './src/screens/BlockThreeScreen';
import LevelThreeScreen from './src/screens/LevelThreeScreen';
import MyNewGameScreen2 from './src/screens/MyNewGameScreen2';
const Stack = createNativeStackNavigator();

export default function App() {
  //ЭКРАН ЗАГРУЗКИ c процентами
  //счетчик процентов 
  const [percent, setPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  //анимация падающей монетки
  const coinAnim = useRef(new Animated.Value(0)).current;
  //когда пользователь врубает приложение монетка бесконечно падает
  useEffect(() => {
    Animated.loop(
      Animated.timing(coinAnim, {
        toValue: 1,
        duration: 1500,
        //физика падения
        easing: Easing.bezier(0.55, 0.055,0.675,0.19),
        useNativeDriver: false,
      })
      //зацикливаем падение
    ).start();

    //считаем проценты
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const coinTop = coinAnim.interpolate({
    inputRange: [0,0.7,1],

    outputRange: [-40,60,60],
  });

  const coinOpacity = coinAnim.interpolate({
    inputRange: [0,0.2,0.7,1],
    outputRange: [0,1,1,0],
  });

  //Пока загружается показываем экран
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style='dark' />

        <View style={styles.splashContent}>
          <Text style={styles.appTitle}>Финпиг</Text>

          <View style={styles.piggyBankContainer}>
            <Animated.View style={[styles.cssCoinLoading, {top: coinTop,opacity: coinOpacity}]}>

              <View style={styles.coinInner}>
                <Text style={styles.coinText}>1</Text>
              </View>
            </Animated.View>

            <Image
              source={require('./assets/piggy_bank.png')}
              style={styles.pig}
            />
          </View>

          <View style={styles.loadingSection}>
            <Text style={styles.loaderText}>Загрузка</Text>
            <View style={styles.loadingLineContainer}>
              <View style={[styles.loadingLine,{width: `${percent}%`}]} />
              <Text style={styles.loadingText}>{percent}%</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  //Страницы после загрузки
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen
            name="Catalog"
            component={CatalogScreen}
            options={{ title: 'Каталог' }}
          />


          <Stack.Screen
            name="PetName"
            component={PetNameScreen}
            options={{ title: 'Имя питомца' }}
          />
          <Stack.Screen
            name="Town"
            component={TownScreen}
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
      
            <Stack.Screen
            name="BlockOneScreen"
            component={BlockOneScreen}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="LevelOneScreen"
            component={LevelOneScreen}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="MyNewGameScreen"
            component={MyNewGameScreen}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="MyNewGameScreen2"
            component={MyNewGameScreen2}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="BlockTwoScreen"
            component={BlockTwoScreen}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="LevelTwoScreen"
            component={LevelTwoScreen}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="BlockThreeScreen"
            component={BlockThreeScreen}
            options={{headerShown: false}}
            />
            <Stack.Screen
            name="LevelThreeScreen"
            component={LevelThreeScreen}
            options={{headerShown: false}}
            />
            

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ headerShown: false }} 
          />

          <Stack.Screen
            name="FoodShop"
            component={FoodShopScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChinaScreen" 
            component={ChinaScreen} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen
            name="World"
            component={WorldScreen}
            options={{ headerShown: false }} 
          />

          <Stack.Screen
            name="Kitchen"
            component={KitchenScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_left', // ← кухня «въезжает слева»
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

//Стили загрузки экрана
const styles = StyleSheet.create({

  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    //добавила отступы снизу  и сверху
    // paddingTop: 80,
    // paddingBottom: 60,

  },
  splashContent: {
    //  вся высота
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#000',
    top: 90,
    position: 'absolute',
  },
  piggyBankContainer: {
    position: 'absolute',
    top: '33%',
    width: 220,
    height: 250, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  cssCoinLoading: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e69500', 
    borderWidth: 3,
    borderColor: '#ffd700',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  coinInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'black',
  },
  pig: {
    width: 380,
    height: 250,
    resizeMode: 'contain',
  },
  loadingSection: {
    alignItems: 'center',
    bottom: 80,
    position: 'absolute'
  },
  loaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  loadingLineContainer: {
    width: 260,
    height: 36,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLine: {
    height: '100%',
    backgroundColor: '#ffb6c1',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  loadingText: {
    color: '#000',
    fontSize: 19,
    fontWeight: 'bold',
    zIndex: 2,
  },
});