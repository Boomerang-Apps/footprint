# OM-03: Download Print-Ready Files

**Started**: 2025-12-26
**Agent**: Backend-2
**Branch**: feature/OM-03-print-ready-download
**Gate**: 1 - Planning
**Linear**: UZF-1847

---

## Story Summary

Implement admin functionality to download high-resolution, print-ready files with correct dimensions (300 DPI) and color profile (sRGB). Admin users can download files for printing directly from the order management dashboard.

---

## Scope

### In Scope
- GET /api/admin/orders/[id]/download - Download print-ready file endpoint
- Print-ready file generation with correct dimensions based on order size
- 300 DPI output with sRGB color profile
- Presigned download URL generation (1 hour expiry)
- Admin-only authorization
- Support for all print sizes: A5, A4, A3, A2

### Out of Scope
- Frontend admin UI (OM-01, Frontend-B)
- Bulk downloads (future story)
- Custom dimension cropping (future story)
- CMYK color profile (print shop handles conversion)

---

## Technical Approach

### 1. API Endpoint

```typescript
// GET /api/admin/orders/[id]/download?size=A4
// Returns presigned download URL

// Response
{
  "success": true,
  "downloadUrl": "https://r2.cloudflarestorage.com/...",
  "fileName": "order_123_A4_print.jpg",
  "dimensions": {
    "width": 2480,
    "height": 3508,
    "dpi": 300
  },
  "expiresIn": 3600
}
```

### 2. Print File Processing

Using existing infrastructure:
- `lib/image/optimize.ts` - `optimizeForPrint()`, `PRINT_SIZES`
- `lib/storage/r2.ts` - `getDownloadUrl()`, `uploadToR2()`

Flow:
1. Admin requests download for order
2. Check if print-ready file exists for requested size
3. If not, generate from transformed image with correct dimensions
4. Return presigned download URL

### 3. File Naming Convention

Format: `{orderId}_{size}_{timestamp}_print.jpg`
Example: `order_abc123_A4_1703577600_print.jpg`

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| footprint/lib/orders/printFile.ts | Create | Print file generation logic |
| footprint/lib/orders/printFile.test.ts | Create | TDD tests |
| footprint/app/api/admin/orders/[id]/download/route.ts | Create | Download API endpoint |
| footprint/app/api/admin/orders/[id]/download/route.test.ts | Create | API tests |

---

## Dependencies

### Uses Existing
- lib/storage/r2.ts - R2 storage operations
- lib/image/optimize.ts - Image processing
- lib/supabase/server.ts - Authentication

### Blocked By
- None

### Blocks
- OM-01: Admin order dashboard (needs download functionality)

---

## Print Size Reference

| Size | Pixels (300 DPI) | Physical Size |
|------|-----------------|---------------|
| A5 | 1748 x 2480 | 148 x 210 mm |
| A4 | 2480 x 3508 | 210 x 297 mm |
| A3 | 3508 x 4960 | 297 x 420 mm |
| A2 | 4960 x 7016 | 420 x 594 mm |

---

## Acceptance Criteria

- [ ] Admin can download print-ready file via API
- [ ] Files generated at 300 DPI with correct dimensions
- [ ] sRGB color profile preserved
- [ ] Presigned URL expires after 1 hour
- [ ] Non-admin requests rejected (401/403)
- [ ] Missing order returns 404
- [ ] Tests written (TDD approach)
- [ ] 80%+ coverage for new code
- [ ] TypeScript clean
- [ ] Lint clean

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - uses existing infrastructure)
- [ ] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-26*
