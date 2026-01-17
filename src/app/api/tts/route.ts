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

    // Keep text simple - don't add prefixes that might confuse the TTS model
    // The model works better with plain text
    // For very short text, just repeat it for clarity
    if (cleanText.length <= 2) {
      // Single letters - repeat for clarity
      cleanText = `${cleanText.toUpperCase()}. ${cleanText.toUpperCase()}.`;
    } else if (cleanText.length <= 4) {
      // Very short words - say twice slowly
      cleanText = `${cleanText}. ${cleanText}.`;
    }
    // For longer text, use as-is without prefixes

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
                // Add language hint based on locale
                ...(locale === 'zh' && { languageCode: 'cmn-CN' }),
                ...(locale === 'ms' && { languageCode: 'ms-MY' }),
                ...(locale === 'en' && { languageCode: 'en-US' }),
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TTS] Voice ${voice} API error (${response.status}):`, errorText);
        // If API key is invalid or model not found, don't try other voices
        if (response.status === 400 || response.status === 403 || response.status === 404) {
          return NextResponse.json(
            { error: `TTS API error: ${response.status}`, code: 'API_ERROR', details: errorText },
            { status: response.status }
          );
        }
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
