import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankContext = createContext(null);

const STORAGE_KEY = '@bank_state_v1';

export const CURRENCIES = [
  { id: 'rub',  code: 'RUB', name: 'Русские',      emoji: '🪙', rateToRub: 1 },
  { id: 'cny',  code: 'CNY', name: 'Юани',         emoji: '🀄', rateToRub: 2 },
  { id: 'egp',  code: 'EGP', name: 'Египетские',   emoji: '🏺', rateToRub: 0.25 },
  { id: 'ant',  code: 'ANT', name: 'Антарктические', emoji: '🐧', rateToRub: 5 },
];

const generateCardNumber = () => {
  return Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  ).join(' ');
};

const generateAccountNumber = () => {
  return '40817' + Math.floor(1000000000 + Math.random() * 8999999999);
};

export function BankProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [balance, setBalance] = useState(0);
  const [cardNumber, setCardNumber] = useState(null);
  const [level, setLevel] = useState(1); // ← старт с 0

  const [envelopes, setEnvelopes] = useState([]);
  const [deposit, setDeposit] = useState(null);
  const [loan, setLoan] = useState(null);
  const [wallets, setWallets] = useState({ rub: 0, cny: 0, egp: 0, ant: 0 });

  const [lastDailyBonus, setLastDailyBonus] = useState(null);
  const [notification, setNotification] = useState(null);

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

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        balance, cardNumber, level, envelopes, deposit, loan, wallets, lastDailyBonus,
      })
    ).catch((e) => console.error('Bank save error:', e));
  }, [isLoaded, balance, cardNumber, level, envelopes, deposit, loan, wallets, lastDailyBonus]);

  const createCard = useCallback(() => {
    if (!cardNumber) {
      setCardNumber(generateCardNumber());
    }
  }, [cardNumber]);

  // ─── Простое повышение уровня вручную (для кнопки +1) ───
  const levelUp = useCallback(() => {
    setLevel((prev) => Math.min(4, prev + 1));
  }, []);

  // Автоматический пересчёт уровня (можно использовать где угодно)
  const checkLevelUp = useCallback(async () => {
    try {
      const b1 = await AsyncStorage.getItem('@block_one_progress_v1');
      const blockOneDone = (b1 ? parseInt(b1, 10) : 0) >= 6;

      let newLevel = 0;
      if (blockOneDone) newLevel = 1;

      setLevel((prev) => (newLevel > prev ? newLevel : prev));
    } catch (e) {
      console.error('Level check error:', e);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    checkLevelUp();
  }, [isLoaded]);

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
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, deposit]);

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

  const transferToEnvelope = useCallback((envId, amount) => {
    if (amount <= 0 || amount > balance) return false;
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === envId ? { ...e, amount: e.amount + amount } : e))
    );
    setBalance((b) => b - amount);
    return true;
  }, [balance]);

  const withdrawFromEnvelope = useCallback((envId, amount) => {
    const env = envelopes.find((e) => e.id === envId);
    if (!env || amount <= 0 || amount > env.amount) return false;
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === envId ? { ...e, amount: e.amount - amount } : e))
    );
    setBalance((b) => b + amount);
    return true;
  }, [envelopes]);

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

  const transferToDeposit = useCallback((amount) => {
    if (!deposit || amount <= 0 || amount > balance) return false;
    setDeposit((d) => ({ ...d, amount: d.amount + amount }));
    setBalance((b) => b - amount);
    return true;
  }, [deposit, balance]);

  const withdrawFromDeposit = useCallback((amount) => {
    if (!deposit || amount <= 0 || amount > deposit.amount) return false;
    setDeposit((d) => ({ ...d, amount: d.amount - amount }));
    setBalance((b) => b + amount);
    return true;
  }, [deposit]);

  const takeLoan = useCallback((amount, days) => {
    const percent = days === 3 ? 8 : 5;
    const totalToRepay = days === 3
      ? +(amount * (1 + percent / 100 * days)).toFixed(2)
      : +(amount * (1 + percent / 100)).toFixed(2);
    setLoan({ amount, days, percent, takenAt: Date.now(), totalToRepay });
    setBalance((b) => b + amount);
    return true;
  }, []);

  const repayLoan = useCallback(() => {
    if (!loan) return false;
    if (balance < loan.totalToRepay) return false;
    setBalance((b) => b - loan.totalToRepay);
    setLoan(null);
    return true;
  }, [loan, balance]);

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
    if (fromId === 'rub') setBalance((b) => b - amount);
    if (toId === 'rub') setBalance((b) => b + result);
    return true;
  }, [wallets]);

  const addCoins = useCallback((amount) => {
    setBalance((b) => b + amount);
    setWallets((w) => ({ ...w, rub: w.rub + amount }));
  }, []);

  const resetBank = useCallback(() => {
    setBalance(0);
    setCardNumber(null);
    setLevel(1);
    setEnvelopes([]);
    setDeposit(null);
    setLoan(null);
    setWallets({ rub: 0, cny: 0, egp: 0, ant: 0 });
    setLastDailyBonus(null);
    setNotification(null);
  }, []);

  const value = {
    isLoaded,
    balance, setBalance,
    cardNumber, createCard,
    level, setLevel, levelUp, checkLevelUp,
    envelopes, createEnvelope, transferToEnvelope, withdrawFromEnvelope,
    deposit, createDeposit, transferToDeposit, withdrawFromDeposit,
    loan, takeLoan, repayLoan,
    wallets, exchangeCurrency,
    notification, setNotification,
    addCoins,
    resetBank,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used inside BankProvider');
  return ctx;
}