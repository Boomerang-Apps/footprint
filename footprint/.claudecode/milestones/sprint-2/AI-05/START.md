# AI-05: Fast AI Transformation

**Started**: 2025-12-26
**Agent**: Backend-2
**Branch**: feature/ai-05-fast-transformation
**Linear ID**: UZF-1849
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary

Optimize AI image transformation for speed (< 10 seconds target), add progress reporting for better UX, and enhance retry logic with better error handling.

---

## Scope

### In Scope
- Progress tracking using Replicate's prediction API
- Real-time progress reporting via polling or SSE
- Performance monitoring with timing metrics
- Enhanced error messages with retry status
- Target < 10 second transformation time

### Out of Scope
- Changing the AI model (Flux Kontext Pro is already fast)
- WebSocket-based progress (SSE is simpler)
- Caching transformed images (separate story)

---

## Acceptance Criteria

- [ ] Transformation completes in < 10 seconds (95th percentile)
- [ ] Progress percentage (0-100%) is trackable during transformation
- [ ] Retry attempts are visible to caller
- [ ] Failed transformations return clear error messages
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

---

## Technical Approach

1. **Prediction API Integration**
   - Use `replicate.predictions.create()` for async start
   - Poll `replicate.predictions.get()` for progress
   - Return progress percentage from status

2. **Progress Tracking Service**
   - Create `TransformationJob` interface with status/progress
   - Add `startTransformation()` that returns job ID
   - Add `getTransformationProgress()` for polling

3. **Enhanced Error Handling**
   - Track retry attempts in job status
   - Include timing metrics in response
   - Provide actionable error messages

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| lib/ai/transform.ts | Create | Progress-tracking transformation service |
| lib/ai/transform.test.ts | Create | TDD tests for transformation service |
| app/api/transform/[jobId]/route.ts | Create | Progress polling endpoint |
| app/api/transform/[jobId]/route.test.ts | Create | API tests |
| lib/ai/replicate.ts | Modify | Add prediction API methods |

---

## Dependencies

### Blocked By
- None (existing Replicate integration is foundation)

### Blocks
- Frontend progress UI (needs API ready)

---

## Test Plan

### Unit Tests
- Progress calculation from prediction status
- Retry logic with progress tracking
- Timeout handling
- Error state transitions

### Integration Tests
- Full transformation flow with progress
- Polling endpoint behavior
- Error recovery scenarios

---

## Safety Gate Progress

- [x] Gate 0: Research (Replicate already approved)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-26*
