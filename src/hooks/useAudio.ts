import { useState, useEffect, useCallback } from 'react';

// Play simple frequency beeps using Web Audio API to avoid external asset dependencies
let audioCtx: AudioContext | null = null;

const createBeep = (frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export function useAudio() {
  const playClick = useCallback(() => {
    createBeep(600, 'sine', 0.1, 0.1);
  }, []);

  const playSuccess = useCallback(() => {
    createBeep(800, 'sine', 0.1, 0.1);
    setTimeout(() => createBeep(1200, 'sine', 0.15, 0.1), 100);
  }, []);

  const playError = useCallback(() => {
    createBeep(300, 'sawtooth', 0.2, 0.1);
    setTimeout(() => createBeep(250, 'sawtooth', 0.3, 0.1), 150);
  }, []);

  return { playClick, playSuccess, playError };
}
