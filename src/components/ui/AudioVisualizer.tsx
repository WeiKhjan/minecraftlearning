'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  barCount?: number;
  barColor?: string;
  height?: number;
}

export default function AudioVisualizer({
  isListening,
  barCount = 20,
  barColor = '#ffffff',
  height = 60,
}: AudioVisualizerProps) {
  const [levels, setLevels] = useState<number[]>(new Array(barCount).fill(5));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isListening) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isListening]);

  const startVisualization = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start animation loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const animate = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Sample the frequency data to create bar levels
        const newLevels: number[] = [];
        const step = Math.floor(dataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const index = i * step;
          // Normalize to percentage (0-100), with minimum height of 5
          const value = Math.max(5, (dataArray[index] / 255) * 100);
          newLevels.push(value);
        }

        setLevels(newLevels);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    } catch (error) {
      console.error('Error accessing microphone for visualization:', error);
      // Show idle animation if can't access mic
      animateIdle();
    }
  };

  const animateIdle = () => {
    // Gentle idle animation when no mic access
    let phase = 0;
    const animate = () => {
      phase += 0.1;
      const newLevels = new Array(barCount).fill(0).map((_, i) => {
        return 10 + Math.sin(phase + i * 0.3) * 5;
      });
      setLevels(newLevels);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopVisualization = () => {
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Reset levels
    setLevels(new Array(barCount).fill(5));
  };

  return (
    <div
      className="flex items-end justify-center gap-1"
      style={{ height: `${height}px` }}
    >
      {levels.map((level, index) => (
        <div
          key={index}
          className="rounded-full transition-all duration-75"
          style={{
            width: '4px',
            height: `${Math.max(4, (level / 100) * height)}px`,
            backgroundColor: barColor,
            opacity: 0.8 + (level / 500),
          }}
        />
      ))}
    </div>
  );
}
