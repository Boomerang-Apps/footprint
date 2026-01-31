# P Variable - Footprint Project Context

## Project Overview

**Name:** Footprint
**Type:** Next.js 14 Web Application
**Version:** 0.1.0
**Purpose:** AI-powered image processing and user engagement platform

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14.2.0 |
| Runtime | React | 18.2.0 |
| Language | TypeScript | 5.3+ |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth | - |
| Storage | AWS S3 | - |
| Payments | Stripe | 14.21+ |
| Monitoring | Sentry | 10.37+ |
| Cache | Upstash Redis | - |
| AI | Replicate | - |
| Testing | Vitest | 4.0+ |
| Styling | Tailwind CSS | 3.4+ |

## Directory Structure

```
/Volumes/SSD-01/Projects/Footprint/footprint/
├── .claude/              # WAVE configuration
│   ├── P.md              # This file (Project Variable)
│   ├── PREFLIGHT.lock    # Pre-flight validation lock
│   └── safety/           # Safety configuration
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   ├── hooks/            # Custom React hooks
│   ├── safety/           # Safety systems (Constitutional AI)
│   ├── agents/           # WAVE agent implementations
│   ├── domains/          # Domain routing
│   └── gates/            # Gate system
├── types/                # TypeScript type definitions
├── public/               # Static assets
├── stories/              # User stories (or in Supabase)
└── supabase/             # Database migrations
```

## Key Integrations

### Supabase
- **URL:** Set in `NEXT_PUBLIC_SUPABASE_URL`
- **Tables:** users, photos, stories, sprints, agent_status
- **RLS:** Row-Level Security enabled

### Stripe
- **Purpose:** Payment processing
- **Keys:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### AWS S3
- **Purpose:** Image storage
- **Configuration:** Via `@aws-sdk/client-s3`

### Sentry
- **Purpose:** Error monitoring
- **DSN:** Set in `SENTRY_DSN`

### Upstash Redis
- **Purpose:** Rate limiting and caching
- **Keys:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Safety Systems

### Constitutional AI
- Location: `src/safety/constitutional.py`
- Principles: P001-P006 (WAVE_PRINCIPLES)

### Emergency Stop
- Location: `src/safety/emergency_stop.py`
- File trigger: `.claude/EMERGENCY-STOP`
- Redis channel: `wave:emergency`

### Budget Enforcement
- Location: `src/safety/budget.py`
- Wave budget: $2.00 default
- Story budget: $0.50 default

## WAVE Agent Roles

| Agent | Responsibility |
|-------|---------------|
| PM | Story management, sprint planning |
| CTO | Architecture decisions, code review |
| FE-Dev | Frontend implementation |
| BE-Dev | Backend/API implementation |
| QA | Testing, validation |

## Git Workflow

- **Main branch:** `main`
- **Wave branches:** `wave/{wave-number}-{story-id}`
- **Worktrees:** `/Volumes/SSD-01/Projects/Footprint/worktrees/`

## Environment Files

- `.env.local` - Local development secrets
- `.env.example` - Template (no secrets)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run type-check` | TypeScript validation |
| `npm run lint` | ESLint checks |

## Constraints

1. **No destructive commands** without explicit approval
2. **No secret exposure** in logs or commits
3. **Stay within domain scope** - respect SUPPORTED_DOMAINS
4. **Validate all inputs** before processing
5. **Respect budget limits** - track API costs
6. **Escalate uncertainty** - ask before assuming

## Current Wave

- **Wave Number:** 1
- **Focus:** Security foundation
- **Stories:** Stored in Supabase `stories` table

## Related Documentation

- CLAUDE.md - Agent instructions
- WAVE-V2-IMPLEMENTATION-GUIDE.md - Full implementation guide
- `.claude/safety/constitutional.json` - Safety configuration

---

*Last Updated: 2026-01-29*
*Generated for WAVE v2 Framework*
