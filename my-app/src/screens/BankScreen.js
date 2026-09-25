import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useBank, CURRENCIES } from '../context/BankContext';

const { width } = Dimensions.get('window');

export default function BankScreen({ navigation }) {
  const bank = useBank();
  const [openSection, setOpenSection] = useState(null); // 'envelope' | 'deposit' | 'exchange' | 'loan' | null

  // При первом заходе — создать карту
  useEffect(() => {
    bank.createCard();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── КАРТА ─── */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardBankName}>🐷 Финпиг Банк</Text>
            <Text style={styles.cardEmoji}>💳</Text>
          </View>

          <Text style={styles.cardNumber}>
            {bank.cardNumber || '**** **** **** ****'}
          </Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardLabel}>БАЛАНС</Text>
              <Text style={styles.cardBalance}>{bank.balance.toFixed(2)} ₽</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>УРОВЕНЬ</Text>
              <Text style={styles.cardLevel}>{bank.level}</Text>
            </View>
          </View>
        </View>

        {/* ─── ВАЛЮТЫ ─── */}
        <View style={styles.walletsRow}>
          {CURRENCIES.map((c) => (
            <View key={c.id} style={styles.walletChip}>
              <Text style={styles.walletEmoji}>{c.emoji}</Text>
              <Text style={styles.walletAmount}>
                {(bank.wallets[c.id] || 0).toFixed(c.id === 'rub' ? 0 : 2)}
              </Text>
              <Text style={styles.walletCode}>{c.code}</Text>
            </View>
          ))}
        </View>

        {/* ─── КРЕДИТ (если есть) ─── */}
        {bank.loan && (
          <View style={styles.loanBanner}>
            <Text style={styles.loanBannerTitle}>⚠️ Активный кредит</Text>
            <Text style={styles.loanBannerText}>
              Взято: {bank.loan.amount} ₽ • К возврату: {bank.loan.totalToRepay} ₽
            </Text>
          </View>
        )}

        {/* ─── 4 СЕКЦИИ ─── */}
        <SectionButton
          emoji="✉️"
          title="Конверт (цель)"
          subtitle={bank.envelopes.length > 0
            ? `${bank.envelopes.length} шт. • ${bank.envelopes.reduce((s, e) => s + e.amount, 0).toFixed(0)} ₽`
            : 'Копи на мечту'}
          onPress={() => setOpenSection('envelope')}
        />

        <SectionButton
          emoji="💰"
          title="Накопительный счёт"
          subtitle={bank.deposit
            ? `${bank.deposit.amount.toFixed(0)} ₽ под ${bank.deposit.percent}%`
            : 'Создай и получай %'}
          onPress={() => setOpenSection('deposit')}
        />

        <SectionButton
          emoji="💱"
          title="Обмен валюты"
          subtitle="RUB ⇄ CNY ⇄ EGP ⇄ ANT"
          onPress={() => setOpenSection('exchange')}
        />

        <SectionButton
          emoji="🏦"
          title="Кредит"
          subtitle="3 дня (8%/день) • 7 дней (5%)"
          onPress={() => setOpenSection('loan')}
        />

        {/* ─── ЗАБЛОКИРОВАННЫЕ ─── */}
        <View style={styles.lockedRow}>
          <LockedButton emoji="🏠" title="Ипотека" />
          <LockedButton emoji="🔄" title="Обменник" />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── МОДАЛКИ ─── */}
      <EnvelopeModal
        visible={openSection === 'envelope'}
        onClose={() => setOpenSection(null)}
      />
      <DepositModal
        visible={openSection === 'deposit'}
        onClose={() => setOpenSection(null)}
      />
      <ExchangeModal
        visible={openSection === 'exchange'}
        onClose={() => setOpenSection(null)}
      />
      <LoanModal
        visible={openSection === 'loan'}
        onClose={() => setOpenSection(null)}
      />

      {/* ─── УВЕДОМЛЕНИЕ ─── */}
      {bank.notification && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{bank.notification}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Компоненты ───

function SectionButton({ emoji, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.section} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.sectionArrow}>▶</Text>
    </TouchableOpacity>
  );
}

function LockedButton({ emoji, title }) {
  return (
    <View style={styles.lockedButton}>
      <Text style={styles.lockedEmoji}>{emoji}</Text>
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedKey}>🔒</Text>
    </View>
  );
}

// ─── Модалка: Конверт ───
function EnvelopeModal({ visible, onClose }) {
  const bank = useBank();
  const [mode, setMode] = useState('list'); // 'list' | 'create'
  const [goal, setGoal] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedEnv, setSelectedEnv] = useState(null);

  const reset = () => {
    setMode('list');
    setGoal('');
    setAmount('');
    setSelectedEnv(null);
  };

  const handleCreate = () => {
    const amt = parseFloat(amount) || 0;
    if (!goal.trim()) {
      Alert.alert('Укажи цель', 'На что копим?');
      return;
    }
    const ok = bank.createEnvelope(goal.trim(), amt);
    if (!ok) Alert.alert('Ошибка', 'Недостаточно монет на карте');
    else reset();
  };

  const handleTransfer = (env) => {
    setSelectedEnv(env);
    setMode('transfer');
  };

  const confirmTransfer = () => {
    const amt = parseFloat(amount) || 0;
    const ok = bank.transferToEnvelope(selectedEnv.id, amt);
    if (!ok) Alert.alert('Ошибка', 'Недостаточно монет');
    else reset();
  };

  const confirmWithdraw = (env) => {
    Alert.prompt?.(
      'Снять с конверта',
      `Доступно: ${env.amount} ₽`,
      (text) => {
        const amt = parseFloat(text) || 0;
        const ok = bank.withdrawFromEnvelope(env.id, amt);
        if (!ok) Alert.alert('Ошибка', 'Неверная сумма');
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✉️ Конверты</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 400 }}>
            {mode === 'list' && (
              <>
                {bank.envelopes.length === 0 ? (
                  <Text style={styles.emptyText}>
                    У тебя пока нет конвертов.{'\n'}Создай первый — на что копишь?
                  </Text>
                ) : (
                  bank.envelopes.map((env) => (
                    <View key={env.id} style={styles.envCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.envGoal}>🎯 {env.goal}</Text>
                        <Text style={styles.envAccount}>№ {env.accountNumber}</Text>
                        <Text style={styles.envAmount}>{env.amount.toFixed(2)} ₽</Text>
                      </View>
                      <View style={{ gap: 6 }}>
                        <TouchableOpacity
                          style={styles.smallBtn}
                          onPress={() => handleTransfer(env)}
                        >
                          <Text style={styles.smallBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: '#bbb' }]}
                          onPress={() => confirmWithdraw(env)}
                        >
                          <Text style={styles.smallBtnText}>−</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setMode('create')}
                >
                  <Text style={styles.primaryBtnText}>+ Создать конверт</Text>
                </TouchableOpacity>
              </>
            )}

            {mode === 'create' && (
              <>
                <Text style={styles.inputLabel}>На что копим?</Text>
                <TextInput
                  style={styles.input}
                  value={goal}
                  onChangeText={setGoal}
                  placeholder="Например: на велосипед"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputLabel}>Сколько положить сразу? (можно 0)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
                  <Text style={styles.primaryBtnText}>Создать</Text>
                </TouchableOpacity>
              </>
            )}

            {mode === 'transfer' && selectedEnv && (
              <>
                <Text style={styles.inputLabel}>
                  Сколько перевести на «{selectedEnv.goal}»?
                </Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
                <Text style={styles.hintText}>Доступно: {bank.balance.toFixed(2)} ₽</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={confirmTransfer}>
                  <Text style={styles.primaryBtnText}>Перевести</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Модалка: Накопительный счёт ───
function DepositModal({ visible, onClose }) {
  const bank = useBank();
  const [mode, setMode] = useState('list');
  const [percent, setPercent] = useState(5);
  const [amount, setAmount] = useState('');

  const reset = () => {
    setMode('list');
    setAmount('');
    setPercent(5);
  };

  const handleCreate = () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      Alert.alert('Введи сумму');
      return;
    }
    const ok = bank.createDeposit(percent, amt);
    if (!ok) Alert.alert('Ошибка', 'Недостаточно монет');
    else reset();
  };

  const handleTopUp = () => {
    const amt = parseFloat(amount) || 0;
    const ok = bank.transferToDeposit(amt);
    if (!ok) Alert.alert('Ошибка', 'Недостаточно монет');
    else reset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💰 Накопительный счёт</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 400 }}>
            {!bank.deposit ? (
              <>
                <Text style={styles.inputLabel}>Выбери процент:</Text>
                <View style={styles.percentRow}>
                  {[5, 5.5].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.percentBtn, percent === p && styles.percentBtnActive]}
                      onPress={() => setPercent(p)}
                    >
                      <Text style={[styles.percentBtnText, percent === p && styles.percentBtnTextActive]}>
                        {p}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Сколько положить?</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
                  <Text style={styles.primaryBtnText}>Открыть счёт под {percent}%</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.envCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.envGoal}>🏦 Накопительный счёт</Text>
                    <Text style={styles.envAccount}>№ {bank.deposit.accountNumber}</Text>
                    <Text style={styles.envAmount}>{bank.deposit.amount.toFixed(2)} ₽</Text>
                    <Text style={styles.envPercent}>Под {bank.deposit.percent}% в день</Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Пополнить счёт</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleTopUp}>
                  <Text style={styles.primaryBtnText}>Перевести</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Модалка: Обмен валюты ───
function ExchangeModal({ visible, onClose }) {
  const bank = useBank();
  const [from, setFrom] = useState('rub');
  const [to, setTo] = useState('cny');
  const [amount, setAmount] = useState('');

  const doExchange = () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return Alert.alert('Введи сумму');
    const ok = bank.exchangeCurrency(from, to, amt);
    if (!ok) Alert.alert('Ошибка', 'Недостаточно средств');
    else {
      Alert.alert('Готово! ✅', 'Обмен выполнен');
      setAmount('');
    }
  };

  const fromRate = CURRENCIES.find((c) => c.id === from).rateToRub;
  const toRate = CURRENCIES.find((c) => c.id === to).rateToRub;
  const preview = amount
    ? ((parseFloat(amount) || 0) * fromRate / toRate).toFixed(2)
    : '0.00';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💱 Обмен валюты</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Из:</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.currencyBtn, from === c.id && styles.currencyBtnActive]}
                onPress={() => setFrom(c.id)}
              >
                <Text style={styles.currencyEmoji}>{c.emoji}</Text>
                <Text style={styles.currencyCode}>{c.code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>В:</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.currencyBtn, to === c.id && styles.currencyBtnActive]}
                onPress={() => setTo(c.id)}
              >
                <Text style={styles.currencyEmoji}>{c.emoji}</Text>
                <Text style={styles.currencyCode}>{c.code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Сколько:</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
          />

          <Text style={styles.hintText}>
            Получишь: {preview} {CURRENCIES.find((c) => c.id === to).code}
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={doExchange}>
            <Text style={styles.primaryBtnText}>Обменять</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Модалка: Кредит ───
function LoanModal({ visible, onClose }) {
  const bank = useBank();
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState(3);

  const take = () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return Alert.alert('Введи сумму');
    bank.takeLoan(amt, days);
    Alert.alert('Кредит выдан 💳', `Тебе начислено ${amt} ₽`);
    setAmount('');
  };

  const repay = () => {
    const ok = bank.repayLoan();
    if (!ok) Alert.alert('Ошибка', 'Недостаточно монет для погашения');
    else Alert.alert('Готово! ✅', 'Кредит погашен');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏦 Кредит</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {bank.loan ? (
            <>
              <View style={styles.envCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.envGoal}>⚠️ Ты должен банку</Text>
                  <Text style={styles.envAmount}>{bank.loan.totalToRepay.toFixed(2)} ₽</Text>
                  <Text style={styles.envAccount}>
                    Срок: {bank.loan.days} дн. • {bank.loan.percent}%
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={repay}>
                <Text style={styles.primaryBtnText}>Погасить</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Срок кредита:</Text>
              <View style={styles.percentRow}>
                <TouchableOpacity
                  style={[styles.percentBtn, days === 3 && styles.percentBtnActive]}
                  onPress={() => setDays(3)}
                >
                  <Text style={[styles.percentBtnText, days === 3 && styles.percentBtnTextActive]}>
                    3 дня (8%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.percentBtn, days === 7 && styles.percentBtnActive]}
                  onPress={() => setDays(7)}
                >
                  <Text style={[styles.percentBtnText, days === 7 && styles.percentBtnTextActive]}>
                    7 дней (5%)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Сумма:</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={take}>
                <Text style={styles.primaryBtnText}>Взять кредит</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  // Карта
  card: {
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBankName: { color: '#ecf0f1', fontSize: 15, fontWeight: '600' },
  cardEmoji: { fontSize: 26 },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 3,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 24,
  },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { color: '#95a5a6', fontSize: 10, letterSpacing: 1 },
  cardBalance: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardLevel: { color: '#f1c40f', fontSize: 20, fontWeight: '700' },

  // Валюты
  walletsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  walletChip: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletEmoji: { fontSize: 20 },
  walletAmount: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
  walletCode: { fontSize: 9, color: colors.textSecondary, letterSpacing: 1 },

  // Кредит-баннер
  loanBanner: {
    backgroundColor: '#ffe0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  loanBannerTitle: { fontWeight: '700', color: '#c0392b' },
  loanBannerText: { color: '#c0392b', marginTop: 4, fontSize: 13 },

  // Секции
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionEmoji: { fontSize: 30, marginRight: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  sectionArrow: { fontSize: 16, color: '#bbb' },

  // Заблокированные
  lockedRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  lockedButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  lockedEmoji: { fontSize: 26 },
  lockedTitle: { fontSize: 12, color: '#666', marginTop: 4 },
  lockedKey: { position: 'absolute', top: 8, right: 8, fontSize: 14 },

  // Кнопка назад
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Тост
  toast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: { color: '#fff', fontWeight: '700', textAlign: 'center' },

  // Модалки
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalClose: { fontSize: 22, color: '#999', paddingHorizontal: 8 },

  inputLabel: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyText: { textAlign: 'center', color: colors.textSecondary, padding: 20, fontStyle: 'italic' },

  envCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  envGoal: { fontSize: 15, fontWeight: '700', color: colors.text },
  envAccount: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'monospace' },
  envAmount: { fontSize: 18, fontWeight: '700', color: colors.accent, marginTop: 4 },
  envPercent: { fontSize: 12, color: '#27ae60', fontWeight: '600', marginTop: 2 },

  smallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },

  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  percentRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  percentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  percentBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  percentBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  percentBtnTextActive: { color: '#fff' },

  hintText: { fontSize: 12, color: colors.textSecondary, marginTop: 6, fontStyle: 'italic' },

  currencyRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  currencyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    minWidth: 70,
  },
  currencyBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  currencyEmoji: { fontSize: 18 },
  currencyCode: { fontSize: 10, fontWeight: '700', color: colors.text, marginTop: 2 },
});