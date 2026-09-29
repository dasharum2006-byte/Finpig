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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { PETS_BY_EGG } from '../petsConfig';

const { width } = Dimensions.get('window');
const PADDING = 16;

export default function PetNameScreen({ route, navigation }) {
  const { speciesId } = route.params;
  const species = PETS_BY_EGG[speciesId];

  const [petName, setPetName] = useState('');
  const [variationId, setVariationId] = useState(null);

  const isReady = petName.trim().length > 0 && variationId !== null;

  const handleConfirm = () => {
    navigation.navigate('Home', {
      pet: {
        speciesId,
        variationId,
        name: petName.trim(),
      },
    });
  };

  if (!species) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Ошибка: вид {speciesId} не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const variations = Object.entries(species.variations).map(([id, v]) => ({
    id,
    ...v,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Яйцо сверху */}
          <View style={styles.eggWrapper}>
            <Image source={species.egg} style={styles.eggImage} resizeMode="contain" />
          </View>

          {/* Имя */}
          <Text style={styles.label}>Введите имя питомца</Text>
          <TextInput
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
            placeholder="Например: Барсик"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Выбор вариации */}
          <Text style={[styles.label, { marginTop: 20 }]}>Выбери окрас</Text>
          <View style={styles.variationsRow}>
            {variations.map((v) => {
              const isSelected = v.id === variationId;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.variationCard,
                    isSelected && styles.variationCardSelected,
                  ]}
                  onPress={() => setVariationId(v.id)}
                  activeOpacity={0.8}
                >
                  <Image source={v.preview} style={styles.variationImage} resizeMode="contain" />
                  <Text style={styles.variationLabel}>{v.label}</Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

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
  container: { flex: 1, backgroundColor: '#E3F2FD' },               // ← светло-голубой
  flex: { flex: 1 },
  content: { paddingHorizontal: PADDING, paddingTop: 20, paddingBottom: 20 },

  // ─── Яйцо сверху ───
  eggWrapper: { alignItems: 'center', marginBottom: 20 },
  eggImage: { width: width * 0.5, height: width * 0.5 },

  // ─── Лейблы ───
  label: {
    fontSize: 18,
    color: '#0D47A1',                                                // ← тёмно-голубой
    fontWeight: '800',
    marginBottom: 10,
  },

  // ─── Поле ввода ───
  input: {
    borderWidth: 2,
    borderColor: '#90CAF9',                                          // ← голубая обводка
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#0D47A1',                                                // ← тёмно-голубой текст
    backgroundColor: '#FFFFFF',                                      // ← белый фон
    minHeight: 56,
  },

  // ─── Карточки окрасов ───
  variationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  variationCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#90CAF9',                                          // ← голубая обводка
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  variationCardSelected: {
    borderColor: '#1976D2',                                          // ← тёмно-голубая обводка
    backgroundColor: '#E3F2FD',                                      // ← светло-голубой фон
    borderWidth: 4,
  },
  variationImage: { width: '80%', height: '80%' },
  variationLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#0D47A1',                                                // ← тёмно-голубой
  },

  // ─── Бейдж-галочка ───
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1976D2',                                      // ← тёмно-голубой
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // ─── Footer с кнопкой ───
  footer: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',                                       // ← голубая граница
    backgroundColor: '#E3F2FD',                                      // ← тот же фон
  },
  button: {
    backgroundColor: '#42A5F5',                                      // ← голубая кнопка
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#BBDEFB',                                      // ← светло-голубая
    shadowOpacity: 0,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  buttonTextDisabled: { color: '#E3F2FD' },
});