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
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: PADDING, paddingTop: 20, paddingBottom: 20 },

  eggWrapper: { alignItems: 'center', marginBottom: 20 },
  eggImage: { width: width * 0.5, height: width * 0.5 },

  label: { fontSize: 16, color: colors.text, fontWeight: '600', marginBottom: 10 },
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
    borderColor: 'transparent',
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  variationCardSelected: { borderColor: colors.accent },
  variationImage: { width: '80%', height: '80%' },
  variationLabel: {
    position: 'absolute',
    bottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  footer: {
    paddingHorizontal: PADDING,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: { backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  buttonTextDisabled: { color: colors.disabledText },
});