# MineCraft Learning

A gamified learning platform for Malaysian primary school kids (Primary 1-6) with Minecraft theming.

## Features

- **Multi-Subject Learning**: Bahasa Malaysia, Bahasa Cina, English, Mathematics
- **Gamification**: Minecraft-themed character with equipment rewards and leveling
- **AI-Powered Assessment**: Gemini 3 Flash for intelligent feedback
- **Voice Tutor**: Gemini 2.5 Flash TTS with Malaysian accent
- **Multi-Language UI**: Bahasa Malaysia, Simplified Chinese, English
- **Multiple Kids**: One parent account can manage multiple children
- **Admin Dashboard**: Monitor all students progress

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth via Supabase Auth
- **AI**: Google Gemini 3 Flash + Gemini 2.5 Flash TTS
- **Hosting**: Vercel
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI Studio API key

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run database schema in Supabase SQL Editor
5. Run `npm run dev`

## Environment Variables

See `.env.example` for required variables.

## Database Setup

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Run `supabase/seed.sql` for initial content
3. Enable Google OAuth in Supabase Authentication

## Making a User Admin

```sql
UPDATE parents SET is_admin = true WHERE email = 'admin@example.com';
```

## License

MIT
