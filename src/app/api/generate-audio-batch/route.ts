import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  buildSyllableGuideRegistry,
  buildSyllablePronunciationRegistry,
  buildVocabularyRegistry,
  buildPhraseRegistry,
  buildDictationRegistry,
  buildMatchingRegistry,
  buildFullRegistry,
  getRegistryStats,
  type AudioItem,
  type AudioType,
  type Locale,
} from '@/lib/audio/registry';

/**
 * Batch Audio Generation API
 *
 * This endpoint generates TTS audio for all content in the registry,
 * with proper rate limiting to respect API quotas (7 RPM).
 *
 * Rate limit: 7 requests per minute = ~9 seconds between requests
 */

// Rate limiting configuration
// Paid Tier 1: Higher limits than free tier
const RATE_CONFIG = {
  requestsPerMinute: 60,       // Paid tier allows much higher RPM
  delayBetweenRequests: 1500,  // 1.5 seconds between requests
  maxRetries: 5,               // More retries for reliability
  retryDelay: 5000,            // 5 seconds on rate limit error
};

// Voice configuration per locale
const VOICE_CONFIG: Record<Locale, string> = {
  ms: 'Kore',   // Clear voice for Malay
  zh: 'Puck',   // Good for Mandarin
  en: 'Kore',   // Clear English
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTTSAudio(
  text: string,
  locale: Locale,
  apiKey: string,
  retryCount = 0
): Promise<{ audioData?: string; mimeType?: string; error?: string }> {
  const voice = VOICE_CONFIG[locale];

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

    // Handle rate limiting
    if (response.status === 429) {
      const errorBody = await response.text();
      console.log(`[TTS] Rate limit response: ${errorBody}`);
      if (retryCount < RATE_CONFIG.maxRetries) {
        const waitTime = RATE_CONFIG.retryDelay * (retryCount + 1); // Exponential backoff
        console.log(`[TTS] Rate limited, waiting ${waitTime}ms before retry ${retryCount + 1}`);
        await sleep(waitTime);
        return generateTTSAudio(text, locale, apiKey, retryCount + 1);
      }
      return { error: `Rate limit exceeded: ${errorBody.substring(0, 200)}` };
    }

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
): Promise<{ url?: string; relativePath?: string; error?: string }> {
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

  // Return both full URL and relative path (for database storage)
  return {
    url: urlData.publicUrl,
    relativePath: `/${fullPath}`, // Relative path for DB (prepend / for consistency)
  };
}

async function generateAndUploadAudio(
  item: AudioItem,
  apiKey: string,
  supabase: ReturnType<typeof getSupabaseAdmin> | null,
  dryRun: boolean
): Promise<{ id: string; success: boolean; url?: string; relativePath?: string; error?: string }> {
  if (dryRun) {
    console.log(`[DryRun] Would generate: "${item.text.substring(0, 50)}..." -> ${item.filePath}`);
    return { id: item.id, success: true, url: `(dry-run) ${item.filePath}` };
  }

  console.log(`[Audio] Generating: "${item.text.substring(0, 50)}..." -> ${item.filePath}`);

  if (!supabase) {
    return { id: item.id, success: false, error: 'Supabase client not configured' };
  }

  const ttsResult = await generateTTSAudio(item.text, item.locale, apiKey);
  if (ttsResult.error || !ttsResult.audioData) {
    return { id: item.id, success: false, error: ttsResult.error || 'No audio generated' };
  }

  const uploadResult = await uploadAudioToSupabase(
    supabase,
    ttsResult.audioData,
    ttsResult.mimeType!,
    item.filePath
  );

  if (uploadResult.error) {
    return { id: item.id, success: false, error: uploadResult.error };
  }

  return {
    id: item.id,
    success: true,
    url: uploadResult.url,
    relativePath: uploadResult.relativePath,
  };
}

// Get items for a specific category and locale
function getItemsByCategory(
  category: AudioType | 'all',
  locale: Locale | 'all'
): AudioItem[] {
  let items: AudioItem[] = [];

  // Get items by category
  switch (category) {
    case 'syllable_guide':
      items = buildSyllableGuideRegistry();
      break;
    case 'syllable_pronunciation':
      items = buildSyllablePronunciationRegistry();
      break;
    case 'vocabulary':
      items = buildVocabularyRegistry();
      break;
    case 'phrase':
      items = buildPhraseRegistry();
      break;
    case 'dictation':
      items = buildDictationRegistry();
      break;
    case 'matching':
      items = buildMatchingRegistry();
      break;
    case 'voice_guide':
      // Voice guides are the same as syllable guides for now
      items = buildSyllableGuideRegistry();
      break;
    case 'all':
      items = buildFullRegistry();
      break;
    default:
      items = [];
  }

  // Filter by locale if specified
  if (locale !== 'all') {
    items = items.filter(item => item.locale === locale);
  }

  return items;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category = 'all',
      locale = 'all',
      startIndex = 0,
      count = 5,
      dryRun = false,
    } = body as {
      category?: AudioType | 'all';
      locale?: Locale | 'all';
      startIndex?: number;
      count?: number;
      dryRun?: boolean;
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !dryRun) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
    }

    // Only create Supabase client when not in dry-run mode
    const supabase = dryRun ? null : getSupabaseAdmin();

    // Get items for the specified category and locale
    const allItems = getItemsByCategory(category, locale);

    if (allItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No audio items found for category: ${category}, locale: ${locale}`,
        total: 0,
      });
    }

    const endIndex = Math.min(startIndex + count, allItems.length);
    const itemsToProcess = allItems.slice(startIndex, endIndex);

    const results: Array<{
      id: string;
      success: boolean;
      url?: string;
      relativePath?: string;
      error?: string;
    }> = [];

    const startTime = Date.now();

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];

      const result = await generateAndUploadAudio(item, apiKey!, supabase, dryRun);
      results.push(result);

      // Rate limiting: wait between requests (except after the last one)
      if (i < itemsToProcess.length - 1 && !dryRun) {
        console.log(`[Rate Limit] Waiting ${RATE_CONFIG.delayBetweenRequests}ms before next request...`);
        await sleep(RATE_CONFIG.delayBetweenRequests);
      }
    }

    const elapsedTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    // Calculate estimated time remaining
    const itemsRemaining = allItems.length - endIndex;
    const avgTimePerItem = elapsedTime / itemsToProcess.length;
    const estimatedTimeRemaining = Math.ceil((itemsRemaining * avgTimePerItem) / 1000 / 60); // minutes

    return NextResponse.json({
      success: true,
      category,
      locale,
      processed: results.length,
      successCount,
      errorCount,
      total: allItems.length,
      nextIndex: endIndex < allItems.length ? endIndex : null,
      estimatedTimeRemaining: `${estimatedTimeRemaining} minutes`,
      elapsedTime: `${Math.round(elapsedTime / 1000)} seconds`,
      dryRun,
      results,
    });
  } catch (error) {
    console.error('Batch audio generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = getRegistryStats();

    // Get breakdown by category and locale
    const categories: Array<{
      category: AudioType | 'all';
      locale: Locale;
      count: number;
    }> = [];

    const locales: Locale[] = ['ms', 'zh', 'en'];
    const categoryTypes: AudioType[] = [
      'syllable_guide',
      'syllable_pronunciation',
      'vocabulary',
      'phrase',
      'dictation',
      'matching',
    ];

    for (const category of categoryTypes) {
      for (const locale of locales) {
        const items = getItemsByCategory(category, locale);
        categories.push({ category, locale, count: items.length });
      }
    }

    // Calculate estimated total time
    const totalItems = stats.total;
    const estimatedTimeMinutes = Math.ceil((totalItems * RATE_CONFIG.delayBetweenRequests) / 1000 / 60);

    return NextResponse.json({
      status: 'ready',
      registry: {
        total: stats.total,
        byType: stats.byType,
        byLocale: stats.byLocale,
      },
      categories,
      rateLimit: {
        requestsPerMinute: RATE_CONFIG.requestsPerMinute,
        delayBetweenRequests: `${RATE_CONFIG.delayBetweenRequests}ms`,
        estimatedTotalTime: `${estimatedTimeMinutes} minutes (~${Math.round(estimatedTimeMinutes / 60)} hours)`,
      },
      usage: {
        method: 'POST',
        body: {
          category: 'syllable_guide | syllable_pronunciation | vocabulary | phrase | dictation | matching | all',
          locale: 'ms | zh | en | all',
          startIndex: 0,
          count: 5,
          dryRun: false,
        },
        description: 'Generate audio clips in batches with rate limiting',
        example: {
          category: 'syllable_guide',
          locale: 'ms',
          startIndex: 0,
          count: 5,
          dryRun: true,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
