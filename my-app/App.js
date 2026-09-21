import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CatalogScreen from './src/screens/CatalogScreen';
import PetNameScreen from './src/screens/PetNameScreen';
import HomeScreen from './src/screens/HomeScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
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
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
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