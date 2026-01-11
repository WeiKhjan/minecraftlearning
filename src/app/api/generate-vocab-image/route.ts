import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface GenerateVocabImageRequest {
  word: string;
  meaning_en: string;
  category?: string; // food, animal, object, place, person, action
}

// Create Supabase client with service role for admin operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { word, meaning_en, category = 'object' }: GenerateVocabImageRequest = await request.json();

    if (!word || !meaning_en) {
      return NextResponse.json({ error: 'Word and meaning_en are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Image generation not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    // Build prompt based on category for primary school educational images
    const categoryPrompts: Record<string, string> = {
      food: 'delicious appetizing food item on a clean plate or simple background',
      animal: 'cute friendly animal in a natural setting, child-friendly appearance',
      object: 'clear recognizable everyday object with simple background',
      place: 'colorful illustrated location/building, welcoming atmosphere',
      person: 'friendly cartoon character (not real person), diverse representation',
      action: 'simple illustration showing the action being performed',
      vehicle: 'colorful cartoon vehicle, child-friendly design',
      nature: 'beautiful natural element with vibrant colors',
      body: 'simple educational illustration of body part (appropriate for children)',
      clothing: 'colorful clothing item displayed clearly',
    };

    const categoryContext = categoryPrompts[category] || categoryPrompts.object;

    const prompt = `Generate an educational vocabulary flashcard image for Malaysian primary school children (ages 6-7).

===== SUBJECT =====
Word: "${word}" (Malay)
Meaning: "${meaning_en}" (English)
Category: ${category}

===== IMAGE REQUIREMENTS =====
- Show a clear, recognizable image of: ${meaning_en}
- Style: ${categoryContext}
- Bright, vibrant colors that appeal to young children
- Simple, clean composition with the subject as the main focus
- Cartoon/illustrated style (NOT photorealistic)
- Friendly and approachable aesthetic
- White or soft pastel gradient background for clarity
- NO text or labels in the image
- NO scary or inappropriate elements

===== ART STYLE =====
- Cute kawaii-inspired illustration style
- Soft rounded edges and shapes
- Cheerful and colorful palette
- Similar to children's educational books or apps
- High quality, professional illustration
- 2D flat design with subtle shading

===== COMPOSITION =====
- Subject centered in frame
- Object fills about 70% of the image
- Clear silhouette and recognizable shape
- Good contrast against background

This image will be used to teach vocabulary to young children - make it memorable, clear, and fun!`;

    // Use Gemini 2.5 Flash Image for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputOptions: {
              mimeType: 'image/png',
            },
          },
        }),
      }
    );

    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
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

      if (!altResponse.ok) {
        const errorText = await altResponse.text();
        console.error('Gemini image generation error:', errorText);
        return NextResponse.json(
          { error: 'Image generation failed', details: errorText },
          { status: 503 }
        );
      }

      const altData = await altResponse.json();

      // Extract image data from alternative response
      let imageData: string | null = null;
      let mimeType = 'image/png';

      const parts = altData.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }

      if (!imageData) {
        console.error('No image in alt response:', JSON.stringify(altData, null, 2));
        return NextResponse.json(
          { error: 'No image generated', code: 'NO_IMAGE' },
          { status: 503 }
        );
      }

      // Upload to Supabase
      return await uploadToSupabase(word, imageData, mimeType);
    }

    const data = await response.json();

    // Extract image from response
    const imageData = data.generatedImages?.[0]?.image?.imageBytes;

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'No image generated', code: 'NO_IMAGE' },
        { status: 503 }
      );
    }

    return await uploadToSupabase(word, imageData, 'image/png');
  } catch (error) {
    console.error('Vocab image generation error:', error);
    return NextResponse.json(
      { error: 'Image generation service error', details: String(error) },
      { status: 500 }
    );
  }
}

async function uploadToSupabase(word: string, imageData: string, mimeType: string) {
  const supabase = getSupabaseAdmin();

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(imageData, 'base64');
  const sanitizedWord = word.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const fileName = `vocab/${sanitizedWord}_${Date.now()}.png`;

  // Upload to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, imageBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    // Return base64 if storage fails
    return NextResponse.json({
      success: true,
      word,
      imageData: `data:${mimeType};base64,${imageData}`,
      stored: false,
      error: uploadError.message,
    });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return NextResponse.json({
    success: true,
    word,
    imageUrl: urlData.publicUrl,
    stored: true,
  });
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/generate-vocab-image',
    method: 'POST',
    body: {
      word: 'string (Malay word)',
      meaning_en: 'string (English meaning)',
      category: 'string (optional: food, animal, object, place, person, action, vehicle, nature, body, clothing)',
    },
  });
}
