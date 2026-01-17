---
name: generating-equipment
description: Generates 8-bit warrior RPG-style equipment items for the MYLearnt gamification system. Creates new armor pieces, weapons, tools, and accessories for player characters. Handles 40 unique equipment tiers (wood to infinity), 8 slots (helmet, chestplate, leggings, boots, weapon, tool, ranged, shield), rarity levels, and AI image generation. Equipment serves as rewards for completing learning activities across 40 units.
---

# Generating Equipment

Creates 8-bit warrior RPG-themed equipment items for the MYLearnt reward system with 40 unique tiers.

## Quick Start

### Most Common Task: Add a New Equipment Item

```sql
-- 1. Insert the equipment record
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level, unit_number, color_primary, color_secondary)
VALUES (
  'Phoenix Helmet',
  'Topi Phoenix',
  '凤凰头盔',
  'Phoenix Helmet',
  'helmet',
  'phoenix',
  'legendary',
  24,
  24,
  '#FF4500',
  '#FFD700'
) RETURNING id;

-- 2. Generate image via API (or manually upload)
-- POST /api/generate-equipment with the equipment details

-- 3. Update with image URL (IMPORTANT: use leading slash, no 'images' prefix)
UPDATE equipment SET image_url = '/equipment/phoenix_helmet.png' WHERE name = 'Phoenix Helmet';
```

### Quick Reference: 40 Tier Progression System

| Phase | Units | Tiers | Rarity |
|-------|-------|-------|--------|
| Classic | 1-6 | wood/leather, stone, iron, gold, diamond, darksteel | common → epic |
| Enchanted | 7-10 | enchanted_iron, enchanted_gold, enchanted_diamond, enchanted_darksteel | rare → epic |
| Advanced | 11-12 | seafoam, amethyst | epic |
| Elemental | 13-20 | blaze, frost, storm, emerald, obsidian, crimsonite, lapis, luminite | epic → legendary |
| Mythic | 21-30 | voidstone, dragonscale, darkbone, phoenix, titan, shadow, radiant, ancient, celestial, void | legendary |
| Ultimate | 31-40 | heroic, mythical, immortal, divine, cosmic, eternal, ascended, supreme, omega, infinity | legendary |

### CRITICAL: Database image_url Format

```
✅ CORRECT: '/equipment/leather_helmet.png'
❌ WRONG:   'images/equipment/leather_helmet.png'
```

The app constructs the full URL by prepending `{SUPABASE_URL}/storage/v1/object/public/images`.
If you store `images/equipment/...`, it becomes `images/images/equipment/...` (broken).

---

## Equipment Slot Types (8 slots)

| Slot | Description | Equipment Type |
|------|-------------|----------------|
| `helmet` | Head armor | Caps, Helmets, Crowns |
| `chestplate` | Body armor | Tunics, Chestplates |
| `leggings` | Leg armor | Pants, Leggings |
| `boots` | Foot armor | Boots, Shoes |
| `weapon` | Primary weapon | Swords, Daggers, Tridents |
| `tool` | Mining/utility tool | Pickaxes |
| `ranged` | Ranged weapon | Bows, Crossbows |
| `shield` | Defensive shield | Shields |

---

## Complete Tier System (40 Tiers)

### Phase 1: Classic 8-bit warrior RPG Tiers (Units 1-6)

| Unit | Tier | Rarity | Color Primary | Color Secondary | Theme |
|------|------|--------|---------------|-----------------|-------|
| 1 | wood/leather | common | #8B4513 | #D2691E | Basic starter gear |
| 2 | stone | common | #808080 | #A9A9A9 | Sturdy cobblestone |
| 3 | iron | rare | #D3D3D3 | #A9A9A9 | First metal tier |
| 4 | gold | rare | #FFD700 | #FFA500 | Royal golden set |
| 5 | diamond | epic | #00CED1 | #40E0D0 | Precious gems |
| 6 | darksteel | epic | #4A4A4A | #8B0000 | Nether-forged |

### Phase 2: Enchanted Tiers (Units 7-12)

| Unit | Tier | Rarity | Color Primary | Color Secondary | Theme |
|------|------|--------|---------------|-----------------|-------|
| 7 | enchanted_iron | rare | #D3D3D3 | #9370DB | Glowing iron with magic |
| 8 | enchanted_gold | epic | #FFD700 | #9370DB | Shimmering golden magic |
| 9 | enchanted_diamond | epic | #00CED1 | #9370DB | Sparkling enchantments |
| 10 | enchanted_darksteel | epic | #4A4A4A | #9370DB | Dark magical flames |
| 11 | seafoam | epic | #5F9EA0 | #20B2AA | Ocean monument gear |
| 12 | amethyst | epic | #9966CC | #E6E6FA | Crystal purple gear |

### Phase 3: Elemental Tiers (Units 13-20)

| Unit | Tier | Rarity | Color Primary | Color Secondary | Theme |
|------|------|--------|---------------|-----------------|-------|
| 13 | blaze | epic | #FF4500 | #FF8C00 | Fire/lava themed |
| 14 | frost | epic | #87CEEB | #FFFFFF | Ice/snow themed |
| 15 | storm | epic | #FFD700 | #4B0082 | Lightning/thunder |
| 16 | emerald | legendary | #50C878 | #00FF00 | Rich green gems |
| 17 | obsidian | legendary | #1C1C1C | #4B0082 | Dark volcanic glass |
| 18 | crimsonite | legendary | #FF0000 | #8B0000 | Glowing red circuits |
| 19 | lapis | legendary | #1E90FF | #00008B | Deep blue magic |
| 20 | luminite | legendary | #FFFF00 | #FFD700 | Bright luminous |

### Phase 4: Mythic Tiers (Units 21-30)

| Unit | Tier | Rarity | Color Primary | Color Secondary | Theme |
|------|------|--------|---------------|-----------------|-------|
| 21 | voidstone | legendary | #301934 | #9400D3 | End dimension purple |
| 22 | dragonscale | legendary | #800080 | #228B22 | Dragon scales/wings |
| 23 | darkbone | legendary | #1C1C1C | #696969 | Dark skeleton boss |
| 24 | phoenix | legendary | #FF4500 | #FFD700 | Rebirth flames |
| 25 | titan | legendary | #B8860B | #8B4513 | Giant's armor |
| 26 | shadow | legendary | #2F2F2F | #4B0082 | Dark void energy |
| 27 | radiant | legendary | #FFFACD | #FFD700 | Pure light |
| 28 | ancient | legendary | #8B4513 | #D4AF37 | Old civilization |
| 29 | celestial | legendary | #000080 | #C0C0C0 | Star/moon themed |
| 30 | void | legendary | #0D0D0D | #4B0082 | Space/dimension |

### Phase 5: Ultimate Tiers (Units 31-40)

| Unit | Tier | Rarity | Color Primary | Color Secondary | Theme |
|------|------|--------|---------------|-----------------|-------|
| 31 | heroic | legendary | #DC143C | #FFD700 | Champion's gear |
| 32 | mythical | legendary | #9400D3 | #FFD700 | Legendary artifacts |
| 33 | immortal | legendary | #00FF00 | #FFFFFF | Undying power |
| 34 | divine | legendary | #FFFFFF | #FFD700 | God-touched |
| 35 | cosmic | legendary | #000080 | #FF69B4 | Universe power |
| 36 | eternal | legendary | #C0C0C0 | #FFD700 | Timeless |
| 37 | ascended | legendary | #87CEEB | #FFFFFF | Transcendent |
| 38 | supreme | legendary | #FF0000 | #000000 | Ultimate power |
| 39 | omega | legendary | #000000 | #FF0000 | Final form |
| 40 | infinity | legendary | #FF69B4 | #00FFFF | MAXIMUM POWER! Rainbow/prismatic |

---

## Degrees of Freedom

| Area | Freedom Level | Guidelines |
|------|---------------|------------|
| **New Equipment Concepts** | 🟢 High | Creates themed equipment sets (holidays, subjects, achievements). Can propose creative new items. |
| **Visual Styling** | 🟢 High | Designs unique appearances within 8-bit warrior RPG pixel art style. Uses tier colors. |
| **Naming Creativity** | 🟢 High | Invents creative names in all 3 languages. Should be kid-friendly and thematic. |
| **Tier Assignment** | 🟡 Medium | Follows tier progression guidelines. Must use valid tier from 40-tier system. |
| **Rarity Mapping** | 🟡 Medium | Generally follows tier→rarity mapping. Can elevate for special items. |
| **Database Schema** | 🔴 Low | Does not modify table structures. Uses existing fields only. |
| **Slot Types** | 🔴 Low | Limited to: helmet, chestplate, leggings, boots, weapon, tool, ranged, shield. |

---

## Database Schema

### equipment table

```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Display name (e.g., 'Leather Cap')
  name_ms TEXT,                    -- Malay display name
  name_zh TEXT,                    -- Chinese display name
  name_en TEXT,                    -- English display name
  slot TEXT NOT NULL,              -- helmet|chestplate|leggings|boots|weapon|tool|ranged|shield
  tier TEXT NOT NULL,              -- See 40 tiers above
  rarity TEXT DEFAULT 'common',    -- common|rare|epic|legendary
  image_url TEXT,                  -- Supabase storage URL
  required_level INTEGER DEFAULT 1,
  unit_number INTEGER,             -- Links to curriculum unit (1-40)
  color_primary TEXT,              -- Hex color for UI display
  color_secondary TEXT,            -- Secondary hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tier Constraint (40 tiers)

```sql
ALTER TABLE equipment ADD CONSTRAINT equipment_tier_check CHECK (tier IN (
  -- Classic Tiers (Units 1-6)
  'wood', 'leather', 'stone', 'chain', 'iron', 'gold', 'diamond', 'darksteel',
  -- Enchanted Tiers (Units 7-12)
  'enchanted_iron', 'enchanted_gold', 'enchanted_diamond', 'enchanted_darksteel', 'seafoam', 'amethyst',
  -- Elemental Tiers (Units 13-20)
  'blaze', 'frost', 'storm', 'emerald', 'obsidian', 'crimsonite', 'lapis', 'luminite',
  -- Mythic Tiers (Units 21-30)
  'voidstone', 'dragonscale', 'darkbone', 'phoenix', 'titan', 'shadow', 'radiant', 'ancient', 'celestial', 'void',
  -- Ultimate Tiers (Units 31-40)
  'heroic', 'mythical', 'immortal', 'divine', 'cosmic', 'eternal', 'ascended', 'supreme', 'omega', 'infinity'
));
```

### Slot Constraint (8 slots)

```sql
ALTER TABLE equipment ADD CONSTRAINT equipment_slot_check CHECK (slot IN (
  'helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool', 'ranged', 'shield'
));
```

### Related Tables

- `kid_inventory` - Equipment owned by kids
- `kid_equipped` - Currently equipped items per slot (includes tool_id, ranged_id, shield_id)
- `activities.equipment_reward_id` - Links activity completion to equipment reward

---

## Equipment Set per Unit (7 items)

Each unit rewards a complete themed set:

1. **Helmet** - Head protection
2. **Chestplate** - Body armor
3. **Leggings** - Leg armor
4. **Boots** - Foot armor
5. **Sword** (weapon slot) - Primary weapon
6. **Pickaxe** (tool slot) - Mining tool
7. **Special** (ranged/shield) - Rotating: Bow/Crossbow (ranged) or Shield

---

## Image Generation Prompt Templates

### Standard Prompt Structure

```
Generate a 8-bit warrior RPG-style pixel art equipment icon.
Subject: {tier} {slot_description}
Style Requirements:
- Authentic 8-bit warrior RPG 8-bit/16-bit pixel art style
- Clean blocky pixels, no anti-aliasing
- Primary color: {color_primary}
- Secondary color: {color_secondary}
- {tier_specific_effects}
- Item shown as inventory icon (like in 8-bit warrior RPG inventory)
- Transparent or solid dark background
- Single item centered, filling 80% of frame
- NO text, NO labels
```

### Tier-Specific Effects

| Tier Category | Special Effects |
|--------------|-----------------|
| Classic | None, basic materials |
| Enchanted | Purple magical glow/shimmer |
| Elemental | Element particles (fire, ice, lightning) |
| Mythic | Auras, special patterns |
| Ultimate | Glowing, ethereal, prismatic effects |

### Slot-Specific Descriptions

| Slot | Description |
|------|-------------|
| helmet | Head armor that covers the head, protective helmet |
| chestplate | Body armor, protective torso armor with plating |
| leggings | Leg armor pants with protective details |
| boots | Armor boots that cover feet |
| weapon | Sword/blade weapon with handle |
| tool | Pickaxe mining tool with handle and head |
| ranged | Bow or crossbow with string |
| shield | Defensive shield with face design |

---

## Seed Files

Equipment data is organized in seed files:

| File | Units | Items |
|------|-------|-------|
| `supabase/seed-equipment-units-1-10.sql` | 1-10 | 70 |
| `supabase/seed-equipment-units-11-20.sql` | 11-20 | 70 |
| `supabase/seed-equipment-units-21-30.sql` | 21-30 | 70 |
| `supabase/seed-equipment-units-31-40.sql` | 31-40 | 70 |
| **Total** | **40** | **280** |

---

## API Reference

### Generate Equipment Images

**File**: `src/app/api/generate-equipment/route.ts`

```typescript
// Request
POST /api/generate-equipment
{
  startIndex: number,  // Position in equipment list
  count: number        // Batch size (1-5 recommended)
}

// Response
{
  success: boolean,
  generated: number,
  results: [
    { id: string, name: string, image_url: string, success: boolean }
  ]
}
```

---

## Storage Structure

```
supabase-storage/
└── images/
    └── equipment/
        ├── leather_helmet.png
        ├── blaze_sword.png
        ├── phoenix_chestplate.png
        ├── infinity_shield.png
        └── ...
```

### Image URL Format

**Database `image_url` Column:**
Store the relative path in the database (the app constructs the full URL):
```sql
-- Store relative path
UPDATE equipment SET image_url = '/equipment/phoenix_helmet.png' WHERE name = 'Phoenix Helmet';

-- The app automatically constructs:
-- {SUPABASE_URL}/storage/v1/object/public/images/equipment/phoenix_helmet.png
```

---

## TypeScript Types

```typescript
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
```

---

## Best Practices

1. **Balanced Progression**: Higher units get more powerful tiers
2. **Thematic Consistency**: Match equipment visuals to tier theme
3. **Color Accuracy**: Use the defined color_primary and color_secondary
4. **Localized Names**: Always provide ms, zh, en translations
5. **Unit Tracking**: Set unit_number to link equipment to curriculum
6. **7 Items Per Unit**: Maintain consistent set size

---

## Related Skills

- **managing-course-syllabi**: Links equipment as activity rewards
- **generating-images**: Uses similar AI image generation patterns
