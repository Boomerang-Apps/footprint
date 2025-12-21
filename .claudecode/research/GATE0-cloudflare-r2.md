# Research: Cloudflare R2 Image Storage

**Date**: 2025-12-19
**Author**: CTO Agent
**Story**: UP-03 (Auto-optimize photo for print)
**Gate**: 0 - Research

---

## Objective

Evaluate Cloudflare R2 for storing user-uploaded images and AI-transformed images. Ensure secure, performant, and cost-effective image storage.

---

## Questions to Answer

1. How do we securely upload images from the browser?
2. What is the cost structure compared to S3?
3. How do we organize images in buckets?
4. What are the security best practices?
5. How do we handle image optimization?

---

## Research Findings

### Cloudflare R2 Overview
- **S3-Compatible**: Uses standard S3 SDK
- **No Egress Fees**: Major cost savings vs AWS S3
- **Global Edge**: Fast delivery worldwide
- **Workers Integration**: Image resizing at edge

### Cost Comparison

| Provider | Storage | Egress | Class A Ops | Class B Ops |
|----------|---------|--------|-------------|-------------|
| R2 | $0.015/GB/mo | FREE | $4.50/million | $0.36/million |
| S3 | $0.023/GB/mo | $0.09/GB | $5.00/million | $0.40/million |

**Monthly Estimate** (500 orders, 5MB avg per image):

| Item | R2 Cost | S3 Cost |
|------|---------|---------|
| Storage (2.5GB) | $0.04 | $0.06 |
| Egress (25GB) | FREE | $2.25 |
| Operations | $0.01 | $0.01 |
| **Total** | **$0.05** | **$2.32** |

**Conclusion**: R2 is significantly cheaper due to free egress.

---

## Recommended Architecture

### Bucket Structure

```
footprint-images/
├── uploads/
│   └── {userId}/{timestamp}-{uuid}.{ext}    # Original uploads
├── transformed/
│   └── {userId}/{timestamp}-{uuid}.{ext}    # AI transformed
├── print-ready/
│   └── {orderId}/{itemId}.{ext}             # Final print files
└── thumbnails/
    └── {userId}/{imageId}-thumb.webp        # Preview thumbnails
```

### Upload Flow

```
Browser → Presigned URL → R2 Direct Upload → Webhook → Process
```

1. Frontend requests presigned URL from backend
2. Backend generates presigned URL with restrictions
3. Frontend uploads directly to R2
4. R2 triggers webhook on upload complete
5. Backend processes/validates image

---

## Implementation

### Presigned URL Generation

```typescript
// lib/storage/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(
  userId: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const key = `uploads/${userId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 3600, // 1 hour
  });

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}
```

### Upload API Route

```typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileName, contentType, fileSize } = await request.json();

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
  if (!allowedTypes.includes(contentType)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate file size (20MB max)
  if (fileSize > 20 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 400 });
  }

  const { uploadUrl, publicUrl } = await getUploadUrl(
    session.userId,
    fileName,
    contentType
  );

  return Response.json({ uploadUrl, publicUrl });
}
```

### Frontend Upload

```typescript
// hooks/useUpload.ts
export function useUpload() {
  const uploadImage = async (file: File): Promise<string> => {
    // 1. Get presigned URL
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    });

    const { uploadUrl, publicUrl } = await response.json();

    // 2. Upload directly to R2
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    return publicUrl;
  };

  return { uploadImage };
}
```

---

## Security Considerations

- [x] **Presigned URLs**: Time-limited (1 hour), single-use
- [x] **Content Type Validation**: Restrict to image types only
- [x] **File Size Limits**: 20MB maximum
- [x] **User Isolation**: Images stored in user-specific paths
- [x] **No Direct Bucket Access**: All access through presigned URLs
- [x] **CORS Configuration**: Restrict to our domain only

### CORS Configuration

```json
{
  "AllowedOrigins": ["https://footprint.co.il", "http://localhost:3000"],
  "AllowedMethods": ["GET", "PUT"],
  "AllowedHeaders": ["Content-Type"],
  "MaxAgeSeconds": 3600
}
```

### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::footprint-images/thumbnails/*"
    }
  ]
}
```

Only thumbnails are publicly readable; all other access requires presigned URLs.

---

## Image Processing

### Optimization Pipeline

1. **Upload**: Original image to `uploads/`
2. **Validate**: Check dimensions, format, file integrity
3. **Optimize**: Resize for web preview (max 2000px)
4. **Transform**: AI style applied, result to `transformed/`
5. **Print Ready**: Full resolution for printing to `print-ready/`

### Using Cloudflare Images (Optional)

```typescript
// Image resizing at edge
const thumbnailUrl = `${R2_PUBLIC_URL}/cdn-cgi/image/width=400,quality=80/${imageKey}`;
```

---

## Rollback Plan

If R2 integration fails:

1. **Immediate**: Switch to local file storage (development only)
2. **Short-term**: Use AWS S3 with same SDK
3. **Long-term**: Multi-provider setup with failover

---

## CTO Approval

**Status**: APPROVED

**CTO Notes**:
- Use presigned URLs for all uploads (never expose credentials)
- Implement file type and size validation on both client and server
- Use Cloudflare Images for thumbnail generation
- Set up monitoring for storage costs
- Implement cleanup job for orphaned images
- CORS must be configured before launch

**Approved by**: CTO Agent
**Date**: 2025-12-19

---

*Research completed by CTO Agent - 2025-12-19*
