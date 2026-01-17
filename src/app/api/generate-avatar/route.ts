import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface GenerateAvatarRequest {
  kidId: string;
  avatarFace: string;
  equipment: {
    helmet?: { name: string; tier: string } | null;
    chestplate?: { name: string; tier: string } | null;
    leggings?: { name: string; tier: string } | null;
    boots?: { name: string; tier: string } | null;
    weapon?: { name: string; tier: string } | null;
    tool?: { name: string; tier: string } | null;
    ranged?: { name: string; tier: string } | null;
    shield?: { name: string; tier: string } | null;
  };
  pet?: { name: string; mobType: string; rarity: string } | null;
}

// Map emoji faces to descriptive expressions
const faceDescriptions: Record<string, string> = {
  '😊': 'warm friendly smile with rosy cheeks and sparkling happy eyes',
  '😄': 'big cheerful grin showing excitement and joy',
  '😎': 'cool confident expression with a slight smirk',
  '🤩': 'amazed starry-eyed expression full of wonder',
  '😁': 'wide beaming smile radiating happiness',
  '🥳': 'celebratory excited face ready for adventure',
  '😃': 'bright enthusiastic smile with wide eyes',
  '🙂': 'gentle pleasant smile, calm and friendly',
  '😺': 'playful cat-like smile, mischievous and cute',
  '🦊': 'clever fox-like expression, smart and adventurous',
  '🐱': 'cute kitty face with whiskers and button nose',
  '🐶': 'adorable puppy-like face, loyal and eager',
};

// Equipment tier visual descriptions (40 tiers)
const tierVisuals: Record<string, { material: string; glow: string; quality: string }> = {
  // Classic tiers (Units 1-6)
  wood: { material: 'simple wooden planks with natural grain', glow: 'warm earthy brown tones', quality: 'humble beginner' },
  leather: { material: 'warm brown leather with visible stitching', glow: 'subtle warm brown tones', quality: 'rustic beginner adventurer' },
  stone: { material: 'solid gray cobblestone with rough texture', glow: 'cool gray stone tones', quality: 'determined apprentice' },
  chain: { material: 'interlocking silver metal rings with metallic sheen', glow: 'cool silver metallic reflections', quality: 'experienced fighter' },
  iron: { material: 'polished steel plates with rivets and shine', glow: 'bright metallic silver gleam', quality: 'strong warrior' },
  gold: { material: 'luxurious golden metal with ornate engravings', glow: 'radiant golden aura and sparkles', quality: 'royal champion' },
  diamond: { material: 'crystalline blue diamond with magical shimmer', glow: 'magical cyan/blue particles and ethereal glow', quality: 'legendary hero' },
  netherite: { material: 'dark ancient netherite with volcanic cracks', glow: 'smoldering dark red ember glow', quality: 'nether conqueror' },
  // Enchanted tiers (Units 7-12)
  enchanted_iron: { material: 'enchanted iron glowing with purple runes', glow: 'mystical purple enchantment sparkles', quality: 'enchanted warrior' },
  enchanted_gold: { material: 'magically enhanced gold with swirling auras', glow: 'golden magical particles and light beams', quality: 'arcane knight' },
  enchanted_diamond: { material: 'diamond infused with powerful magic', glow: 'brilliant blue-purple magical aura', quality: 'spell-forged champion' },
  enchanted_netherite: { material: 'netherite with dark magical flames', glow: 'dark fire and purple rune glow', quality: 'shadow mage warrior' },
  prismarine: { material: 'ocean prismarine with sea crystal patterns', glow: 'teal ocean shimmer and water reflections', quality: 'guardian of the depths' },
  amethyst: { material: 'purple crystal amethyst with geode texture', glow: 'violet crystal resonance and sparkles', quality: 'crystal sage' },
  // Elemental tiers (Units 13-20)
  blaze: { material: 'blazing fire armor with living flames', glow: 'intense orange-red fire particles', quality: 'flame wielder' },
  frost: { material: 'frozen ice armor with crystalline frost', glow: 'icy blue particles and snowflakes', quality: 'frost champion' },
  storm: { material: 'storm-charged armor with lightning crackling', glow: 'electric yellow-purple lightning bolts', quality: 'thunder lord' },
  emerald: { material: 'rich green emerald with village engravings', glow: 'brilliant green gem sparkle', quality: 'emerald merchant king' },
  obsidian: { material: 'volcanic obsidian glass with purple veins', glow: 'deep purple void reflections', quality: 'obsidian sentinel' },
  redstone: { material: 'glowing red redstone circuits and wires', glow: 'pulsing red energy circuits', quality: 'redstone engineer' },
  lapis: { material: 'deep blue lapis lazuli with golden trim', glow: 'mystical blue enchanting glow', quality: 'lapis enchanter' },
  glowstone: { material: 'luminous glowstone with bright particles', glow: 'bright yellow-orange light emission', quality: 'light bringer' },
  // Mythic tiers (Units 21-30)
  ender: { material: 'end dimension purple with teleportation effects', glow: 'purple enderman particles and void energy', quality: 'ender walker' },
  dragon: { material: 'dragon scale armor with wing motifs', glow: 'purple-black dragon fire aura', quality: 'dragon rider' },
  wither: { material: 'wither skull armor with dark bones', glow: 'dark smoky wither effect and skulls', quality: 'wither slayer' },
  phoenix: { material: 'phoenix feather armor with rebirth flames', glow: 'golden-orange phoenix fire and feathers', quality: 'reborn phoenix knight' },
  titan: { material: 'massive titan plates with ancient power', glow: 'earth-shaking brown-gold energy', quality: 'titan champion' },
  shadow: { material: 'void shadow armor absorbing light', glow: 'dark void tendrils and shadow mist', quality: 'shadow assassin' },
  radiant: { material: 'pure light armor radiating brilliance', glow: 'blinding white-gold holy light', quality: 'radiant paladin' },
  ancient: { material: 'ancient civilization relics with runes', glow: 'ancient gold symbols glowing', quality: 'ancient guardian' },
  celestial: { material: 'star and moon infused cosmic armor', glow: 'twinkling stars and moonlight aura', quality: 'celestial knight' },
  void: { material: 'dimension-warping void armor', glow: 'space-bending dark purple vortex', quality: 'void walker' },
  // Ultimate tiers (Units 31-40)
  heroic: { material: 'champion heroic armor with medals', glow: 'inspiring golden hero light', quality: 'legendary hero' },
  mythical: { material: 'mythical artifact armor from legends', glow: 'rainbow prismatic mythical energy', quality: 'myth incarnate' },
  immortal: { material: 'undying immortal armor defying death', glow: 'eternal green life energy', quality: 'immortal warrior' },
  divine: { material: 'god-touched divine armor with halos', glow: 'divine white-gold heavenly rays', quality: 'divine avatar' },
  cosmic: { material: 'universe-forged cosmic armor with galaxies', glow: 'swirling galaxy and nebula patterns', quality: 'cosmic entity' },
  eternal: { material: 'timeless eternal armor beyond time', glow: 'time-warping golden clock particles', quality: 'eternal guardian' },
  ascended: { material: 'transcendent ascended armor of enlightenment', glow: 'ascending white light beams', quality: 'ascended master' },
  supreme: { material: 'ultimate supreme armor of pure power', glow: 'overwhelming multicolor power aura', quality: 'supreme ruler' },
  omega: { material: 'final form omega armor perfected', glow: 'omega symbol energy bursts', quality: 'omega champion' },
  infinity: { material: 'infinite power armor with all elements', glow: 'prismatic rainbow infinity particles', quality: 'infinity master' },
};

// Weapon descriptions by tier (sword in right hand)
const weaponVisuals: Record<string, string> = {
  wood: 'basic wooden sword with simple grip',
  leather: 'simple wooden sword with leather-wrapped handle',
  stone: 'stone blade sword with cobblestone texture',
  chain: 'stone blade sword with metal guard',
  iron: 'gleaming iron sword with cross-guard',
  gold: 'ornate golden sword with jeweled hilt',
  diamond: 'legendary diamond sword glowing with magical energy',
  netherite: 'dark netherite sword with volcanic edge',
  // Enchanted
  enchanted_iron: 'enchanted iron sword with purple runes',
  enchanted_gold: 'magically glowing golden sword',
  enchanted_diamond: 'brilliant enchanted diamond sword',
  enchanted_netherite: 'dark magic netherite blade with flames',
  prismarine: 'ocean prismarine trident-sword hybrid',
  amethyst: 'purple crystal amethyst blade',
  // Elemental
  blaze: 'flaming blaze sword wreathed in fire',
  frost: 'frozen ice sword with frost particles',
  storm: 'lightning-charged storm blade crackling',
  emerald: 'emerald sword with villager engravings',
  obsidian: 'obsidian glass blade sharp as void',
  redstone: 'redstone-powered glowing sword',
  lapis: 'lapis lazuli enchanted blade',
  glowstone: 'luminous glowstone light blade',
  // Mythic
  ender: 'ender sword with teleportation trails',
  dragon: 'dragon-scale sword with purple flames',
  wither: 'wither bone sword with dark aura',
  phoenix: 'phoenix feather blade of rebirth',
  titan: 'massive titan greatsword',
  shadow: 'void shadow blade absorbing light',
  radiant: 'holy radiant sword of pure light',
  ancient: 'ancient relic sword with runes',
  celestial: 'star-forged celestial blade',
  void: 'dimension-cutting void sword',
  // Ultimate
  heroic: 'heroic champion sword with medals',
  mythical: 'mythical artifact sword from legends',
  immortal: 'immortal undying blade',
  divine: 'god-touched divine sword with halo',
  cosmic: 'galaxy-forged cosmic blade',
  eternal: 'timeless eternal sword',
  ascended: 'transcendent ascended blade',
  supreme: 'ultimate supreme sword of power',
  omega: 'perfected omega blade',
  infinity: 'infinite prismatic infinity blade',
};

// Tool descriptions by tier (pickaxe on belt/back)
const toolVisuals: Record<string, string> = {
  wood: 'basic wooden pickaxe strapped to belt',
  leather: 'leather-gripped wooden pickaxe on belt',
  stone: 'stone pickaxe hanging from belt loop',
  chain: 'stone pickaxe with metal handle on back',
  iron: 'iron pickaxe secured to belt',
  gold: 'ornate golden pickaxe on decorative belt',
  diamond: 'diamond pickaxe glowing on belt',
  netherite: 'dark netherite pickaxe strapped to back',
  enchanted_iron: 'enchanted iron pickaxe with runes on belt',
  enchanted_gold: 'magical golden pickaxe glowing at hip',
  enchanted_diamond: 'brilliant diamond pickaxe on belt',
  enchanted_netherite: 'dark magic pickaxe strapped to back',
  prismarine: 'prismarine pickaxe at belt',
  amethyst: 'crystal amethyst pickaxe on hip',
  blaze: 'flaming pickaxe at belt',
  frost: 'ice pickaxe at hip',
  storm: 'lightning pickaxe on belt',
  emerald: 'emerald pickaxe at belt',
  obsidian: 'obsidian pickaxe strapped to back',
  redstone: 'redstone pickaxe glowing at hip',
  lapis: 'lapis pickaxe at belt',
  glowstone: 'glowing pickaxe at hip',
  ender: 'ender pickaxe at belt',
  dragon: 'dragon pickaxe on back',
  wither: 'wither pickaxe at hip',
  phoenix: 'phoenix pickaxe at belt',
  titan: 'massive titan pickaxe on back',
  shadow: 'shadow pickaxe at hip',
  radiant: 'radiant pickaxe at belt',
  ancient: 'ancient pickaxe at hip',
  celestial: 'celestial pickaxe at belt',
  void: 'void pickaxe on back',
  heroic: 'heroic pickaxe at belt',
  mythical: 'mythical pickaxe at hip',
  immortal: 'immortal pickaxe at belt',
  divine: 'divine pickaxe at hip',
  cosmic: 'cosmic pickaxe on back',
  eternal: 'eternal pickaxe at belt',
  ascended: 'ascended pickaxe at hip',
  supreme: 'supreme pickaxe at belt',
  omega: 'omega pickaxe on back',
  infinity: 'infinity pickaxe at belt',
};

// Ranged weapon descriptions by tier (bow/crossbow on back)
const rangedVisuals: Record<string, string> = {
  wood: 'simple wooden bow slung across back',
  leather: 'leather-bound bow on back',
  stone: 'stone-tipped bow on back',
  chain: 'reinforced bow slung over shoulder',
  iron: 'iron crossbow strapped to back',
  gold: 'ornate golden bow with quiver on back',
  diamond: 'diamond-tipped bow glowing on back',
  netherite: 'dark netherite crossbow on back',
  enchanted_iron: 'enchanted iron bow with magic arrows on back',
  enchanted_gold: 'magical golden bow glowing on back',
  enchanted_diamond: 'brilliant enchanted bow on back',
  enchanted_netherite: 'dark magic crossbow on back',
  prismarine: 'prismarine bow with water arrows on back',
  amethyst: 'crystal bow shooting amethyst shards on back',
  blaze: 'fire bow with flame arrows on back',
  frost: 'ice bow with frost arrows on back',
  storm: 'lightning bow crackling on back',
  emerald: 'emerald bow on back',
  obsidian: 'obsidian crossbow on back',
  redstone: 'redstone-powered crossbow on back',
  lapis: 'lapis enchanted bow on back',
  glowstone: 'luminous bow on back',
  ender: 'ender bow with teleport arrows on back',
  dragon: 'dragon bow shooting purple flames on back',
  wither: 'wither skull crossbow on back',
  phoenix: 'phoenix feather bow on back',
  titan: 'massive titan greatbow on back',
  shadow: 'shadow bow on back',
  radiant: 'holy light bow on back',
  ancient: 'ancient relic bow on back',
  celestial: 'star-shooting celestial bow on back',
  void: 'void-opening bow on back',
  heroic: 'heroic bow on back',
  mythical: 'mythical bow on back',
  immortal: 'immortal bow on back',
  divine: 'divine bow on back',
  cosmic: 'cosmic bow on back',
  eternal: 'eternal bow on back',
  ascended: 'ascended bow on back',
  supreme: 'supreme bow on back',
  omega: 'omega bow on back',
  infinity: 'infinity bow on back',
};

// Shield descriptions by tier (on left arm)
const shieldVisuals: Record<string, string> = {
  wood: 'basic wooden shield on left arm',
  leather: 'leather-reinforced wooden shield on left arm',
  stone: 'stone-plated shield on left arm',
  chain: 'chainmail-covered shield on left arm',
  iron: 'sturdy iron shield with crest on left arm',
  gold: 'ornate golden shield with royal emblem on left arm',
  diamond: 'crystalline diamond shield glowing on left arm',
  netherite: 'dark netherite tower shield on left arm',
  enchanted_iron: 'enchanted iron shield with barrier magic on left arm',
  enchanted_gold: 'magical golden shield shimmering on left arm',
  enchanted_diamond: 'brilliant enchanted shield on left arm',
  enchanted_netherite: 'dark magic shield with flames on left arm',
  prismarine: 'ocean prismarine shield on left arm',
  amethyst: 'crystal amethyst shield on left arm',
  blaze: 'flaming shield wreathed in fire on left arm',
  frost: 'frozen ice shield on left arm',
  storm: 'lightning-charged shield on left arm',
  emerald: 'emerald shield on left arm',
  obsidian: 'obsidian mirror shield on left arm',
  redstone: 'redstone energy shield on left arm',
  lapis: 'lapis barrier shield on left arm',
  glowstone: 'luminous shield on left arm',
  ender: 'ender shield with void protection on left arm',
  dragon: 'dragon scale shield on left arm',
  wither: 'wither bone shield on left arm',
  phoenix: 'phoenix feather shield on left arm',
  titan: 'massive titan tower shield on left arm',
  shadow: 'shadow shield absorbing attacks on left arm',
  radiant: 'holy radiant shield of light on left arm',
  ancient: 'ancient relic shield on left arm',
  celestial: 'star-patterned celestial shield on left arm',
  void: 'dimension-warping void shield on left arm',
  heroic: 'heroic champion shield on left arm',
  mythical: 'mythical artifact shield on left arm',
  immortal: 'immortal shield on left arm',
  divine: 'divine holy shield with halo on left arm',
  cosmic: 'galaxy-patterned cosmic shield on left arm',
  eternal: 'timeless eternal shield on left arm',
  ascended: 'transcendent shield on left arm',
  supreme: 'supreme power shield on left arm',
  omega: 'omega shield on left arm',
  infinity: 'infinite prismatic shield on left arm',
};

// Pet/companion descriptions by mob type
const petDescriptions: Record<string, string> = {
  // Passive mobs
  chicken: 'a cute white chicken with red comb, standing loyally nearby',
  cow: 'a friendly brown and white spotted cow companion',
  pig: 'an adorable pink pig with a happy snout',
  sheep: 'a fluffy white sheep with soft wool',
  rabbit: 'a small cute bunny hopping beside the character',
  // Baby versions
  baby_cow: 'an adorable baby calf following loyally',
  baby_rabbit: 'a tiny baby bunny, extremely cute and fluffy',
  wolf_pup: 'a playful wolf puppy with big eyes',
  kitten: 'a cute little kitten with whiskers',
  fox_kit: 'a baby fox kit with big ears and fluffy tail',
  parrot_chick: 'a colorful baby parrot perched on shoulder',
  // Uncommon
  cat: 'a sleek cat companion with bright eyes',
  wolf: 'a loyal tamed wolf with red collar',
  fox: 'a cute orange fox with fluffy tail',
  parrot: 'a colorful parrot perched on character\'s shoulder',
  turtle: 'a friendly sea turtle companion',
  // Rare
  bee: 'a fuzzy yellow and black bee hovering nearby',
  panda: 'a cute black and white panda sitting beside',
  axolotl: 'a pink axolotl with adorable smile and feathery gills',
  ocelot: 'a spotted jungle ocelot',
  llama: 'a fluffy llama with colorful decorations',
  // Epic (monsters)
  skeleton: 'a friendly skeleton companion with bow',
  zombie: 'a tamed zombie friend in worn clothes',
  creeper: 'a friendly creeper that won\'t explode',
  spider: 'a tamed spider with multiple eyes',
  slime: 'a bouncy green slime companion',
  // Legendary
  iron_golem: 'a protective iron golem standing guard',
  snow_golem: 'a cheerful snow golem with pumpkin head',
  allay: 'a glowing blue allay floating and dancing',
  ender_dragon: 'a baby ender dragon perched protectively',
  wither: 'a miniature friendly wither companion',
};

export async function POST(request: NextRequest) {
  try {
    const { kidId, avatarFace, equipment, pet }: GenerateAvatarRequest = await request.json();

    if (!kidId) {
      return NextResponse.json({ error: 'Kid ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify kid ownership
    const { data: kid, error: kidError } = await supabase
      .from('kids')
      .select('*')
      .eq('id', kidId)
      .eq('parent_id', user.id)
      .single();

    if (kidError || !kid) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Avatar generation not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    // Build dynamic face description
    const faceDesc = faceDescriptions[avatarFace] ||
      (avatarFace ? `expressive face showing "${avatarFace}" emotion` : 'friendly smiling face with bright eyes');

    // Build detailed equipment descriptions
    const equipmentParts: string[] = [];
    const tiers: string[] = [];

    if (equipment.helmet) {
      const tier = equipment.helmet.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`HEAD: ${visual.material} helmet protecting the head`);
    }

    if (equipment.chestplate) {
      const tier = equipment.chestplate.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`CHEST: ${visual.material} chestplate armor covering torso`);
    }

    if (equipment.leggings) {
      const tier = equipment.leggings.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`LEGS: ${visual.material} leggings protecting the legs`);
    }

    if (equipment.boots) {
      const tier = equipment.boots.tier;
      tiers.push(tier);
      const visual = tierVisuals[tier];
      equipmentParts.push(`FEET: ${visual.material} boots on the feet`);
    }

    if (equipment.weapon) {
      const tier = equipment.weapon.tier;
      tiers.push(tier);
      const visual = weaponVisuals[tier] || `${tier} sword`;
      equipmentParts.push(`RIGHT HAND: ${visual} - primary melee weapon prominently displayed`);
    }

    // Shield on left arm (game design: defensive off-hand item)
    if (equipment.shield) {
      const tier = equipment.shield.tier;
      tiers.push(tier);
      const visual = shieldVisuals[tier] || `${tier} shield on left arm`;
      equipmentParts.push(`LEFT ARM: ${visual} - defensive shield clearly visible`);
    }

    // Ranged weapon on back (game design: stored when not primary)
    if (equipment.ranged) {
      const tier = equipment.ranged.tier;
      tiers.push(tier);
      const visual = rangedVisuals[tier] || `${tier} bow on back`;
      equipmentParts.push(`BACK (upper): ${visual} - ranged weapon slung across back`);
    }

    // Tool on belt/back (game design: utility item stored at hip)
    if (equipment.tool) {
      const tier = equipment.tool.tier;
      tiers.push(tier);
      const visual = toolVisuals[tier] || `${tier} pickaxe at belt`;
      equipmentParts.push(`BELT/HIP: ${visual} - mining tool secured at waist`);
    }

    // Determine highest tier for overall theme (expanded for 40 tiers)
    const tierRank = [
      'wood', 'leather', 'stone', 'chain', 'iron', 'gold', 'diamond', 'netherite',
      'enchanted_iron', 'enchanted_gold', 'enchanted_diamond', 'enchanted_netherite', 'prismarine', 'amethyst',
      'blaze', 'frost', 'storm', 'emerald', 'obsidian', 'redstone', 'lapis', 'glowstone',
      'ender', 'dragon', 'wither', 'phoenix', 'titan', 'shadow', 'radiant', 'ancient', 'celestial', 'void',
      'heroic', 'mythical', 'immortal', 'divine', 'cosmic', 'eternal', 'ascended', 'supreme', 'omega', 'infinity'
    ];
    const highestTier = tiers.length > 0
      ? tiers.reduce((a, b) => tierRank.indexOf(a) > tierRank.indexOf(b) ? a : b)
      : 'leather';

    const themeVisual = tierVisuals[highestTier] || tierVisuals.leather;
    const hasEquipment = equipmentParts.length > 0;

    // Dynamic background based on tier phase
    const getBackgroundForTier = (tier: string): string => {
      const idx = tierRank.indexOf(tier);
      if (idx <= 5) return 'sunny grass field with blue sky, peaceful village vibe'; // Classic
      if (idx <= 7) return 'stone castle courtyard with training dummies'; // Iron/Gold
      if (idx <= 13) return 'magical enchanting room with floating books and purple particles'; // Enchanted
      if (idx <= 21) return 'elemental realm with fire, ice, and lightning swirling'; // Elemental
      if (idx <= 31) return 'mythical dimension with floating islands and dragons'; // Mythic
      return 'cosmic void with galaxies, stars, and rainbow prismatic energy'; // Ultimate
    };

    const backgrounds: Record<string, string> = {
      leather: 'sunny grass field with blue sky, peaceful village vibe',
      chain: 'stone castle courtyard with training dummies',
      iron: 'mountain fortress with snow peaks in distance',
      gold: 'royal palace garden with golden sunlight',
      diamond: 'magical floating islands with aurora borealis, mystical particles',
    };

    // Build pet description
    const petDescription = pet
      ? petDescriptions[pet.mobType] || `a cute ${pet.name} companion`
      : null;

    // Count equipped items for composition guidance
    const hasWeapon = !!equipment.weapon;
    const hasShield = !!equipment.shield;
    const hasRanged = !!equipment.ranged;
    const hasTool = !!equipment.tool;
    const totalItems = (hasWeapon ? 1 : 0) + (hasShield ? 1 : 0) + (hasRanged ? 1 : 0) + (hasTool ? 1 : 0);

    // Build the dynamic prompt with professional game design for full loadout
    const prompt = `Generate a stunning 3D Minecraft-style character avatar!

===== CHARACTER FACE =====
${faceDesc}
The face should clearly show this expression - it's very important for the character's personality!

===== FULL EQUIPMENT LOADOUT (PROFESSIONAL RPG GAME DESIGN) =====
${hasEquipment ? equipmentParts.join('\n') : 'No armor equipped - wearing simple villager clothes (brown shirt, blue pants)'}

${hasEquipment ? `Overall appearance: ${themeVisual.quality} with ${themeVisual.glow}` : 'Simple but cheerful village kid look'}

===== EQUIPMENT PLACEMENT GUIDE (IMPORTANT FOR VISUAL CLARITY) =====
Like professional RPG games (Minecraft Dungeons, Zelda, etc.), show ALL equipped items clearly:
${hasWeapon ? '- SWORD: Held prominently in RIGHT HAND, blade pointing slightly upward in heroic pose' : ''}
${hasShield ? '- SHIELD: Strapped to LEFT ARM, angled to show the front design clearly' : ''}
${hasRanged ? '- BOW/CROSSBOW: Slung diagonally across the BACK (upper area), visible over shoulder' : ''}
${hasTool ? '- PICKAXE: Hanging from BELT on hip or strapped to lower back, handle visible' : ''}
${totalItems >= 3 ? `
LAYERING (for ${totalItems} items):
- Front layer: Sword (right hand) + Shield (left arm)
- Back layer: Bow across upper back, Pickaxe at belt/lower back
- Ensure NO items overlap confusingly - each should be distinctly visible!` : ''}

===== PET COMPANION =====
${petDescription ? `IMPORTANT: Include ${petDescription} - the pet should be clearly visible next to or near the character, looking cute and friendly!` : 'No pet companion'}

===== UNEQUIPPED BODY PARTS =====
${!equipment.helmet ? '- HEAD: Show the character\'s face and hair clearly (no helmet)' : ''}
${!equipment.chestplate ? '- CHEST: Simple colored shirt/tunic' : ''}
${!equipment.leggings ? '- LEGS: Basic blue pants like Steve' : ''}
${!equipment.boots ? '- FEET: Simple brown shoes' : ''}
${!hasWeapon ? '- RIGHT HAND: Empty or in fist' : ''}
${!hasShield ? '- LEFT ARM: No shield, arm relaxed' : ''}

===== 3D ART STYLE (CRITICAL) =====
- Authentic Minecraft blocky/cubic body: square head, rectangular torso, blocky limbs
- HIGH QUALITY 3D RENDER with ray-traced lighting
- Smooth surfaces with realistic reflections on armor/equipment
- Vibrant saturated colors
- Soft shadows and ambient occlusion
- ${tierRank.indexOf(highestTier) >= 14 ? 'Add magical particle effects and glowing aura around equipment' : tierRank.indexOf(highestTier) >= 8 ? 'Add subtle enchantment sparkles' : 'Clean polished look'}

===== COMPOSITION =====
- 3/4 angle view showing character depth (slightly turned so back-mounted items visible)
- Full body visible, HEROIC BATTLE-READY POSE
${totalItems >= 2 ? '- Pose should showcase ALL equipped items: sword forward, shield raised, bow visible on back' : '- Standing confidently'}
- Background: ${getBackgroundForTier(highestTier)}
- Rim lighting to make character pop
- Character should fill most of the frame

===== MOOD =====
This is for a children's educational game - make the character look like an AWESOME hero that kids would want to be!
${hasEquipment ? `This ${themeVisual.quality} is FULLY EQUIPPED and ready for epic learning adventures!` : 'A brave young adventurer starting their journey!'}`;

    // Use Gemini 2.5 Flash Image (Nano Banana) for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini avatar generation error:', errorText);
      return NextResponse.json(
        { error: 'Avatar generation failed', details: errorText },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Extract image data from response
    let imageData: string | null = null;
    let mimeType = 'image/png';

    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'No avatar image generated', code: 'NO_IMAGE' },
        { status: 503 }
      );
    }

    // Convert base64 to buffer for upload
    const imageBuffer = Buffer.from(imageData, 'base64');
    const fileName = `avatar_${kidId}_${Date.now()}.png`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      // Return the base64 image anyway if storage fails
      return NextResponse.json({
        success: true,
        imageData: `data:${mimeType};base64,${imageData}`,
        stored: false,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update kid record with new avatar URL
    const { error: updateError } = await supabase
      .from('kids')
      .update({ generated_avatar_url: avatarUrl })
      .eq('id', kidId);

    if (updateError) {
      console.error('Update kid avatar error:', updateError);
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      stored: true,
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Avatar generation service error' },
      { status: 500 }
    );
  }
}
