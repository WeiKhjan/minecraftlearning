import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// All vocabulary words for Units 2-9
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

  // =====================
  // Unit 4: Kenali Jiran
  // =====================
  { word: 'pasu', meaning_en: 'vase', category: 'object' },
  { word: 'bantal', meaning_en: 'pillow', category: 'object' },
  { word: 'jam', meaning_en: 'clock', category: 'object' },
  { word: 'jiran', meaning_en: 'neighbor', category: 'person' },
  { word: 'pensel', meaning_en: 'pencil', category: 'object' },
  { word: 'obor', meaning_en: 'torch', category: 'object' },
  { word: 'duduk', meaning_en: 'sit', category: 'action' },
  { word: 'butang', meaning_en: 'button', category: 'object' },
  { word: 'tudung', meaning_en: 'headscarf', category: 'clothing' },
  { word: 'dinding', meaning_en: 'wall', category: 'object' },
  { word: 'tangga', meaning_en: 'stairs', category: 'object' },
  { word: 'tong', meaning_en: 'barrel', category: 'object' },
  { word: 'orang', meaning_en: 'person', category: 'person' },
  { word: 'selipar', meaning_en: 'slipper', category: 'clothing' },

  // =====================
  // Unit 5: Kawan-kawan Wei Han
  // =====================
  { word: 'jadual', meaning_en: 'timetable', category: 'object' },
  { word: 'ketua kelas', meaning_en: 'class monitor', category: 'person' },
  { word: 'radio', meaning_en: 'radio', category: 'object' },
  { word: 'pokok bunga', meaning_en: 'flower plant', category: 'nature' },
  { word: 'tong sampah', meaning_en: 'trash bin', category: 'object' },
  { word: 'baju ungu', meaning_en: 'purple shirt', category: 'clothing' },
  { word: 'buah pisang', meaning_en: 'banana', category: 'food' },
  { word: 'piring kuih', meaning_en: 'cake plate', category: 'object' },
  { word: 'bangku kayu', meaning_en: 'wooden bench', category: 'object' },
  { word: 'bilik muzik', meaning_en: 'music room', category: 'place' },
  { word: 'piano', meaning_en: 'piano', category: 'object' },
  { word: 'bernyanyi', meaning_en: 'singing', category: 'action' },
  { word: 'bertepuk tangan', meaning_en: 'clapping', category: 'action' },
  { word: 'buku tulis', meaning_en: 'exercise book', category: 'object' },
  { word: 'lukisan', meaning_en: 'drawing', category: 'object' },

  // =====================
  // Unit 6: Taman Permainan
  // =====================
  { word: 'buah limau', meaning_en: 'lime', category: 'food' },
  { word: 'botol air', meaning_en: 'water bottle', category: 'object' },
  { word: 'rantai basikal', meaning_en: 'bicycle chain', category: 'object' },
  { word: 'memakai', meaning_en: 'wearing', category: 'action' },
  { word: 'bermain', meaning_en: 'playing', category: 'action' },
  { word: 'belon', meaning_en: 'balloon', category: 'object' },
  { word: 'buaian', meaning_en: 'swing', category: 'object' },
  { word: 'jongkang-jongkit', meaning_en: 'seesaw', category: 'object' },
  { word: 'layang-layang', meaning_en: 'kite', category: 'object' },
  { word: 'dewan', meaning_en: 'hall', category: 'place' },
  { word: 'papan gelongsor', meaning_en: 'slide', category: 'object' },
  { word: 'pagar', meaning_en: 'fence', category: 'object' },
  { word: 'penjaja', meaning_en: 'vendor', category: 'person' },

  // =====================
  // Unit 7: Sihat dan Gembira
  // =====================
  { word: 'stoking', meaning_en: 'socks', category: 'clothing' },
  { word: 'kasut sukan', meaning_en: 'sports shoes', category: 'clothing' },
  { word: 'bersenam', meaning_en: 'exercising', category: 'action' },
  { word: 'berjoging', meaning_en: 'jogging', category: 'action' },
  { word: 'segar', meaning_en: 'fresh', category: 'object' },
  { word: 'bola', meaning_en: 'ball', category: 'object' },

  // =====================
  // Unit 8: Sedap dan Sihat
  // =====================
  { word: 'sandwic', meaning_en: 'sandwich', category: 'food' },
  { word: 'telur', meaning_en: 'egg', category: 'food' },
  { word: 'pisang', meaning_en: 'banana', category: 'food' },
  { word: 'tembikai', meaning_en: 'watermelon', category: 'food' },
  { word: 'nasi lemak', meaning_en: 'coconut rice', category: 'food' },
  { word: 'susu segar', meaning_en: 'fresh milk', category: 'food' },
  { word: 'buah jambu', meaning_en: 'guava', category: 'food' },
  { word: 'roti telur', meaning_en: 'egg bread', category: 'food' },
  { word: 'membuka', meaning_en: 'opening', category: 'action' },
  { word: 'membeli', meaning_en: 'buying', category: 'action' },
  { word: 'minum', meaning_en: 'drinking', category: 'action' },
  { word: 'makan', meaning_en: 'eating', category: 'action' },

  // =====================
  // Unit 9: Kebersihan dan Kesihatan
  // =====================
  { word: 'berus gigi', meaning_en: 'toothbrush', category: 'object' },
  { word: 'ubat gigi', meaning_en: 'toothpaste', category: 'object' },
  { word: 'mencuci', meaning_en: 'washing', category: 'action' },
  { word: 'menjaga', meaning_en: 'taking care', category: 'action' },
  { word: 'menggosok gigi', meaning_en: 'brushing teeth', category: 'action' },
  { word: 'mencuci muka', meaning_en: 'washing face', category: 'action' },
  { word: 'mandi', meaning_en: 'bathing', category: 'action' },
  { word: 'sabun', meaning_en: 'soap', category: 'object' },
  { word: 'syampu', meaning_en: 'shampoo', category: 'object' },
  { word: 'merawat', meaning_en: 'treating', category: 'action' },
  { word: 'membantu', meaning_en: 'helping', category: 'action' },
  { word: 'membasuh', meaning_en: 'rinsing', category: 'action' },
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
