'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/types';

interface DrawingCanvasProps {
  expectedLetter: string;
  locale: Locale;
  onRecognized: (isCorrect: boolean, recognizedLetter: string) => void;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export default function DrawingCanvas({
  expectedLetter,
  locale,
  onRecognized,
  disabled = false,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastPointRef = useRef<Point | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Set drawing style
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw guide letter
    drawGuideLetter(ctx, expectedLetter, rect.width, rect.height);
  }, [expectedLetter]);

  // Draw faint guide letter
  const drawGuideLetter = (ctx: CanvasRenderingContext2D, letter: string, width: number, height: number) => {
    ctx.save();
    ctx.font = `bold ${Math.min(width, height) * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.fillText(letter.toUpperCase(), width / 2, height / 2);
    ctx.restore();
  };

  // Get point from event
  const getPoint = useCallback((e: React.TouchEvent | React.MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  // Start drawing
  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || isAnalyzing) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    setIsDrawing(true);
    setHasDrawn(true);
    lastPointRef.current = point;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [disabled, isAnalyzing, getPoint]);

  // Continue drawing
  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || disabled || isAnalyzing) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point || !lastPointRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  }, [isDrawing, disabled, isAnalyzing, getPoint]);

  // Stop drawing
  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  // Clear canvas
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawGuideLetter(ctx, expectedLetter, rect.width, rect.height);
    setHasDrawn(false);
  }, [expectedLetter]);

  // Submit drawing for recognition
  const handleSubmit = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsAnalyzing(true);

    try {
      // Get canvas as base64 image
      const imageData = canvas.toDataURL('image/png');

      // Send to recognition API
      const response = await fetch('/api/handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          expectedLetter,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Recognition failed');
      }

      const result = await response.json();
      onRecognized(result.isCorrect, result.recognizedLetter || '?');

      if (result.isCorrect) {
        // Clear after successful recognition
        setTimeout(handleClear, 500);
      }
    } catch (error) {
      console.error('Handwriting recognition error:', error);
      // Fallback: simple check
      onRecognized(false, '?');
    } finally {
      setIsAnalyzing(false);
    }
  }, [hasDrawn, expectedLetter, locale, onRecognized, handleClear]);

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-48 bg-white rounded-lg border-4 ${
            disabled ? 'border-gray-300 opacity-50' : 'border-[#5D8731]'
          } touch-none`}
          style={{ touchAction: 'none' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
        />

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="animate-spin text-3xl inline-block">⏳</span>
              <p className="text-gray-600 mt-2">
                {locale === 'ms' ? 'Menganalisis...' :
                  locale === 'zh' ? '分析中...' :
                  'Analyzing...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-gray-500">
        {locale === 'ms' ? 'Tulis huruf di atas' :
          locale === 'zh' ? '在上面写字母' :
          'Write the letter above'}
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleClear}
          disabled={disabled || isAnalyzing || !hasDrawn}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {locale === 'ms' ? 'Padam' : locale === 'zh' ? '清除' : 'Clear'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || isAnalyzing || !hasDrawn}
          className="px-6 py-2 bg-[#5D8731] hover:bg-[#4A6B27] text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAnalyzing && <span className="animate-spin">⏳</span>}
          {locale === 'ms' ? 'Hantar' : locale === 'zh' ? '提交' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
