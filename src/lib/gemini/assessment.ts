import { gemini3Flash } from './client';
import { AssessmentResult, Locale, SubjectCode } from '@/types';

function getSubjectTutor(subject: SubjectCode): string {
  const tutors: Record<SubjectCode, string> = {
    bm: 'Bahasa Malaysia',
    bc: 'Mandarin Chinese',
    en: 'English',
    math: 'Mathematics',
  };
  return tutors[subject];
}

export async function assessAnswer(
  kidAnswer: string,
  expectedAnswer: string,
  activityContext: string,
  subject: SubjectCode,
  kidName: string,
  thinkingLevel: 'minimal' | 'low' | 'medium' | 'high' = 'medium'
): Promise<AssessmentResult> {
  const prompt = `
You are a friendly ${getSubjectTutor(subject)} tutor for Malaysian primary school kids.
The student's name is ${kidName}.

Activity Context: ${activityContext}
Expected Answer: ${expectedAnswer}
Kid's Answer: ${kidAnswer}

Assess the answer and provide feedback in THREE languages.
Be encouraging and kid-friendly! Use simple words suitable for primary school children.
Address the child by name occasionally to make it personal.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "isCorrect": true or false,
  "score": 0-100,
  "feedback": {
    "ms": "Feedback in Bahasa Malaysia (encouraging, kid-friendly, max 2 sentences)",
    "zh": "Feedback in Simplified Chinese (encouraging, kid-friendly, max 2 sentences)",
    "en": "Feedback in English (encouraging, kid-friendly, max 2 sentences)"
  },
  "hint": {
    "ms": "Hint if wrong, empty string if correct (Bahasa Malaysia)",
    "zh": "Hint if wrong, empty string if correct (Simplified Chinese)",
    "en": "Hint if wrong, empty string if correct (English)"
  }
}
`;

  try {
    const result = await gemini3Flash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as AssessmentResult;
  } catch (error) {
    console.error('Error assessing answer:', error);
    // Return a default response if API fails
    return {
      isCorrect: false,
      score: 0,
      feedback: {
        ms: 'Maaf, ada masalah teknikal. Sila cuba lagi.',
        zh: '抱歉，出现了技术问题。请再试一次。',
        en: 'Sorry, there was a technical issue. Please try again.',
      },
      hint: {
        ms: '',
        zh: '',
        en: '',
      },
    };
  }
}

export async function assessPronunciation(
  transcript: string,
  expectedPhrase: string,
  subject: SubjectCode,
  kidName: string
): Promise<AssessmentResult & { pronunciationScore: number }> {
  const prompt = `
You are a friendly ${getSubjectTutor(subject)} pronunciation tutor for Malaysian primary school kids.
The student's name is ${kidName}.

Expected Phrase: "${expectedPhrase}"
What the student said (transcript): "${transcript}"

Assess the pronunciation and provide:
1. Whether it's close enough to be considered correct (be lenient - kids are learning!)
2. A pronunciation score from 0-100
3. Encouraging feedback in three languages

Return ONLY valid JSON:
{
  "isCorrect": true or false,
  "score": 0-100,
  "pronunciationScore": 0-100,
  "feedback": {
    "ms": "Feedback in Bahasa Malaysia",
    "zh": "Feedback in Simplified Chinese",
    "en": "Feedback in English"
  },
  "hint": {
    "ms": "Pronunciation tip if needed",
    "zh": "Pronunciation tip if needed",
    "en": "Pronunciation tip if needed"
  }
}
`;

  try {
    const result = await gemini3Flash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error assessing pronunciation:', error);
    return {
      isCorrect: false,
      score: 0,
      pronunciationScore: 0,
      feedback: {
        ms: 'Maaf, ada masalah teknikal. Sila cuba lagi.',
        zh: '抱歉，出现了技术问题。请再试一次。',
        en: 'Sorry, there was a technical issue. Please try again.',
      },
      hint: {
        ms: '',
        zh: '',
        en: '',
      },
    };
  }
}

export async function generateEncouragement(
  kidName: string,
  currentStreak: number,
  locale: Locale
): Promise<string> {
  const prompt = `
Generate a short, encouraging message (1 sentence) for a primary school kid named ${kidName}.
They have completed ${currentStreak} activities in a row!
Language: ${locale === 'ms' ? 'Bahasa Malaysia' : locale === 'zh' ? 'Simplified Chinese' : 'English'}

Make it fun and motivating! You can mention 8-bit RPG themes like quests, treasure hunting, or heroic adventures.
Return ONLY the message text, no quotes or formatting.
`;

  try {
    const result = await gemini3Flash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
      },
    });

    return result.response.text().trim();
  } catch {
    const defaults: Record<Locale, string> = {
      ms: `Bagus, ${kidName}! Teruskan usaha!`,
      zh: `做得好，${kidName}！继续加油！`,
      en: `Great job, ${kidName}! Keep it up!`,
    };
    return defaults[locale];
  }
}
