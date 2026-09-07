'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface MuseumAudioPlayerProps {
  currentArtworkAudio?: string;
  isExhibitionOpen?: boolean;
}

export const MuseumAudioPlayer: React.FC<MuseumAudioPlayerProps> = ({
  currentArtworkAudio,
  isExhibitionOpen = false,
}) => {
  const isMounted = useIsMounted();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mode, setMode] = useState<'ambient' | 'silence'>('ambient');
  const [volume, setVolume] = useState<number>(0.35);
  const [isAudioSupported, setIsAudioSupported] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Initialize Web Audio API generative soothing museum soundscape
  const initWebAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
          setIsAudioSupported(false);
          return;
        }
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Master output gain
      if (!masterGainRef.current) {
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.connect(ctx.destination);
        masterGainRef.current = master;
      }

      // Create ambient harmonic cluster (gentle warm museum frequencies: 108Hz, 162Hz, 216Hz, 324Hz)
      const rootFrequencies = [108, 162, 216, 324];
      const newOscs: OscillatorNode[] = [];

      // Sub-drone & gentle harmonics
      rootFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Very soft subtle detune for warm analog feel
        osc.detune.setValueAtTime((idx - 1.5) * 3, ctx.currentTime);

        // Low volume per harmonic
        const level = idx === 0 ? 0.04 : 0.02 / (idx + 1);
        oscGain.gain.setValueAtTime(level, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGainRef.current!);
        osc.start();
        newOscs.push(osc);
      });

      // Filtered subtle room ambience noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.008;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter to simulate quiet acoustics of large stone gallery room
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGainRef.current!);
      whiteNoise.start();

      oscillatorsRef.current = newOscs;
      noiseNodeRef.current = whiteNoise;
    } catch {
      setIsAudioSupported(false);
    }
  }, []);

  const stopWebAudio = useCallback(() => {
    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      masterGainRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    }
  }, []);

  const toggleSoundtrack = () => {
    if (!isPlaying) {
      initWebAudio();
      if (audioCtxRef.current && masterGainRef.current) {
        const ctx = audioCtxRef.current;
        masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        masterGainRef.current.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 1.5);
      }
      setIsPlaying(true);
      setMode('ambient');
    } else {
      stopWebAudio();
      setIsPlaying(false);
      setMode('silence');
    }
  };

  // Adjust volume on the fly
  useEffect(() => {
    if (isPlaying && masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      masterGainRef.current.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.3);
    }
  }, [volume, isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isMounted || !isAudioSupported) return null;

  return (
    <div
      id="museum-audio-player-dock"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#111111]/90 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880]/60 px-3.5 py-2 shadow-2xl transition-all duration-300"
    >
      <button
        onClick={toggleSoundtrack}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors focus:outline-none"
        aria-label={isPlaying ? 'Wycisz ambient galerii' : 'Włącz ambient przestrzeni wystawowej'}
        title={isPlaying ? 'Ambient aktywny • Kliknij, aby wyciszyć' : 'Włącz subtelny ambient sali wystawowej (generowany Web Audio)'}
      >
        {isPlaying ? (
          <>
            <div className="relative flex items-center justify-center">
              <Volume2 className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            </div>
            <span className="text-[10px] text-[#C5A880] font-medium hidden sm:inline">Ambient: Wł.</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-[#AAA69D]" />
            <span className="text-[10px] hidden sm:inline">Dźwięk: Wył.</span>
          </>
        )}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2 pl-2 border-l border-[#2A2927]">
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-14 h-1 bg-[#2A2927] rounded-none appearance-none cursor-pointer accent-[#C5A880]"
            title="Głośność tła wystawowego"
          />
        </div>
      )}
    </div>
  );
};
