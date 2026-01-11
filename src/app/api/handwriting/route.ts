import { NextRequest, NextResponse } from 'next/server';

interface HandwritingRequest {
  image: string;        // Base64 image data
  expectedLetter: string;
  locale: string;
}

interface HandwritingResponse {
  isCorrect: boolean;
  recognizedLetter: string;
  confidence: number;
  feedback: {
    ms: string;
    zh: string;
    en: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { image, expectedLetter, locale = 'ms' }: HandwritingRequest = await request.json();

    if (!image || !expectedLetter) {
      return NextResponse.json(
        { error: 'Image and expected letter are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, do simple fallback
    if (!apiKey) {
      return NextResponse.json({
        isCorrect: true, // Be generous when no AI available
        recognizedLetter: expectedLetter,
        confidence: 0.5,
        feedback: {
          ms: 'Bagus! Teruskan latihan.',
          zh: '好！继续练习。',
          en: 'Good! Keep practicing.',
        },
      });
    }

    // Extract base64 data from data URL
    const base64Match = image.match(/^data:image\/\w+;base64,(.+)$/);
    const base64Data = base64Match ? base64Match[1] : image;

    // Use Gemini Vision for handwriting recognition
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Data,
                },
              },
              {
                text: `You are analyzing a child's handwritten letter drawing.

The child should have written the letter: "${expectedLetter.toUpperCase()}"

Look at this image and determine:
1. What letter did the child write? (Look for any recognizable letter shape)
2. Is it the correct letter "${expectedLetter.toUpperCase()}"?

Be generous in your assessment - this is for young children learning to write:
- Accept uppercase or lowercase
- Accept imperfect shapes if recognizable
- Focus on the intent, not perfection

Respond ONLY with this exact JSON format, no other text:
{
  "recognizedLetter": "A",
  "isCorrect": true,
  "confidence": 0.8,
  "feedbackMs": "Malay feedback for the child",
  "feedbackZh": "Chinese feedback for the child",
  "feedbackEn": "English feedback for the child"
}

If nothing is drawn or completely unrecognizable, set recognizedLetter to "?" and isCorrect to false.`,
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      // Fallback response
      return NextResponse.json(createFallbackResponse(expectedLetter, true));
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(createFallbackResponse(expectedLetter, true));
    }

    // Parse the JSON response
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const result: HandwritingResponse = {
        isCorrect: parsed.isCorrect === true,
        recognizedLetter: parsed.recognizedLetter || '?',
        confidence: parsed.confidence || 0.5,
        feedback: {
          ms: parsed.feedbackMs || (parsed.isCorrect ? 'Bagus!' : 'Cuba lagi!'),
          zh: parsed.feedbackZh || (parsed.isCorrect ? '很好！' : '再试一次！'),
          en: parsed.feedbackEn || (parsed.isCorrect ? 'Good job!' : 'Try again!'),
        },
      };

      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return NextResponse.json(createFallbackResponse(expectedLetter, true));
    }
  } catch (error) {
    console.error('Handwriting API error:', error);
    return NextResponse.json(
      { error: 'Handwriting recognition failed' },
      { status: 500 }
    );
  }
}

function createFallbackResponse(expectedLetter: string, isCorrect: boolean): HandwritingResponse {
  return {
    isCorrect,
    recognizedLetter: isCorrect ? expectedLetter : '?',
    confidence: 0.5,
    feedback: {
      ms: isCorrect ? 'Bagus! Teruskan!' : 'Cuba tulis huruf dengan lebih jelas.',
      zh: isCorrect ? '很好！继续！' : '请把字母写得更清楚。',
      en: isCorrect ? 'Good! Keep going!' : 'Try writing the letter more clearly.',
    },
  };
}
