# Contracts Directory

This directory contains shared type definitions and interfaces used across the project.

## Purpose

- Define TypeScript interfaces for API contracts
- Share types between frontend and backend
- Ensure type safety across module boundaries

## Structure

```
contracts/
├── api/           # API request/response types
├── domain/        # Domain entity types
├── events/        # Event payload types
└── shared/        # Shared utility types
```

## Usage

```typescript
// Import from contracts
import type { IUser, IOrder } from '@/contracts/domain';
import type { APIResponse } from '@/contracts/api';
```

## Guidelines

1. All types should use `I` prefix for interfaces
2. Export types from index.ts barrel files
3. Keep types immutable where possible
4. Document complex types with JSDoc comments
