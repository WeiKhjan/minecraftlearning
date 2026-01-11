import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// All vocabulary words for Unit 2 and Unit 3
const VOCABULARY_LIST = [
  // Unit 2: Mari Sayang
  // BA:6 - Mari Ajuk dan Sebut
  { word: 'baju', meaning_en: 'shirt/clothes', category: 'clothing' },
  { word: 'roti', meaning_en: 'bread', category: 'food' },
  { word: 'biru', meaning_en: 'blue color', category: 'object' },
  { word: 'susu', meaning_en: 'milk', category: 'food' },
  { word: 'teko', meaning_en: 'teapot', category: 'object' },

  // BA:7 - Baca Suku Kata
  { word: 'labu', meaning_en: 'pumpkin', category: 'food' },
  { word: 'tidur', meaning_en: 'sleeping person', category: 'action' },
  { word: 'bayi', meaning_en: 'baby', category: 'person' },
  { word: 'lebah', meaning_en: 'bee', category: 'animal' },
  { word: 'tulis', meaning_en: 'writing/pencil', category: 'action' },
  { word: 'betik', meaning_en: 'papaya', category: 'food' },
  { word: 'lobak', meaning_en: 'carrot', category: 'food' },
  { word: 'nasi', meaning_en: 'rice', category: 'food' },
  { word: 'cucu', meaning_en: 'grandchild', category: 'person' },
  { word: 'lukis', meaning_en: 'drawing/painting', category: 'action' },
  { word: 'nenek', meaning_en: 'grandmother', category: 'person' },
  { word: 'cawan', meaning_en: 'cup/mug', category: 'object' },

  // BA:8 - Baca Perkataan
  { word: 'lidi', meaning_en: 'stick/skewer', category: 'object' },
  { word: 'ceri', meaning_en: 'cherry', category: 'food' },
  { word: 'buku', meaning_en: 'book', category: 'object' },
  { word: 'topi', meaning_en: 'hat/cap', category: 'clothing' },

  // BA:9 - Tulis Suku Kata (food menu)
  { word: 'mi sup', meaning_en: 'noodle soup', category: 'food' },
  { word: 'bubur', meaning_en: 'porridge', category: 'food' },
  { word: 'teh', meaning_en: 'tea', category: 'food' },
  { word: 'kopi', meaning_en: 'coffee', category: 'food' },

  // BA:11 - Kata Nama Am
  { word: 'kedai', meaning_en: 'shop/store', category: 'place' },
  { word: 'pasar', meaning_en: 'market', category: 'place' },
  { word: 'bapa', meaning_en: 'father', category: 'person' },
  { word: 'adik', meaning_en: 'younger sibling', category: 'person' },
  { word: 'kereta', meaning_en: 'car', category: 'vehicle' },
  { word: 'van', meaning_en: 'van', category: 'vehicle' },
  { word: 'jalan', meaning_en: 'road/street', category: 'place' },

  // Unit 3: Balik Ke Kampung
  // BA:12 - Singgah di Gerai
  { word: 'pau', meaning_en: 'steamed bun', category: 'food' },
  { word: 'cakoi', meaning_en: 'fried dough stick', category: 'food' },
  { word: 'hijau', meaning_en: 'green color', category: 'object' },
  { word: 'limau', meaning_en: 'lime/citrus', category: 'food' },
  { word: 'gerai', meaning_en: 'stall/booth', category: 'place' },

  // BA:13 - Balik ke Kampung
  { word: 'matahari', meaning_en: 'sun', category: 'nature' },
  { word: 'padi', meaning_en: 'rice paddy field', category: 'nature' },
  { word: 'awan', meaning_en: 'cloud', category: 'nature' },
  { word: 'itik', meaning_en: 'duck', category: 'animal' },
  { word: 'lembu', meaning_en: 'cow', category: 'animal' },
  { word: 'ayam', meaning_en: 'chicken', category: 'animal' },

  // BA:14 - Memancing Ikan
  { word: 'joran', meaning_en: 'fishing rod', category: 'object' },
  { word: 'ikan', meaning_en: 'fish', category: 'animal' },
  { word: 'bakul', meaning_en: 'basket', category: 'object' },
  { word: 'kasut', meaning_en: 'shoes', category: 'clothing' },
  { word: 'kolam', meaning_en: 'pond', category: 'nature' },
  { word: 'rumput', meaning_en: 'grass', category: 'nature' },

  // BA:15 - Sayang akan Datuk dan Nenek
  { word: 'gambar', meaning_en: 'picture/photo', category: 'object' },
  { word: 'rak', meaning_en: 'shelf', category: 'object' },
  { word: 'datuk', meaning_en: 'grandfather', category: 'person' },
  { word: 'rambut', meaning_en: 'hair', category: 'body' },
];

// Create Supabase client with service role
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function generateSingleImage(
  word: string,
  meaning_en: string,
  category: string,
  apiKey: string
): Promise<{ word: string; imageUrl?: string; error?: string }> {
  const categoryPrompts: Record<string, string> = {
    food: 'delicious appetizing food item on a clean plate or simple background',
    animal: 'cute friendly animal in a natural setting, child-friendly appearance',
    object: 'clear recognizable everyday object with simple background',
    place: 'colorful illustrated location/building, welcoming atmosphere',
    person: 'friendly cartoon character (not real person), diverse Malaysian representation',
    action: 'simple illustration showing the action being performed',
    vehicle: 'colorful cartoon vehicle, child-friendly design',
    nature: 'beautiful natural element with vibrant colors',
    body: 'simple educational illustration (appropriate for children)',
    clothing: 'colorful clothing item displayed clearly',
  };

  const categoryContext = categoryPrompts[category] || categoryPrompts.object;

  const prompt = `Generate an educational vocabulary flashcard image for Malaysian primary school children.

Subject: "${meaning_en}"
Style: ${categoryContext}
Requirements:
- Cute kawaii illustration style
- Bright vibrant colors
- White/pastel background
- Subject centered, fills 70% of frame
- NO text in image
- Child-friendly and memorable

Make it perfect for teaching young children vocabulary!`;

  try {
    // Use Gemini 2.5 Flash Image (same as avatar generation)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    let imageData: string | null = null;
    let mimeType = 'image/png';

    if (response.ok) {
      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    } else {
      const errorText = await response.text();
      console.error('Gemini error:', errorText);
      return { word, error: `API error: ${response.status}` };
    }

    if (!imageData) {
      return { word, error: 'No image in response' };
    }

    // Upload to Supabase
    const supabase = getSupabaseAdmin();
    const imageBuffer = Buffer.from(imageData, 'base64');
    const sanitizedWord = word.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const fileName = `vocab/${sanitizedWord}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { word, error: `Upload failed: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);

    return { word, imageUrl: urlData.publicUrl };
  } catch (error) {
    return { word, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startIndex = 0, count = 5 } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
    }

    const endIndex = Math.min(startIndex + count, VOCABULARY_LIST.length);
    const wordsToProcess = VOCABULARY_LIST.slice(startIndex, endIndex);

    const results: Array<{ word: string; imageUrl?: string; error?: string }> = [];

    for (const vocab of wordsToProcess) {
      console.log(`Generating image for: ${vocab.word}`);
      const result = await generateSingleImage(vocab.word, vocab.meaning_en, vocab.category, apiKey);
      results.push(result);

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: VOCABULARY_LIST.length,
      nextIndex: endIndex < VOCABULARY_LIST.length ? endIndex : null,
      results,
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    return NextResponse.json({ error: 'Batch generation failed', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    totalWords: VOCABULARY_LIST.length,
    vocabulary: VOCABULARY_LIST.map((v) => ({ word: v.word, meaning: v.meaning_en, category: v.category })),
    usage: {
      method: 'POST',
      body: { startIndex: 0, count: 5 },
      description: 'Process words in batches to avoid timeout',
    },
  });
}
