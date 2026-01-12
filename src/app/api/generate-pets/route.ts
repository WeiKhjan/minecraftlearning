import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// All Minecraft mob pets
const PET_LIST = [
  // Passive Mobs (Common)
  { id: 'chicken', name: 'Chicken', mobType: 'passive', rarity: 'common', description: 'A clucking farm bird' },
  { id: 'cow', name: 'Cow', mobType: 'passive', rarity: 'common', description: 'A gentle moo-ing cow' },
  { id: 'pig', name: 'Pig', mobType: 'passive', rarity: 'common', description: 'A happy pink pig' },
  { id: 'sheep', name: 'Sheep', mobType: 'passive', rarity: 'common', description: 'A fluffy white sheep' },
  { id: 'rabbit', name: 'Rabbit', mobType: 'passive', rarity: 'common', description: 'A hopping bunny' },

  // Baby Pets for Units 4-9 (Common/Rare)
  { id: 'baby_cow', name: 'Baby Cow', mobType: 'passive', rarity: 'common', description: 'A cute baby cow with big eyes' },
  { id: 'baby_rabbit', name: 'Baby Rabbit', mobType: 'passive', rarity: 'common', description: 'A tiny hopping baby bunny' },
  { id: 'wolf_pup', name: 'Wolf Pup', mobType: 'neutral', rarity: 'rare', description: 'A loyal baby wolf with a collar' },
  { id: 'kitten', name: 'Kitten', mobType: 'passive', rarity: 'rare', description: 'A playful fluffy kitten' },
  { id: 'fox_kit', name: 'Fox Kit', mobType: 'passive', rarity: 'rare', description: 'A clever baby orange fox' },
  { id: 'parrot_chick', name: 'Parrot Chick', mobType: 'passive', rarity: 'rare', description: 'A colorful baby parrot' },

  // Passive Mobs (Uncommon)
  { id: 'cat', name: 'Cat', mobType: 'passive', rarity: 'uncommon', description: 'A cute sitting cat' },
  { id: 'wolf', name: 'Wolf', mobType: 'neutral', rarity: 'uncommon', description: 'A loyal tamed wolf with red collar' },
  { id: 'fox', name: 'Fox', mobType: 'passive', rarity: 'uncommon', description: 'A clever orange fox' },
  { id: 'parrot', name: 'Parrot', mobType: 'passive', rarity: 'uncommon', description: 'A colorful tropical parrot' },
  { id: 'turtle', name: 'Turtle', mobType: 'passive', rarity: 'uncommon', description: 'A green sea turtle' },

  // Neutral/Special (Rare)
  { id: 'bee', name: 'Bee', mobType: 'neutral', rarity: 'rare', description: 'A fuzzy buzzing bee' },
  { id: 'panda', name: 'Panda', mobType: 'passive', rarity: 'rare', description: 'A cute black and white panda' },
  { id: 'axolotl', name: 'Axolotl', mobType: 'passive', rarity: 'rare', description: 'A pink aquatic axolotl' },
  { id: 'ocelot', name: 'Ocelot', mobType: 'passive', rarity: 'rare', description: 'A spotted jungle ocelot' },
  { id: 'llama', name: 'Llama', mobType: 'neutral', rarity: 'rare', description: 'A fluffy llama with colorful carpet' },

  // Hostile Mobs (Epic)
  { id: 'skeleton', name: 'Skeleton', mobType: 'hostile', rarity: 'epic', description: 'A skeleton archer with bow' },
  { id: 'zombie', name: 'Zombie', mobType: 'hostile', rarity: 'epic', description: 'A green zombie in torn clothes' },
  { id: 'creeper', name: 'Creeper', mobType: 'hostile', rarity: 'epic', description: 'A green creeper (friendly version)' },
  { id: 'spider', name: 'Spider', mobType: 'hostile', rarity: 'epic', description: 'A large cave spider' },
  { id: 'slime', name: 'Slime', mobType: 'hostile', rarity: 'epic', description: 'A bouncy green slime cube' },

  // Legendary Mobs
  { id: 'iron_golem', name: 'Iron Golem', mobType: 'utility', rarity: 'legendary', description: 'A mighty iron golem holding a flower' },
  { id: 'snow_golem', name: 'Snow Golem', mobType: 'utility', rarity: 'legendary', description: 'A snowman with pumpkin head' },
  { id: 'allay', name: 'Allay', mobType: 'passive', rarity: 'legendary', description: 'A cute blue fairy-like allay' },
  { id: 'ender_dragon', name: 'Ender Dragon', mobType: 'hostile', rarity: 'legendary', description: 'The mighty black ender dragon' },
  { id: 'wither', name: 'Wither', mobType: 'hostile', rarity: 'legendary', description: 'The three-headed wither boss' },
];

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function generatePetImage(
  pet: (typeof PET_LIST)[0],
  apiKey: string
): Promise<{ id: string; imageUrl?: string; error?: string }> {
  const rarityGlow: Record<string, string> = {
    common: 'simple clean',
    uncommon: 'slight glow effect',
    rare: 'soft magical aura',
    epic: 'purple mystical aura',
    legendary: 'golden legendary glow with sparkles',
  };

  const glow = rarityGlow[pet.rarity] || 'simple clean';

  const prompt = `Generate a Minecraft-style pixel art pet companion icon.

Subject: ${pet.name} - ${pet.description}
Mob Type: ${pet.mobType} mob from Minecraft

Style Requirements:
- Authentic Minecraft 8-bit/16-bit pixel art style
- Clean blocky pixels, no anti-aliasing
- ${glow}
- Cute chibi-like proportions (big head, small body)
- Pet shown as companion icon (like a buddy that follows player)
- Transparent or gradient dark background
- Single mob centered, facing slightly to the side
- Friendly expression (even for hostile mobs - make them look cute!)
- NO text, NO labels
- Sharp pixel edges
- Recognizable Minecraft mob aesthetic

Make it look like an adorable Minecraft pet companion!`;

  try {
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
      return { id: pet.id, error: `API error: ${response.status}` };
    }

    if (!imageData) {
      return { id: pet.id, error: 'No image in response' };
    }

    // Upload to Supabase
    const supabase = getSupabaseAdmin();
    const imageBuffer = Buffer.from(imageData, 'base64');
    const fileName = `pets/${pet.id}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { id: pet.id, error: `Upload failed: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);

    // Update pet record with image URL
    await supabase
      .from('pets')
      .update({ image_url: urlData.publicUrl })
      .eq('id', pet.id);

    return { id: pet.id, imageUrl: urlData.publicUrl };
  } catch (error) {
    return { id: pet.id, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startIndex = 0, count = 5 } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
    }

    const endIndex = Math.min(startIndex + count, PET_LIST.length);
    const petsToProcess = PET_LIST.slice(startIndex, endIndex);

    const results: Array<{ id: string; imageUrl?: string; error?: string }> = [];

    for (const pet of petsToProcess) {
      console.log(`Generating image for pet: ${pet.id}`);
      const result = await generatePetImage(pet, apiKey);
      results.push(result);

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: PET_LIST.length,
      nextIndex: endIndex < PET_LIST.length ? endIndex : null,
      results,
    });
  } catch (error) {
    console.error('Pet generation error:', error);
    return NextResponse.json({ error: 'Generation failed', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    totalPets: PET_LIST.length,
    pets: PET_LIST.map((p) => ({ id: p.id, name: p.name, rarity: p.rarity, mobType: p.mobType })),
    usage: {
      method: 'POST',
      body: { startIndex: 0, count: 5 },
      description: 'Generate pet images in batches',
    },
  });
}
