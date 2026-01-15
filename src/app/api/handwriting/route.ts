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

    // If no API key, return error - recognition requires AI
    if (!apiKey) {
      console.error('[Handwriting] No GEMINI_API_KEY configured');
      return NextResponse.json({
        isCorrect: false,
        recognizedLetter: '?',
        confidence: 0,
        feedback: {
          ms: 'Pengecaman tulisan tidak tersedia. Sila hubungi pentadbir.',
          zh: '手写识别不可用。请联系管理员。',
          en: 'Handwriting recognition unavailable. Please contact admin.',
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
      ? `You are a handwriting recognition system for children learning to spell.

TASK: Recognize the handwritten word in this image.

The child is trying to write: "${expectedText}"

Instructions:
1. Look at the handwritten text in the image
2. Identify what word the child wrote (read each letter)
3. Compare with "${expectedText}" (case-insensitive)

Be GENEROUS - this is for young children:
- Accept messy handwriting if readable
- Accept if letters are imperfect but recognizable
- "ayam", "Ayam", "AYAM" are all correct for "${expectedText}"
- Focus on whether the child spelled the word correctly

Return JSON:
{
  "recognizedLetter": "[word you see]",
  "isCorrect": true/false,
  "confidence": 0.8,
  "feedbackMs": "feedback in Malay",
  "feedbackZh": "feedback in Chinese",
  "feedbackEn": "feedback in English"
}

If you can read "${expectedText}" or very close to it, set isCorrect: true.`
      : `You are a handwriting recognition system for children learning to write letters.

TASK: Look at this handwritten image and recognize what LETTER the child wrote.

IMPORTANT:
1. First, identify what letter is actually drawn in the image
2. The expected correct answer is: "${expectedText}"
3. Compare what you see with the expected answer

Recognition rules:
- Accept uppercase or lowercase versions of the same letter
- Accept imperfect but recognizable letter shapes
- The letter must match "${expectedText}" to be correct
- If the child wrote a different letter, mark isCorrect as false

Respond ONLY with this JSON format:
{
  "recognizedLetter": "[THE ACTUAL LETTER YOU SEE]",
  "isCorrect": [true if it matches "${expectedText}", false otherwise],
  "confidence": [0.0 to 1.0],
  "feedbackMs": "[Malay feedback]",
  "feedbackZh": "[Chinese feedback]",
  "feedbackEn": "[English feedback]"
}

If blank or unreadable, use recognizedLetter: "?" and isCorrect: false.`;

    // Use Gemini 3 Flash Preview for handwriting recognition (OCR)
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
                text: prompt,
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Handwriting] Gemini API error:', errorText);
      // Return error - don't pretend it's correct
      return NextResponse.json({
        isCorrect: false,
        recognizedLetter: '?',
        confidence: 0,
        feedback: {
          ms: 'Cuba lagi - pengecaman tidak berjaya.',
          zh: '请再试一次 - 识别失败。',
          en: 'Try again - recognition failed.',
        },
      });
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('[Handwriting] No text content in response:', JSON.stringify(data));
      return NextResponse.json({
        isCorrect: false,
        recognizedLetter: '?',
        confidence: 0,
        feedback: {
          ms: 'Cuba tulis dengan lebih jelas.',
          zh: '请写得更清楚。',
          en: 'Please write more clearly.',
        },
      });
    }

    // Parse the JSON response
    try {
      // Try direct parse first
      let parsed;
      try {
        parsed = JSON.parse(textContent);
      } catch {
        // Fallback: extract JSON from response (handle markdown code blocks too)
        let jsonText = textContent;

        // Remove markdown code block if present
        const codeBlockMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1];
        }

        // Extract JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          // Check if response is incomplete (just "{" or partial)
          if (textContent.trim() === '{' || textContent.length < 10) {
            console.error('[Handwriting] Incomplete response from AI, retrying might help');
            return NextResponse.json({
              isCorrect: false,
              recognizedLetter: '?',
              confidence: 0,
              feedback: {
                ms: 'Cuba hantar sekali lagi.',
                zh: '请再试一次。',
                en: 'Please try submitting again.',
              },
            });
          }
          console.error('[Handwriting] No JSON found in:', textContent);
          throw new Error('No JSON found');
        }

        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
          console.error('[Handwriting] Invalid JSON:', jsonMatch[0]);
          throw jsonError;
        }
      }

      const recognizedText = (parsed.recognizedLetter || '?').toLowerCase().trim();
      const expectedLower = expectedLetter.toLowerCase().trim();

      // Validate by comparing recognized text with expected text
      // Only mark as correct if the recognized text actually matches what was expected
      // This prevents the AI from incorrectly marking wrong answers as correct
      const isMatch = recognizedText === expectedLower ||
        recognizedText.replace(/\s/g, '') === expectedLower.replace(/\s/g, '');

      // Use text matching as the source of truth, not the AI's isCorrect flag
      const isCorrect = isMatch;

      console.log(`[Handwriting] Expected: "${expectedLower}", Recognized: "${recognizedText}", AI said: ${parsed.isCorrect}, Final: ${isCorrect}`);

      const result: HandwritingResponse = {
        isCorrect,
        recognizedLetter: parsed.recognizedLetter || '?',
        confidence: parsed.confidence || 0.5,
        feedback: {
          ms: parsed.feedbackMs || (isCorrect ? 'Bagus!' : 'Cuba lagi!'),
          zh: parsed.feedbackZh || (isCorrect ? '很好！' : '再试一次！'),
          en: parsed.feedbackEn || (isCorrect ? 'Good job!' : 'Try again!'),
        },
      };

      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[Handwriting] Failed to parse Gemini response:', parseError, textContent);
      return NextResponse.json({
        isCorrect: false,
        recognizedLetter: '?',
        confidence: 0,
        feedback: {
          ms: 'Cuba tulis dengan lebih jelas.',
          zh: '请写得更清楚。',
          en: 'Please write more clearly.',
        },
      });
    }
  } catch (error) {
    console.error('Handwriting API error:', error);
    return NextResponse.json(
      { error: 'Handwriting recognition failed' },
      { status: 500 }
    );
  }
}
