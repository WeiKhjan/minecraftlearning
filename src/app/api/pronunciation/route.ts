import { NextRequest, NextResponse } from 'next/server';

interface PronunciationRequest {
  expected: string;  // The syllable the kid should say
  spoken: string;    // What the kid actually said
  locale: string;    // Language: ms, zh, en
  contentType?: string; // Type of content: syllable, word, letter, etc.
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
    const { expected, spoken, locale = 'ms', contentType = 'syllable' }: PronunciationRequest = await request.json();

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

    // Build content-type specific instructions
    const isSentence = contentType === 'sentence' || expected.split(' ').length > 2;

    const systemPrompt = isSentence
      ? `You assess children's MALAY (Bahasa Malaysia) pronunciation for Malaysian primary school.
This is a SPEAKING exercise - the child is reading Malay sentences/phrases aloud.
BE VERY LENIENT - this is for young children (ages 6-12) learning to speak.

ACCEPT AS CORRECT if:
- The spoken text contains most of the key words from expected (even if order differs slightly)
- Proper nouns (names like "Puan Chan", "Cikgu Ali") are pronounced reasonably close
- Minor word variations or speech recognition errors (e.g., "ini" vs "nie", "puan" vs "pwa")
- Missing articles or small words like "ini", "itu", "dan"
- 70% or more of the expected words are present

ONLY mark as INCORRECT if:
- The child said something completely different
- Less than 50% of key words match
- The meaning is totally wrong

Be encouraging! Children are learning and trying their best.
feedbackMs must be in MALAY, feedbackZh in SIMPLIFIED CHINESE, feedbackEn in ENGLISH.
Return ONLY JSON: {"isCorrect":true/false,"confidence":0.8,"feedbackMs":"text","feedbackZh":"text","feedbackEn":"text","correctionMs":"text","correctionZh":"text","correctionEn":"text"}`
      : `You assess children's MALAY (Bahasa Malaysia) pronunciation for Malaysian primary school.
This is a MALAY SUKU KATA (syllable) lesson - the child is learning to pronounce Malay syllables/words.
Compare the spoken text to the expected Malay text phonetically. Accept if it sounds similar.
Be LENIENT and encouraging for children learning.
IMPORTANT: feedbackMs must be in MALAY, feedbackZh in SIMPLIFIED CHINESE, feedbackEn in ENGLISH.
Return ONLY JSON: {"isCorrect":true/false,"confidence":0.8,"feedbackMs":"text","feedbackZh":"text","feedbackEn":"text","correctionMs":"text","correctionZh":"text","correctionEn":"text"}`;

    // Use Gemini for intelligent pronunciation analysis
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `MALAY ${contentType.toUpperCase()} PRONUNCIATION TEST
Expected: "${expected}"
Child said: "${spoken}"
Is this correct or close enough? Remember to be LENIENT for children.`
            }]
          }],
          systemInstruction: {
            parts: [{
              text: systemPrompt
            }]
          },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100000,
            responseMimeType: 'application/json',
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
      console.log('[pronunciation] Raw Gemini response:', textContent);

      // Try to parse directly first (with responseMimeType: 'application/json')
      let parsed;
      try {
        parsed = JSON.parse(textContent);
      } catch {
        // Fallback: Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

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
