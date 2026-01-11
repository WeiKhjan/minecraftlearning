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
      : 'simple casual clothes';

    // Generate avatar using Gemini with image generation
    const prompt = `Create a cute, child-friendly Minecraft-style pixel art character avatar.

Character details:
- Face/expression: ${avatarFace || 'happy smiling face'}
- Equipment: ${equipmentString}
- Style: Blocky Minecraft aesthetic, pixel art style, cute and friendly for children
- Background: Simple solid color or gradient, suitable for a profile picture
- Character should be standing and facing forward
- Full body visible but focused on upper body
- Bright, vibrant colors appropriate for a learning game

Make it look like a friendly adventure character for a children's educational app.`;

    // Use Gemini 2.0 Flash with image generation capability
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
