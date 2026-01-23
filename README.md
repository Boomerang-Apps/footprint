# Footprint

**Carbon Footprint Tracking & Personalized Art Creation**

Footprint is a Next.js application that combines sustainability tracking with AI-powered artistic image transformations. Users can upload photos and transform them into personalized art pieces using various artistic styles.

## Features

- **AI Style Transfer** - Transform photos into 8 artistic styles using Google Gemini (Nano Banana)
- **E-commerce Flow** - Complete checkout with PayPlus payment integration
- **User Authentication** - Supabase Auth with email/password
- **Order Management** - Track orders from creation to delivery
- **RTL Support** - Full Hebrew language support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.5 Flash (Nano Banana)
- **Payments**: PayPlus
- **Storage**: Cloudflare R2 / Supabase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account
- Google AI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Boomerang-Apps/footprint.git
cd footprint

# Install dependencies
cd footprint
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_AI_API_KEY=your_google_ai_key
PAYPLUS_API_KEY=your_payplus_key
```

## Project Structure

```
footprint/
├── footprint/              # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and services
│   └── types/             # TypeScript types
├── .claude/               # WAVE agent configuration
│   └── prompts/           # Agent prompt files
├── .claudecode/           # WAVE workflow configuration
├── stories/               # AI Stories by wave
│   ├── wave1/            # Wave 1 stories
│   ├── wave2/            # Wave 2 stories
│   └── wave3/            # Wave 3 stories
└── worktrees/            # Git worktrees for parallel development
```

## WAVE Development

This project uses the WAVE (Workflow Automation for Verified Execution) methodology for AI-assisted development.

### Agents

- **FE-Dev** - Frontend development in `worktrees/fe-dev`
- **BE-Dev** - Backend development in `worktrees/be-dev`
- **QA** - Quality assurance in `worktrees/qa`

### Running Tests

```bash
cd footprint
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
npm run type-check  # TypeScript validation
npm run lint        # ESLint
```

## Deployment

The app is deployed on Vercel with automatic deployments on push to main.

- **Production**: [footprint-ebon.vercel.app](https://footprint-ebon.vercel.app)

## License

MIT

---

Built with WAVE methodology using Claude AI agents.
