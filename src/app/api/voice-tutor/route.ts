import { NextRequest, NextResponse } from 'next/server';

// Voice names for Gemini 2.5 TTS
const VOICE_CONFIG = {
  ms: 'Aoede', // Good for Malay
  zh: 'Puck',  // Good for Mandarin
  en: 'Kore',  // Clear English
};

// Language-specific system prompts for generating tutoring text
const TUTOR_PROMPTS = {
  ms: `Anda adalah guru yang mesra untuk kanak-kanak sekolah rendah Malaysia.
Beri penerangan ringkas dan mudah difahami. Gunakan bahasa yang ceria dan menggalakkan.
Jangan gunakan format markdown atau simbol khas. Hanya teks biasa untuk dibaca dengan kuat.`,

  zh: `你是一位友善的马来西亚小学教师。
用简单易懂的语言解释。使用活泼鼓励的语气。
不要使用markdown格式或特殊符号。只用可以朗读的纯文本。`,

  en: `You are a friendly tutor for Malaysian primary school children.
Give brief, easy-to-understand explanations. Use cheerful and encouraging language.
Do not use markdown formatting or special symbols. Only plain text that can be read aloud.`,
};

interface VoiceTutorRequest {
  // The content to teach about (letter, word, concept, etc.)
  content: string;
  // Type of content for context
  contentType: 'letter' | 'word' | 'syllable' | 'sentence' | 'instruction' | 'feedback';
  // Additional context (e.g., activity name, subject)
  context?: string;
  // Locale for language
  locale?: 'ms' | 'zh' | 'en';
  // Optional: skip AI generation and just do TTS on provided text
  directTTS?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceTutorRequest = await request.json();
    const { content, contentType, context, locale = 'ms', directTTS = false } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Voice tutor not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    let textToSpeak: string;

    // Layer 1: Generate tutoring text (unless directTTS is true)
    if (directTTS) {
      // Skip AI generation, use content directly for TTS
      textToSpeak = content;
    } else {
      // Generate educational guidance text using Gemini
      const tutorPrompt = generateTutorPrompt(content, contentType, context, locale);

      const textResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: tutorPrompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: TUTOR_PROMPTS[locale] }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150, // Keep responses short for children
            },
          }),
        }
      );

      if (!textResponse.ok) {
        const errorText = await textResponse.text();
        console.error('Gemini text generation error:', errorText);
        return NextResponse.json(
          { error: 'Failed to generate tutoring content', code: 'TEXT_GEN_ERROR' },
          { status: 503 }
        );
      }

      const textData = await textResponse.json();
      textToSpeak = textData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textToSpeak) {
        console.error('No text generated:', JSON.stringify(textData, null, 2));
        // Fallback to content directly
        textToSpeak = content;
      }

      // Clean up any markdown or special characters
      textToSpeak = textToSpeak
        .replace(/[*#_`~]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    }

    // Layer 2: Convert text to speech using Gemini TTS
    const voice = VOICE_CONFIG[locale];

    const ttsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: textToSpeak }],
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

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('Gemini TTS error:', errorText);
      return NextResponse.json(
        { error: 'TTS temporarily unavailable', code: 'TTS_ERROR', details: errorText },
        { status: 503 }
      );
    }

    const ttsData = await ttsResponse.json();

    // Extract audio data from response
    const audioData = ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mp3';

    if (!audioData) {
      console.error('No audio in TTS response:', JSON.stringify(ttsData, null, 2));
      return NextResponse.json(
        { error: 'No audio generated', code: 'NO_AUDIO' },
        { status: 503 }
      );
    }

    // Return base64 audio data and the generated text
    return NextResponse.json({
      audio: audioData,
      mimeType: mimeType,
      text: textToSpeak, // Return the text that was spoken (for display/debugging)
    });
  } catch (error) {
    console.error('Voice tutor error:', error);
    return NextResponse.json(
      { error: 'Voice tutor service error', code: 'INTERNAL_ERROR' },
      { status: 503 }
    );
  }
}

// Generate appropriate prompt based on content type
function generateTutorPrompt(
  content: string,
  contentType: string,
  context: string | undefined,
  locale: 'ms' | 'zh' | 'en'
): string {
  const prompts = {
    letter: {
      ms: `Terangkan huruf "${content}" untuk kanak-kanak. Sebut huruf itu, bunyinya, dan beri satu contoh perkataan yang bermula dengan huruf itu. Dalam 1-2 ayat sahaja.`,
      zh: `向孩子解释字母"${content}"。说出字母、发音，并给出一个以该字母开头的单词例子。只用1-2句话。`,
      en: `Explain the letter "${content}" to a child. Say the letter, its sound, and give one example word that starts with it. Keep it to 1-2 sentences.`,
    },
    word: {
      ms: `Sebut perkataan "${content}" dan terangkan maksudnya secara ringkas untuk kanak-kanak. Dalam 1-2 ayat.`,
      zh: `读出单词"${content}"并简单地向孩子解释它的意思。只用1-2句话。`,
      en: `Say the word "${content}" and briefly explain its meaning to a child. Keep it to 1-2 sentences.`,
    },
    syllable: {
      ms: `Ajar cara menyebut suku kata "${content}". Pecahkan bunyi dan sebut perlahan-lahan. Dalam 1-2 ayat.`,
      zh: `教孩子如何发音音节"${content}"。分解声音并慢慢说。只用1-2句话。`,
      en: `Teach how to pronounce the syllable "${content}". Break down the sounds and say it slowly. Keep it to 1-2 sentences.`,
    },
    sentence: {
      ms: `Baca ayat ini dengan jelas: "${content}"`,
      zh: `清晰地朗读这个句子："${content}"`,
      en: `Read this sentence clearly: "${content}"`,
    },
    instruction: {
      ms: `Beri arahan ini dengan cara yang ceria: ${content}`,
      zh: `用欢快的方式给出这个指示：${content}`,
      en: `Give this instruction in a cheerful way: ${content}`,
    },
    feedback: {
      ms: `${content}`,
      zh: `${content}`,
      en: `${content}`,
    },
  };

  const typePrompts = prompts[contentType as keyof typeof prompts] || prompts.word;
  let prompt = typePrompts[locale];

  if (context) {
    const contextIntro = {
      ms: `Konteks: ${context}. `,
      zh: `背景：${context}。`,
      en: `Context: ${context}. `,
    };
    prompt = contextIntro[locale] + prompt;
  }

  return prompt;
}
