import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetContext = createContext(null);

const STORAGE_KEY = '@pet_state_v2';

const HUNGER_CYCLE_MS = 24 * 60 * 60 * 1000;
const HUNGER_DROP_PER_MS = 100 / HUNGER_CYCLE_MS;
const HUNGER_MAX = 100;

// ─── Счастье ───
// Счастье угасает от 100 до 0 за 3 дня. Любое «полезное» действие
// (пройден вопрос задания, завершена мини-игра или куплена вещь в ToyShop)
// поднимает его обратно до 100%.
const HAPPINESS_CYCLE_MS = 3 * 24 * 60 * 60 * 1000;
const HAPPINESS_DROP_PER_MS = 100 / HAPPINESS_CYCLE_MS;
const HAPPINESS_MAX = 100;

function computeHunger(lastFed) {
  if (!lastFed) return HUNGER_MAX;
  const elapsed = Date.now() - lastFed;
  const drop = elapsed * HUNGER_DROP_PER_MS;
  return Math.max(0, HUNGER_MAX - drop);
}

function computeHappiness(lastBoost) {
  if (!lastBoost) return HAPPINESS_MAX;
  const elapsed = Date.now() - lastBoost;
  const drop = elapsed * HAPPINESS_DROP_PER_MS;
  return Math.max(0, HAPPINESS_MAX - drop);
}

export function PetProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [pet, setPet] = useState(null);
  const [lastFed, setLastFed] = useState(null);
  const [hunger, setHunger] = useState(HUNGER_MAX);
  const [lastHappinessBoost, setLastHappinessBoost] = useState(null);
  const [happiness, setHappiness] = useState(HAPPINESS_MAX);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setPet(s.pet ?? null);
          setIsOnboardingDone(s.isOnboardingDone ?? false);
          const savedLastFed = s.lastFed ?? Date.now();
          setLastFed(savedLastFed);
          setHunger(computeHunger(savedLastFed));
          const savedBoost = s.lastHappinessBoost ?? Date.now();
          setLastHappinessBoost(savedBoost);
          setHappiness(computeHappiness(savedBoost));
          setInventory(s.inventory ?? []);
        } else {
          setLastFed(Date.now());
          setHunger(HUNGER_MAX);
          setLastHappinessBoost(Date.now());
          setHappiness(HAPPINESS_MAX);
        }
      } catch (e) {
        console.error('Pet load error:', e);
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
        pet,
        lastFed,
        hunger,
        lastHappinessBoost,
        happiness,
        inventory,
        isOnboardingDone,
      })
    ).catch((e) => console.error('Pet save error:', e));
  }, [isLoaded, pet, lastFed, hunger, lastHappinessBoost, happiness, inventory, isOnboardingDone]);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setHunger(computeHunger(lastFed));
      setHappiness(computeHappiness(lastHappinessBoost));
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, lastFed, lastHappinessBoost]);

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
    setLastHappinessBoost(now);
    setHappiness(HAPPINESS_MAX);
  }, []);

  // Установить стадию (0..3). Вызывается HomeScreen по bank.level
  const setStage = useCallback((newStage) => {
    setPet((p) => {
      if (!p) return p;
      const safe = Math.max(0, Math.min(3, newStage));
      if (p.stage === safe) return p;
      return { ...p, stage: safe, hatched: safe >= 1 };
    });
  }, []);

  const feedPet = useCallback((amount = 100) => {
    const now = Date.now();
    const currentHunger = computeHunger(lastFed);
    const newHunger = Math.min(HUNGER_MAX, currentHunger + amount);
    const remainingDrop = ((HUNGER_MAX - newHunger) / 100) * HUNGER_CYCLE_MS;
    const newLastFed = now - remainingDrop;
    setLastFed(newLastFed);
    setHunger(newHunger);
  }, [lastFed]);

  // Поднять счастье (по умолчанию — до 100%).
  const boostHappiness = useCallback((amount = HAPPINESS_MAX) => {
    const now = Date.now();
    const current = computeHappiness(lastHappinessBoost);
    const newHappiness = Math.min(HAPPINESS_MAX, current + amount);
    const remainingDrop =
      ((HAPPINESS_MAX - newHappiness) / 100) * HAPPINESS_CYCLE_MS;
    setLastHappinessBoost(now - remainingDrop);
    setHappiness(newHappiness);
  }, [lastHappinessBoost]);

  const clearPet = useCallback(() => {
    setPet(null);
    const now = Date.now();
    setLastFed(now);
    setHunger(HUNGER_MAX);
    setLastHappinessBoost(now);
    setHappiness(HAPPINESS_MAX);
    setIsOnboardingDone(false);
  }, []);

  const setOnboardingDone = useCallback((value) => {
    setIsOnboardingDone(value);
  }, []);

  const addFoodToInventory = useCallback((newItems) => {
    setInventory((prev) => {
      const updated = [...prev];
      newItems.forEach((newItem) => {
        const existingIndex = updated.findIndex((item) => item.id === newItem.id);
        if (existingIndex > -1) {
          updated[existingIndex].quantity += newItem.quantity;
        } else {
          updated.push({ ...newItem });
        }
      });
      return updated;
    });
  }, []);

  const consumeFood = useCallback((itemId) => {
    setInventory((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  }, []);

  return (
    <PetContext.Provider
      value={{
        isLoaded,
        pet,
        hunger,
        lastFed,
        happiness,
        lastHappinessBoost,
        inventory,
        setNewPet,
        setStage,
        feedPet,
        boostHappiness,
        clearPet,
        addFoodToInventory,
        isOnboardingDone,
        setOnboardingDone,
        consumeFood,
        HUNGER_MAX,
        HAPPINESS_MAX,
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