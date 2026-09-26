import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetContext = createContext(null);

const STORAGE_KEY = '@pet_state_v2';

// Полный цикл голода: 24 часа
const HUNGER_CYCLE_MS = 24 * 60 * 60 * 1000;
const HUNGER_DROP_PER_MS = 100 / HUNGER_CYCLE_MS; // % в миллисекунду
const HUNGER_MAX = 100;

// Пересчёт: сколько % голода осталось с момента последнего кормления
function computeHunger(lastFed) {
  if (!lastFed) return HUNGER_MAX;
  const elapsed = Date.now() - lastFed;
  const drop = elapsed * HUNGER_DROP_PER_MS;
  return Math.max(0, HUNGER_MAX - drop);
}

export function PetProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [pet, setPet] = useState(null);
  const [lastFed, setLastFed] = useState(null);
  const [hunger, setHunger] = useState(HUNGER_MAX);

  // ─── Загрузка ───
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setPet(s.pet ?? null);
          const savedLastFed = s.lastFed ?? Date.now();
          setLastFed(savedLastFed);
          setHunger(computeHunger(savedLastFed));
        } else {
          setLastFed(Date.now());
          setHunger(HUNGER_MAX);
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
      JSON.stringify({ pet, lastFed })
    ).catch((e) => console.error('Pet save error:', e));
  }, [isLoaded, pet, lastFed]);

  // ─── Тикер: обновляем голод каждые 30 секунд ───
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setHunger(computeHunger(lastFed));
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, lastFed]);

  // ─── Создать нового питомца ───
  const setNewPet = useCallback(({ speciesId, variationId, name }) => {
    setPet({
      speciesId,
      variationId,
      name,
      stage: 0,
      hatched: false,
    });
    const now = Date.now();
    setLastFed(now);
    setHunger(HUNGER_MAX);
  }, []);

  const hatchPet = useCallback(() => {
    setPet((p) => (p ? { ...p, hatched: true, stage: 1 } : p));
  }, []);

  const evolvePet = useCallback(() => {
    setPet((p) => {
      if (!p) return p;
      const nextStage = Math.min(3, (p.stage ?? 0) + 1);
      return { ...p, stage: nextStage, hatched: true };
    });
  }, []);

  // ─── Покормить — прирост по "весу" еды ───
  // amount: сколько % добавить (20 для вредного, 45 для полезного)
  const feedPet = useCallback((amount = 100) => {
    const now = Date.now();

    // Считаем текущий голод на этот момент
    const currentHunger = computeHunger(lastFed);

    // Новая сытость = текущая + прирост, но не выше 100
    const newHunger = Math.min(HUNGER_MAX, currentHunger + amount);

    // Переводим "новую сытость" обратно в lastFed:
    // newHunger = 100 - (now - lastFed') / cycle * 100
    // → now - lastFed' = (100 - newHunger) / 100 * cycle
    // → lastFed' = now - (100 - newHunger) / 100 * cycle
    const remainingDrop = ((HUNGER_MAX - newHunger) / 100) * HUNGER_CYCLE_MS;
    const newLastFed = now - remainingDrop;

    setLastFed(newLastFed);
    setHunger(newHunger);
  }, [lastFed]);

  const clearPet = useCallback(() => {
    setPet(null);
    const now = Date.now();
    setLastFed(now);
    setHunger(HUNGER_MAX);
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