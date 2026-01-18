# MYLearnt

A gamified learning platform for Malaysian primary school kids (Primary 1-6) with 8-bit Warrior Quest pixel art RPG theming.

**Live Site**: [https://mylearnt.aitomate.it.com](https://mylearnt.aitomate.it.com)

## Features

- **Multi-Subject Learning**: Bahasa Malaysia, Bahasa Cina, English, Mathematics
- **Gamification**: 8-bit pixel art RPG character with 40 equipment tiers, pets, and leveling system
- **AI-Powered Assessment**: Google Gemini for intelligent feedback and pronunciation scoring
- **Voice Tutor**: Gemini 2.0 Flash TTS with Malaysian accent support
- **AI Avatar Generator**: Create unique character portraits based on equipped items
- **Multi-Language UI**: Bahasa Malaysia, Simplified Chinese, English
- **Multiple Kids**: One parent account can manage multiple children
- **Admin Dashboard**: Monitor all students' progress and manage content

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth via Supabase Auth
- **AI Models**:
  - Google Gemini 2.0 Flash (assessment, image generation)
  - Google Gemini 2.0 Flash TTS (voice tutor)
- **Storage**: Supabase Storage (images, audio)
- **Hosting**: Vercel
- **Domain**: Cloudflare DNS
- **i18n**: next-intl

## Activity Types

| Type | Description |
|------|-------------|
| Alphabet | Letter/character recognition with images |
| Syllable | Syllable reading and word building practice |
| Matching | Match words to images |
| Writing | Character/word tracing practice |
| Dictation | Listen and spell words |
| Speaking | Pronunciation practice with AI feedback |
| Singing | Learn through songs with lyrics |
| Math | Mathematics problems and exercises |

## Equipment System (40 Tiers)

Equipment rewards progress through 40 unique tiers across 8 slots:

**Slots**: Helmet, Chestplate, Leggings, Boots, Weapon, Tool, Ranged, Shield

**Tier Progression**:

| Category | Tiers |
|----------|-------|
| Classic (Units 1-6) | Wood, Leather, Stone, Chain, Iron, Gold, Diamond, Netherite |
| Enchanted (Units 7-12) | Enchanted Iron, Enchanted Gold, Enchanted Diamond, Enchanted Netherite, Seafoam, Amethyst |
| Elemental (Units 13-20) | Blaze, Frost, Storm, Emerald, Obsidian, Crimsonite, Lapis, Luminite |
| Mythic (Units 21-30) | Voidstone, Dragonscale, Darkbone, Phoenix, Titan, Shadow, Radiant, Ancient, Celestial, Void |
| Ultimate (Units 31-40) | Heroic, Mythical, Immortal, Divine, Cosmic, Eternal, Ascended, Supreme, Omega, Infinity |

**Image Storage**: `{SUPABASE_URL}/storage/v1/object/public/images/equipment/{tier}_{slot}.png`

## Pet System

Pets are creature companions awarded when kids complete ALL activities in a theme.

**Rarities**: Common, Uncommon, Rare, Epic, Legendary

**Image Storage**: `{SUPABASE_URL}/storage/v1/object/public/images/pets/{pet_id}.png`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI Studio API key (Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/WeiKhjan/minecraftlearning.git
cd minecraft-learning

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase and Gemini API keys

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

## Database Setup

1. Create a new Supabase project
2. Run schema migrations in `supabase/migrations/`
3. Run seed files in `supabase/` for initial content
4. Enable Google OAuth in Supabase Authentication
5. Create storage buckets: `images`, `audio`

### Making a User Admin

```sql
UPDATE parents SET is_admin = true WHERE email = 'your-email@example.com';
```

## API Endpoints

### Content Generation APIs

| Endpoint | Description |
|----------|-------------|
| `/api/generate-equipment` | Generate equipment images (8-bit pixel art) |
| `/api/generate-pets` | Generate pet images (8-bit pixel art) |
| `/api/generate-vocab-batch` | Generate vocabulary images (kawaii style) |
| `/api/generate-audio` | Generate TTS audio clips |
| `/api/generate-avatar` | Generate AI character portraits |

### Usage Example

```bash
# Check items needing generation
curl https://mylearnt.aitomate.it.com/api/generate-equipment

# Generate in batches
curl -X POST https://mylearnt.aitomate.it.com/api/generate-equipment \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5, "unitStart": 1, "unitEnd": 10}'
```

## Project Structure

```
minecraft-learning/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized pages (ms, zh, en)
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── character/     # Character & equipment
│   │   │   ├── learn/         # Learning activities
│   │   │   └── admin/         # Admin panel
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities & Supabase client
│   └── types/                 # TypeScript types
├── supabase/
│   ├── migrations/            # Database migrations
│   └── seed-*.sql             # Seed data files
├── messages/                  # i18n translation files
└── public/                    # Static assets
```

## Adding New Content

### Step 1: Create Vocabulary Images

1. Add words to `/api/generate-vocab-batch` vocabulary list
2. Run the API to generate images
3. Images stored at: `images/vocab/{word}.png`

### Step 2: Create Seed SQL

```sql
-- Example: Adding a new activity
INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, content, xp_reward, equipment_reward_id)
VALUES (
  'theme-uuid',
  'matching',
  'Padankan Gambar',
  '配对图片',
  'Match Pictures',
  '{"pairs": [{"word": "kucing", "image_url": "https://..."}]}'::jsonb,
  50,
  'equipment-uuid'
);
```

### Step 3: Generate Audio (for speaking/dictation)

```bash
curl -X POST https://mylearnt.aitomate.it.com/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5}'
```

## Deployment

The app auto-deploys to Vercel on push to `main` branch.

**Domain Setup**:
1. DNS managed by Cloudflare
2. CNAME record: `mylearnt` → `cname.vercel-dns.com`
3. Domain added in Vercel project settings

## License

MIT
