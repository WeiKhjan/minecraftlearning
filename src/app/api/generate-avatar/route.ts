import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface GenerateAvatarRequest {
  kidId: string;
  avatarFace: string;
  equipment: {
    helmet?: { name: string; tier: string } | null;
    chestplate?: { name: string; tier: string } | null;
    leggings?: { name: string; tier: string } | null;
    boots?: { name: string; tier: string } | null;
    weapon?: { name: string; tier: string } | null;
  };
}

// Map emoji faces to descriptive expressions
const faceDescriptions: Record<string, string> = {
  '😊': 'warm friendly smile with rosy cheeks and sparkling happy eyes',
  '😄': 'big cheerful grin showing excitement and joy',
  '😎': 'cool confident expression with a slight smirk',
  '🤩': 'amazed starry-eyed expression full of wonder',
  '😁': 'wide beaming smile radiating happiness',
  '🥳': 'celebratory excited face ready for adventure',
  '😃': 'bright enthusiastic smile with wide eyes',
  '🙂': 'gentle pleasant smile, calm and friendly',
  '😺': 'playful cat-like smile, mischievous and cute',
  '🦊': 'clever fox-like expression, smart and adventurous',
  '🐱': 'cute kitty face with whiskers and button nose',
  '🐶': 'adorable puppy-like face, loyal and eager',
};

// Equipment tier visual descriptions
const tierVisuals: Record<string, { material: string; glow: string; quality: string }> = {
  leather: {
    material: 'warm brown leather with visible stitching',
    glow: 'subtle warm brown tones',
    quality: 'rustic beginner adventurer',
  },
  chain: {
    material: 'interlocking silver metal rings with metallic sheen',
    glow: 'cool silver metallic reflections',
    quality: 'experienced fighter',
  },
  iron: {
    material: 'polished steel plates with rivets and shine',
    glow: 'bright metallic silver gleam',
    quality: 'strong warrior',
  },
  gold: {
    material: 'luxurious golden metal with ornate engravings',
    glow: 'radiant golden aura and sparkles',
    quality: 'royal champion',
  },
  diamond: {
    material: 'crystalline blue diamond with magical shimmer',
    glow: 'magical cyan/blue particles and ethereal glow',
    quality: 'legendary hero',
  },
};

// Weapon descriptions by tier
const weaponVisuals: Record<string, string> = {
  leather: 'simple wooden sword with leather-wrapped handle',
  chain: 'stone blade sword with metal guard',
  iron: 'gleaming iron sword with cross-guard',
  gold: 'ornate golden sword with jeweled hilt',
  diamond: 'legendary diamond sword glowing with magical energy',
};

export async function POST(request: NextRequest) {
  try {
    const { kidId, avatarFace, equipment }: GenerateAvatarRequest = await request.json();

    if (!kidId) {
      return NextResponse.json({ error: 'Kid ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify kid ownership
    const { data: kid, error: kidError } = await supabase
      .from('kids')
      .select('*')
      .eq('id', kidId)
      .eq('parent_id', user.id)
      .single();

    if (kidError || !kid) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Avatar generation not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    // Build dynamic face description
    const faceDesc = faceDescriptions[avatarFace] ||
      (avatarFace ? `expressive face showing "${avatarFace}" emotion` : 'friendly smiling face with bright eyes');

    // Build detailed equipment descriptions
    const equipmentParts: string[] = [];
    const tiers: string[] = [];

    if (equipment.helmet) {
      const tier = equipment.helmet.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`HEAD: ${visual.material} helmet protecting the head`);
    }

    if (equipment.chestplate) {
      const tier = equipment.chestplate.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`CHEST: ${visual.material} chestplate armor covering torso`);
    }

    if (equipment.leggings) {
      const tier = equipment.leggings.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`LEGS: ${visual.material} leggings protecting the legs`);
    }

    if (equipment.boots) {
      const tier = equipment.boots.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`FEET: ${visual.material} boots on the feet`);
    }

    if (equipment.weapon) {
      const tier = equipment.weapon.tier;
      tiers.push(tier);
      equipmentParts.push(`WEAPON: ${weaponVisuals[tier]} held in right hand`);
    }

    // Determine highest tier for overall theme
    const tierRank = ['leather', 'chain', 'iron', 'gold', 'diamond'];
    const highestTier = tiers.length > 0
      ? tiers.reduce((a, b) => tierRank.indexOf(a) > tierRank.indexOf(b) ? a : b)
      : 'leather';

    const themeVisual = tierVisuals[highestTier];
    const hasEquipment = equipmentParts.length > 0;

    // Dynamic background based on tier
    const backgrounds: Record<string, string> = {
      leather: 'sunny grass field with blue sky, peaceful village vibe',
      chain: 'stone castle courtyard with training dummies',
      iron: 'mountain fortress with snow peaks in distance',
      gold: 'royal palace garden with golden sunlight',
      diamond: 'magical floating islands with aurora borealis, mystical particles',
    };

    // Build the dynamic prompt
    const prompt = `Generate a stunning 3D Minecraft-style character avatar!

===== CHARACTER FACE =====
${faceDesc}
The face should clearly show this expression - it's very important for the character's personality!

===== EQUIPMENT (MUST MATCH EXACTLY) =====
${hasEquipment ? equipmentParts.join('\n') : 'No armor equipped - wearing simple villager clothes (brown shirt, blue pants)'}

${hasEquipment ? `Overall appearance: ${themeVisual.quality} with ${themeVisual.glow}` : 'Simple but cheerful village kid look'}

===== UNEQUIPPED BODY PARTS =====
${!equipment.helmet ? '- HEAD: Show the character\'s face and hair clearly (no helmet)' : ''}
${!equipment.chestplate ? '- CHEST: Simple colored shirt/tunic' : ''}
${!equipment.leggings ? '- LEGS: Basic blue pants like Steve' : ''}
${!equipment.boots ? '- FEET: Simple brown shoes' : ''}

===== 3D ART STYLE (CRITICAL) =====
- Authentic Minecraft blocky/cubic body: square head, rectangular torso, blocky limbs
- HIGH QUALITY 3D RENDER with ray-traced lighting
- Smooth surfaces with realistic reflections on armor/equipment
- Vibrant saturated colors
- Soft shadows and ambient occlusion
- ${hasEquipment && (highestTier === 'gold' || highestTier === 'diamond') ? 'Add magical particle effects and glow around equipment' : 'Clean polished look'}

===== COMPOSITION =====
- 3/4 angle view showing character depth
- Full body visible, heroic standing pose
- Background: ${backgrounds[highestTier]}
- Rim lighting to make character pop
- Character should fill most of the frame

===== MOOD =====
This is for a children's educational game - make the character look like an AWESOME hero that kids would want to be!
${hasEquipment ? `This ${themeVisual.quality} is ready for learning adventures!` : 'A brave young adventurer starting their journey!'}`;

    // Use Gemini 2.5 Flash Image model for image generation
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini avatar generation error:', errorText);
      return NextResponse.json(
        { error: 'Avatar generation failed', details: errorText },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Extract image data from response
    let imageData: string | null = null;
    let mimeType = 'image/png';

    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'No avatar image generated', code: 'NO_IMAGE' },
        { status: 503 }
      );
    }

    // Convert base64 to buffer for upload
    const imageBuffer = Buffer.from(imageData, 'base64');
    const fileName = `avatar_${kidId}_${Date.now()}.png`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      // Return the base64 image anyway if storage fails
      return NextResponse.json({
        success: true,
        imageData: `data:${mimeType};base64,${imageData}`,
        stored: false,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update kid record with new avatar URL
    const { error: updateError } = await supabase
      .from('kids')
      .update({ generated_avatar_url: avatarUrl })
      .eq('id', kidId);

    if (updateError) {
      console.error('Update kid avatar error:', updateError);
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      stored: true,
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Avatar generation service error' },
      { status: 500 }
    );
  }
}
