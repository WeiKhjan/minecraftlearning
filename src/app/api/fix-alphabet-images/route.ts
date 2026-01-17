import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vowel words for the alphabet sounds activity
const VOWEL_WORDS = [
  { letter: 'A', word: 'ayam', meaning_en: 'Chicken', category: 'animal' },
  { letter: 'E', word: 'emak', meaning_en: 'Mother', category: 'person' },
  { letter: 'I', word: 'itik', meaning_en: 'Duck', category: 'animal' },
  { letter: 'O', word: 'oren', meaning_en: 'Orange', category: 'food' },
  { letter: 'U', word: 'unta', meaning_en: 'Camel', category: 'animal' },
];

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function generateAndUploadImage(word: string, meaning_en: string, category: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const categoryPrompts: Record<string, string> = {
    food: 'delicious appetizing food item on a clean plate or simple background',
    animal: 'cute friendly animal in a natural setting, child-friendly appearance',
    person: 'friendly cartoon character representing a mother figure, warm and caring',
  };

  const categoryContext = categoryPrompts[category] || 'clear recognizable everyday object';

  const prompt = `Generate an educational vocabulary flashcard image for Malaysian primary school children (ages 6-7).

Word: "${word}" (Malay)
Meaning: "${meaning_en}" (English)

Requirements:
- Show a clear, recognizable image of: ${meaning_en}
- Style: ${categoryContext}
- Bright, vibrant colors for children
- Cartoon/illustrated style (NOT photorealistic)
- Cute kawaii-inspired style
- White or soft pastel background
- NO text in the image
- Subject centered, fills 70% of frame`;

  try {
    // Try Gemini image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          config: { numberOfImages: 1, outputOptions: { mimeType: 'image/png' } },
        }),
      }
    );

    let imageData: string | null = null;

    if (response.ok) {
      const data = await response.json();
      imageData = data.generatedImages?.[0]?.image?.imageBytes;
    }

    if (!imageData) {
      // Try alternative endpoint
      const altResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
        }
      );

      if (altResponse.ok) {
        const altData = await altResponse.json();
        const parts = altData.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }
    }

    if (!imageData) return null;

    // Upload to Supabase
    const supabase = getSupabaseAdmin();
    const imageBuffer = Buffer.from(imageData, 'base64');
    const fileName = `${word}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true });

    if (uploadError) {
      console.error(`Upload error for ${word}:`, uploadError);
      return null;
    }

    return `images/${fileName}`;
  } catch (error) {
    console.error(`Generation error for ${word}:`, error);
    return null;
  }
}

export async function POST() {
  const results: Array<{ letter: string; word: string; success: boolean; path?: string; error?: string }> = [];

  for (const item of VOWEL_WORDS) {
    console.log(`Generating image for ${item.word}...`);

    const path = await generateAndUploadImage(item.word, item.meaning_en, item.category);

    if (path) {
      results.push({ letter: item.letter, word: item.word, success: true, path });
    } else {
      results.push({ letter: item.letter, word: item.word, success: false, error: 'Generation failed' });
    }

    // Wait between generations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Update the activity in the database
  const supabase = getSupabaseAdmin();

  // Build new pairs data
  const newPairs = VOWEL_WORDS.map(item => {
    const result = results.find(r => r.word === item.word);
    return {
      letter: item.letter,
      image: result?.path || `/images/${item.word}.png`,
      word_ms: item.word.charAt(0).toUpperCase() + item.word.slice(1),
      word_zh: item.letter === 'A' ? '鸡' : item.letter === 'E' ? '妈妈' : item.letter === 'I' ? '鸭子' : item.letter === 'O' ? '橙子' : '骆驼',
      word_en: item.meaning_en,
    };
  });

  // Update activities with title containing "Alphabet Sounds" or "Bunyi Abjad"
  const { error: updateError } = await supabase
    .from('activities')
    .update({
      content: {
        type: 'matching',
        data: { pairs: newPairs }
      }
    })
    .or('title_en.ilike.%Alphabet Sounds%,title_ms.ilike.%Bunyi Abjad%');

  return NextResponse.json({
    message: 'Image generation complete',
    results,
    updateError: updateError?.message,
    newPairs,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/fix-alphabet-images',
    method: 'POST',
    description: 'Generates images for vowel words (A-ayam, E-emak, I-itik, O-oren, U-unta) and updates the alphabet sounds activity',
  });
}
