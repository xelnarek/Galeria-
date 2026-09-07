'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.8);
      setTimeout(() => {
        oscillatorsRef.current.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        oscillatorsRef.current = [];
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
      }, 900);
    }
    setIsPlaying(false);
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      // Very subtle, quiet atmospheric room drone
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Warm contemplative resonant tones (A2 110Hz, E3 165Hz, C#3 138.6Hz)
      const freqs = [110, 164.81, 220, 329.63];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Subtle slow frequency drifting
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + index * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.6, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        if (panner) {
          panner.pan.setValueAtTime((index % 2 === 0 ? -1 : 1) * 0.3, ctx.currentTime);
          osc.connect(filter);
          filter.connect(panner);
          panner.connect(masterGain);
        } else {
          osc.connect(filter);
          filter.connect(masterGain);
        }

        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio could not be initialized:', e);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <button
      id="ambient-sound-toggle-btn"
      onClick={toggleSound}
      className="inline-flex items-center gap-2 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 rounded-full text-xs text-[#AAA69D] hover:text-[#F2F0EA] transition-colors uppercase tracking-wider"
      title={isPlaying ? 'Wycisz ambient wystawy' : 'Włącz subtelne tło dźwiękowe wystawy'}
      aria-label={isPlaying ? 'Wycisz dźwięk wystawy' : 'Włącz dźwięk wystawy'}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#C5A880] animate-pulse" />
          <span className="hidden sm:inline">Dźwięk: włączony</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-[#AAA69D]" />
          <span className="hidden sm:inline">Dźwięk: wyciszony</span>
        </>
      )}
    </button>
  );
};
