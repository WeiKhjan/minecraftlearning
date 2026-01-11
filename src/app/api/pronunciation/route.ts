import { NextRequest, NextResponse } from 'next/server';

interface PronunciationRequest {
  expected: string;  // The syllable the kid should say
  spoken: string;    // What the kid actually said
  locale: string;    // Language: ms, zh, en
}

interface PronunciationResponse {
  isCorrect: boolean;
  confidence: number;
  feedback: {
    ms: string;
    zh: string;
    en: string;
  };
  correction?: {
    ms: string;
    zh: string;
    en: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { expected, spoken, locale = 'ms' }: PronunciationRequest = await request.json();

    if (!expected || !spoken) {
      return NextResponse.json(
        { error: 'Expected and spoken text are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, do simple string comparison
    if (!apiKey) {
      const isCorrect = normalizeText(spoken) === normalizeText(expected);
      return NextResponse.json(createSimpleResponse(isCorrect, expected, spoken));
    }

    // Use Gemini for intelligent pronunciation analysis
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a pronunciation assessment assistant for children learning to read Malay syllables.

The child should say: "${expected}"
The child said: "${spoken}"
Language: ${locale === 'ms' ? 'Malay' : locale === 'zh' ? 'Chinese' : 'English'}

Analyze if the child's pronunciation is correct or close enough to be accepted.
Consider:
- Minor variations in transcription are OK (e.g., "ba" vs "baa")
- If the syllable sounds similar, accept it
- Be encouraging for children

Respond in this exact JSON format:
{
  "isCorrect": true/false,
  "confidence": 0.0-1.0,
  "feedbackMs": "Malay feedback message",
  "feedbackZh": "Chinese feedback message",
  "feedbackEn": "English feedback message",
  "correctionMs": "If wrong, how to say it correctly in Malay",
  "correctionZh": "If wrong, how to say it correctly in Chinese",
  "correctionEn": "If wrong, how to say it correctly in English"
}

Only respond with JSON, no other text.`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      // Fallback to simple comparison
      const isCorrect = normalizeText(spoken) === normalizeText(expected);
      return NextResponse.json(createSimpleResponse(isCorrect, expected, spoken));
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      const isCorrect = normalizeText(spoken) === normalizeText(expected);
      return NextResponse.json(createSimpleResponse(isCorrect, expected, spoken));
    }

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const result: PronunciationResponse = {
        isCorrect: parsed.isCorrect === true,
        confidence: parsed.confidence || 0.8,
        feedback: {
          ms: parsed.feedbackMs || (parsed.isCorrect ? 'Bagus!' : 'Cuba lagi!'),
          zh: parsed.feedbackZh || (parsed.isCorrect ? '很好！' : '再试一次！'),
          en: parsed.feedbackEn || (parsed.isCorrect ? 'Good job!' : 'Try again!'),
        },
      };

      if (!parsed.isCorrect) {
        result.correction = {
          ms: parsed.correctionMs || `Sebut: "${expected}"`,
          zh: parsed.correctionZh || `读作: "${expected}"`,
          en: parsed.correctionEn || `Say: "${expected}"`,
        };
      }

      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      const isCorrect = normalizeText(spoken) === normalizeText(expected);
      return NextResponse.json(createSimpleResponse(isCorrect, expected, spoken));
    }
  } catch (error) {
    console.error('Pronunciation API error:', error);
    return NextResponse.json(
      { error: 'Pronunciation analysis failed' },
      { status: 500 }
    );
  }
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '') // Keep letters, numbers, Chinese chars
    .replace(/\s+/g, '');
}

// Create simple response without AI
function createSimpleResponse(isCorrect: boolean, expected: string, spoken: string): PronunciationResponse {
  if (isCorrect) {
    return {
      isCorrect: true,
      confidence: 1.0,
      feedback: {
        ms: 'Bagus! Sebutan anda betul!',
        zh: '很好！你的发音正确！',
        en: 'Great! Your pronunciation is correct!',
      },
    };
  }

  return {
    isCorrect: false,
    confidence: 0.5,
    feedback: {
      ms: `Anda menyebut "${spoken}", cuba sebut "${expected}" sekali lagi.`,
      zh: `你说的是"${spoken}"，请再试一次说"${expected}"。`,
      en: `You said "${spoken}", try saying "${expected}" again.`,
    },
    correction: {
      ms: `Sebut dengan jelas: "${expected}"`,
      zh: `请清楚地说: "${expected}"`,
      en: `Say clearly: "${expected}"`,
    },
  };
}
