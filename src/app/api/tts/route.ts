import { NextRequest, NextResponse } from 'next/server';

// Voice names for different languages (Malaysian-accented English for all)
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
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const voice = VOICE_CONFIG[locale as keyof typeof VOICE_CONFIG] || VOICE_CONFIG.ms;

    // Use Gemini 2.5 Flash TTS
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
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract audio data from response
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 });
    }

    // Return base64 audio data
    return NextResponse.json({
      audio: audioData,
      mimeType: 'audio/mp3',
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
