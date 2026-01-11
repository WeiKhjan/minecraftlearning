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

    // Build description of equipment
    const equipmentDesc: string[] = [];
    if (equipment.helmet) {
      equipmentDesc.push(`${equipment.helmet.tier} helmet`);
    }
    if (equipment.chestplate) {
      equipmentDesc.push(`${equipment.chestplate.tier} chestplate/armor`);
    }
    if (equipment.leggings) {
      equipmentDesc.push(`${equipment.leggings.tier} leggings/pants`);
    }
    if (equipment.boots) {
      equipmentDesc.push(`${equipment.boots.tier} boots`);
    }
    if (equipment.weapon) {
      equipmentDesc.push(`${equipment.weapon.tier} sword/weapon in hand`);
    }

    const equipmentString = equipmentDesc.length > 0
      ? equipmentDesc.join(', ')
      : 'simple Steve-like default outfit';

    // Build tier color description for equipment
    const tierColors: Record<string, string> = {
      leather: 'brown leather',
      chain: 'silver chainmail',
      iron: 'shiny silver iron',
      gold: 'gleaming golden',
      diamond: 'sparkling blue diamond',
    };

    const coloredEquipment = equipmentDesc.map(desc => {
      for (const [tier, color] of Object.entries(tierColors)) {
        if (desc.includes(tier)) {
          return desc.replace(tier, color);
        }
      }
      return desc;
    }).join(', ');

    // Generate avatar using Gemini with image generation - 3D Minecraft style prompt
    const prompt = `Create a stunning 3D rendered Minecraft-style character avatar that kids will love!

CHARACTER DESIGN:
- Face: ${avatarFace || 'cute happy smiling face with big friendly eyes'}
- Equipment: ${coloredEquipment || 'classic Steve outfit'}
- Body: Iconic Minecraft blocky/cubic body shape with cube head, rectangular body and limbs

ART STYLE (VERY IMPORTANT):
- 3D rendered look with soft lighting and gentle shadows
- Minecraft's signature blocky/voxel aesthetic but with modern 3D rendering
- Smooth, polished surfaces with slight reflections
- Vibrant, saturated colors that pop
- Cute chibi-like proportions (slightly bigger head) to appeal to children
- Friendly, approachable character expression

COMPOSITION:
- Character standing in a heroic but friendly pose
- Upper body focus, showing head and torso clearly
- Slight angle (3/4 view) to show depth and 3D effect
- Clean, simple gradient background (sky blue to light blue)
- Soft glow or rim lighting around the character

MOOD: Fun, adventurous, friendly, perfect for a children's educational learning game. The character should look like a brave little hero ready for learning adventures!`;

    // Use Gemini 2.0 Flash experimental with image generation capability
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
