# Vocabulary Image Generation Setup

## Prerequisites

1. **Supabase Storage Bucket**: Create an "images" bucket in Supabase
   - Go to Supabase Dashboard > Storage
   - Click "New Bucket"
   - Name: `images`
   - Public: Yes (so images can be accessed without authentication)

2. **Environment Variables**: Ensure these are set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

## Generating Vocabulary Images

### Option 1: Using the API (Recommended)

The app has a batch generation endpoint. Run your Next.js dev server first:

```bash
npm run dev
```

Then call the API to generate images in batches (5 at a time to avoid rate limits):

```bash
# Check vocabulary list
curl http://localhost:3000/api/generate-vocab-batch

# Generate first 5 images
curl -X POST http://localhost:3000/api/generate-vocab-batch \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5}'

# Generate next 5 images
curl -X POST http://localhost:3000/api/generate-vocab-batch \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 5, "count": 5}'

# Continue until all ~52 images are generated...
```

### Option 2: Using the Admin Page

Navigate to `/admin/generate-images` (you may need to create this page) to use a UI for batch generation.

## Vocabulary Words (52 total)

### Unit 2: Mari Sayang (31 words)
- baju, roti, biru, susu, teko
- labu, tidur, bayi, lebah, tulis, betik, lobak, nasi, cucu, lukis, nenek, cawan
- lidi, ceri, buku, topi
- mi sup, bubur, teh, kopi
- kedai, pasar, bapa, adik, kereta, van, jalan

### Unit 3: Balik Ke Kampung (21 words)
- pau, cakoi, hijau, limau, gerai
- matahari, padi, awan, itik, lembu, ayam
- joran, ikan, bakul, kasut, kolam, rumput
- gambar, rak, datuk, rambut

## After Generating Images

1. Run the seed SQL to create Unit 2 and Unit 3 activities:
   ```bash
   # In Supabase SQL Editor, run:
   supabase/seed-unit2-unit3.sql
   ```

2. The images will be stored at:
   ```
   {SUPABASE_URL}/storage/v1/object/public/images/vocab/{word}.png
   ```

## Troubleshooting

- **Rate Limit**: Wait 2+ seconds between requests
- **No Image Generated**: Check Gemini API quota
- **Upload Failed**: Verify bucket exists and is public
- **Wrong URL**: Ensure images bucket policy allows public access

## Image Style

Images are generated with:
- Kawaii/cute cartoon style
- Bright vibrant colors
- White/pastel backgrounds
- Child-friendly educational aesthetic
- No text in images
