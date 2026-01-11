'use client';

import { useCallback, useRef } from 'react';

type SoundEffect = 'correct' | 'wrong' | 'click' | 'complete' | 'levelUp' | 'coin';

// Web Audio API-based sound effects generator
// This creates sounds programmatically without needing audio files
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
      console.warn('Sound effect failed:', e);
    }
  }, [getContext]);

  const play = useCallback((effect: SoundEffect) => {
    switch (effect) {
      case 'correct':
        // Happy ascending tone
        playTone(523.25, 0.1, 'sine', 0.3); // C5
        setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
        setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 200); // G5
        break;

      case 'wrong':
        // Descending buzzy tone
        playTone(200, 0.15, 'sawtooth', 0.2);
        setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 100);
        break;

      case 'click':
        // Short click
        playTone(800, 0.05, 'square', 0.1);
        break;

      case 'complete':
        // Fanfare
        playTone(523.25, 0.15, 'sine', 0.3); // C5
        setTimeout(() => playTone(659.25, 0.15, 'sine', 0.3), 150); // E5
        setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 300); // G5
        setTimeout(() => playTone(1046.50, 0.3, 'sine', 0.4), 450); // C6
        break;

      case 'levelUp':
        // Exciting ascending arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.1, 'sine', 0.25), i * 80);
        });
        break;

      case 'coin':
        // Minecraft-style coin/pickup sound
        playTone(987.77, 0.1, 'square', 0.15); // B5
        setTimeout(() => playTone(1318.51, 0.15, 'square', 0.15), 100); // E6
        break;
    }
  }, [playTone]);

  return { play };
}
