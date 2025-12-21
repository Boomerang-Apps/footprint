# API Configuration Guide

**All API keys and secrets required to run multi-agent projects**

---

## Quick Setup Checklist

- [ ] GitHub - Repository access, Actions secrets
- [ ] Vercel - Deployment, environment variables
- [ ] Supabase - Database, Auth, Edge Functions
- [ ] Linear - Project management, MCP integration
- [ ] Claude Code - AI agents (API key or subscription)

---

## 1. GitHub Configuration

### Repository Setup

```bash
# Create new repo from template
gh repo create YOUR-ORG/new-project --template Boomerang-Apps/template-repo --private

# Or clone and push
git clone git@github.com:Boomerang-Apps/template-repo.git new-project
cd new-project
gh repo create YOUR-ORG/new-project --source=. --private
```

### GitHub Actions Secrets

Go to: `Settings → Secrets and variables → Actions`

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `EXPO_TOKEN` | EAS Build authentication | [expo.dev/accounts/settings/access-tokens](https://expo.dev/accounts/settings/access-tokens) |
| `CODECOV_TOKEN` | Coverage reporting | [codecov.io](https://codecov.io) → Repo Settings |
| `VERCEL_TOKEN` | Deployment (if using) | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `SUPABASE_ACCESS_TOKEN` | CLI/Edge Functions | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |

### Branch Protection

Go to: `Settings → Branches → Add rule`

**For `main` branch:**
- [x] Require pull request before merging
- [x] Require approvals: 1
- [x] Require status checks: `lint`, `typecheck`, `test`
- [x] Require branches to be up to date

**For `develop` branch:**
- [x] Require pull request before merging
- [x] Require status checks: `lint`, `typecheck`, `test`

---

## 2. Vercel Configuration

### Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Environment Variables

Go to: `Project Settings → Environment Variables`

| Variable | Environment | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only | Supabase service role (server-side) |

### Deployment Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js / Other |
| Build Command | `npm run build` |
| Output Directory | `.next` / `dist` |
| Install Command | `npm ci` |

---

## 3. Supabase Configuration

### Project Setup

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project
3. Note your project credentials

### API Keys

Go to: `Project Settings → API`

| Key | Environment Variable | Usage |
|-----|---------------------|-------|
| Project URL | `SUPABASE_URL` | API endpoint |
| anon/public | `SUPABASE_ANON_KEY` | Client-side (safe to expose) |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` | Server-side only (NEVER expose) |

### CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Get access token for CI/CD
# Go to: supabase.com/dashboard/account/tokens
```

### Edge Functions Secrets

```bash
# Set secrets for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set TWILIO_AUTH_TOKEN=xxx
```

### Environment Files

**.env.local** (development):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

**.env.production** (production):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

---

## 4. Linear Configuration

### Workspace Setup

1. Go to [linear.app](https://linear.app)
2. Create or select workspace
3. Create project for your app

### MCP Integration (Claude Code)

```bash
# Add Linear MCP server to Claude Code
claude mcp add linear-server https://mcp.linear.app/sse --transport sse

# Verify
claude mcp list
```

### API Key (for CI/CD or scripts)

Go to: `Settings → API → Personal API keys`

| Variable | Description |
|----------|-------------|
| `LINEAR_API_KEY` | Personal API key for automation |

### Labels to Create

| Label | Color | Purpose |
|-------|-------|---------|
| `gate-0-research` | Gray | CTO research phase |
| `gate-1-plan` | Blue | Planning phase |
| `gate-2-build` | Amber | Implementation |
| `gate-3-test` | Purple | QA validation |
| `gate-4-review` | Pink | PM review |
| `gate-5-deploy` | Green | Merged/Complete |
| `agent-cto` | - | Assigned to CTO |
| `agent-pm` | - | PM handling |
| `agent-qa` | - | QA validating |
| `agent-backend-1` | - | Backend-1 |
| `agent-backend-2` | - | Backend-2 |
| `agent-frontend-a` | - | Frontend-A |
| `agent-frontend-b` | - | Frontend-B |

---

## 5. Claude Code Configuration

### Installation

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Or via Homebrew
brew install claude-code
```

### Authentication

```bash
# Login (uses browser OAuth)
claude login

# Or set API key directly
export ANTHROPIC_API_KEY=sk-ant-xxx
```

### MCP Servers

```bash
# Linear integration
claude mcp add linear-server https://mcp.linear.app/sse --transport sse

# List configured servers
claude mcp list
```

### Project Settings

Create `.claude/settings.json`:
```json
{
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "temperature": 0
}
```

---

## 6. Additional Services (Optional)

### Twilio (VoIP)

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Account SID (ACxxx) |
| `TWILIO_AUTH_TOKEN` | Auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio number |

### RevenueCat (Payments)

| Variable | Description |
|----------|-------------|
| `REVENUECAT_IOS_KEY` | iOS API key (appl_xxx) |
| `REVENUECAT_ANDROID_KEY` | Android API key (goog_xxx) |

### OpenAI (AI Services)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key (sk-xxx) |

### ElevenLabs (TTS)

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | API key |

---

## Environment File Templates

### .env.example (commit this)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# RevenueCat (optional)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=

# Feature flags
EXPO_PUBLIC_ENV=development
```

### .env.local (DO NOT commit)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
OPENAI_API_KEY=sk-xxx
```

---

## Security Checklist

- [ ] Never commit `.env.local` or any file with real keys
- [ ] Add `.env.local` to `.gitignore`
- [ ] Use `EXPO_PUBLIC_` prefix only for client-safe variables
- [ ] Store sensitive keys in GitHub Secrets / Vercel env
- [ ] Rotate keys if accidentally exposed
- [ ] Use service role key only on server-side

---

## Quick Reference

### Get All Keys

| Platform | URL |
|----------|-----|
| Supabase | [supabase.com/dashboard/project/YOUR_PROJECT/settings/api](https://supabase.com/dashboard) |
| Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| Linear | [linear.app/settings/api](https://linear.app/settings) |
| Expo | [expo.dev/accounts/settings/access-tokens](https://expo.dev/accounts/settings/access-tokens) |
| GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) |

---

*API Configuration Guide v1.0*
