# CLI Setup Guide - Footprint

This guide helps you set up CLI tools for GitHub, Vercel, Supabase, and Linear integration.

---

## Current Status

| Tool | Status | Account |
|------|--------|---------|
| Vercel CLI | Installed (v50.1.2) | boomerangapps |
| GitHub CLI | Not installed | - |
| Supabase CLI | Not installed | - |
| Linear CLI | Optional | - |

---

## 1. Install Missing CLIs

### Option A: Using Homebrew (Recommended)

```bash
# If Homebrew isn't installed, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install GitHub CLI
brew install gh

# Install Supabase CLI
brew install supabase/tap/supabase
```

### Option B: Direct Downloads

**GitHub CLI:**
```bash
# Download from: https://cli.github.com/
# Or use the pkg installer for macOS
```

**Supabase CLI:**
```bash
# Using npm
npm install -g supabase

# Or download from: https://supabase.com/docs/guides/cli
```

---

## 2. GitHub CLI Setup

After installing `gh`:

```bash
# Authenticate with GitHub
gh auth login

# Choose:
# - GitHub.com
# - HTTPS
# - Login with a web browser

# Verify
gh auth status
```

### Create Footprint Repository

```bash
cd /Users/mymac/Desktop/footprint

# Create new private repo
gh repo create Boomerang-Apps/footprint --private --source=. --remote=origin --push

# Or if repo already exists, add remote
git remote add origin https://github.com/Boomerang-Apps/footprint.git
git push -u origin main
```

---

## 3. Vercel Setup

Vercel CLI is already installed and logged in.

```bash
cd /Users/mymac/Desktop/footprint

# Link to Vercel project
vercel link

# When prompted:
# - Set up and deploy? Yes
# - Which scope? boomerangapps
# - Link to existing project? No (create new)
# - Project name: footprint
# - Directory: ./

# Set environment variables
vercel env pull .env.local

# Or push local env to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc
```

### Deploy Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls
```

---

## 4. Supabase CLI Setup

After installing `supabase`:

```bash
# Login to Supabase
supabase login

# Link to existing project
cd /Users/mymac/Desktop/footprint
supabase link --project-ref gqupiqdvwzskjpybwkbq

# When prompted for database password:
# Use: oDPlvl3UwjuuStfP
```

### Supabase Commands

```bash
# Check status
supabase status

# Generate types from database
supabase gen types typescript --project-id gqupiqdvwzskjpybwkbq > types/supabase.ts

# Run migrations
supabase db push

# Pull remote schema
supabase db pull

# Start local development
supabase start
```

---

## 5. Linear CLI (Optional)

Linear doesn't have an official CLI, but you can use the API:

```bash
# Test Linear API
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: lin_wh_mpGNLzFIIIhBR1Ey2WMWir1C6qFGtqyF2SuafWzKwcIE" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { id name } }"}'
```

For CLI-like experience, consider:
- `linear-cli` npm package
- Linear GitHub integration for auto-linking PRs

---

## 6. Environment Variables Sync

### Push to Vercel

```bash
# Individual variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Or use the dashboard
vercel env ls
```

### Pull from Vercel

```bash
vercel env pull .env.local
```

---

## 7. Quick Reference

### All CLI Auth Commands

```bash
# Vercel
vercel login
vercel whoami

# GitHub
gh auth login
gh auth status

# Supabase
supabase login
supabase projects list
```

### Project Linking

```bash
# Vercel
vercel link

# Supabase
supabase link --project-ref gqupiqdvwzskjpybwkbq

# GitHub
gh repo create Boomerang-Apps/footprint --private
```

---

## 8. Shared Resources from Uzerflow

The following are shared with the Uzerflow project:

| Resource | ID/URL |
|----------|--------|
| Supabase Project | gqupiqdvwzskjpybwkbq |
| Upstash Redis | first-gator-32813 |
| Resend Email | Shared account |
| Google OAuth | pathlock-portal project |

---

## Troubleshooting

### Homebrew Not Found

```bash
# Add to PATH (Apple Silicon Mac)
export PATH="/opt/homebrew/bin:$PATH"

# Add to ~/.zshrc for persistence
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Vercel Project Not Linked

```bash
# Remove and re-link
rm -rf .vercel
vercel link
```

### Supabase Connection Issues

```bash
# Check connection
supabase db ping

# Reset link
supabase unlink
supabase link --project-ref gqupiqdvwzskjpybwkbq
```

---

*CLI Setup Guide - Created by CTO Agent - 2025-12-19*
