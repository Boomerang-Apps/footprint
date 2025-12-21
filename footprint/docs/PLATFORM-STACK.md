# Platform Stack Guide

**Complete infrastructure for web applications, mobile apps, and websites**

---

## Boomerang Apps Core Stack

| Layer | Platform | Purpose | Required |
|-------|----------|---------|----------|
| Code | **GitHub** | Version control, CI/CD, OAuth | YES |
| Backend | **Supabase** | Database, Auth, Storage, Edge Functions | YES |
| Web Deploy | **Vercel** | Hosting, Serverless, Edge | YES |
| Mobile Deploy | **Expo EAS** | iOS/Android builds, OTA updates | FOR MOBILE |
| DNS/CDN | **Cloudflare** | DNS, SSL, Security, CDN | RECOMMENDED |
| Payments | **Paddle** | Subscriptions, Billing, Tax | IF MONETIZING |
| Email | **Resend** | Transactional emails | YES |
| Rate Limiting | **Upstash** | Redis, Rate limiting | RECOMMENDED |
| Caching | **Redis Cloud** | Sessions, License cache | OPTIONAL |
| Automation | **Pabbly** | Workflows, Integrations | OPTIONAL |
| Project Mgmt | **Linear** | Issues, Sprints, MCP | YES |
| AI Agents | **Anthropic** | Claude API, Multi-agent | YES |
| Analytics | **PostHog** | Product analytics, Feature flags | RECOMMENDED |
| Errors | **Sentry** | Error tracking, Performance | RECOMMENDED |
| Security | **Snyk** | Vulnerability scanning, Dependencies | RECOMMENDED |
| Mobile Payments | **RevenueCat** | In-app purchases | FOR MOBILE |
| Dev Tunnels | **ngrok** | Local webhook testing, Debugging | FOR WEBHOOKS |

---

## Platform Matrix

| Layer | Platform | Web App | Mobile App | Website | Free Tier |
|-------|----------|---------|------------|---------|-----------|
| Code | GitHub | YES | YES | YES | YES |
| Backend | Supabase | YES | YES | Optional | YES |
| Web Deploy | Vercel | YES | - | YES | YES |
| Mobile Deploy | Expo EAS | - | YES | - | YES |
| DNS/CDN | Cloudflare | YES | - | YES | YES |
| Payments | Paddle | YES | - | YES | Pay-as-go |
| Email | Resend | YES | YES | YES | YES |
| Rate Limit | Upstash | YES | YES | - | YES |
| Caching | Redis Cloud | YES | YES | - | YES |
| Automation | Pabbly | YES | YES | YES | Paid |
| Project Mgmt | Linear | YES | YES | YES | YES |
| AI Agents | Claude | YES | YES | YES | Paid |
| Analytics | PostHog | YES | YES | YES | YES |
| Errors | Sentry | YES | YES | YES | YES |
| Security | Snyk | YES | YES | YES | YES |
| Mobile Payments | RevenueCat | - | YES | - | YES |
| Dev Tunnels | ngrok | YES | YES | - | YES |

---

## 1. GitHub (REQUIRED)

**Purpose**: Version control, CI/CD, collaboration

### Setup
```bash
# Create organization (recommended for teams)
# Go to: github.com/organizations/new

# Create repo from template
gh repo create my-org/my-app --template Boomerang-Apps/template-repo
```

### Required Secrets
| Secret | Purpose |
|--------|---------|
| `EXPO_TOKEN` | Mobile builds |
| `VERCEL_TOKEN` | Web deployments |
| `SUPABASE_ACCESS_TOKEN` | Database migrations |
| `SENTRY_AUTH_TOKEN` | Error tracking |

### Cost
- Free: Unlimited public repos, 2000 Actions minutes/month
- Team: $4/user/month

---

## 2. Supabase (REQUIRED for Apps)

**Purpose**: Database, Authentication, Storage, Edge Functions, Realtime

### Setup
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Create project at supabase.com/dashboard
# Link local project
supabase link --project-ref YOUR_PROJECT_REF
```

### Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # Server-side only
```

### Features Used
- [x] PostgreSQL database
- [x] Row Level Security (RLS)
- [x] Auth (Email, Phone, OAuth)
- [x] Storage (files, images)
- [x] Edge Functions (serverless)
- [x] Realtime subscriptions

### Cost
- Free: 500MB database, 1GB storage, 2GB bandwidth
- Pro: $25/month (8GB database, 100GB storage)

---

## 3. Vercel (REQUIRED for Web)

**Purpose**: Web hosting, serverless functions, edge network

### Setup
```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### Environment Variables
Set in Vercel Dashboard → Project → Settings → Environment Variables

| Variable | Environment |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Production |

### Features Used
- [x] Automatic deployments from GitHub
- [x] Preview deployments for PRs
- [x] Edge functions
- [x] Built-in CDN
- [x] SSL certificates

### Cost
- Hobby: Free (personal projects)
- Pro: $20/month (team features)

---

## 4. Expo / EAS (REQUIRED for Mobile)

**Purpose**: Mobile app development, builds, OTA updates

### Setup
```bash
# Install CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas init

# Build
eas build --platform all
```

### Environment Variables
Set in `eas.json` or EAS Secrets

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co"
      }
    }
  }
}
```

### Features Used
- [x] Development builds
- [x] Preview builds (TestFlight, Internal)
- [x] Production builds (App Store, Play Store)
- [x] OTA updates
- [x] Push notifications

### Cost
- Free: 30 builds/month
- Production: $99/month (unlimited builds)

---

## 5. Cloudflare (RECOMMENDED)

**Purpose**: DNS, CDN, Security, DDoS protection

### Setup
1. Create account at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your registrar
4. Configure DNS records

### DNS Records
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | Vercel IP | Yes |
| CNAME | www | cname.vercel-dns.com | Yes |
| CNAME | api | your-api.supabase.co | No |

### Features Used
- [x] DNS management
- [x] Free SSL (Full Strict)
- [x] CDN caching
- [x] DDoS protection
- [x] Bot protection
- [x] Web Application Firewall
- [ ] Workers (optional)
- [ ] R2 Storage (optional)

### Recommended Settings
| Setting | Value |
|---------|-------|
| SSL/TLS | Full (strict) |
| Always Use HTTPS | On |
| Auto Minify | JS, CSS, HTML |
| Brotli | On |
| HTTP/3 | On |

### Cost
- Free: Most features
- Pro: $20/month (advanced WAF, analytics)

---

## 6. Linear (REQUIRED)

**Purpose**: Project management, issue tracking, sprints

### Setup
```bash
# Add MCP to Claude Code
claude mcp add linear-server https://mcp.linear.app/sse --transport sse
```

### Workspace Configuration
1. Create workspace at [linear.app](https://linear.app)
2. Create project for your app
3. Set up cycles (sprints)
4. Create labels for gates and agents

### Labels to Create
| Label | Color | Purpose |
|-------|-------|---------|
| `gate-0-research` | Gray | Research phase |
| `gate-1-plan` | Blue | Planning |
| `gate-2-build` | Amber | Implementation |
| `gate-3-test` | Purple | QA |
| `gate-4-review` | Pink | Review |
| `gate-5-deploy` | Green | Complete |

### Cost
- Free: Up to 250 issues
- Standard: $8/user/month

---

## 7. PostHog (RECOMMENDED)

**Purpose**: Product analytics, feature flags, session replay

### Setup
```bash
npm install posthog-js  # Web
npm install posthog-react-native  # Mobile
```

### Environment Variables
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Features Used
- [x] Event tracking
- [x] User identification
- [x] Funnels & retention
- [x] Feature flags
- [x] A/B testing
- [x] Session replay

### Cost
- Free: 1M events/month
- Scale: Pay per event after

---

## 8. Sentry (RECOMMENDED)

**Purpose**: Error tracking, performance monitoring

### Setup
```bash
npm install @sentry/react  # Web
npm install @sentry/react-native  # Mobile
npx @sentry/wizard -i nextjs  # Auto-configure
```

### Environment Variables
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx  # For source maps
```

### Features Used
- [x] Error tracking
- [x] Stack traces with source maps
- [x] Release tracking
- [x] Performance monitoring
- [x] User feedback

### Cost
- Developer: Free (5K errors/month)
- Team: $26/month (100K errors)

---

## 9. Resend (IF NEEDED)

**Purpose**: Transactional emails

### Setup
```bash
npm install resend
```

### Environment Variables
```bash
RESEND_API_KEY=re_xxx
```

### Use Cases
- Welcome emails
- Password reset
- Notifications
- Receipts

### Cost
- Free: 100 emails/day
- Pro: $20/month (50K emails)

---

## 10. Paddle (IF MONETIZING - Web)

**Purpose**: Payments, subscriptions, tax compliance, merchant of record

### Why Paddle over Stripe?
- Handles global tax/VAT automatically
- Merchant of Record (they handle compliance)
- Built-in subscription management
- Simpler international payments

### Setup
```bash
npm install @paddle/paddle-js @paddle/paddle-node-sdk
```

### Environment Variables
```bash
# Server-side
PADDLE_API_KEY=pdl_live_xxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxx

# Client-side
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production  # or 'sandbox'
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=xxx
```

### Features Used
- [x] Subscriptions
- [x] One-time payments
- [x] Global tax handling (VAT, GST, Sales Tax)
- [x] Customer portal
- [x] Webhooks
- [x] Checkout overlay

### Webhook Events
| Event | Purpose |
|-------|---------|
| `subscription.created` | New subscription |
| `subscription.updated` | Plan change |
| `subscription.canceled` | Cancellation |
| `transaction.completed` | Payment success |

### Cost
- 5% + $0.50 per transaction (includes tax handling)

---

## 11. Upstash (RECOMMENDED)

**Purpose**: Serverless Redis, rate limiting, caching

### Setup
```bash
npm install @upstash/redis @upstash/ratelimit
```

### Environment Variables
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYxxx
```

### Usage Example
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// In API route
const { success } = await ratelimit.limit(identifier);
if (!success) return new Response('Rate limited', { status: 429 });
```

### Features Used
- [x] Rate limiting (API protection)
- [x] Session storage
- [x] Caching
- [x] Pub/Sub

### Cost
- Free: 10K commands/day
- Pay-as-you-go: $0.20 per 100K commands

---

## 12. Redis Cloud (OPTIONAL)

**Purpose**: Enterprise Redis for caching, sessions, real-time features

### Why Redis Cloud vs Upstash?
| Feature | Upstash | Redis Cloud |
|---------|---------|-------------|
| Protocol | REST API | Standard Redis |
| Best for | Rate limiting, serverless | Sessions, caching, pub/sub |
| Connection | HTTP (stateless) | TCP (persistent) |
| Latency | ~10-50ms | ~1-5ms |
| Package | `@upstash/redis` | `ioredis` |

**Use both:** Upstash for rate limiting, Redis Cloud for caching

### Setup
```bash
# 1. Create account at cloud.redis.io
# 2. Create database (Free tier available)
# 3. Get connection URL

# Install ioredis
npm install ioredis
```

### Environment Variables
```bash
# Redis Cloud connection URL
REDIS_URL=redis://default:password@host:port

# For TLS (production)
REDIS_URL=rediss://default:password@host:port
```

### Usage Example
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache with TTL
await redis.setex('key', 900, JSON.stringify(data)); // 15 min TTL

// Get cached data
const cached = await redis.get('key');
```

### Use Cases
| Feature | Example |
|---------|---------|
| License caching | Validate licenses without DB hit |
| Session storage | User sessions across instances |
| Real-time | Pub/sub for live updates |
| Queue | Background job processing |

### Cost
- Free: 30MB database, shared cluster
- Essentials: $5/month (250MB, dedicated)
- Pro: $88/month (12.5GB, high availability)

---

## 13. Pabbly (OPTIONAL)

**Purpose**: Workflow automation, integrations (like Zapier but cheaper)

### Setup
1. Create account at [pabbly.com/connect](https://www.pabbly.com/connect/)
2. Create workflow
3. Connect triggers and actions

### Use Cases
- Sync data between platforms
- Send notifications on events
- Automate onboarding flows
- Connect to 1000+ apps

### Common Workflows
| Trigger | Action |
|---------|--------|
| Paddle subscription created | Add to Supabase, send welcome email |
| Linear issue completed | Post to Slack |
| Form submission | Create Linear issue |
| GitHub PR merged | Notify team |

### Integration with Your Stack
- Webhook triggers from Supabase, Paddle, Linear
- Actions to Resend, Slack, Discord, Notion

### Cost
- Starter: $19/month (12,000 tasks)
- Growth: $39/month (40,000 tasks)

---

## 14. Snyk (RECOMMENDED)

**Purpose**: Security scanning, vulnerability detection, dependency monitoring

### Why Snyk?
- Finds vulnerabilities in dependencies (npm, pip, etc.)
- Scans code for security issues
- Monitors containers and IaC
- Integrates with GitHub for automatic PR checks
- Free for open source and small teams

### Setup

1. **Sign up**: [snyk.io](https://snyk.io)
2. **Connect GitHub**: Snyk → Integrations → GitHub
3. **Import projects**: Select repositories to monitor

### CLI Setup
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test project for vulnerabilities
snyk test

# Monitor project (continuous)
snyk monitor
```

### GitHub Integration

Snyk automatically:
- Scans PRs for new vulnerabilities
- Opens PRs to fix vulnerable dependencies
- Blocks merges if critical issues found

### Configuration

Create `.snyk` file in project root:
```yaml
# Snyk policy file
version: v1.25.0
ignore: {}
patch: {}
```

### GitHub Actions Integration
```yaml
# .github/workflows/security.yml
name: Security

on: [push, pull_request]

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### What It Scans

| Type | Coverage |
|------|----------|
| Dependencies | npm, yarn, pip, go, etc. |
| Code | JavaScript, TypeScript, Python, etc. |
| Containers | Docker images |
| IaC | Terraform, CloudFormation |

### Severity Levels

| Level | Action |
|-------|--------|
| Critical | Fix immediately, block deploy |
| High | Fix before release |
| Medium | Fix in next sprint |
| Low | Track, fix when convenient |

### Cost
- Free: 200 tests/month, unlimited projects
- Team: $52/dev/month (unlimited tests)
- Enterprise: Custom pricing

---

## 15. RevenueCat (IF MONETIZING - Mobile)

**Purpose**: In-app purchases, subscriptions for mobile

### Setup
```bash
npm install react-native-purchases
```

### Environment Variables
```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
```

### Features Used
- [x] In-app purchases
- [x] Subscriptions
- [x] Cross-platform entitlements
- [x] Analytics
- [x] A/B testing

### Cost
- Free: Up to $2.5K MTR
- Pro: 1% of MTR after

---

## 16. ngrok (FOR WEBHOOKS)

**Purpose**: Local webhook testing, tunnel localhost to public URL

### Why ngrok?
- Test Paddle, Stripe, Slack webhooks locally
- Excellent debugging UI at localhost:4040
- Inspect request/response headers
- Replay failed webhooks
- Alternative: Cloudflare Tunnel (free, more secure for staging)

### Setup
```bash
# Install ngrok
brew install ngrok

# Authenticate (get token from ngrok.com dashboard)
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel to local dev server
ngrok http 3000

# Your webhook URL will be:
# https://[random-id].ngrok-free.app/api/webhooks/paddle
```

### Use Cases
| Webhook | Local URL |
|---------|-----------|
| Paddle | `https://xxx.ngrok-free.app/api/paddle/webhook` |
| Stripe | `https://xxx.ngrok-free.app/api/stripe/webhook` |
| Slack | `https://xxx.ngrok-free.app/api/integrations/slack/callback` |
| GitHub | `https://xxx.ngrok-free.app/api/github/webhook` |

### Debugging
```bash
# View all requests in browser
open http://localhost:4040

# Features:
# - Inspect request headers
# - View request/response bodies
# - Replay requests
# - See timing information
```

### Recommended Approach
| Environment | Tool | Why |
|-------------|------|-----|
| Local dev | ngrok | Best debugging UI |
| Staging | Cloudflare Tunnel | Free, secure, stable URLs |
| Production | AWS/Vercel | Native infrastructure |

### Cost
- Free: 1 online endpoint, 20K requests/month
- Personal: $8/month (custom domains, more endpoints)
- Pro: $20/month (team features)

---

## Quick Setup Checklist

### Minimum Viable Stack (MVP)

For a new project, set up in this order:

```
1. [ ] GitHub - Create repo from template
2. [ ] Supabase - Create project, get API keys
3. [ ] Vercel/EAS - Link project, configure env vars
4. [ ] Linear - Create project, add MCP to Claude
5. [ ] Claude Code - Install, configure MCP
```

### Production Checklist

Before going live, add:

```
6. [ ] Cloudflare - DNS, SSL, security
7. [ ] PostHog - Analytics
8. [ ] Sentry - Error tracking
9. [ ] Resend - Transactional emails (if needed)
10. [ ] Stripe/RevenueCat - Payments (if monetizing)
```

---

## Environment Variables Summary

### .env.example (Complete)

```bash
# ===== REQUIRED =====
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ===== RECOMMENDED =====
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# ===== IF NEEDED =====
# Resend Email
RESEND_API_KEY=

# Stripe Payments (Web)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# RevenueCat Payments (Mobile)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=

# ===== ENVIRONMENT =====
EXPO_PUBLIC_ENV=development
```

---

## Cost Summary (Monthly)

### Free Tier Stack
| Platform | Cost |
|----------|------|
| GitHub | $0 |
| Supabase | $0 |
| Vercel | $0 |
| EAS | $0 |
| Cloudflare | $0 |
| Linear | $0 |
| PostHog | $0 |
| Sentry | $0 |
| Snyk | $0 |
| ngrok | $0 |
| **Total** | **$0** |

### Production Stack
| Platform | Cost |
|----------|------|
| GitHub Team | $4/user |
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| EAS Production | $99 |
| Cloudflare Pro | $20 |
| Linear Standard | $8/user |
| PostHog Scale | Variable |
| Sentry Team | $26 |
| **Total** | **~$200 + per user** |

---

*Platform Stack Guide v1.0*
