import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankContext = createContext(null);

const STORAGE_KEY = '@bank_state_v1';

// ── Курсы валют (из PDF) ──
// 2 русских = 1 юань  → 1 юань = 2 ₽
// 1 русский = 4 египетских → 1 ег = 0.25 ₽
// 5 русских = 1 антарктическая → 1 ан = 5 ₽
export const CURRENCIES = [
  { id: 'rub',  code: 'RUB', name: 'Русские',      emoji: '🪙', rateToRub: 1 },
  { id: 'cny',  code: 'CNY', name: 'Юани',         emoji: '🀄', rateToRub: 2 },
  { id: 'egp',  code: 'EGP', name: 'Египетские',   emoji: '🏺', rateToRub: 0.25 },
  { id: 'ant',  code: 'ANT', name: 'Антарктические', emoji: '🐧', rateToRub: 5 },
];

// Генерация номера карты вида 1234 5678 9012 3456
const generateCardNumber = () => {
  return Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  ).join(' ');
};

// Генерация номера счёта для конверта
const generateAccountNumber = () => {
  return '40817' + Math.floor(1000000000 + Math.random() * 8999999999);
};

export function BankProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [balance, setBalance] = useState(0);              // ₽ монеты на карте
  const [cardNumber, setCardNumber] = useState(null);
  const [level, setLevel] = useState(1);

  // Конверты — [{ id, accountNumber, goal, amount }]
  const [envelopes, setEnvelopes] = useState([]);

  // Накопительный счёт — { accountNumber, percent, amount, lastAccrual }
  const [deposit, setDeposit] = useState(null);

  // Кредит — { amount, takenAt, days, percent, totalToRepay } | null
  const [loan, setLoan] = useState(null);

  // Мультивалютные кошельки — { rub, cny, egp, ant }
  const [wallets, setWallets] = useState({ rub: 0, cny: 0, egp: 0, ant: 0 });

  // Время последнего бонуса +30
  const [lastDailyBonus, setLastDailyBonus] = useState(null);

  // Уведомление для показа
  const [notification, setNotification] = useState(null);

  // ─── Загрузка ───
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setBalance(s.balance ?? 0);
          setCardNumber(s.cardNumber ?? null);
          setLevel(s.level ?? 1);
          setEnvelopes(s.envelopes ?? []);
          setDeposit(s.deposit ?? null);
          setLoan(s.loan ?? null);
          setWallets(s.wallets ?? { rub: 0, cny: 0, egp: 0, ant: 0 });
          setLastDailyBonus(s.lastDailyBonus ?? null);
        }
      } catch (e) {
        console.error('Bank load error:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // ─── Сохранение ───
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        balance, cardNumber, level, envelopes, deposit, loan, wallets, lastDailyBonus,
      })
    ).catch((e) => console.error('Bank save error:', e));
  }, [isLoaded, balance, cardNumber, level, envelopes, deposit, loan, wallets, lastDailyBonus]);

  // ─── Создание карты (при первом заходе в банк) ───
  const createCard = useCallback(() => {
    if (!cardNumber) {
      setCardNumber(generateCardNumber());
      setBalance((b) => b + 100); // бонус за открытие карты
      setWallets((w) => ({ ...w, rub: w.rub + 100 }));
    }
  }, [cardNumber]);

  // ─── Ежедневный бонус +30 ₽ ───
  useEffect(() => {
    if (!isLoaded || !cardNumber) return;
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    if (!lastDailyBonus || now - lastDailyBonus >= DAY) {
      setBalance((b) => b + 30);
      setWallets((w) => ({ ...w, rub: w.rub + 30 }));
      setLastDailyBonus(now);
      setNotification('🪙 Вам +30 монет за ежедневный вход!');
      setTimeout(() => setNotification(null), 4000);
    }
  }, [isLoaded, cardNumber, lastDailyBonus]);

  // ─── Начисление % по накопительному счёту ───
  useEffect(() => {
    if (!isLoaded || !deposit) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const DAY = 24 * 60 * 60 * 1000;
      if (now - (deposit.lastAccrual || 0) >= DAY) {
        const bonus = +(deposit.amount * deposit.percent / 100).toFixed(2);
        setDeposit((d) => ({ ...d, amount: d.amount + bonus, lastAccrual: now }));
        setNotification(`💰 Начислено +${bonus} ₽ на накопительный счёт`);
        setTimeout(() => setNotification(null), 4000);
      }
    }, 60 * 1000); // проверяем раз в минуту
    return () => clearInterval(interval);
  }, [isLoaded, deposit]);

  // ─── Создание конверта ───
  const createEnvelope = useCallback((goal, initialAmount = 0) => {
    if (initialAmount > balance) return false;
    const env = {
      id: Date.now().toString(),
      accountNumber: generateAccountNumber(),
      goal: goal || 'Без цели',
      amount: initialAmount,
      createdAt: Date.now(),
    };
    setEnvelopes((prev) => [...prev, env]);
    if (initialAmount > 0) setBalance((b) => b - initialAmount);
    return true;
  }, [balance]);

  // ─── Перевод на конверт ───
  const transferToEnvelope = useCallback((envId, amount) => {
    if (amount <= 0 || amount > balance) return false;
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === envId ? { ...e, amount: e.amount + amount } : e))
    );
    setBalance((b) => b - amount);
    return true;
  }, [balance]);

  // ─── Снять с конверта ───
  const withdrawFromEnvelope = useCallback((envId, amount) => {
    const env = envelopes.find((e) => e.id === envId);
    if (!env || amount <= 0 || amount > env.amount) return false;
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === envId ? { ...e, amount: e.amount - amount } : e))
    );
    setBalance((b) => b + amount);
    return true;
  }, [envelopes]);

  // ─── Создать накопительный счёт ───
  const createDeposit = useCallback((percent, initialAmount) => {
    if (initialAmount > balance) return false;
    const dep = {
      accountNumber: generateAccountNumber(),
      percent,
      amount: initialAmount,
      lastAccrual: Date.now(),
    };
    setDeposit(dep);
    setBalance((b) => b - initialAmount);
    return true;
  }, [balance]);

  // ─── Перевод на накопительный ───
  const transferToDeposit = useCallback((amount) => {
    if (!deposit || amount <= 0 || amount > balance) return false;
    setDeposit((d) => ({ ...d, amount: d.amount + amount }));
    setBalance((b) => b - amount);
    return true;
  }, [deposit, balance]);

  // ─── Снять с накопительного ───
  const withdrawFromDeposit = useCallback((amount) => {
    if (!deposit || amount <= 0 || amount > deposit.amount) return false;
    setDeposit((d) => ({ ...d, amount: d.amount - amount }));
    setBalance((b) => b + amount);
    return true;
  }, [deposit]);

  // ─── Взять кредит ───
  const takeLoan = useCallback((amount, days) => {
    const percent = days === 3 ? 8 : 5; // 8% в день на 3 дня, 5% в неделю на 7 дней
    const totalToRepay = days === 3
      ? +(amount * (1 + percent / 100 * days)).toFixed(2)
      : +(amount * (1 + percent / 100)).toFixed(2);
    setLoan({ amount, days, percent, takenAt: Date.now(), totalToRepay });
    setBalance((b) => b + amount);
    return true;
  }, []);

  // ─── Погасить кредит ───
  const repayLoan = useCallback(() => {
    if (!loan) return false;
    if (balance < loan.totalToRepay) return false;
    setBalance((b) => b - loan.totalToRepay);
    setLoan(null);
    return true;
  }, [loan, balance]);

  // ─── Обмен валюты ───
  const exchangeCurrency = useCallback((fromId, toId, amount) => {
    if (amount <= 0) return false;
    if ((wallets[fromId] || 0) < amount) return false;
    const fromRate = CURRENCIES.find((c) => c.id === fromId).rateToRub;
    const toRate = CURRENCIES.find((c) => c.id === toId).rateToRub;
    const inRub = amount * fromRate;
    const result = +(inRub / toRate).toFixed(2);
    setWallets((w) => ({
      ...w,
      [fromId]: (w[fromId] || 0) - amount,
      [toId]: (w[toId] || 0) + result,
    }));
    // Если меняем рубли — синхронизируем balance
    if (fromId === 'rub') setBalance((b) => b - amount);
    if (toId === 'rub') setBalance((b) => b + result);
    return true;
  }, [wallets]);

  // ─── Добавить монеты (для заданий) ───
  const addCoins = useCallback((amount) => {
    setBalance((b) => b + amount);
    setWallets((w) => ({ ...w, rub: w.rub + amount }));
  }, []);

  const value = {
    isLoaded,
    balance, setBalance,
    cardNumber, createCard,
    level, setLevel,
    envelopes, createEnvelope, transferToEnvelope, withdrawFromEnvelope,
    deposit, createDeposit, transferToDeposit, withdrawFromDeposit,
    loan, takeLoan, repayLoan,
    wallets, exchangeCurrency,
    notification, setNotification,
    addCoins,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used inside BankProvider');
  return ctx;
}