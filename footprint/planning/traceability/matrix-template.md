# Traceability Matrix Template

## Requirements to Stories Mapping

| Requirement ID | Requirement Description | Story ID(s) | Status |
|---------------|------------------------|-------------|--------|
| REQ-001 | Example requirement | UI-01A-001 | Pending |

## Stories to Tests Mapping

| Story ID | Unit Tests | Integration Tests | E2E Tests | Coverage |
|----------|------------|-------------------|-----------|----------|
| UI-01A-001 | *.test.ts | *.integration.test.ts | *.e2e.ts | 0% |

## Dependencies Graph

```
Story-A
  └── Story-B (depends on)
      └── Story-C (depends on)
```

## Verification Status

| Story ID | Gate 0 | Gate 1 | Gate 2 | Gate 3 | Gate 4 | Gate 5 | Gate 6 | Gate 7 |
|----------|--------|--------|--------|--------|--------|--------|--------|--------|
| UI-01A-001 | - | - | - | - | - | - | - | - |

Legend: Pass | Fail | Pending | N/A
