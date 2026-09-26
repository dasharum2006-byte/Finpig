import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetContext = createContext(null);

const STORAGE_KEY = '@pet_state_v2';
const DAY_MS = 24 * 60 * 60 * 1000;
const HUNGER_DROP_PER_DAY = 25;
const HUNGER_MAX = 100;

export function PetProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // ─── Питомец ───
  // { speciesId, variationId, name, stage, hatched }
  const [pet, setPet] = useState(null);

  // ─── Голод ───
  const [hunger, setHunger] = useState(HUNGER_MAX);
  const [lastFed, setLastFed] = useState(null);

  // ─── Загрузка ───
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setPet(s.pet ?? null);
          setHunger(s.hunger ?? HUNGER_MAX);
          setLastFed(s.lastFed ?? Date.now());

          // Пересчёт голода по времени
          const savedLastFed = s.lastFed ?? Date.now();
          const elapsed = Date.now() - savedLastFed;
          const daysPassed = Math.floor(elapsed / DAY_MS);
          if (daysPassed >= 1) {
            setHunger(Math.max(0, (s.hunger ?? HUNGER_MAX) - daysPassed * HUNGER_DROP_PER_DAY));
            setLastFed(savedLastFed + daysPassed * DAY_MS);
          }
        } else {
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
      JSON.stringify({ pet, hunger, lastFed })
    ).catch((e) => console.error('Pet save error:', e));
  }, [isLoaded, pet, hunger, lastFed]);

  // ─── Тикер голода ───
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      if (!lastFed) return;
      const daysPassed = Math.floor((Date.now() - lastFed) / DAY_MS);
      if (daysPassed >= 1) {
        setHunger((h) => Math.max(0, h - daysPassed * HUNGER_DROP_PER_DAY));
        setLastFed((lf) => lf + daysPassed * DAY_MS);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, lastFed]);

  // ─── Установить питомца (после выбора + имени) ───
  const setNewPet = useCallback(({ speciesId, variationId, name }) => {
    setPet({
      speciesId,
      variationId,
      name,
      stage: 0,       // 0 = яйцо/только что вылупился
      hatched: false, // вылупился ли
    });
  }, []);

  // ─── Вылупить ───
  const hatchPet = useCallback(() => {
    setPet((p) => (p ? { ...p, hatched: true, stage: 1 } : p));
  }, []);

  // ─── Повысить стадию (0 → 1 → 2) ───
  const evolvePet = useCallback(() => {
    setPet((p) => {
      if (!p) return p;
      const nextStage = Math.min(2, (p.stage ?? 0) + 1);
      return { ...p, stage: nextStage, hatched: true };
    });
  }, []);

  // ─── Покормить ───
  const feedPet = useCallback(() => {
    setHunger(HUNGER_MAX);
    setLastFed(Date.now());
  }, []);

  const decreaseHunger = useCallback((amount = HUNGER_DROP_PER_DAY) => {
    setHunger((h) => Math.max(0, h - amount));
  }, []);

  // ─── Сбросить питомца ───
  const clearPet = useCallback(() => {
    setPet(null);
    setHunger(HUNGER_MAX);
    setLastFed(Date.now());
  }, []);

  return (
    <PetContext.Provider
      value={{
        isLoaded,
        pet,
        hunger,
        lastFed,
        setNewPet,
        hatchPet,
        evolvePet,
        feedPet,
        decreaseHunger,
        clearPet,
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