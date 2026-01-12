/**
 * Audio URL Builder
 *
 * Constructs expected audio URLs for pre-generated audio files.
 * If the file doesn't exist, VoiceTutorButton will fallback to TTS API.
 */

import type { Locale } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://glwxvgxgquwfgwbwqbiz.supabase.co';
const AUDIO_BASE_PATH = `${SUPABASE_URL}/storage/v1/object/public/audio`;

/**
 * Build audio URL for syllable pronunciation
 * @param syllable - The syllable (e.g., "ba", "ca")
 * @param locale - Language locale
 */
export function getSyllablePronunciationUrl(syllable: string, locale: Locale): string {
  const cleanSyllable = syllable.toLowerCase().replace(/[^a-z]/g, '');
  return `${AUDIO_BASE_PATH}/syllable/${locale}/pronunciation/${cleanSyllable}.wav`;
}

/**
 * Build audio URL for syllable guide (educational explanation)
 * @param syllable - The syllable (e.g., "ba", "ca")
 * @param locale - Language locale
 */
export function getSyllableGuideUrl(syllable: string, locale: Locale): string {
  const cleanSyllable = syllable.toLowerCase().replace(/[^a-z]/g, '');
  return `${AUDIO_BASE_PATH}/syllable/${locale}/guide/${cleanSyllable}.wav`;
}

/**
 * Build audio URL for vocabulary word
 * @param word - The word (e.g., "ayam", "buku")
 * @param locale - Language locale
 */
export function getVocabularyUrl(word: string, locale: Locale): string {
  const cleanWord = word.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
  return `${AUDIO_BASE_PATH}/vocabulary/${locale}/${cleanWord}.wav`;
}

/**
 * Build audio URL for phrase/sentence
 * @param phrase - The phrase text
 * @param locale - Language locale
 */
export function getPhraseUrl(phrase: string, locale: Locale): string {
  // Use first 50 chars, cleaned up for filename
  const slug = phrase
    .toLowerCase()
    .substring(0, 50)
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return `${AUDIO_BASE_PATH}/phrase/${locale}/sentence/${slug}.wav`;
}

/**
 * Build audio URL for dictation word
 * @param word - The word
 * @param locale - Language locale
 */
export function getDictationUrl(word: string, locale: Locale): string {
  const cleanWord = word.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
  return `${AUDIO_BASE_PATH}/dictation/${locale}/word/${cleanWord}.wav`;
}

/**
 * Build audio URL for matching activity sound
 * @param item - The syllable/letter/word
 * @param locale - Language locale
 */
export function getMatchingUrl(item: string, locale: Locale): string {
  const cleanItem = item.toLowerCase().replace(/[^a-z]/g, '');
  return `${AUDIO_BASE_PATH}/matching/${locale}/syllable/${cleanItem}.wav`;
}

/**
 * Generic audio URL builder based on content type
 */
export function getAudioUrl(
  text: string,
  contentType: 'syllable' | 'syllable_guide' | 'word' | 'phrase' | 'dictation' | 'matching',
  locale: Locale
): string {
  switch (contentType) {
    case 'syllable':
      return getSyllablePronunciationUrl(text, locale);
    case 'syllable_guide':
      return getSyllableGuideUrl(text, locale);
    case 'word':
      return getVocabularyUrl(text, locale);
    case 'phrase':
      return getPhraseUrl(text, locale);
    case 'dictation':
      return getDictationUrl(text, locale);
    case 'matching':
      return getMatchingUrl(text, locale);
    default:
      return getSyllablePronunciationUrl(text, locale);
  }
}
