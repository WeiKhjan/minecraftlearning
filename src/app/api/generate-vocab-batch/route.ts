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

  // =====================
  // Unit 10: Berhati-hati Selalu (Always Be Careful)
  // =====================
  { word: 'berhati-hati', meaning_en: 'be careful', category: 'action' },
  { word: 'cermat', meaning_en: 'meticulous', category: 'action' },
  { word: 'bijak', meaning_en: 'wise', category: 'person' },
  { word: 'selamat', meaning_en: 'safe', category: 'object' },
  { word: 'bahaya', meaning_en: 'danger', category: 'object' },
  { word: 'awas', meaning_en: 'beware', category: 'action' },
  { word: 'jaga', meaning_en: 'guard/watch', category: 'action' },
  { word: 'lindungi', meaning_en: 'protect', category: 'action' },

  // =====================
  // Unit 11: Selamat Sentiasa (Always Safe)
  // =====================
  { word: 'tali pinggang keledar', meaning_en: 'seat belt', category: 'object' },
  { word: 'berhenti', meaning_en: 'stop', category: 'action' },
  { word: 'lalu lintas', meaning_en: 'traffic', category: 'place' },
  { word: 'lampu isyarat', meaning_en: 'traffic light', category: 'object' },
  { word: 'zebra crossing', meaning_en: 'zebra crossing', category: 'place' },
  { word: 'helmet', meaning_en: 'helmet', category: 'clothing' },
  { word: 'bas sekolah', meaning_en: 'school bus', category: 'vehicle' },
  { word: 'pemandu', meaning_en: 'driver', category: 'person' },

  // =====================
  // Unit 12: Jadikan Teladan (Be a Role Model)
  // =====================
  { word: 'teladan', meaning_en: 'role model', category: 'person' },
  { word: 'tanggungjawab', meaning_en: 'responsibility', category: 'action' },
  { word: 'jujur', meaning_en: 'honest', category: 'person' },
  { word: 'rajin', meaning_en: 'diligent', category: 'person' },
  { word: 'sopan', meaning_en: 'polite', category: 'person' },
  { word: 'hormat', meaning_en: 'respect', category: 'action' },
  { word: 'tolong', meaning_en: 'help', category: 'action' },
  { word: 'berkongsi', meaning_en: 'sharing', category: 'action' },

  // =====================
  // Unit 13: Meriahnya Perayaan (Festive Celebrations - Hari Gawai)
  // =====================
  { word: 'Hari Gawai', meaning_en: 'Gawai Festival', category: 'place' },
  { word: 'tuak', meaning_en: 'rice wine', category: 'food' },
  { word: 'ayam pansuh', meaning_en: 'bamboo chicken', category: 'food' },
  { word: 'umai', meaning_en: 'raw fish salad', category: 'food' },
  { word: 'sape', meaning_en: 'traditional lute', category: 'object' },
  { word: 'rumah panjang', meaning_en: 'longhouse', category: 'place' },
  { word: 'ngajat', meaning_en: 'warrior dance', category: 'action' },
  { word: 'pakaian tradisional', meaning_en: 'traditional costume', category: 'clothing' },

  // =====================
  // Unit 14: Sambutan Perayaan (Celebration Continued)
  // =====================
  { word: 'ketupat', meaning_en: 'rice cake in woven palm leaf', category: 'food' },
  { word: 'rendang', meaning_en: 'spicy meat dish', category: 'food' },
  { word: 'pelita', meaning_en: 'oil lamp', category: 'object' },
  { word: 'bunga api', meaning_en: 'fireworks', category: 'object' },
  { word: 'mercun', meaning_en: 'firecracker', category: 'object' },
  { word: 'kuih raya', meaning_en: 'festive cookies', category: 'food' },
  { word: 'duit raya', meaning_en: 'festive money packet', category: 'object' },
  { word: 'baju kurung', meaning_en: 'traditional Malay dress', category: 'clothing' },

  // =====================
  // Unit 15: Wah, Cantiknya! (How Beautiful! - Arts)
  // =====================
  { word: 'lukisan', meaning_en: 'painting', category: 'object' },
  { word: 'warna', meaning_en: 'color', category: 'object' },
  { word: 'berus', meaning_en: 'brush', category: 'object' },
  { word: 'kanvas', meaning_en: 'canvas', category: 'object' },
  { word: 'cat air', meaning_en: 'watercolor', category: 'object' },
  { word: 'palet', meaning_en: 'palette', category: 'object' },
  { word: 'pelukis', meaning_en: 'painter', category: 'person' },
  { word: 'cantik', meaning_en: 'beautiful', category: 'object' },

  // =====================
  // Unit 16: Pameran Kartun Malaysia (Malaysian Cartoon Exhibition)
  // =====================
  { word: 'kartunis', meaning_en: 'cartoonist', category: 'person' },
  { word: 'Datuk Lat', meaning_en: 'Datuk Lat cartoonist', category: 'person' },
  { word: 'Budak Kampung', meaning_en: 'Kampung Boy comic', category: 'object' },
  { word: 'komik', meaning_en: 'comic', category: 'object' },
  { word: 'watak', meaning_en: 'character', category: 'person' },
  { word: 'pameran', meaning_en: 'exhibition', category: 'place' },
  { word: 'galeri', meaning_en: 'gallery', category: 'place' },
  { word: 'kreatif', meaning_en: 'creative', category: 'action' },

  // =====================
  // Unit 17: Bendera Malaysia (Malaysian Flag)
  // =====================
  { word: 'bendera', meaning_en: 'flag', category: 'object' },
  { word: 'Jalur Gemilang', meaning_en: 'Malaysian flag', category: 'object' },
  { word: 'bulan', meaning_en: 'moon/crescent', category: 'nature' },
  { word: 'bintang', meaning_en: 'star', category: 'nature' },
  { word: 'merah', meaning_en: 'red', category: 'object' },
  { word: 'putih', meaning_en: 'white', category: 'object' },
  { word: 'kuning', meaning_en: 'yellow', category: 'object' },
  { word: 'jalur', meaning_en: 'stripe', category: 'object' },

  // =====================
  // Unit 18: Negaraku Istimewa (My Special Country)
  // =====================
  { word: 'gunung', meaning_en: 'mountain', category: 'nature' },
  { word: 'Gunung Kinabalu', meaning_en: 'Mount Kinabalu', category: 'nature' },
  { word: 'laut', meaning_en: 'sea', category: 'nature' },
  { word: 'pulau', meaning_en: 'island', category: 'nature' },
  { word: 'hutan', meaning_en: 'forest', category: 'nature' },
  { word: 'sungai', meaning_en: 'river', category: 'nature' },
  { word: 'pantai', meaning_en: 'beach', category: 'nature' },
  { word: 'negeri', meaning_en: 'state', category: 'place' },

  // =====================
  // Unit 19: Mesra Plastik (Plastic Friendly - Recycling)
  // =====================
  { word: 'botol plastik', meaning_en: 'plastic bottle', category: 'object' },
  { word: 'kitar semula', meaning_en: 'recycle', category: 'action' },
  { word: 'potong', meaning_en: 'cut', category: 'action' },
  { word: 'masukkan', meaning_en: 'insert/put in', category: 'action' },
  { word: 'pasu bunga', meaning_en: 'flower vase', category: 'object' },
  { word: 'tanah', meaning_en: 'soil', category: 'nature' },
  { word: 'pokok bunga', meaning_en: 'flower plant', category: 'nature' },
  { word: 'hiasan', meaning_en: 'decoration', category: 'object' },

  // =====================
  // Unit 20: Hemat dan Mudah (Thrifty and Easy)
  // =====================
  { word: 'tin', meaning_en: 'can/tin', category: 'object' },
  { word: 'kertas', meaning_en: 'paper', category: 'object' },
  { word: 'kaca', meaning_en: 'glass', category: 'object' },
  { word: 'beg plastik', meaning_en: 'plastic bag', category: 'object' },
  { word: 'jimat', meaning_en: 'save/economize', category: 'action' },
  { word: 'guna semula', meaning_en: 'reuse', category: 'action' },
  { word: 'kurangkan', meaning_en: 'reduce', category: 'action' },
  { word: 'beg kain', meaning_en: 'cloth bag', category: 'object' },

  // =====================
  // Unit 21: Jaga Alam Sekitar (Take Care of Environment)
  // =====================
  { word: 'sampah', meaning_en: 'garbage/trash', category: 'object' },
  { word: 'tong kitar semula', meaning_en: 'recycling bin', category: 'object' },
  { word: 'alam sekitar', meaning_en: 'environment', category: 'nature' },
  { word: 'pencemaran', meaning_en: 'pollution', category: 'nature' },
  { word: 'bersih', meaning_en: 'clean', category: 'action' },
  { word: 'hijau', meaning_en: 'green', category: 'nature' },
  { word: 'pokok', meaning_en: 'tree', category: 'nature' },
  { word: 'buang', meaning_en: 'throw away', category: 'action' },

  // =====================
  // Unit 22: Kolaj Ciptaan Saya (My Collage Creation)
  // =====================
  { word: 'kolaj', meaning_en: 'collage', category: 'object' },
  { word: 'gunting', meaning_en: 'scissors', category: 'object' },
  { word: 'gam', meaning_en: 'glue', category: 'object' },
  { word: 'kertas warna', meaning_en: 'colored paper', category: 'object' },
  { word: 'majalah', meaning_en: 'magazine', category: 'object' },
  { word: 'tampal', meaning_en: 'paste/stick', category: 'action' },
  { word: 'cipta', meaning_en: 'create', category: 'action' },
  { word: 'kreativiti', meaning_en: 'creativity', category: 'action' },

  // =====================
  // Unit 23: Corak dan Warna (Patterns and Colors)
  // =====================
  { word: 'corak', meaning_en: 'pattern', category: 'object' },
  { word: 'corak batik', meaning_en: 'batik pattern', category: 'object' },
  { word: 'bunga', meaning_en: 'flower', category: 'nature' },
  { word: 'daun', meaning_en: 'leaf', category: 'nature' },
  { word: 'geometri', meaning_en: 'geometric shapes', category: 'object' },
  { word: 'garisan', meaning_en: 'lines', category: 'object' },
  { word: 'bulatan', meaning_en: 'circles', category: 'object' },
  { word: 'segi empat', meaning_en: 'squares', category: 'object' },

  // =====================
  // Unit 24: Ayu Tunggal - Batik
  // =====================
  { word: 'batik', meaning_en: 'batik fabric', category: 'clothing' },
  { word: 'canting', meaning_en: 'batik wax pen tool', category: 'object' },
  { word: 'lilin', meaning_en: 'wax', category: 'object' },
  { word: 'kain', meaning_en: 'cloth/fabric', category: 'clothing' },
  { word: 'pewarna', meaning_en: 'dye', category: 'object' },
  { word: 'motif', meaning_en: 'motif/design', category: 'object' },
  { word: 'tradisional', meaning_en: 'traditional', category: 'object' },
  { word: 'warisan', meaning_en: 'heritage', category: 'object' },
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
    const sanitizedWord = word.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_').replace(/[^a-z0-9_]/g, '');
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
