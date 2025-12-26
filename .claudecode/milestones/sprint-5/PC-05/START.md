# PC-05: Realistic Mockup Preview

## Story
**ID**: PC-05
**Title**: Realistic Mockup Preview
**Agent**: Frontend-B
**Sprint**: 5
**Points**: TBD

## Objective
Add a room environment preview to the customize page that shows the art print on a realistic wall, helping customers visualize size and placement.

## Current State
- Basic preview showing image with optional frame
- No environmental context
- Size shown only as text dimensions (e.g., "A4 • 21×29.7 cm")
- Customers can't visualize how big the print will look in their space

## Target State
- Room environment preview showing print on a wall
- Wall visualization with realistic proportions
- Size context indicators (furniture, person silhouette for scale)
- Toggle between room views or simple preview
- Responsive design for mobile/desktop

## Technical Approach

### 1. Room Preview Component
```typescript
// components/mockup/RoomPreview.tsx
interface RoomPreviewProps {
  imageUrl: string;
  size: SizeType;
  frameType: FrameType;
  frameColor?: string;
}
```

### 2. Size Scale System
Map print sizes to visual proportions:
| Size | Dimensions | Wall % | Reference |
|------|------------|--------|-----------|
| A5 | 14.8×21cm | 8% | Postcard size |
| A4 | 21×29.7cm | 12% | Letter size |
| A3 | 29.7×42cm | 18% | Poster size |
| A2 | 42×59.4cm | 25% | Large poster |

### 3. Room Environments
- **Living Room**: Sofa, side table, plant (for A3, A2)
- **Office/Desk**: Desk scene (for A5, A4)
- Auto-select based on print size

### 4. Implementation Steps
1. Create `RoomPreview` component with wall background
2. Add size-based scaling for the print
3. Add furniture/context elements as SVG or CSS
4. Integrate with customize page
5. Add toggle between room view and simple preview

## Dependencies
- `originalImage` from orderStore
- Size, frame selections from customize page
- No external APIs needed

## Acceptance Criteria
- [ ] Room environment renders with wall background
- [ ] Print displays at correct proportional size
- [ ] Frame type reflects in preview
- [ ] Size context visible (furniture/reference objects)
- [ ] Toggle between room and simple view
- [ ] Responsive on mobile and desktop
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Create/Modify
| File | Action |
|------|--------|
| `components/mockup/RoomPreview.tsx` | Create |
| `components/mockup/RoomPreview.test.tsx` | Create |
| `app/(app)/create/customize/page.tsx` | Modify - integrate RoomPreview |
| `app/(app)/create/customize/page.test.tsx` | Modify - add room preview tests |

## Branch
`feature/pc-05-realistic-mockup-preview`

## Start Tag
`PC-05-start`

---
**Started**: 2025-12-26
**Agent**: Frontend-B
