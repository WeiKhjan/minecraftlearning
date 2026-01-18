import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tier color configurations for image generation prompts
const TIER_CONFIGS: Record<string, { color: string; effects: string }> = {
  // Classic Tiers
  wood: { color: 'brown wooden', effects: 'natural wood grain texture' },
  leather: { color: 'brown leather', effects: 'leather texture with stitching' },
  stone: { color: 'grey stone', effects: 'rough cobblestone texture' },
  chain: { color: 'silver chainmail', effects: 'interlocking metal rings' },
  iron: { color: 'shiny silver iron', effects: 'polished metal with rivets' },
  gold: { color: 'shiny golden', effects: 'ornate golden engravings' },
  diamond: { color: 'glowing cyan diamond', effects: 'crystalline facets with shimmer' },
  netherite: { color: 'dark grey-black netherite', effects: 'dark metal with red accents from the nether' },
  // Enchanted Tiers
  enchanted_iron: { color: 'silver iron with purple glow', effects: 'magical purple shimmer particles' },
  enchanted_gold: { color: 'golden with purple glow', effects: 'magical purple shimmer particles' },
  enchanted_diamond: { color: 'cyan diamond with purple glow', effects: 'magical sparkles and enchantment glow' },
  enchanted_netherite: { color: 'dark netherite with purple flames', effects: 'dark magical flames and glow' },
  seafoam: { color: 'teal-green seafoam', effects: 'ocean-themed with aquatic shimmer' },
  amethyst: { color: 'purple amethyst crystal', effects: 'crystalline purple glow' },
  // Elemental Tiers
  blaze: { color: 'orange-red blazing fire', effects: 'fire particles and flames' },
  frost: { color: 'light blue ice', effects: 'ice crystals and frost particles' },
  storm: { color: 'yellow-purple storm', effects: 'lightning bolts and electric sparks' },
  emerald: { color: 'bright green emerald', effects: 'rich green gem facets' },
  obsidian: { color: 'black obsidian', effects: 'dark volcanic glass with purple portal energy' },
  crimsonite: { color: 'glowing red crimsonite', effects: 'glowing red circuit patterns' },
  lapis: { color: 'deep blue lapis lazuli', effects: 'magical blue enchantment energy' },
  luminite: { color: 'bright yellow luminite', effects: 'luminous glowing particles' },
  // Mythic Tiers
  voidstone: { color: 'dark purple voidstone', effects: 'teleportation particles and void energy' },
  dragonscale: { color: 'purple-green dragon scale', effects: 'dragon scale texture with wings motif' },
  darkbone: { color: 'black-grey darkbone', effects: 'dark smoke and decay particles' },
  phoenix: { color: 'orange-gold phoenix flame', effects: 'rebirth flames and feather patterns' },
  titan: { color: 'bronze-brown titan', effects: 'giant runes and ancient power' },
  shadow: { color: 'dark black shadow', effects: 'shadow wisps and void energy' },
  radiant: { color: 'bright white-gold radiant', effects: 'holy light rays and divine glow' },
  ancient: { color: 'brown-gold ancient', effects: 'ancient runes and weathered metal' },
  celestial: { color: 'dark blue-silver celestial', effects: 'stars and moon patterns' },
  void: { color: 'pure black void', effects: 'dimensional rift and space particles' },
  // Ultimate Tiers
  heroic: { color: 'crimson-gold heroic', effects: 'champion banner patterns and valor' },
  mythical: { color: 'purple-gold mythical', effects: 'legendary aura and artifact glow' },
  immortal: { color: 'green-white immortal', effects: 'eternal life energy and regeneration' },
  divine: { color: 'pure white-gold divine', effects: 'godly halo and holy blessing' },
  cosmic: { color: 'dark blue-pink cosmic', effects: 'galaxy patterns and nebula energy' },
  eternal: { color: 'silver-gold eternal', effects: 'timeless shimmer and endless power' },
  ascended: { color: 'light blue-white ascended', effects: 'transcendent glow and heavenly aura' },
  supreme: { color: 'red-black supreme', effects: 'ultimate power and dominant aura' },
  omega: { color: 'black-red omega', effects: 'final form energy and omega symbol' },
  infinity: { color: 'rainbow prismatic infinity', effects: 'RAINBOW shifting colors and infinite power aura' },
};

// Piece descriptions for image generation
const PIECE_DESCRIPTIONS: Record<string, string> = {
  helmet: 'armor helmet that covers the head',
  chestplate: 'armor chestplate/body armor that covers torso',
  leggings: 'armor leggings/pants that cover legs',
  boots: 'armor boots/shoes that cover feet',
  weapon: 'sword weapon with handle and blade',
  tool: 'mining pickaxe tool with handle and pointed head',
  ranged: 'bow or crossbow ranged weapon with string',
  shield: 'defensive shield with face design',
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface EquipmentItem {
  id: string;
  name: string;
  tier: string;
  slot: string;
  color_primary: string | null;
  color_secondary: string | null;
}

async function generateEquipmentImage(
  equipment: EquipmentItem,
  apiKey: string
): Promise<{ id: string; name: string; imageUrl?: string; error?: string }> {
  const tierConfig = TIER_CONFIGS[equipment.tier] || { color: equipment.tier, effects: '' };
  const pieceDesc = PIECE_DESCRIPTIONS[equipment.slot] || equipment.slot;

  // Build color description
  let colorDesc = tierConfig.color;
  if (equipment.color_primary) {
    colorDesc = `${equipment.color_primary} and ${equipment.color_secondary || equipment.color_primary} colored`;
  }

  const prompt = `Generate an 8-bit warrior RPG style pixel art equipment icon.

Subject: ${equipment.name}
Type: ${colorDesc} ${equipment.slot}
Description: ${pieceDesc}

Style Requirements:
- Authentic 8-bit/16-bit pixel art style (classic RPG aesthetic)
- Clean blocky pixels, no anti-aliasing
- ${tierConfig.color} color palette
- ${tierConfig.effects}
- Item shown as inventory icon (like in classic fantasy RPG games)
- Transparent or solid dark background
- Single item centered, filling 80% of frame
- NO text, NO labels
- Sharp pixel edges
- Classic 8-bit fantasy warrior RPG aesthetic

Make it look like a classic 8-bit fantasy warrior RPG inventory icon!`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
      return { id: equipment.id, name: equipment.name, error: `API error: ${response.status}` };
    }

    if (!imageData) {
      return { id: equipment.id, name: equipment.name, error: 'No image in response' };
    }

    // Upload to Supabase
    const supabase = getSupabaseAdmin();
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Create filename from tier and slot
    const fileName = `equipment/${equipment.tier}_${equipment.slot}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { id: equipment.id, name: equipment.name, error: `Upload failed: ${uploadError.message}` };
    }

    // Update the equipment record with the image URL
    const imageUrl = `/equipment/${equipment.tier}_${equipment.slot}.png`;
    const { error: updateError } = await supabase
      .from('equipment')
      .update({ image_url: imageUrl })
      .eq('id', equipment.id);

    if (updateError) {
      console.error('Failed to update equipment record:', updateError);
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);

    return { id: equipment.id, name: equipment.name, imageUrl: urlData.publicUrl };
  } catch (error) {
    return { id: equipment.id, name: equipment.name, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startIndex = 0, count = 5, unitStart, unitEnd } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch equipment from database
    let query = supabase
      .from('equipment')
      .select('id, name, tier, slot, color_primary, color_secondary, unit_number')
      .order('unit_number', { ascending: true })
      .order('slot', { ascending: true });

    // Filter by unit range if specified
    if (unitStart !== undefined && unitEnd !== undefined) {
      query = query.gte('unit_number', unitStart).lte('unit_number', unitEnd);
    }

    const { data: equipmentList, error: fetchError } = await query;

    if (fetchError || !equipmentList) {
      return NextResponse.json({ error: 'Failed to fetch equipment list' }, { status: 500 });
    }

    const endIndex = Math.min(startIndex + count, equipmentList.length);
    const itemsToProcess = equipmentList.slice(startIndex, endIndex);

    const results: Array<{ id: string; name: string; imageUrl?: string; error?: string }> = [];

    for (const equipment of itemsToProcess) {
      console.log(`Generating image for: ${equipment.name} (${equipment.tier} ${equipment.slot})`);
      const result = await generateEquipmentImage(equipment, apiKey);
      results.push(result);

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: equipmentList.length,
      nextIndex: endIndex < equipmentList.length ? endIndex : null,
      results,
    });
  } catch (error) {
    console.error('Equipment generation error:', error);
    return NextResponse.json({ error: 'Generation failed', details: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const unitStart = searchParams.get('unitStart');
  const unitEnd = searchParams.get('unitEnd');

  let query = supabase
    .from('equipment')
    .select('id, name, tier, slot, unit_number, image_url')
    .order('unit_number', { ascending: true })
    .order('slot', { ascending: true });

  if (unitStart && unitEnd) {
    query = query.gte('unit_number', parseInt(unitStart)).lte('unit_number', parseInt(unitEnd));
  }

  const { data: equipmentList, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }

  const withImages = equipmentList?.filter(e => e.image_url) || [];
  const withoutImages = equipmentList?.filter(e => !e.image_url) || [];

  return NextResponse.json({
    status: 'ready',
    totalItems: equipmentList?.length || 0,
    withImages: withImages.length,
    needsImages: withoutImages.length,
    equipment: equipmentList?.map((e) => ({
      id: e.id,
      name: e.name,
      tier: e.tier,
      slot: e.slot,
      unit: e.unit_number,
      hasImage: !!e.image_url,
    })),
    usage: {
      method: 'POST',
      body: {
        startIndex: 0,
        count: 5,
        unitStart: 1,  // Optional: filter by unit range
        unitEnd: 10,   // Optional: filter by unit range
      },
      description: 'Generate equipment images in batches. Use unitStart/unitEnd to filter by unit.',
    },
  });
}
