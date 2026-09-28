import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetPlanContext = createContext(null);

const STORAGE_KEY = '@budget_plan_v1';

export function BudgetPlanProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
const [periodCompleted, setPeriodCompleted] = useState(false);
  const [currentFact, setCurrentFact] = useState(null);
  const [history, setHistory] = useState([]);


  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setCurrentPlan(s.currentPlan ?? null);
          setCurrentFact(s.currentFact ?? null);
          setHistory(s.history ?? []);
          setPeriodCompleted(s.periodCompleted ?? false);
        }
      } catch (e) {
        console.error('BudgetPlan load error:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);


  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ currentPlan, currentFact, history, periodCompleted })
    ).catch((e) => console.error('BudgetPlan save error:', e));
  }, [isLoaded, currentPlan, currentFact, history, periodCompleted]);


  const confirmPlan = useCallback(({ budget, needs, wants, savings }) => {
    setPeriodCompleted(false); 
    const plan = {
      budget,
      needs,
      wants,
      savings,
      periodId: Date.now().toString(),
      confirmedAt: Date.now(),
    };
    setCurrentPlan(plan);
    setCurrentFact({ needs: 0, wants: 0, savings: 0 }); 
    return plan;
  }, []);


  const updateFact = useCallback((category, delta) => {
    setCurrentFact((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: (prev[category] || 0) + delta,
      };
    });
  }, []);

  const finishPeriod = useCallback(() => {
    setPeriodCompleted(true);
    if (!currentPlan || !currentFact) return null;
    const record = {
      plan: currentPlan,
      fact: currentFact,
      completedAt: Date.now(),
    };
    setHistory((prev) => [...prev, record]);
    setCurrentPlan(null);
    setCurrentFact(null);
    return record;
  }, []);

  const resetPlan = useCallback(() => {
    setCurrentPlan(null);
    setCurrentFact(null);
    setHistory([]);
    setPeriodCompleted(false); 
  }, []);


  const getMatchPercent = useCallback(() => {
    if (!currentPlan || !currentFact) return 0;
    const calc = (plan, fact) => {
      if (plan === 0) return 100;
      const diff = Math.abs(fact - plan);
      const match = Math.max(0, 100 - (diff / plan) * 100);
      return match;
    };
    const n = calc(currentPlan.needs, currentFact.needs);
    const w = calc(currentPlan.wants, currentFact.wants);
    const s = calc(currentPlan.savings, currentFact.savings);
    return Math.round((n + w + s) / 3);
  }, [currentPlan, currentFact]);

  return (
    <BudgetPlanContext.Provider
      value={{
        isLoaded,
        currentPlan,
        currentFact,
        history,
        confirmPlan,
        periodCompleted,
        updateFact,
        finishPeriod,
        resetPlan,
        getMatchPercent,
      }}
    >
      {children}
    </BudgetPlanContext.Provider>
  );
}

export function useBudgetPlan() {
  const ctx = useContext(BudgetPlanContext);
  if (!ctx) throw new Error('useBudgetPlan must be used inside BudgetPlanProvider');
  return ctx;
}