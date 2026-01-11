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
PENTING: Terus beri penerangan tentang kandungan yang diminta. Jangan mulakan dengan salam atau perkenalan.
Beri penerangan ringkas dan mudah difahami dalam 2-3 ayat.
Jangan gunakan format markdown atau simbol khas. Hanya teks biasa untuk dibaca dengan kuat.`,

  zh: `你是一位友善的马来西亚小学教师。
重要：直接解释所要求的内容。不要以问候或介绍开始。
用简单易懂的语言在2-3句话内解释。
不要使用markdown格式或特殊符号。只用可以朗读的纯文本。`,

  en: `You are a friendly tutor for Malaysian primary school children.
IMPORTANT: Directly explain the requested content. Do not start with greetings or introductions.
Give brief, easy-to-understand explanations in 2-3 sentences.
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
      console.log('[voice-tutor] Generating text with prompt:', tutorPrompt);

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
              temperature: 0.5,
              maxOutputTokens: 300,
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

    console.log('[voice-tutor] TTS response mimeType:', mimeType, 'audio data length:', audioData?.length);

    if (!audioData) {
      console.error('No audio in TTS response:', JSON.stringify(ttsData, null, 2));
      return NextResponse.json(
        { error: 'No audio generated', code: 'NO_AUDIO' },
        { status: 503 }
      );
    }

    // Return base64 audio data and the generated text
    console.log('[voice-tutor] Success - returning audio with mimeType:', mimeType);
    console.log('[voice-tutor] Full text to speak:', textToSpeak);
    console.log('[voice-tutor] Audio data length:', audioData?.length, 'bytes (~', Math.round(audioData?.length / 48000), 'seconds at 24kHz)');
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
      ms: `Huruf "${content}". Terus terangkan: sebut nama huruf, bunyinya, dan satu contoh perkataan. Contoh format: "Huruf A, bunyi 'ah', seperti 'ayam'."`,
      zh: `字母"${content}"。直接解释：说出字母名称、发音和一个例词。格式示例："字母A，发音'啊'，比如'苹果'。"`,
      en: `Letter "${content}". Directly explain: say the letter name, its sound, and one example word. Example format: "Letter A, sounds like 'ah', like in 'apple'."`,
    },
    word: {
      ms: `Perkataan "${content}". Terus terangkan: sebut perkataan dan maksudnya dalam 1-2 ayat.`,
      zh: `单词"${content}"。直接解释：读出单词并用1-2句话说明意思。`,
      en: `Word "${content}". Directly explain: say the word and its meaning in 1-2 sentences.`,
    },
    syllable: {
      ms: `Suku kata "${content}". ${content.length === 1 ? `Ini huruf vokal. Terangkan bunyi vokal ini dengan jelas.` : `Ini gabungan konsonan dan vokal. Pecahkan bunyi konsonan "${content[0]}" dan vokal "${content.slice(1)}" kemudian gabungkan.`} Akhiri dengan: "Cuba sebut bersama saya: ${content}... ${content}... ${content}."`,
      zh: `音节"${content}"。${content.length === 1 ? `这是元音字母。清楚地解释这个元音的发音。` : `这是辅音和元音的组合。分解辅音"${content[0]}"和元音"${content.slice(1)}"然后组合。`}最后说："跟我一起说：${content}... ${content}... ${content}。"`,
      en: `Syllable "${content}". ${content.length === 1 ? `This is a vowel. Explain this vowel sound clearly.` : `This combines consonant "${content[0]}" and vowel "${content.slice(1)}". Break down then combine.`} End with: "Say it with me: ${content}... ${content}... ${content}."`,
    },
    sentence: {
      ms: `Baca ayat ini dengan jelas: "${content}"`,
      zh: `清晰地朗读这个句子："${content}"`,
      en: `Read this sentence clearly: "${content}"`,
    },
    instruction: {
      ms: `${content}`,
      zh: `${content}`,
      en: `${content}`,
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
