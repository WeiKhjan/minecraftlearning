// Database Types

export type Locale = 'ms' | 'zh' | 'en';

export type Grade = 'primary_1' | 'primary_2' | 'primary_3' | 'primary_4' | 'primary_5' | 'primary_6';

export type SubjectCode = 'bm' | 'bc' | 'en' | 'math';

export type EquipmentSlot = 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'weapon' | 'tool' | 'ranged' | 'shield';

export type EquipmentTier =
  // Classic Tiers (Units 1-6)
  | 'wood' | 'leather' | 'stone' | 'chain' | 'iron' | 'gold' | 'diamond' | 'darksteel'
  // Enchanted Tiers (Units 7-12)
  | 'enchanted_iron' | 'enchanted_gold' | 'enchanted_diamond' | 'enchanted_darksteel' | 'seafoam' | 'amethyst'
  // Elemental Tiers (Units 13-20)
  | 'blaze' | 'frost' | 'storm' | 'emerald' | 'obsidian' | 'crimsonite' | 'lapis' | 'luminite'
  // Mythic Tiers (Units 21-30)
  | 'voidstone' | 'dragonscale' | 'darkbone' | 'phoenix' | 'titan' | 'shadow' | 'radiant' | 'ancient' | 'celestial' | 'void'
  // Ultimate Tiers (Units 31-40)
  | 'heroic' | 'mythical' | 'immortal' | 'divine' | 'cosmic' | 'eternal' | 'ascended' | 'supreme' | 'omega' | 'infinity';

export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type PetMobType = 'passive' | 'neutral' | 'hostile' | 'utility';

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ActivityType = 'alphabet' | 'matching' | 'syllable' | 'writing' | 'speaking' | 'singing' | 'math' | 'dictation';

export type ProgressStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// Parent/User
export interface Parent {
  id: string;
  email: string;
  display_name: string | null;
  preferred_language: Locale;
  is_admin: boolean;
  created_at: string;
}

// Kid Profile
export interface Kid {
  id: string;
  parent_id: string;
  name: string;
  school: string | null;
  grade: Grade;
  preferred_language: Locale;
  avatar_seed: string | null;
  generated_avatar_url: string | null;
  level: number;
  total_xp: number;
  created_at: string;
}

// Subject
export interface Subject {
  id: string;
  code: SubjectCode;
  name_ms: string;
  name_zh: string;
  name_en: string;
  icon: string | null;
  color: string | null;
  order_index: number;
}

// Theme/Unit
export interface Theme {
  id: string;
  subject_id: string;
  code: string;
  name_ms: string;
  name_zh: string;
  name_en: string;
  description_ms: string | null;
  description_zh: string | null;
  description_en: string | null;
  order_index: number;
  required_grade: Grade | null;
  pet_reward: string | null;
}

// Activity
export interface Activity {
  id: string;
  theme_id: string;
  type: ActivityType;
  title_ms: string;
  title_zh: string;
  title_en: string;
  instructions_ms: string | null;
  instructions_zh: string | null;
  instructions_en: string | null;
  content: ActivityContent;
  xp_reward: number;
  equipment_reward_id: string | null;
  order_index: number;
}

// Activity Content Types
export interface ActivityContent {
  type: ActivityType;
  data: AlphabetContent | MatchingContent | SyllableContent | WritingContent | SpeakingContent | SingingContent | MathContent | DictationContent;
}

export interface AlphabetContent {
  letters: string[];
  instruction: {
    ms: string;
    zh: string;
    en: string;
  };
}

export interface MatchingContent {
  pairs: {
    // Old format (alphabet matching)
    letter?: string;
    word_ms?: string;
    word_zh?: string;
    word_en?: string;
    // New format (syllable/word matching)
    syllable?: string;
    word?: string;
    meaning_ms?: string;
    meaning_zh?: string;
    meaning_en?: string;
    // Common
    image?: string;
    audio_url?: string; // Pre-generated audio URL
  }[];
}

export interface SyllableContent {
  // Simple format: flat array of syllables
  syllables?: string[];
  audio_urls?: string[]; // Pre-generated audio URLs for each syllable
  voice_guides?: string[]; // Pre-generated voice guidance texts (for directTTS to save API cost)
  // Word format: array of word objects with syllables
  words?: {
    word: string;
    syllables: string[];
    meaning_ms?: string;
    meaning_zh?: string;
    meaning_en?: string;
    image?: string;
    audio_url?: string;
  }[];
}

export interface WritingContent {
  characters: string[];
  trace_guides: boolean;
  words?: {
    word: string;
    meaning_ms: string;
    meaning_zh: string;
    meaning_en: string;
  }[];
}

export interface SpeakingContent {
  phrases: {
    text: string;
    translation_ms: string;
    translation_zh: string;
    translation_en: string;
    audio_url?: string; // Pre-generated audio URL
    voice_guide?: string; // Pre-generated voice guidance text (for directTTS to save API cost)
  }[];
  use_kid_name: boolean;
}

export interface SingingContent {
  title: string;
  lyrics: {
    line: string;
    timing?: number;
  }[];
  audio_url?: string;
  melody_reference?: string;
  youtube_id?: string;
}

export interface MathContent {
  problems: {
    question: string;
    answer: string | number;
    options?: (string | number)[];
  }[];
}

export interface DictationContent {
  words: {
    word: string;
    meaning_ms: string;
    meaning_zh: string;
    meaning_en: string;
    audio_url?: string; // Pre-generated audio URL
  }[];
}

// Equipment
export interface Equipment {
  id: string;
  name: string;
  name_ms: string | null;
  name_zh: string | null;
  name_en: string | null;
  slot: EquipmentSlot;
  tier: EquipmentTier;
  rarity: EquipmentRarity;
  image_url: string;
  required_level: number;
  unit_number: number | null;
  color_primary: string | null;
  color_secondary: string | null;
}

// Kid Inventory
export interface KidInventory {
  id: string;
  kid_id: string;
  equipment_id: string;
  obtained_at: string;
  equipment?: Equipment;
}

// Kid Equipped
export interface KidEquipped {
  kid_id: string;
  helmet_id: string | null;
  chestplate_id: string | null;
  leggings_id: string | null;
  boots_id: string | null;
  weapon_id: string | null;
  tool_id: string | null;
  ranged_id: string | null;
  shield_id: string | null;
  pet_id: string | null;
}

// Pet
export interface Pet {
  id: string;
  name: LocalizedText;
  mob_type: PetMobType;
  rarity: PetRarity;
  description: LocalizedText | null;
  image_url: string | null;
  created_at: string;
}

// Kid Pet (owned pets)
export interface KidPet {
  id: string;
  kid_id: string;
  pet_id: string;
  obtained_at: string;
  obtained_from_theme: string | null;
  pet?: Pet;
}

// Kid Progress
export interface KidProgress {
  id: string;
  kid_id: string;
  activity_id: string;
  status: ProgressStatus;
  score: number | null;
  stars: number | null;
  attempts: number;
  ai_feedback: {
    ms: string;
    zh: string;
    en: string;
  } | null;
  completed_at: string | null;
}

// Kid Subject Progress (aggregated)
export interface KidSubjectProgress {
  id: string;
  kid_id: string;
  subject_id: string;
  total_activities: number;
  completed_activities: number;
  total_xp_earned: number;
  last_activity_at: string | null;
}

// Voice Session
export interface VoiceSession {
  id: string;
  kid_id: string;
  activity_id: string;
  transcript: string | null;
  ai_response: string | null;
  pronunciation_score: number | null;
  created_at: string;
}

// AI Assessment Result
export interface AssessmentResult {
  isCorrect: boolean;
  score: number;
  feedback: {
    ms: string;
    zh: string;
    en: string;
  };
  hint?: {
    ms: string;
    zh: string;
    en: string;
  };
}

// Helper type for localized text
export interface LocalizedText {
  ms: string;
  zh: string;
  en: string;
}

// Get localized value helper
export function getLocalizedValue<T extends LocalizedText>(obj: T, locale: Locale): string {
  return obj[locale];
}

// Equipment Slot Display Order
export const EQUIPMENT_SLOT_ORDER: EquipmentSlot[] = [
  'helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool', 'ranged', 'shield'
];

// Tier Color Mapping for UI Display
export const TIER_COLORS: Record<EquipmentTier, { primary: string; secondary: string }> = {
  // Classic Tiers
  wood: { primary: '#8B4513', secondary: '#A0522D' },
  leather: { primary: '#8B4513', secondary: '#D2691E' },
  stone: { primary: '#808080', secondary: '#A9A9A9' },
  chain: { primary: '#C0C0C0', secondary: '#808080' },
  iron: { primary: '#D3D3D3', secondary: '#A9A9A9' },
  gold: { primary: '#FFD700', secondary: '#FFA500' },
  diamond: { primary: '#00CED1', secondary: '#40E0D0' },
  darksteel: { primary: '#4A4A4A', secondary: '#8B0000' },
  // Enchanted Tiers
  enchanted_iron: { primary: '#D3D3D3', secondary: '#9370DB' },
  enchanted_gold: { primary: '#FFD700', secondary: '#9370DB' },
  enchanted_diamond: { primary: '#00CED1', secondary: '#9370DB' },
  enchanted_darksteel: { primary: '#4A4A4A', secondary: '#9370DB' },
  seafoam: { primary: '#5F9EA0', secondary: '#20B2AA' },
  amethyst: { primary: '#9966CC', secondary: '#E6E6FA' },
  // Elemental Tiers
  blaze: { primary: '#FF4500', secondary: '#FF8C00' },
  frost: { primary: '#87CEEB', secondary: '#FFFFFF' },
  storm: { primary: '#FFD700', secondary: '#4B0082' },
  emerald: { primary: '#50C878', secondary: '#00FF00' },
  obsidian: { primary: '#1C1C1C', secondary: '#4B0082' },
  crimsonite: { primary: '#FF0000', secondary: '#8B0000' },
  lapis: { primary: '#1E90FF', secondary: '#00008B' },
  luminite: { primary: '#FFFF00', secondary: '#FFD700' },
  // Mythic Tiers
  voidstone: { primary: '#301934', secondary: '#9400D3' },
  dragonscale: { primary: '#800080', secondary: '#228B22' },
  darkbone: { primary: '#1C1C1C', secondary: '#696969' },
  phoenix: { primary: '#FF4500', secondary: '#FFD700' },
  titan: { primary: '#B8860B', secondary: '#8B4513' },
  shadow: { primary: '#2F2F2F', secondary: '#4B0082' },
  radiant: { primary: '#FFFACD', secondary: '#FFD700' },
  ancient: { primary: '#8B4513', secondary: '#D4AF37' },
  celestial: { primary: '#000080', secondary: '#C0C0C0' },
  void: { primary: '#0D0D0D', secondary: '#4B0082' },
  // Ultimate Tiers
  heroic: { primary: '#DC143C', secondary: '#FFD700' },
  mythical: { primary: '#9400D3', secondary: '#FFD700' },
  immortal: { primary: '#00FF00', secondary: '#FFFFFF' },
  divine: { primary: '#FFFFFF', secondary: '#FFD700' },
  cosmic: { primary: '#000080', secondary: '#FF69B4' },
  eternal: { primary: '#C0C0C0', secondary: '#FFD700' },
  ascended: { primary: '#87CEEB', secondary: '#FFFFFF' },
  supreme: { primary: '#FF0000', secondary: '#000000' },
  omega: { primary: '#000000', secondary: '#FF0000' },
  infinity: { primary: '#FF69B4', secondary: '#00FFFF' }, // Rainbow/prismatic
};
