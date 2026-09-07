'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const [volume, setVolume] = useState(0.025);

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const currentVal = gainNodeRef.current.gain.value;
      gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.4);
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
      }, 500);
    }
    setIsPlaying(false);
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;
      
      // Warm contemplative resonant tones
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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(newVolume, audioCtxRef.current.currentTime, 0.2);
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
    <div className="flex items-center gap-3">
      <button
        id="ambient-sound-toggle-btn"
        onClick={toggleSound}
        className="inline-flex items-center gap-2 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 rounded-full text-xs text-[#AAA69D] hover:text-[#F2F0EA] transition-colors uppercase tracking-wider group"
        title={isPlaying ? 'Wycisz ambient wystawy' : 'Włącz subtelne tło dźwiękowe wystawy'}
        aria-label={isPlaying ? 'Wycisz dźwięk wystawy' : 'Włącz dźwięk wystawy'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#C5A880] animate-pulse group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Dźwięk: on</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-[#AAA69D]" />
            <span className="hidden sm:inline">Dźwięk: off</span>
          </>
        )}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
          <input
            type="range"
            min="0"
            max="0.08"
            step="0.005"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#2A2927] rounded-full appearance-none cursor-pointer accent-[#C5A880]"
            aria-label="Głośność tła"
          />
        </div>
      )}
    </div>
  );
};
