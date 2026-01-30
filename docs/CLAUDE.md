# CLAUDE.md - AI Agent Instructions

## Project Overview
[Brief description of this project and its purpose]

## Tech Stack
- **Framework:** [e.g., Next.js 14 with App Router]
- **Language:** TypeScript
- **Database:** [e.g., Supabase (PostgreSQL)]
- **Styling:** [e.g., Tailwind CSS, shadcn/ui]
- **Deployment:** [e.g., Vercel]

## Project Structure
```
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── features/    # Feature-specific components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── docs/            # Documentation
```

## Key Files
- `app/page.tsx` - Main entry point
- `lib/supabase.ts` - Database client
- `components/ui/` - Base UI components

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow existing code patterns
- Use functional components with hooks
- Prefer named exports over default exports

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE

### Testing
- Write tests for new features
- Test file: `*.test.ts` or `*.spec.ts`

## Common Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run test     # Run tests
npm run lint     # Lint code
```

## Important Notes
- [Any gotchas or special considerations]
- [Environment variables needed]
- [External services or APIs used]
