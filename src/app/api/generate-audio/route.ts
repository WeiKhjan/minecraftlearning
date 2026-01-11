import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Voice configuration per locale
const VOICE_CONFIG: Record<string, string> = {
  ms: 'Kore',
  zh: 'Puck',
  en: 'Kore',
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function generateTTSAudio(
  text: string,
  locale: string,
  apiKey: string
): Promise<{ audioData?: string; mimeType?: string; error?: string }> {
  const voice = VOICE_CONFIG[locale] || VOICE_CONFIG.ms;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] API error:', errorText);
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mp3';

    if (!audioData) {
      return { error: 'No audio in response' };
    }

    return { audioData, mimeType };
  } catch (error) {
    return { error: String(error) };
  }
}

async function uploadAudioToSupabase(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  audioData: string,
  mimeType: string,
  filePath: string
): Promise<{ url?: string; error?: string }> {
  const audioBuffer = Buffer.from(audioData, 'base64');
  const extension = mimeType.includes('mp3') ? 'mp3' : 'wav';
  const fullPath = `${filePath}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('audio')
    .upload(fullPath, audioBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fullPath);
  return { url: urlData.publicUrl };
}

// Generate audio for a single text item
async function generateAndUploadAudio(
  text: string,
  locale: string,
  filePath: string,
  apiKey: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<{ text: string; filePath: string; url?: string; error?: string }> {
  console.log(`[Audio] Generating: "${text}" -> ${filePath}`);

  const ttsResult = await generateTTSAudio(text, locale, apiKey);
  if (ttsResult.error || !ttsResult.audioData) {
    return { text, filePath, error: ttsResult.error || 'No audio generated' };
  }

  const uploadResult = await uploadAudioToSupabase(
    supabase,
    ttsResult.audioData,
    ttsResult.mimeType!,
    filePath
  );

  if (uploadResult.error) {
    return { text, filePath, error: uploadResult.error };
  }

  return { text, filePath, url: uploadResult.url };
}

// Extract all text items that need TTS from activities
interface AudioItem {
  activityId: string;
  activityTitle: string;
  text: string;
  locale: string;
  filePath: string;
  type: 'speaking' | 'syllable' | 'dictation';
  index: number;
}

async function getAllAudioItems(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<AudioItem[]> {
  const items: AudioItem[] = [];

  // Fetch all activities
  const { data: activities, error } = await supabase
    .from('activities')
    .select('id, type, title_ms, content')
    .in('type', ['speaking', 'syllable', 'dictation']);

  if (error || !activities) {
    console.error('Error fetching activities:', error);
    return items;
  }

  for (const activity of activities) {
    const content = activity.content as { type: string; data: Record<string, unknown> };
    const data = content?.data;
    if (!data) continue;

    // Speaking activities - phrases
    if (activity.type === 'speaking' && Array.isArray(data.phrases)) {
      for (let i = 0; i < data.phrases.length; i++) {
        const phrase = data.phrases[i] as { text: string };
        if (phrase.text) {
          items.push({
            activityId: activity.id,
            activityTitle: activity.title_ms,
            text: phrase.text,
            locale: 'ms', // Speaking lessons are typically in Malay
            filePath: `speaking/${activity.id}/${i}`,
            type: 'speaking',
            index: i,
          });
        }
      }
    }

    // Syllable activities - syllables array
    if (activity.type === 'syllable' && Array.isArray(data.syllables)) {
      for (let i = 0; i < data.syllables.length; i++) {
        const syllable = data.syllables[i] as string;
        if (syllable) {
          items.push({
            activityId: activity.id,
            activityTitle: activity.title_ms,
            text: syllable,
            locale: 'ms', // Syllables are Malay suku kata
            filePath: `syllable/${activity.id}/${i}`,
            type: 'syllable',
            index: i,
          });
        }
      }
    }

    // Dictation activities - words array
    if (activity.type === 'dictation' && Array.isArray(data.words)) {
      for (let i = 0; i < data.words.length; i++) {
        const word = data.words[i] as { word: string };
        if (word.word) {
          items.push({
            activityId: activity.id,
            activityTitle: activity.title_ms,
            text: word.word,
            locale: 'ms', // Dictation words are typically in Malay
            filePath: `dictation/${activity.id}/${i}`,
            type: 'dictation',
            index: i,
          });
        }
      }
    }
  }

  return items;
}

// Update activity content with audio URL
async function updateActivityWithAudioUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  item: AudioItem,
  audioUrl: string
): Promise<void> {
  // Fetch current activity content
  const { data: activity, error: fetchError } = await supabase
    .from('activities')
    .select('content')
    .eq('id', item.activityId)
    .single();

  if (fetchError || !activity) {
    console.error(`[Audio] Failed to fetch activity ${item.activityId}:`, fetchError);
    return;
  }

  const content = activity.content as { type: string; data: Record<string, unknown> };
  const data = content.data;

  // Update the appropriate field based on activity type
  if (item.type === 'speaking' && Array.isArray(data.phrases)) {
    (data.phrases[item.index] as Record<string, unknown>).audio_url = audioUrl;
  } else if (item.type === 'syllable') {
    if (!Array.isArray(data.audio_urls)) {
      data.audio_urls = [];
    }
    (data.audio_urls as string[])[item.index] = audioUrl;
  } else if (item.type === 'dictation' && Array.isArray(data.words)) {
    (data.words[item.index] as Record<string, unknown>).audio_url = audioUrl;
  }

  // Save updated content
  const { error: updateError } = await supabase
    .from('activities')
    .update({ content })
    .eq('id', item.activityId);

  if (updateError) {
    console.error(`[Audio] Failed to update activity ${item.activityId}:`, updateError);
  } else {
    console.log(`[Audio] Updated activity ${item.activityId} with audio URL`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startIndex = 0, count = 5 } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
    }

    const supabase = getSupabaseAdmin();

    // Get all audio items
    const allItems = await getAllAudioItems(supabase);

    if (allItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No audio items found to generate',
        total: 0,
      });
    }

    const endIndex = Math.min(startIndex + count, allItems.length);
    const itemsToProcess = allItems.slice(startIndex, endIndex);

    const results: Array<{ text: string; filePath: string; url?: string; error?: string }> = [];

    for (const item of itemsToProcess) {
      const result = await generateAndUploadAudio(
        item.text,
        item.locale,
        item.filePath,
        apiKey,
        supabase
      );
      results.push(result);

      // Update activity content with the audio URL
      if (result.url) {
        await updateActivityWithAudioUrl(supabase, item, result.url);
      }

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: allItems.length,
      nextIndex: endIndex < allItems.length ? endIndex : null,
      results,
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json({ error: 'Generation failed', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const allItems = await getAllAudioItems(supabase);

    // Group by activity type
    const byType = {
      speaking: allItems.filter((i) => i.type === 'speaking'),
      syllable: allItems.filter((i) => i.type === 'syllable'),
      dictation: allItems.filter((i) => i.type === 'dictation'),
    };

    return NextResponse.json({
      status: 'ready',
      totalItems: allItems.length,
      breakdown: {
        speaking: byType.speaking.length,
        syllable: byType.syllable.length,
        dictation: byType.dictation.length,
      },
      items: allItems.map((i) => ({
        activityId: i.activityId,
        activityTitle: i.activityTitle,
        type: i.type,
        text: i.text,
        filePath: i.filePath,
      })),
      usage: {
        method: 'POST',
        body: { startIndex: 0, count: 5 },
        description: 'Generate audio clips in batches',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
