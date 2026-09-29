//Экран загрузки
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated, Easing, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';

//Навигация
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Контексты
import { BankProvider } from './src/context/BankContext';
import { PetProvider, usePet } from './src/context/PetContext';
import { BudgetPlanProvider } from './src/context/BudgetPlanContext';
import { DemoProvider } from './src/context/DemoContext';
import { MusicProvider } from './src/context/MusicContext';
// Экраны
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
import BlockTwoScreen from './src/screens/BlockTwoScreen';
import LevelTwoScreen from './src/screens/LevelTwoScreen';
import BlockThreeScreen from './src/screens/BlockThreeScreen';
import LevelThreeScreen from './src/screens/LevelThreeScreen';
import MyNewGameScreen2 from './src/screens/MyNewGameScreen2';
import BankScreen from './src/screens/BankScreen';
import EgyptScreen from './src/screens/EgyptScreen';
import EgyptMarketScreen from './src/screens/EgyptMarketScreen';
import EgyptBankScreen from './src/screens/EgyptBankScreen';
import ArcticScreen from './src/screens/ArcticScreen';
import ArcticBankScreen from './src/screens/ArcticBankScreen';
import ArcticMarketScreen from './src/screens/ArcticMarketScreen';
import LevelFourScreen from './src/screens/LevelFourScreen';
import BlockFourScreen from './src/screens/BlockFourScreen';
import LivingRoomScreen from './src/screens/LivingRoomScreen'; 
import { colors } from './src/theme';
import MiniGamesScreen from './src/screens/MiniGamesScreen';
import GamePriceGuesser from './src/screens/GamePriceGuesser';
import IncomeExpenseGameScreen from './src/screens/IncomeExpenseGameScreen';
import MemoryGame1Screen from './src/screens/MemoryGame1Screen';
import ScamGameScreen from './src/screens/ScamGameScreen';
import BudgetPlanScreen from './src/screens/BudgetPlanScreen';
import ToyShopScreen from './src/screens/ToyShopScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import ParentGateScreen from './src/screens/ParentGateScreen';
import ParentScreen from './src/screens/ParentScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BudgetResultScreen from './src/screens/BudgetResultScreen';
import NewBudgetPlanScreen from './src/screens/NewBudgetPlanScreen';
import GlossaryScreen from './src/screens/GlossaryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PurchasedItemsScreen from './src/screens/PurchasedItemsScreen';

const Stack = createNativeStackNavigator();

// Единая тема навигации: нежно-голубой · синий · белый
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.white,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
    notification: colors.primary,
  },
};


    function RootNavigator() {
  const petCtx = usePet();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    if (petCtx.isLoaded) {
      setInitialRoute(petCtx.pet ? 'Home' : 'Catalog');
    }
  }, [petCtx.isLoaded, petCtx.pet]);

  if (!petCtx.isLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
        <ActivityIndicator size="large" color="#42A5F5" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
              {/* ─── ГЛАВНЫЕ ─── */}
              <Stack.Screen
                name="Catalog"
                component={CatalogScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PetName"
                component={PetNameScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ headerShown: false }}
            />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="BudgetPlanScreen"
                component={BudgetPlanScreen}
                options={{ headerShown: false}}
              />
              <Stack.Screen
                name="Kitchen"
                component={KitchenScreen}
                options={{ headerShown: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="GoalsScreen"
                component={GoalsScreen}
                options={{ headerShown: false}}
              />
              <Stack.Screen 
              name="BudgetResult" 
              component={BudgetResultScreen} 
              options={{ headerShown: false }} 
              />
              <Stack.Screen 
              name="NewBudgetPlan" 
              component={NewBudgetPlanScreen} 
              options={{ headerShown: false }} 
              />
              <Stack.Screen name="LivingRoomScreen" 
              component={LivingRoomScreen} 
              options={{ headerShown: false , animation:'fade'} }/>
            
               <Stack.Screen name="MiniGamesScreen" 
              component={MiniGamesScreen} 
              options={{ headerShown: false }} />

              <Stack.Screen name="ScamGameScreen" 
              component={ScamGameScreen} 
              options={{ headerShown: false }} />
              <Stack.Screen
                name="ParentGateScreen"
                component={ParentGateScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Parent"
                component={ParentScreen}
                options={{ headerShown: false }}
              />
              {/* ─── ГОРОД ─── */}
              <Stack.Screen
                name="Town"
                component={TownScreen}
                options={{ headerShown: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="FoodShop"
                component={FoodShopScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Bank"
                component={BankScreen}
                options={{ title: '🏦 Банк' }}
              />
              <Stack.Screen
                name="ToyShopScreen"
                component={ToyShopScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
              name="PurchasedItems"
              component={PurchasedItemsScreen}
              options={{ headerShown: false }}
            />

              {/* ─── МИР ─── */}
              <Stack.Screen
                name="World"
                component={WorldScreen}
                options={{ headerShown: false }}
              />

              {/* ─── ЗАДАНИЯ ─── */}
              <Stack.Screen
                name="Tasks"
                component={TasksScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
              name="Glossary"
              component={GlossaryScreen}
              options={{ headerShown: false }}
            />
              <Stack.Screen
                name="BlockOneScreen"
                component={BlockOneScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LevelOneScreen"
                component={LevelOneScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MyNewGameScreen"
                component={MyNewGameScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MyNewGameScreen2"
                component={MyNewGameScreen2}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="GamePriceGuesser" 
              component={GamePriceGuesser} 
              options={{ headerShown: false }} />
              <Stack.Screen name="MemoryGame1Screen" 
              component={MemoryGame1Screen} 
              options={{ headerShown: false }} />
              <Stack.Screen name="IncomeExpenseGameScreen" 
              component={IncomeExpenseGameScreen} 
              options={{ headerShown: false }} />
              <Stack.Screen
                name="BlockTwoScreen"
                component={BlockTwoScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LevelTwoScreen"
                component={LevelTwoScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="BlockThreeScreen"
                component={BlockThreeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LevelThreeScreen"
                component={LevelThreeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="BlockFourScreen"
                component={BlockFourScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LevelFourScreen"
                component={LevelFourScreen}
                options={{ headerShown: false }}
              />

              {/* ─── КИТАЙ ─── */}
              <Stack.Screen
                name="ChinaScreen"
                component={ChinaScreen}
                options={{ headerShown: false }}
              />

              {/* ─── ЕГИПЕТ ─── */}
              <Stack.Screen
                name="EgyptScreen"
                component={EgyptScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EgyptMarketScreen"
                component={EgyptMarketScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EgyptBankScreen"
                component={EgyptBankScreen}
                options={{ headerShown: false }}
              />

              {/* ─── АРКТИКА ─── */}
              <Stack.Screen
                name="ArcticScreen"
                component={ArcticScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ArcticBankScreen"
                component={ArcticBankScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
              <Stack.Screen
                name="ArcticMarketScreen"
                component={ArcticMarketScreen}
                options={{ headerShown: false }}
              />
              </Stack.Navigator>
  );
}

export default function App() {
  const [percent, setPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  const interval = setInterval(() => {
    setPercent((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 300);
        return 100;
      }
      return prev + 1;
    });
  }, 25);
  return () => clearInterval(interval);
}, []);


  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="dark" />
        <View style={styles.splashContent}>
          <Text style={styles.appTitle}>Финпиг</Text>
          <View style={styles.piggyBankContainer}>
            {/* <Animated.View
              style={[styles.cssCoinLoading, { top: coinTop, opacity: coinOpacity }]}
            >
              <View style={styles.coinInner}>
                <Text style={styles.coinText}>1</Text>
              </View>
            </Animated.View> */}
            <Image source={require('./assets/piggy_bank.png')} style={styles.pig} />
          </View>
          <View style={styles.loadingSection}>
            <Text style={styles.loaderText}>Загрузка</Text>
            <View style={styles.loadingLineContainer}>
              <View style={[styles.loadingLine, { width: `${percent}%` }]} />
              <Text style={styles.loadingText}>{percent}%</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

 return (
    <MusicProvider>
      <BankProvider>
        <PetProvider>
          <BudgetPlanProvider>
            <DemoProvider>
              <SafeAreaProvider>
                <NavigationContainer theme={navTheme}>
                  <RootNavigator />
                </NavigationContainer>
              </SafeAreaProvider>
            </DemoProvider>
          </BudgetPlanProvider>
        </PetProvider>
      </BankProvider>
    </MusicProvider>
  );
}
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.text,
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
    fontSize: 17,
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
    position: 'absolute',
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