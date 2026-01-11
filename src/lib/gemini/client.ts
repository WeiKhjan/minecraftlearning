import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Gemini 3 Flash Preview for assessment
export const gemini3Flash = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
});

// Gemini 2.5 Flash for TTS (when using through API)
export const gemini25Flash = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-tts',
});

export { genAI };
