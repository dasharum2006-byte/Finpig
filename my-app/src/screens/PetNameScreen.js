import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const PADDING = 16;

export default function PetNameScreen({ route, navigation }) {
  const { item } = route.params; // ← выбранная картинка с прошлого экрана
  const [petName, setPetName] = useState('');

  const isReady = petName.trim().length > 0;

  const handleConfirm = () => {
  navigation.navigate('Home', { item, petName });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Картинка выбранного предмета */}
          <View style={styles.imageWrapper}>
            <Image source={item.source} style={styles.image} resizeMode="contain" />
          </View>

          {/* Поле ввода */}
          <Text style={styles.label}>Введите имя питомца</Text>
          <TextInput
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
            placeholder="Например: Барсик"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
        </View>

        {/* Кнопка внизу */}
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={!isReady}
            onPress={handleConfirm}
            style={[styles.button, !isReady && styles.buttonDisabled]}
          >
            <Text style={[styles.buttonText, !isReady && styles.buttonTextDisabled]}>
              Подтвердить
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING,
    paddingTop: 20,
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBg,
  },
  footer: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.disabledText,
  },
});