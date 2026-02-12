# Remove.bg API Setup

## Overview
Background removal is now powered by **Remove.bg API** - a specialized service for precise background removal.

- **Free Tier**: 50 images/month
- **Quality**: Professional-grade background removal
- **Speed**: ~2-5 seconds per image

## Setup Instructions

### 1. Get Your API Key

1. Go to [https://www.remove.bg/api](https://www.remove.bg/api)
2. Click "Get API Key"
3. Sign up for a free account
4. Copy your API key from the dashboard

### 2. Add to Environment

Add the API key to `.env.local`:

```bash
# Remove.bg API for background removal
# Get your API key from: https://www.remove.bg/api
# Free tier: 50 images/month
REMOVEBG_API_KEY=your_api_key_here
```

### 3. Restart Dev Server

```bash
# Kill the current server
# Restart:
pnpm dev
```

## How It Works

The `/api/tweak` endpoint now automatically detects background removal requests:

- **"Remove Background"** button → Uses Remove.bg API
- **Other AI features** (Enhance, Change BG, etc.) → Uses Gemini AI

## Testing

1. Upload an image
2. Apply a style
3. Go to the Tweak page
4. Click the **"הסר רקע"** (Remove Background) button
5. Wait 2-5 seconds
6. Background should be removed with transparent PNG result

## API Limits

### Free Tier
- **50 API calls/month**
- **Preview size**: Up to 0.25 megapixels
- **Regular size**: Up to 25 megapixels

### Paid Plans
- **Subscription**: $9/month for 500 images
- **Pay-as-you-go**: $0.20 per image
- See pricing: [https://www.remove.bg/pricing](https://www.remove.bg/pricing)

## Error Handling

If API key is missing or invalid:
```
Error: "Background removal service not configured. Please add REMOVEBG_API_KEY to environment."
```

If API limit is exceeded:
```
Error: "Remove.bg: Insufficient credits"
```

## Fallback Strategy

If Remove.bg fails, the app will:
1. Show error message to user
2. Log error to console
3. Allow user to retry or skip background removal

## File Output

- **Format**: PNG with transparency
- **Size**: Optimized for web
- **Storage**: Uploaded to Supabase Storage under `/transformed/` folder

## Code Changes

### New Files
- `lib/ai/remove-bg.ts` - Remove.bg API client

### Modified Files
- `app/api/tweak/route.ts` - Route logic to detect and use Remove.bg
- `.env.local` - Added REMOVEBG_API_KEY
- `.env.example` - Added API key documentation

## Alternative Services (Future)

If Remove.bg doesn't meet needs, these alternatives can be integrated:

1. **PhotoRoom API** - [https://www.photoroom.com/api](https://www.photoroom.com/api)
2. **Cloudinary** - Built-in background removal
3. **Segment Anything (SAM)** - Self-hosted model
4. **U²-Net** - Self-hosted segmentation model

## Monitoring Usage

Track API usage in Remove.bg dashboard:
- [https://www.remove.bg/users/sign_in](https://www.remove.bg/users/sign_in)
- View remaining credits
- Download usage history
- Upgrade plan if needed
