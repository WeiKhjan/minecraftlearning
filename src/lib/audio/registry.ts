/**
 * Audio Registry - Comprehensive list of all audio items to pre-generate
 *
 * This file contains all text content that needs TTS audio generation
 * for the MYLearnt educational platform.
 */

export type Locale = 'ms' | 'zh' | 'en';

export type AudioType =
  | 'syllable_guide'        // Educational explanation for syllables
  | 'syllable_pronunciation' // Just the syllable sound
  | 'vocabulary'            // Word pronunciation
  | 'phrase'                // Speaking activity phrases/sentences
  | 'voice_guide'           // Educational voice guides for speaking
  | 'dictation'             // Dictation words
  | 'matching';             // Matching activity sounds (syllables/letters)

export interface AudioItem {
  id: string;               // Unique identifier: {type}_{locale}_{text_slug}
  type: AudioType;
  text: string;             // Text to speak (in target locale)
  locale: Locale;
  filePath: string;         // Storage path without extension: syllable/ms/guide/ba
  priority: number;         // 1=high (core), 2=medium, 3=low
}

// ============================================
// BASE SYLLABLES (35 total)
// ============================================
const BASE_SYLLABLES = [
  // Vowels (5)
  'a', 'e', 'i', 'o', 'u',
  // Consonant + vowel A (6)
  'ba', 'ca', 'ga', 'ka', 'ma', 'sa',
  // Consonant + vowel E (6)
  'be', 'ce', 'ge', 'ke', 'me', 'se',
  // Consonant + vowel I (6)
  'bi', 'ci', 'gi', 'ki', 'mi', 'si',
  // Consonant + vowel O (6)
  'bo', 'co', 'go', 'ko', 'mo', 'so',
  // Consonant + vowel U (6)
  'bu', 'cu', 'gu', 'ku', 'mu', 'su',
];

// Voice guide templates by locale
const SYLLABLE_GUIDE_TEMPLATES: Record<Locale, (syl: string, isVowel: boolean) => string> = {
  ms: (syl, isVowel) => {
    if (isVowel) {
      const sounds: Record<string, string> = { a: 'ah', e: 'eh', i: 'ee', o: 'oh', u: 'oo' };
      return `Ini huruf vokal ${syl.toUpperCase()}. Bunyi ${sounds[syl]}. Cuba sebut bersama saya: ${syl}, ${syl}, ${syl}.`;
    }
    const consonant = syl[0];
    const vowel = syl[1];
    const vowelSound: Record<string, string> = { a: 'ah', e: 'eh', i: 'ee', o: 'oh', u: 'oo' };
    const consonantSound: Record<string, string> = {
      b: 'buh', c: 'chuh', g: 'guh', k: 'kuh', m: 'muh', s: 'suh',
      d: 'duh', f: 'fuh', h: 'huh', j: 'juh', l: 'luh', n: 'nuh',
      p: 'puh', r: 'ruh', t: 'tuh', w: 'wuh', y: 'yuh', z: 'zuh'
    };
    return `Suku kata ${syl.toUpperCase()}. Gabungkan bunyi ${consonantSound[consonant] || consonant} dan ${vowelSound[vowel]} menjadi ${syl}. Cuba sebut bersama saya: ${syl}, ${syl}, ${syl}.`;
  },
  zh: (syl, isVowel) => {
    if (isVowel) {
      return `这是元音 ${syl.toUpperCase()}。跟我一起说：${syl}，${syl}，${syl}。`;
    }
    const consonant = syl[0].toUpperCase();
    const vowel = syl[1].toUpperCase();
    return `音节 ${syl.toUpperCase()}。将辅音 ${consonant} 和元音 ${vowel} 结合成 ${syl}。跟我一起说：${syl}，${syl}，${syl}。`;
  },
  en: (syl, isVowel) => {
    if (isVowel) {
      return `This is the vowel ${syl.toUpperCase()}. Say it with me: ${syl}, ${syl}, ${syl}.`;
    }
    const consonant = syl[0].toUpperCase();
    const vowel = syl[1].toUpperCase();
    return `Syllable ${syl.toUpperCase()}. Combine the consonant ${consonant} with vowel ${vowel} to make ${syl}. Say it with me: ${syl}, ${syl}, ${syl}.`;
  }
};

// ============================================
// VOCABULARY WORDS (from all units)
// ============================================
const VOCABULARY_WORDS = [
  // Unit 1 - Alphabet matching
  { word: 'ayam', ms: 'ayam', zh: '鸡', en: 'chicken' },
  { word: 'emak', ms: 'emak', zh: '妈妈', en: 'mother' },
  { word: 'itik', ms: 'itik', zh: '鸭子', en: 'duck' },
  { word: 'oren', ms: 'oren', zh: '橙子', en: 'orange' },
  { word: 'unta', ms: 'unta', zh: '骆驼', en: 'camel' },
  { word: 'ibu', ms: 'ibu', zh: '妈妈', en: 'mother' },
  { word: 'meja', ms: 'meja', zh: '桌子', en: 'table' },
  { word: 'buku', ms: 'buku', zh: '书', en: 'book' },
  { word: 'epal', ms: 'epal', zh: '苹果', en: 'apple' },
  { word: 'ikan', ms: 'ikan', zh: '鱼', en: 'fish' },
  { word: 'ular', ms: 'ular', zh: '蛇', en: 'snake' },

  // Unit 2 - Family/Food
  { word: 'baju', ms: 'baju', zh: '衣服', en: 'clothes' },
  { word: 'roti', ms: 'roti', zh: '面包', en: 'bread' },
  { word: 'biru', ms: 'biru', zh: '蓝色', en: 'blue' },
  { word: 'susu', ms: 'susu', zh: '牛奶', en: 'milk' },
  { word: 'teko', ms: 'teko', zh: '茶壶', en: 'teapot' },
  { word: 'labu', ms: 'labu', zh: '南瓜', en: 'pumpkin' },
  { word: 'tidur', ms: 'tidur', zh: '睡觉', en: 'sleep' },
  { word: 'bayi', ms: 'bayi', zh: '婴儿', en: 'baby' },
  { word: 'lebah', ms: 'lebah', zh: '蜜蜂', en: 'bee' },
  { word: 'tulis', ms: 'tulis', zh: '写', en: 'write' },
  { word: 'betik', ms: 'betik', zh: '木瓜', en: 'papaya' },
  { word: 'lobak', ms: 'lobak', zh: '萝卜', en: 'carrot' },
  { word: 'nasi', ms: 'nasi', zh: '米饭', en: 'rice' },
  { word: 'cucu', ms: 'cucu', zh: '孙子', en: 'grandchild' },
  { word: 'nenek', ms: 'nenek', zh: '奶奶', en: 'grandmother' },
  { word: 'cawan', ms: 'cawan', zh: '杯子', en: 'cup' },
  { word: 'lidi', ms: 'lidi', zh: '竹签', en: 'stick' },
  { word: 'ceri', ms: 'ceri', zh: '樱桃', en: 'cherry' },
  { word: 'topi', ms: 'topi', zh: '帽子', en: 'hat' },
  { word: 'bubur', ms: 'bubur', zh: '粥', en: 'porridge' },
  { word: 'teh', ms: 'teh', zh: '茶', en: 'tea' },
  { word: 'kopi', ms: 'kopi', zh: '咖啡', en: 'coffee' },

  // Unit 3 - Kampung
  { word: 'pau', ms: 'pau', zh: '包子', en: 'bun' },
  { word: 'cakoi', ms: 'cakoi', zh: '油条', en: 'fried dough' },
  { word: 'hijau', ms: 'hijau', zh: '绿色', en: 'green' },
  { word: 'limau', ms: 'limau', zh: '柠檬', en: 'lime' },
  { word: 'gerai', ms: 'gerai', zh: '摊位', en: 'stall' },
  { word: 'joran', ms: 'joran', zh: '鱼竿', en: 'fishing rod' },
  { word: 'bakul', ms: 'bakul', zh: '篮子', en: 'basket' },
  { word: 'kasut', ms: 'kasut', zh: '鞋子', en: 'shoes' },
  { word: 'kolam', ms: 'kolam', zh: '池塘', en: 'pond' },

  // Unit 4 - Jiran
  { word: 'pasu', ms: 'pasu', zh: '花瓶', en: 'vase' },
  { word: 'bantal', ms: 'bantal', zh: '枕头', en: 'pillow' },
  { word: 'jam', ms: 'jam', zh: '钟', en: 'clock' },
  { word: 'jiran', ms: 'jiran', zh: '邻居', en: 'neighbor' },
  { word: 'pensel', ms: 'pensel', zh: '铅笔', en: 'pencil' },
  { word: 'obor', ms: 'obor', zh: '火炬', en: 'torch' },
  { word: 'duduk', ms: 'duduk', zh: '坐', en: 'sit' },
  { word: 'butang', ms: 'butang', zh: '按钮', en: 'button' },
  { word: 'tudung', ms: 'tudung', zh: '头巾', en: 'headscarf' },
  { word: 'dinding', ms: 'dinding', zh: '墙', en: 'wall' },
  { word: 'tangga', ms: 'tangga', zh: '楼梯', en: 'stairs' },
  { word: 'tong', ms: 'tong', zh: '桶', en: 'barrel' },
  { word: 'orang', ms: 'orang', zh: '人', en: 'person' },
  { word: 'selipar', ms: 'selipar', zh: '拖鞋', en: 'slipper' },

  // Unit 5 - Kawan
  { word: 'jadual', ms: 'jadual', zh: '时间表', en: 'timetable' },
  { word: 'radio', ms: 'radio', zh: '收音机', en: 'radio' },
  { word: 'piano', ms: 'piano', zh: '钢琴', en: 'piano' },
  { word: 'lukisan', ms: 'lukisan', zh: '画作', en: 'drawing' },

  // Unit 6 - Taman Permainan
  { word: 'belon', ms: 'belon', zh: '气球', en: 'balloon' },
  { word: 'dewan', ms: 'dewan', zh: '礼堂', en: 'hall' },
  { word: 'pagar', ms: 'pagar', zh: '栅栏', en: 'fence' },
  { word: 'penjaja', ms: 'penjaja', zh: '小贩', en: 'vendor' },

  // Unit 7 - Sihat
  { word: 'stoking', ms: 'stoking', zh: '袜子', en: 'socks' },
  { word: 'segar', ms: 'segar', zh: '新鲜', en: 'fresh' },
  { word: 'sihat', ms: 'sihat', zh: '健康', en: 'healthy' },
  { word: 'bola', ms: 'bola', zh: '球', en: 'ball' },
  { word: 'guni', ms: 'guni', zh: '麻袋', en: 'sack' },

  // Unit 8 - Makanan
  { word: 'sandwic', ms: 'sandwic', zh: '三明治', en: 'sandwich' },
  { word: 'telur', ms: 'telur', zh: '鸡蛋', en: 'egg' },
  { word: 'sawi', ms: 'sawi', zh: '芥菜', en: 'mustard greens' },
  { word: 'pisang', ms: 'pisang', zh: '香蕉', en: 'banana' },
  { word: 'tembikai', ms: 'tembikai', zh: '西瓜', en: 'watermelon' },

  // Unit 9 - Kebersihan
  { word: 'sabun', ms: 'sabun', zh: '肥皂', en: 'soap' },
  { word: 'syampu', ms: 'syampu', zh: '洗发水', en: 'shampoo' },
  { word: 'tuala', ms: 'tuala', zh: '毛巾', en: 'towel' },
  { word: 'bersih', ms: 'bersih', zh: '干净', en: 'clean' },
  { word: 'pakaian', ms: 'pakaian', zh: '衣物', en: 'clothes' },
];

// ============================================
// SPEAKING PHRASES (from all units)
// ============================================
const SPEAKING_PHRASES = [
  // Unit 1 - Introduction
  { text: 'Saya {name}', ms: 'Saya {name}', zh: '我是 {name}', en: 'I am {name}' },
  { text: 'Hai, kawan-kawan!', ms: 'Hai, kawan-kawan!', zh: '嗨，朋友们！', en: 'Hi, friends!' },

  // Unit 2 - Terima Kasih
  { text: 'Terima kasih, Ayah.', ms: 'Terima kasih, Ayah.', zh: '谢谢爸爸。', en: 'Thank you, Father.' },
  { text: 'Sama-sama.', ms: 'Sama-sama.', zh: '不客气。', en: 'You are welcome.' },
  { text: 'Ayah beli nasi lemak.', ms: 'Ayah beli nasi lemak.', zh: '爸爸买了椰浆饭。', en: 'Father bought nasi lemak.' },

  // Unit 3 - Kampung
  { text: 'Saya Encik Hassan.', ms: 'Saya Encik Hassan.', zh: '我是哈山先生。', en: 'I am Mr. Hassan.' },
  { text: 'Rumah datuk di kampung.', ms: 'Rumah datuk di kampung.', zh: '爷爷的房子在乡下。', en: 'Grandfather\'s house is in the village.' },
  { text: 'Air kolam sangat jernih.', ms: 'Air kolam sangat jernih.', zh: '池塘的水很清澈。', en: 'The pond water is very clear.' },
  { text: 'Ikan keli hidup di dalam kolam.', ms: 'Ikan keli hidup di dalam kolam.', zh: '鲶鱼生活在池塘里。', en: 'Catfish live in the pond.' },
  { text: 'Datuk suka memancing ikan.', ms: 'Datuk suka memancing ikan.', zh: '爷爷喜欢钓鱼。', en: 'Grandfather likes fishing.' },

  // Unit 4 - Pantun Jiran
  { text: 'Pohon kelapa pokok getah,', ms: 'Pohon kelapa pokok getah,', zh: '椰子树和橡胶树，', en: 'Coconut and rubber trees,' },
  { text: 'Tumbuh subur di halaman.', ms: 'Tumbuh subur di halaman.', zh: '在院子里茁壮成长。', en: 'Growing well in the yard.' },
  { text: 'Hidup berjiran penuh berkah,', ms: 'Hidup berjiran penuh berkah,', zh: '与邻居和睦相处很幸福，', en: 'Living with neighbors is blessed,' },
  { text: 'Saling bantu sepanjang zaman.', ms: 'Saling bantu sepanjang zaman.', zh: '互相帮助直到永远。', en: 'Helping each other forever.' },
  { text: 'Ini sudut bacaan Zura.', ms: 'Ini sudut bacaan Zura.', zh: '这是祖拉的阅读角。', en: 'This is Zura\'s reading corner.' },
  { text: 'Zura membaca buku cerita.', ms: 'Zura membaca buku cerita.', zh: '祖拉在读故事书。', en: 'Zura is reading a storybook.' },
  { text: 'Buku cerita sangat menarik.', ms: 'Buku cerita sangat menarik.', zh: '故事书非常有趣。', en: 'The storybook is very interesting.' },

  // Unit 5 - Pantun Kawan
  { text: 'Buah cempedak di luar pagar,', ms: 'Buah cempedak di luar pagar,', zh: '篱笆外的菠萝蜜，', en: 'Jackfruit outside the fence,' },
  { text: 'Ambil galah tolong jolokkan.', ms: 'Ambil galah tolong jolokkan.', zh: '请用长杆摘下来。', en: 'Use a pole to pick it.' },
  { text: 'Saya suka hidup berkawan,', ms: 'Saya suka hidup berkawan,', zh: '我喜欢交朋友，', en: 'I like having friends,' },
  { text: 'Kerana kawan tempat bercerita.', ms: 'Kerana kawan tempat bercerita.', zh: '因为朋友是倾诉的对象。', en: 'Because friends are for sharing.' },

  // Unit 6 - Taman Permainan
  { text: 'Kanak-kanak bermain di taman permainan.', ms: 'Kanak-kanak bermain di taman permainan.', zh: '孩子们在游乐场玩耍。', en: 'Children play at the playground.' },
  { text: 'Mereka bermain buaian.', ms: 'Mereka bermain buaian.', zh: '他们在玩秋千。', en: 'They play on the swings.' },
  { text: 'Ada yang bermain jongkang-jongkit.', ms: 'Ada yang bermain jongkang-jongkit.', zh: '有的在玩跷跷板。', en: 'Some play on the seesaw.' },
  { text: 'Kanak-kanak sangat gembira.', ms: 'Kanak-kanak sangat gembira.', zh: '孩子们非常开心。', en: 'The children are very happy.' },

  // Unit 7 - Sihat
  { text: 'Selamat pagi! Sudah makan?', ms: 'Selamat pagi! Sudah makan?', zh: '早上好！吃了吗？', en: 'Good morning! Have you eaten?' },
  { text: 'Sudah. Saya makan roti.', ms: 'Sudah. Saya makan roti.', zh: '吃了。我吃了面包。', en: 'Yes. I ate bread.' },
  { text: 'Mari kita bersenam pagi.', ms: 'Mari kita bersenam pagi.', zh: '让我们做早操。', en: 'Let\'s do morning exercise.' },
  { text: 'Bersenam membuat badan sihat.', ms: 'Bersenam membuat badan sihat.', zh: '运动使身体健康。', en: 'Exercise makes the body healthy.' },

  // Unit 8 - Makanan
  { text: 'Sarapan pagi sangat penting.', ms: 'Sarapan pagi sangat penting.', zh: '早餐非常重要。', en: 'Breakfast is very important.' },
  { text: 'Makan makanan berkhasiat.', ms: 'Makan makanan berkhasiat.', zh: '吃有营养的食物。', en: 'Eat nutritious food.' },
  { text: 'Buah-buahan baik untuk kesihatan.', ms: 'Buah-buahan baik untuk kesihatan.', zh: '水果对健康有益。', en: 'Fruits are good for health.' },

  // Unit 9 - Kebersihan
  { text: 'Cuci tangan sebelum makan.', ms: 'Cuci tangan sebelum makan.', zh: '吃饭前要洗手。', en: 'Wash hands before eating.' },
  { text: 'Gosok gigi setiap hari.', ms: 'Gosok gigi setiap hari.', zh: '每天刷牙。', en: 'Brush teeth every day.' },
  { text: 'Kebersihan itu sebahagian daripada iman.', ms: 'Kebersihan itu sebahagian daripada iman.', zh: '清洁是信仰的一部分。', en: 'Cleanliness is part of faith.' },
  { text: 'Mandi dua kali sehari.', ms: 'Mandi dua kali sehari.', zh: '每天洗澡两次。', en: 'Bathe twice a day.' },
];

// ============================================
// MATCHING SYLLABLES (additional)
// ============================================
const MATCHING_SYLLABLES = [
  // Additional syllables from matching activities
  'la', 'ti', 'le', 'tu', 'lo', 'na', 'cu', 'ne', 'ce',
  'li', 'di', 'ri', 'pi', 'ju', 'ro', 'ru',
  // More consonant combinations
  'da', 'de', 'do', 'du',
  'fa', 'fe', 'fi', 'fo', 'fu',
  'ha', 'he', 'hi', 'ho', 'hu',
  'ja', 'je', 'ji', 'jo', 'ju',
  'la', 'le', 'li', 'lo', 'lu',
  'na', 'ne', 'ni', 'no', 'nu',
  'pa', 'pe', 'pi', 'po', 'pu',
  'ra', 're', 'ri', 'ro', 'ru',
  'ta', 'te', 'ti', 'to', 'tu',
  'wa', 'we', 'wi', 'wo', 'wu',
  'ya', 'ye', 'yi', 'yo', 'yu',
];

// Remove duplicates and combine with base syllables
const ALL_SYLLABLES = [...new Set([...BASE_SYLLABLES, ...MATCHING_SYLLABLES])];

// ============================================
// DICTATION WORDS
// ============================================
const DICTATION_WORDS = [
  // Unit 1
  'ayam', 'epal', 'ikan', 'oren', 'ular',
  // Unit 2
  'nasi', 'susu', 'bubur', 'teh', 'kopi',
  // Unit 3
  'joran', 'bakul', 'kasut', 'kolam',
  // Unit 8
  'telur', 'pisang', 'roti',
];

// ============================================
// REGISTRY BUILDER FUNCTIONS
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function buildSyllableGuideRegistry(): AudioItem[] {
  const items: AudioItem[] = [];
  const locales: Locale[] = ['ms', 'zh', 'en'];

  for (const locale of locales) {
    for (const syl of ALL_SYLLABLES) {
      const isVowel = syl.length === 1 && 'aeiou'.includes(syl);
      const guideText = SYLLABLE_GUIDE_TEMPLATES[locale](syl, isVowel);

      items.push({
        id: `syllable_guide_${locale}_${syl}`,
        type: 'syllable_guide',
        text: guideText,
        locale,
        filePath: `syllable/${locale}/guide/${syl}`,
        priority: 1,
      });
    }
  }

  return items;
}

export function buildSyllablePronunciationRegistry(): AudioItem[] {
  const items: AudioItem[] = [];
  const locales: Locale[] = ['ms', 'zh', 'en'];

  for (const locale of locales) {
    for (const syl of ALL_SYLLABLES) {
      items.push({
        id: `syllable_pronunciation_${locale}_${syl}`,
        type: 'syllable_pronunciation',
        text: syl,
        locale,
        filePath: `syllable/${locale}/pronunciation/${syl}`,
        priority: 1,
      });
    }
  }

  return items;
}

export function buildVocabularyRegistry(): AudioItem[] {
  const items: AudioItem[] = [];
  const locales: Locale[] = ['ms', 'zh', 'en'];

  for (const vocab of VOCABULARY_WORDS) {
    for (const locale of locales) {
      const text = vocab[locale] || vocab.word;
      items.push({
        id: `vocabulary_${locale}_${slugify(vocab.word)}`,
        type: 'vocabulary',
        text,
        locale,
        filePath: `vocabulary/${locale}/${slugify(vocab.word)}`,
        priority: 2,
      });
    }
  }

  return items;
}

export function buildPhraseRegistry(): AudioItem[] {
  const items: AudioItem[] = [];
  const locales: Locale[] = ['ms', 'zh', 'en'];

  for (let i = 0; i < SPEAKING_PHRASES.length; i++) {
    const phrase = SPEAKING_PHRASES[i];
    for (const locale of locales) {
      const text = phrase[locale] || phrase.text;
      // Replace {name} placeholder with generic name for TTS
      const textForTTS = text.replace('{name}', locale === 'ms' ? 'Ali' : locale === 'zh' ? '小明' : 'Ali');

      items.push({
        id: `phrase_${locale}_${i}`,
        type: 'phrase',
        text: textForTTS,
        locale,
        filePath: `phrase/${locale}/${slugify(phrase.text).substring(0, 30)}_${i}`,
        priority: 2,
      });
    }
  }

  return items;
}

export function buildDictationRegistry(): AudioItem[] {
  const items: AudioItem[] = [];
  const locales: Locale[] = ['ms', 'zh', 'en'];
  const uniqueWords = [...new Set(DICTATION_WORDS)];

  for (const word of uniqueWords) {
    // Find vocab entry for translation
    const vocab = VOCABULARY_WORDS.find(v => v.word === word);

    for (const locale of locales) {
      const text = vocab ? (vocab[locale] || word) : word;
      items.push({
        id: `dictation_${locale}_${slugify(word)}`,
        type: 'dictation',
        text,
        locale,
        filePath: `dictation/${locale}/${slugify(word)}`,
        priority: 1,
      });
    }
  }

  return items;
}

export function buildMatchingRegistry(): AudioItem[] {
  // Matching uses syllable pronunciations - reuse syllable registry
  // This function returns letter/syllable sounds for matching activities
  const items: AudioItem[] = [];
  const locales: Locale[] = ['ms', 'zh', 'en'];
  const letters = 'AEIOU'.split(''); // Vowel letters for matching

  for (const locale of locales) {
    for (const letter of letters) {
      items.push({
        id: `matching_${locale}_letter_${letter.toLowerCase()}`,
        type: 'matching',
        text: letter,
        locale,
        filePath: `matching/${locale}/letter_${letter.toLowerCase()}`,
        priority: 2,
      });
    }
  }

  return items;
}

export function buildFullRegistry(): AudioItem[] {
  return [
    ...buildSyllableGuideRegistry(),
    ...buildSyllablePronunciationRegistry(),
    ...buildVocabularyRegistry(),
    ...buildPhraseRegistry(),
    ...buildDictationRegistry(),
    ...buildMatchingRegistry(),
  ];
}

export function getRegistryStats() {
  const full = buildFullRegistry();
  const byType: Record<string, number> = {};
  const byLocale: Record<string, number> = {};

  for (const item of full) {
    byType[item.type] = (byType[item.type] || 0) + 1;
    byLocale[item.locale] = (byLocale[item.locale] || 0) + 1;
  }

  return {
    total: full.length,
    byType,
    byLocale,
  };
}

// Export data for direct access
export { ALL_SYLLABLES, VOCABULARY_WORDS, SPEAKING_PHRASES, DICTATION_WORDS };
