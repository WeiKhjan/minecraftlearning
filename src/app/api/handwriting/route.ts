import { NextRequest, NextResponse } from 'next/server';

interface HandwritingRequest {
  image: string;        // Base64 image data
  expectedLetter: string;  // Can be letter or word
  locale: string;
  contentType?: 'letter' | 'word';  // Type of content
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
    const { image, expectedLetter, locale = 'ms', contentType }: HandwritingRequest = await request.json();

    if (!image || !expectedLetter) {
      return NextResponse.json(
        { error: 'Image and expected text are required' },
        { status: 400 }
      );
    }

    // Auto-detect content type if not provided
    const isWord = contentType === 'word' || expectedLetter.length > 1;

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

    // Build appropriate prompt based on content type
    const contentLabel = isWord ? 'word' : 'letter';
    const expectedText = isWord ? expectedLetter : expectedLetter.toUpperCase();

    const prompt = isWord
      ? `You are analyzing a child's handwritten WORD drawing.

The child should have written the Malay word: "${expectedText}"

Look at this image and determine:
1. What word did the child write? (Look for any recognizable word)
2. Is it the correct word "${expectedText}"?

Be generous in your assessment - this is for young children learning to write Malay:
- Accept imperfect shapes if recognizable
- Accept slight spelling variations if the intent is clear
- Focus on recognizing the overall word, not individual letter perfection

Respond ONLY with this exact JSON format, no other text:
{
  "recognizedLetter": "${expectedText}",
  "isCorrect": true,
  "confidence": 0.8,
  "feedbackMs": "Malay feedback for the child",
  "feedbackZh": "Chinese feedback for the child",
  "feedbackEn": "English feedback for the child"
}

If nothing is drawn or completely unrecognizable, set recognizedLetter to "?" and isCorrect to false.`
      : `You are analyzing a child's handwritten letter drawing.

The child should have written the letter: "${expectedText}"

Look at this image and determine:
1. What letter did the child write? (Look for any recognizable letter shape)
2. Is it the correct letter "${expectedText}"?

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

If nothing is drawn or completely unrecognizable, set recognizedLetter to "?" and isCorrect to false.`;

    // Use Gemini Vision for handwriting recognition
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
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
                text: prompt,
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      // Fallback response
      return NextResponse.json(createFallbackResponse(expectedLetter, isWord, true));
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(createFallbackResponse(expectedLetter, isWord, true));
    }

    // Parse the JSON response
    try {
      // Try direct parse first (with responseMimeType: 'application/json')
      let parsed;
      try {
        parsed = JSON.parse(textContent);
      } catch {
        // Fallback: extract JSON from response
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found');
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

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
      console.error('Failed to parse Gemini response:', parseError, textContent);
      return NextResponse.json(createFallbackResponse(expectedLetter, isWord, true));
    }
  } catch (error) {
    console.error('Handwriting API error:', error);
    return NextResponse.json(
      { error: 'Handwriting recognition failed' },
      { status: 500 }
    );
  }
}

function createFallbackResponse(expectedText: string, isWord: boolean, isCorrect: boolean): HandwritingResponse {
  const contentType = isWord ? 'perkataan' : 'huruf';
  const contentTypeZh = isWord ? '单词' : '字母';
  const contentTypeEn = isWord ? 'word' : 'letter';

  return {
    isCorrect,
    recognizedLetter: isCorrect ? expectedText : '?',
    confidence: 0.5,
    feedback: {
      ms: isCorrect ? 'Bagus! Teruskan!' : `Cuba tulis ${contentType} dengan lebih jelas.`,
      zh: isCorrect ? '很好！继续！' : `请把${contentTypeZh}写得更清楚。`,
      en: isCorrect ? 'Good! Keep going!' : `Try writing the ${contentTypeEn} more clearly.`,
    },
  };
}
