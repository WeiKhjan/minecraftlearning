// Gemini TTS Configuration for Malaysian Accent Voice Tutor

export interface TTSConfig {
  voice: string;
  systemPrompt: string;
}

// Voice tutor configuration with Malaysian accent
export const voiceTutorConfig: TTSConfig = {
  voice: 'Kore', // Can be adjusted based on available voices
  systemPrompt: `
You are Cikgu Maya, a friendly Bahasa Malaysia teacher for primary school children in Malaysia.
Speak with a Malaysian accent and style.
Use simple words suitable for primary school children.
Be warm, encouraging, and patient.
Mix some English words naturally like Malaysian speakers do (code-switching).
Speak clearly and at a moderate pace so children can follow.
`,
};

// Generate TTS request payload
export function generateTTSPayload(text: string, language: 'ms' | 'zh' | 'en') {
  const languagePrompts = {
    ms: 'Speak in Bahasa Malaysia with a Malaysian accent.',
    zh: 'Speak in Mandarin Chinese with clear pronunciation suitable for children.',
    en: 'Speak in English with a Malaysian accent, friendly tone.',
  };

  return {
    text,
    systemPrompt: `${voiceTutorConfig.systemPrompt}\n${languagePrompts[language]}`,
    voice: voiceTutorConfig.voice,
  };
}

// Pronunciation guide phrases
export const pronunciationGuides = {
  ms: {
    vowels: {
      a: 'Sebut "ah" seperti dalam "ayam"',
      e: 'Sebut "eh" seperti dalam "enak"',
      i: 'Sebut "ee" seperti dalam "ikan"',
      o: 'Sebut "oh" seperti dalam "oren"',
      u: 'Sebut "oo" seperti dalam "ular"',
    },
    introduction: 'Mari kita sebut sama-sama. Cuba ikut Cikgu Maya.',
    encouragement: [
      'Bagus! Sebutan awak sangat jelas!',
      'Pandai! Cuba sekali lagi.',
      'Hebat! Awak belajar dengan cepat!',
      'Syabas! Teruskan usaha!',
    ],
  },
  zh: {
    vowels: {
      a: '发音像 "啊"',
      e: '发音像 "鹅"',
      i: '发音像 "衣"',
      o: '发音像 "哦"',
      u: '发音像 "乌"',
    },
    introduction: '让我们一起说。跟着老师说。',
    encouragement: [
      '很好！你的发音很清楚！',
      '真棒！再试一次。',
      '太厉害了！你学得很快！',
      '做得好！继续努力！',
    ],
  },
  en: {
    vowels: {
      a: 'Say "ah" like in "apple"',
      e: 'Say "eh" like in "egg"',
      i: 'Say "ee" like in "igloo"',
      o: 'Say "oh" like in "orange"',
      u: 'Say "oo" like in "umbrella"',
    },
    introduction: "Let's say it together. Follow Teacher Maya.",
    encouragement: [
      'Great! Your pronunciation is very clear!',
      'Excellent! Try once more.',
      'Amazing! You learn so fast!',
      'Well done! Keep it up!',
    ],
  },
};

// Get random encouragement
export function getRandomEncouragement(language: 'ms' | 'zh' | 'en'): string {
  const phrases = pronunciationGuides[language].encouragement;
  return phrases[Math.floor(Math.random() * phrases.length)];
}
