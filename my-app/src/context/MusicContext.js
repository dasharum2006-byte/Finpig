import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const MusicContext = createContext(null);
const STORAGE_KEY = '@music_prefs_v1';

// Фоновая музыка и звук монеток
const BGM = require('../../assets/music/bgm.mp3');
const COIN_SFX = require('../../assets/sounds/coin.mp3');

export function MusicProvider({ children }) {
  const player = useAudioPlayer(BGM);
  const coinPlayer = useAudioPlayer(COIN_SFX);

  const [isLoaded, setIsLoaded] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [sfxOn, setSfxOn] = useState(true);
  const [sfxVolume] = useState(0.9);

  // Загрузка сохранённых настроек + настройка аудио-режима
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (typeof s.musicOn === 'boolean') setMusicOn(s.musicOn);
          if (typeof s.sfxOn === 'boolean') setSfxOn(s.sfxOn);
          if (typeof s.volume === 'number') setVolume(Math.max(0, Math.min(1, s.volume)));
        }
      } catch (e) {
        console.error('Music init error:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Сохранение настроек
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ musicOn, volume, sfxOn })).catch(() => {});
  }, [isLoaded, musicOn, volume, sfxOn]);

  // Луп + громкость + play/pause для фоновой музыки
  useEffect(() => {
    if (!player || !isLoaded) return;
    try {
      player.loop = true;
      player.volume = volume;
      if (musicOn) {
        if (!player.playing) player.play();
      } else if (player.playing) {
        player.pause();
      }
    } catch (e) {
      console.error('Music control error:', e);
    }
  }, [player, isLoaded, musicOn, volume]);

  // Громкость звука монеток
  useEffect(() => {
    if (!coinPlayer) return;
    try {
      coinPlayer.volume = sfxVolume;
    } catch (e) {
      // ignore
    }
  }, [coinPlayer, sfxVolume]);

  // Звон монеток
  const playCoin = useCallback(() => {
    if (!sfxOn || !coinPlayer) return;
    try {
      coinPlayer.seekTo(0);
      coinPlayer.play();
    } catch (e) {
      // ignore
    }
  }, [coinPlayer, sfxOn]);

  const toggleMusic = useCallback((value) => {
    setMusicOn((prev) => (typeof value === 'boolean' ? value : !prev));
  }, []);

  return (
    <MusicContext.Provider
      value={{
        isLoaded,
        musicOn, setMusicOn, toggleMusic,
        volume, setVolume,
        sfxOn, setSfxOn,
        playCoin,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider');
  return ctx;
}
