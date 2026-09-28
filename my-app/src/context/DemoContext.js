import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DemoContext = createContext(null);
const STORAGE_KEY = '@demo_mode_v1';

export function DemoProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDemoMode(raw === 'true');
      } catch (e) {
        console.error('Demo load error:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, demoMode ? 'true' : 'false').catch(() => {});
  }, [isLoaded, demoMode]);

  const toggleDemo = useCallback((value) => {
    setDemoMode(value);
  }, []);

  return (
    <DemoContext.Provider value={{ isLoaded, demoMode, toggleDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}