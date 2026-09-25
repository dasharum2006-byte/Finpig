import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetContext = createContext(null);

const STORAGE_KEY = '@pet_state_v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const HUNGER_DROP_PER_DAY = 25;
const HUNGER_MAX = 100;

export function PetProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hunger, setHunger] = useState(HUNGER_MAX);
  const [lastFed, setLastFed] = useState(null);

  // ─── Загрузка с пересчётом по времени ───
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          const savedHunger = s.hunger ?? HUNGER_MAX;
          const savedLastFed = s.lastFed ?? Date.now();

          const elapsed = Date.now() - savedLastFed;
          const daysPassed = Math.floor(elapsed / DAY_MS);
          const newHunger = Math.max(0, savedHunger - daysPassed * HUNGER_DROP_PER_DAY);

          setHunger(newHunger);
          setLastFed(savedLastFed + daysPassed * DAY_MS);
        } else {
          setHunger(HUNGER_MAX);
          setLastFed(Date.now());
        }
      } catch (e) {
        console.error('Pet load error:', e);
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
      JSON.stringify({ hunger, lastFed })
    ).catch((e) => console.error('Pet save error:', e));
  }, [isLoaded, hunger, lastFed]);

  // ─── Тикер: раз в минуту проверяем прошедшие дни ───
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      if (!lastFed) return;
      const elapsed = Date.now() - lastFed;
      const daysPassed = Math.floor(elapsed / DAY_MS);
      if (daysPassed >= 1) {
        setHunger((h) => Math.max(0, h - daysPassed * HUNGER_DROP_PER_DAY));
        setLastFed((lf) => lf + daysPassed * DAY_MS);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, lastFed]);

  const feedPet = useCallback(() => {
    setHunger(HUNGER_MAX);
    setLastFed(Date.now());
  }, []);

  const decreaseHunger = useCallback((amount = HUNGER_DROP_PER_DAY) => {
    setHunger((h) => Math.max(0, h - amount));
  }, []);

  return (
    <PetContext.Provider
      value={{
        isLoaded,
        hunger,
        lastFed,
        feedPet,
        decreaseHunger,
        HUNGER_MAX,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used inside PetProvider');
  return ctx;
}