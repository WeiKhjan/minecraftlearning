import { NextRequest, NextResponse } from 'next/server';

// Voice names for Gemini 2.5 TTS
const VOICE_CONFIG = {
  ms: 'Aoede', // Good for Malay
  zh: 'Puck',  // Good for Mandarin
  en: 'Kore',  // Clear English
};

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

    const voice = VOICE_CONFIG[locale as keyof typeof VOICE_CONFIG] || VOICE_CONFIG.ms;

    // Use Gemini 2.5 Flash TTS model
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
                  text: text,
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
      console.error('Gemini TTS error:', errorText);

      return NextResponse.json(
        { error: 'TTS temporarily unavailable', code: 'API_ERROR', details: errorText },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Extract audio data from response
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mp3';

    if (!audioData) {
      console.error('No audio in response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'No audio generated', code: 'NO_AUDIO' },
        { status: 503 }
      );
    }

    // Return base64 audio data
    return NextResponse.json({
      audio: audioData,
      mimeType: mimeType,
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'TTS service error', code: 'INTERNAL_ERROR' },
      { status: 503 }
    );
  }
}
