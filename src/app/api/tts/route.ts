import { NextRequest, NextResponse } from 'next/server';

/**
 * Pure Text-to-Speech API
 * This endpoint ONLY converts provided text to speech.
 * For AI-generated tutoring with TTS, use /api/voice-tutor instead.
 *
 * The text must be plain, readable content - not a prompt or instruction.
 */

// Voice names for Gemini 2.5 TTS
// Available voices: Zephyr, Puck, Charon, Kore, Fenrir, Leda, Orus, Aoede
const VOICE_CONFIG = {
  ms: 'Kore',   // Clear voice for Malay
  zh: 'Puck',   // Good for Mandarin
  en: 'Kore',   // Clear English
};

// Fallback voices if primary fails
const FALLBACK_VOICES = ['Kore', 'Puck', 'Zephyr', 'Charon'];

export async function POST(request: NextRequest) {
  try {
    const { text, locale = 'ms' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'TTS not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    // Clean and prepare text for TTS - remove any instruction-like prefixes
    let cleanText = text
      .replace(/^(say|speak|read|pronounce|tell)[:\s]*/i, '')
      .trim();

    // For short text (words less than 4 chars), make it more pronounceable
    if (cleanText.length <= 3) {
      // Single letters
      const letterIntro = {
        ms: `Huruf ${cleanText.toUpperCase()}`,
        zh: `字母 ${cleanText.toUpperCase()}`,
        en: `The letter ${cleanText.toUpperCase()}`,
      };
      cleanText = letterIntro[locale as keyof typeof letterIntro] || letterIntro.en;
    } else if (cleanText.length <= 6) {
      // Short words - spell them out slowly
      const wordIntro = {
        ms: `Perkataan: ${cleanText}`,
        zh: `单词：${cleanText}`,
        en: `The word: ${cleanText}`,
      };
      cleanText = wordIntro[locale as keyof typeof wordIntro] || wordIntro.en;
    }

    const primaryVoice = VOICE_CONFIG[locale as keyof typeof VOICE_CONFIG] || VOICE_CONFIG.ms;

    // Try TTS with primary voice, then fallbacks if needed
    const voicesToTry = [primaryVoice, ...FALLBACK_VOICES.filter(v => v !== primaryVoice)];

    for (const voice of voicesToTry) {
      console.log(`[TTS] Trying voice: ${voice} for text: "${cleanText}"`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: cleanText,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voice,
                  },
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TTS] Voice ${voice} API error:`, errorText);
        continue; // Try next voice
      }

      const data = await response.json();

      // Check for successful audio generation
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mp3';
      const finishReason = data.candidates?.[0]?.finishReason;

      if (audioData) {
        console.log(`[TTS] Success with voice: ${voice}`);
        return NextResponse.json({
          audio: audioData,
          mimeType: mimeType,
        });
      }

      // Log failure and try next voice
      console.error(`[TTS] Voice ${voice} failed, finishReason: ${finishReason}`, JSON.stringify(data, null, 2));
    }

    // All voices failed
    console.error('[TTS] All voices failed for text:', cleanText);
    return NextResponse.json(
      { error: 'TTS generation failed', code: 'ALL_VOICES_FAILED' },
      { status: 503 }
    );
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'TTS service error', code: 'INTERNAL_ERROR' },
      { status: 503 }
    );
  }
}
