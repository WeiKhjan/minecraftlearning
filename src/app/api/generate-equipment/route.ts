import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// All equipment pieces: 5 tiers × 5 pieces = 25 items
const EQUIPMENT_LIST = [
  // Leather Tier
  { id: 'leather_helmet', tier: 'leather', piece: 'helmet', color: 'brown leather' },
  { id: 'leather_chestplate', tier: 'leather', piece: 'chestplate', color: 'brown leather' },
  { id: 'leather_leggings', tier: 'leather', piece: 'leggings', color: 'brown leather' },
  { id: 'leather_boots', tier: 'leather', piece: 'boots', color: 'brown leather' },
  { id: 'wooden_sword', tier: 'leather', piece: 'sword', color: 'wooden' },

  // Chain Tier
  { id: 'chain_helmet', tier: 'chain', piece: 'helmet', color: 'silver chainmail' },
  { id: 'chain_chestplate', tier: 'chain', piece: 'chestplate', color: 'silver chainmail' },
  { id: 'chain_leggings', tier: 'chain', piece: 'leggings', color: 'silver chainmail' },
  { id: 'chain_boots', tier: 'chain', piece: 'boots', color: 'silver chainmail' },
  { id: 'stone_sword', tier: 'chain', piece: 'sword', color: 'grey stone' },

  // Iron Tier
  { id: 'iron_helmet', tier: 'iron', piece: 'helmet', color: 'shiny silver iron' },
  { id: 'iron_chestplate', tier: 'iron', piece: 'chestplate', color: 'shiny silver iron' },
  { id: 'iron_leggings', tier: 'iron', piece: 'leggings', color: 'shiny silver iron' },
  { id: 'iron_boots', tier: 'iron', piece: 'boots', color: 'shiny silver iron' },
  { id: 'iron_sword', tier: 'iron', piece: 'sword', color: 'shiny silver iron' },

  // Gold Tier
  { id: 'gold_helmet', tier: 'gold', piece: 'helmet', color: 'shiny golden' },
  { id: 'gold_chestplate', tier: 'gold', piece: 'chestplate', color: 'shiny golden' },
  { id: 'gold_leggings', tier: 'gold', piece: 'leggings', color: 'shiny golden' },
  { id: 'gold_boots', tier: 'gold', piece: 'boots', color: 'shiny golden' },
  { id: 'gold_sword', tier: 'gold', piece: 'sword', color: 'shiny golden' },

  // Diamond Tier
  { id: 'diamond_helmet', tier: 'diamond', piece: 'helmet', color: 'glowing cyan diamond' },
  { id: 'diamond_chestplate', tier: 'diamond', piece: 'chestplate', color: 'glowing cyan diamond' },
  { id: 'diamond_leggings', tier: 'diamond', piece: 'leggings', color: 'glowing cyan diamond' },
  { id: 'diamond_boots', tier: 'diamond', piece: 'boots', color: 'glowing cyan diamond' },
  { id: 'diamond_sword', tier: 'diamond', piece: 'sword', color: 'glowing cyan diamond' },
];

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function generateEquipmentImage(
  equipment: (typeof EQUIPMENT_LIST)[0],
  apiKey: string
): Promise<{ id: string; imageUrl?: string; error?: string }> {
  const pieceDescriptions: Record<string, string> = {
    helmet: 'armor helmet/cap that covers the head',
    chestplate: 'armor chestplate/body armor that covers torso',
    leggings: 'armor leggings/pants that cover legs',
    boots: 'armor boots/shoes that cover feet',
    sword: 'sword weapon with handle and blade',
  };

  const pieceDesc = pieceDescriptions[equipment.piece];

  const prompt = `Generate a Minecraft-style pixel art equipment icon.

Subject: ${equipment.color} ${equipment.piece}
Description: ${pieceDesc}

Style Requirements:
- Authentic Minecraft 8-bit/16-bit pixel art style
- Clean blocky pixels, no anti-aliasing
- ${equipment.color} color palette
- Item shown as inventory icon (like in Minecraft inventory)
- Transparent or solid dark background
- Single item centered, filling 80% of frame
- NO text, NO labels
- Sharp pixel edges
- Recognizable Minecraft aesthetic

Make it look exactly like a Minecraft game inventory icon!`;

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
      return { id: equipment.id, error: `API error: ${response.status}` };
    }

    if (!imageData) {
      return { id: equipment.id, error: 'No image in response' };
    }

    // Upload to Supabase
    const supabase = getSupabaseAdmin();
    const imageBuffer = Buffer.from(imageData, 'base64');
    const fileName = `equipment/${equipment.id}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { id: equipment.id, error: `Upload failed: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);

    return { id: equipment.id, imageUrl: urlData.publicUrl };
  } catch (error) {
    return { id: equipment.id, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startIndex = 0, count = 5 } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
    }

    const endIndex = Math.min(startIndex + count, EQUIPMENT_LIST.length);
    const itemsToProcess = EQUIPMENT_LIST.slice(startIndex, endIndex);

    const results: Array<{ id: string; imageUrl?: string; error?: string }> = [];

    for (const equipment of itemsToProcess) {
      console.log(`Generating image for: ${equipment.id}`);
      const result = await generateEquipmentImage(equipment, apiKey);
      results.push(result);

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: EQUIPMENT_LIST.length,
      nextIndex: endIndex < EQUIPMENT_LIST.length ? endIndex : null,
      results,
    });
  } catch (error) {
    console.error('Equipment generation error:', error);
    return NextResponse.json({ error: 'Generation failed', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    totalItems: EQUIPMENT_LIST.length,
    equipment: EQUIPMENT_LIST.map((e) => ({ id: e.id, tier: e.tier, piece: e.piece })),
    usage: {
      method: 'POST',
      body: { startIndex: 0, count: 5 },
      description: 'Generate equipment images in batches',
    },
  });
}
