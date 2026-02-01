# FOOTPRINT WAVE EXECUTION CHECKLIST

**Project:** Footprint - AI-Powered Photo Printing Platform  
**Date:** 2026-01-29  
**Purpose:** Complete pre-flight validation and Claude Code execution instructions  
**Status:** PRE-EXECUTION CHECKLIST

---

## HOW TO USE THIS DOCUMENT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXECUTION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PHASE 1              PHASE 2              PHASE 3              PHASE 4    │
│   ═══════              ═══════              ═══════              ═══════    │
│                                                                              │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐   │
│  │ System  │────────▶│ Wave 1  │────────▶│  Tools  │────────▶│ Claude  │   │
│  │Readiness│         │Validate │         │ Config  │         │  Code   │   │
│  │  Check  │         │         │         │         │         │ Execute │   │
│  └─────────┘         └─────────┘         └─────────┘         └─────────┘   │
│      │                    │                   │                    │        │
│      ▼                    ▼                   ▼                    ▼        │
│   30 min              15 min              20 min              ongoing       │
│                                                                              │
│  YOU DO THIS ──────────────────────────────────────▶ CLAUDE CODE DOES THIS │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Instructions:**
1. Work through each phase sequentially
2. Check off each item as you complete it
3. If any check fails, resolve before continuing
4. Copy the Claude Code commands exactly as shown

---

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: SYSTEM READINESS VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

## 1.1 Project Directory Access

**Action:** Open Terminal and verify project location

```bash
# Run this command
cd /Volumes/SSD-01/Projects/Footprint/footprint && pwd
```

**Expected Output:**
```
/Volumes/SSD-01/Projects/Footprint/footprint
```

**Checklist:**
```
□ Terminal opened
□ Can navigate to project directory
□ Directory exists and is accessible
```

---

## 1.2 Project Structure Verification

**Action:** Verify core directories exist

```bash
# Run this command
ls -la app/ components/ lib/ types/ 2>/dev/null && echo "✅ Core directories exist" || echo "❌ Missing directories"
```

**Checklist:**
```
□ app/ directory exists (Next.js pages)
□ components/ directory exists (React components)
□ lib/ directory exists (utilities)
□ types/ directory exists (TypeScript types)
```

---

## 1.3 Environment File Check

**Action:** Verify .env.local exists and has content

```bash
# Run this command
if [ -f .env.local ]; then
  echo "✅ .env.local exists"
  echo "Lines: $(wc -l < .env.local)"
  echo ""
  echo "=== Variables present (names only) ==="
  grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1 | head -20
else
  echo "❌ .env.local does NOT exist"
  echo "Create it from .env.example: cp .env.example .env.local"
fi
```

**Required Variables for Wave 1:**
```
□ NEXT_PUBLIC_SUPABASE_URL
□ NEXT_PUBLIC_SUPABASE_ANON_KEY
□ SUPABASE_SERVICE_ROLE_KEY
□ UPSTASH_REDIS_REST_URL (for rate limiting)
□ UPSTASH_REDIS_REST_TOKEN (for rate limiting)
□ SENTRY_DSN (for error monitoring)
```

**If missing, add these to .env.local:**
```bash
# Supabase (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis (get from Upstash console)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Sentry (get from Sentry dashboard)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 1.4 Node.js and Dependencies

**Action:** Verify Node.js version and install dependencies

```bash
# Run these commands
echo "=== Node.js Version ==="
node --version

echo ""
echo "=== npm Version ==="
npm --version

echo ""
echo "=== Installing/Verifying Dependencies ==="
npm install

echo ""
echo "=== Dependency Count ==="
ls node_modules | wc -l
```

**Checklist:**
```
□ Node.js version >= 18.x
□ npm version >= 9.x
□ npm install completed without errors
□ node_modules directory has packages
```

---

## 1.5 Git Repository Status

**Action:** Ensure clean working tree

```bash
# Run this command
echo "=== Git Status ==="
git status

echo ""
echo "=== Current Branch ==="
git branch --show-current

echo ""
echo "=== Uncommitted Changes ==="
git diff --stat
```

**Checklist:**
```
□ On main or development branch
□ No uncommitted changes (or commit them first)
□ Repository is in clean state
```

**If you have uncommitted changes:**
```bash
git add .
git commit -m "Pre-WAVE checkpoint"
```

---

## 1.6 Development Server Test

**Action:** Verify the app can start

```bash
# Run this command (will start dev server)
npm run dev &
sleep 10
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
kill %1 2>/dev/null
```

**Expected:** HTTP 200 or 302

**Checklist:**
```
□ npm run dev starts without errors
□ http://localhost:3000 is accessible
□ No TypeScript compilation errors
```

---

## PHASE 1 SUMMARY CHECKLIST

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 1: SYSTEM READINESS                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  □ 1.1 Project directory accessible                                       ║
║  □ 1.2 Core directories exist (app, components, lib, types)               ║
║  □ 1.3 .env.local exists with required variables                          ║
║  □ 1.4 Node.js >= 18.x, npm install successful                           ║
║  □ 1.5 Git repository clean                                               ║
║  □ 1.6 Development server starts                                          ║
║                                                                            ║
║  ALL CHECKS PASSED? □ YES  □ NO (fix before continuing)                   ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: WAVE 1 STORIES VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

## 2.1 Create Stories Directory Structure

**Action:** Create the directory structure for WAVE stories

```bash
# Run this command
cd /Volumes/SSD-01/Projects/Footprint/footprint

mkdir -p stories/wave1
mkdir -p stories/wave2
mkdir -p stories/wave3
mkdir -p stories/wave4
mkdir -p stories/wave5
mkdir -p .claude/snapshots
mkdir -p .claude/memory
mkdir -p .claude/signals

echo "✅ Directory structure created"
ls -la stories/
ls -la .claude/
```

**Checklist:**
```
□ stories/wave1-5/ directories created
□ .claude/ directory created with subdirectories
```

---

## 2.2 Wave 1 Stories Overview

**Wave 1: Security & Infrastructure**
- **Priority:** P0-Critical
- **Duration:** 3-5 days
- **Stories:** 6
- **Hours:** 28

| Story ID | Title | Agent | Hours | Human Approval |
|----------|-------|-------|-------|----------------|
| STR-SEC-001 | Implement Row-Level Security Policies | be-dev-1 | 6 | ✅ Required |
| STR-SEC-002 | Restrict Anonymous Access & Auth Guards | be-dev-2 | 4 | ✅ Required |
| STR-SEC-003 | Add API Rate Limiting (Upstash Redis) | be-dev-1 | 6 | No |
| STR-SEC-004 | Implement Input Validation (Zod) | be-dev-2 | 6 | No |
| STR-DB-002 | Add Database Indexes | be-dev-1 | 3 | No |
| STR-MON-001 | Set Up Sentry Error Monitoring | be-dev-2 | 3 | No |

**Checklist:**
```
□ Reviewed all 6 Wave 1 stories
□ Understand acceptance criteria for each
□ Ready to approve execution
```

---

## 2.3 Wave 1 Dependencies Check

**Action:** Install packages needed for Wave 1

```bash
# Run this command
cd /Volumes/SSD-01/Projects/Footprint/footprint

echo "=== Installing Wave 1 Dependencies ==="

# Input validation
npm install zod

# Rate limiting
npm install @upstash/redis @upstash/ratelimit

# Error monitoring
npm install @sentry/nextjs

# Testing
npm install -D vitest @testing-library/react @vitejs/plugin-react jsdom

echo ""
echo "=== Verifying Installation ==="
grep -E '"zod"|"@upstash|"@sentry|"vitest"' package.json
```

**Checklist:**
```
□ zod installed (input validation)
□ @upstash/redis installed (rate limiting)
□ @upstash/ratelimit installed (rate limiting)
□ @sentry/nextjs installed (error monitoring)
□ vitest installed (testing)
□ @testing-library/react installed (testing)
```

---

## 2.4 Wave 1 Acceptance Criteria Review

### STR-SEC-001: Row-Level Security
```
□ AC-01: RLS enabled on profiles, orders, order_items, payments, shipments, addresses
□ AC-02: Users can only SELECT their own orders
□ AC-03: Admin users can access all records
□ AC-04: Anonymous users get empty results
□ AC-05: INSERT auto-sets user_id to auth.uid()
```

### STR-SEC-002: Auth Guards
```
□ AC-01: No auth token + no guest email → 401 on /api/upload
□ AC-02: No auth token → 401 on /api/transform
□ AC-03: Valid guest email → upload proceeds
□ AC-04: Valid JWT → endpoint accessible
□ AC-05: Invalid/expired token → 401
```

### STR-SEC-003: Rate Limiting
```
□ AC-01: Upload: 10 requests/minute limit
□ AC-02: Transform: 5 requests/minute limit
□ AC-03: X-RateLimit-* headers in response
□ AC-04: Different users have separate limits
□ AC-05: Anonymous requests tracked by IP
```

### STR-SEC-004: Input Validation
```
□ AC-01: All API routes validate with Zod
□ AC-02: Invalid data type → 400 Bad Request
□ AC-03: Missing required field → 400 with field list
□ AC-04: HTML in strings → stripped/escaped
□ AC-05: Numeric strings → coerced to numbers
```

### STR-DB-002: Database Indexes
```
□ AC-01: Index on orders.user_id
□ AC-02: Index on orders.status
□ AC-03: Index on orders.created_at
□ AC-04: Index on payments.order_id
□ AC-05: Index on order_items.order_id
```

### STR-MON-001: Sentry Monitoring
```
□ AC-01: Unhandled errors sent to Sentry
□ AC-02: Environment visible in Sentry
□ AC-03: Slack notification on new error types
```

---

## PHASE 2 SUMMARY CHECKLIST

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 2: WAVE 1 VALIDATION                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  □ 2.1 Stories directory structure created                                ║
║  □ 2.2 All 6 Wave 1 stories reviewed                                      ║
║  □ 2.3 Wave 1 npm packages installed                                      ║
║  □ 2.4 Acceptance criteria understood for each story                      ║
║                                                                            ║
║  WAVE 1 READY? □ YES  □ NO (fix before continuing)                        ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: TOOLS & SERVICES VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

## 3.1 Supabase Connection Test

**Action (Manual):** Verify Supabase access

```
1. Open: https://supabase.com/dashboard
2. Select your Footprint project
3. Verify you can access:
```

**Checklist:**
```
□ Can log into Supabase dashboard
□ Can access Table Editor
□ Can access SQL Editor
□ Can access Authentication settings
□ Can access Database settings (for RLS)
□ Can see current tables (profiles, orders, payments, etc.)
```

**Action (Terminal):** Test Supabase connection

```bash
# Run this command
cd /Volumes/SSD-01/Projects/Footprint/footprint

# Extract URL and test
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2 | tr -d '"')
echo "Testing: $SUPABASE_URL"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$SUPABASE_URL/rest/v1/"
```

**Expected:** HTTP Status 200 or 401 (both mean connection works)

---

## 3.2 Upstash Redis Setup

**Action (Manual):** Set up Upstash Redis for rate limiting

```
1. Go to: https://console.upstash.com/
2. Click "Create Database"
3. Choose:
   - Name: footprint-ratelimit
   - Region: Closest to your users (EU or US)
   - Type: Regional
4. Copy credentials to .env.local
```

**Add to .env.local:**
```bash
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxE=
```

**Action (Terminal):** Test Upstash connection

```bash
# Run this command (after adding to .env.local)
cd /Volumes/SSD-01/Projects/Footprint/footprint

UPSTASH_URL=$(grep UPSTASH_REDIS_REST_URL .env.local | cut -d'=' -f2 | tr -d '"')
UPSTASH_TOKEN=$(grep UPSTASH_REDIS_REST_TOKEN .env.local | cut -d'=' -f2 | tr -d '"')

curl -s "${UPSTASH_URL}/ping" -H "Authorization: Bearer ${UPSTASH_TOKEN}"
```

**Expected Output:** `{"result":"PONG"}`

**Checklist:**
```
□ Upstash account created
□ Redis database created
□ UPSTASH_REDIS_REST_URL in .env.local
□ UPSTASH_REDIS_REST_TOKEN in .env.local
□ PING returns PONG
```

---

## 3.3 Sentry Setup

**Action (Manual):** Set up Sentry for error monitoring

```
1. Go to: https://sentry.io/
2. Create account or log in
3. Create new project:
   - Platform: Next.js
   - Project name: footprint
4. Copy DSN to .env.local
```

**Add to .env.local:**
```bash
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Checklist:**
```
□ Sentry account created
□ Next.js project created
□ SENTRY_DSN in .env.local
□ (Optional) SENTRY_AUTH_TOKEN for source maps
```

---

## 3.4 Verify All Environment Variables

**Action:** Run complete environment check

```bash
# Run this command
cd /Volumes/SSD-01/Projects/Footprint/footprint

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            ENVIRONMENT VARIABLES CHECK                          ║"
echo "╠════════════════════════════════════════════════════════════════╣"

check_var() {
  if grep -q "^$1=" .env.local 2>/dev/null; then
    value=$(grep "^$1=" .env.local | cut -d'=' -f2)
    if [ -n "$value" ] && [ "$value" != '""' ] && [ "$value" != "''" ]; then
      echo "║ ✅ $1"
    else
      echo "║ ⚠️  $1 (empty value)"
    fi
  else
    echo "║ ❌ $1 (missing)"
  fi
}

echo "║"
echo "║ === SUPABASE (Required) ==="
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"

echo "║"
echo "║ === UPSTASH REDIS (Required for Wave 1) ==="
check_var "UPSTASH_REDIS_REST_URL"
check_var "UPSTASH_REDIS_REST_TOKEN"

echo "║"
echo "║ === SENTRY (Required for Wave 1) ==="
check_var "SENTRY_DSN"

echo "║"
echo "║ === PAYPLUS (Required for Wave 2) ==="
check_var "PAYPLUS_API_KEY"
check_var "PAYPLUS_SECRET_KEY"

echo "║"
echo "╚════════════════════════════════════════════════════════════════╝"
```

---

## 3.5 Create Test Configuration

**Action:** Set up Vitest for testing

```bash
# Run this command
cd /Volumes/SSD-01/Projects/Footprint/footprint

# Check if vitest.config.ts exists
if [ ! -f vitest.config.ts ]; then
  echo "Creating vitest.config.ts..."
  cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
EOF
  echo "✅ vitest.config.ts created"
else
  echo "✅ vitest.config.ts already exists"
fi

# Create setup file if needed
if [ ! -f vitest.setup.ts ]; then
  cat > vitest.setup.ts << 'EOF'
import '@testing-library/jest-dom'
EOF
  echo "✅ vitest.setup.ts created"
fi

# Add test script to package.json if not present
if ! grep -q '"test"' package.json; then
  echo "⚠️  Add to package.json scripts: \"test\": \"vitest\""
fi
```

---

## PHASE 3 SUMMARY CHECKLIST

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 3: TOOLS & SERVICES                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  □ 3.1 Supabase dashboard accessible, tables visible                      ║
║  □ 3.2 Upstash Redis created, PING returns PONG                          ║
║  □ 3.3 Sentry project created, DSN configured                            ║
║  □ 3.4 All required env variables set and valid                          ║
║  □ 3.5 Vitest configuration created                                       ║
║                                                                            ║
║  ALL TOOLS READY? □ YES  □ NO (fix before continuing)                     ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: CLAUDE CODE EXECUTION INSTRUCTIONS
# ═══════════════════════════════════════════════════════════════════════════

## 4.1 INITIAL SETUP COMMAND

**⚠️ IMPORTANT: Copy this ENTIRE block to Claude Code to begin:**

```
I need you to help me implement the FOOTPRINT project using the WAVE framework.

═══════════════════════════════════════════════════════════════════════════
PROJECT CONTEXT
═══════════════════════════════════════════════════════════════════════════

Project: Footprint - AI-powered photo printing platform for Israel
Location: /Volumes/SSD-01/Projects/Footprint/footprint
Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Supabase (Auth, Database, Storage)
- Payments: PayPlus (Israeli market)
- Storage: Cloudflare R2
- Deployment: Vercel

Current Status: Production deployed, 75% ready
Critical Gaps: Security (RLS missing), Billing (invoices missing)

═══════════════════════════════════════════════════════════════════════════
WAVE FRAMEWORK RULES
═══════════════════════════════════════════════════════════════════════════

1. Work on ONE story at a time, in order
2. For each story:
   - Read and understand the acceptance criteria
   - Write tests FIRST (TDD approach)
   - Implement to pass ALL acceptance criteria
   - Run tests to verify
   - Report completion status
3. Do NOT modify files marked as "forbidden"
4. If you hit a safety stop condition, STOP and report
5. Ask for clarification if criteria are unclear

═══════════════════════════════════════════════════════════════════════════
CURRENT TASK: WAVE 1 - SECURITY & INFRASTRUCTURE
═══════════════════════════════════════════════════════════════════════════

Wave 1 contains 6 stories (28 hours total):

| ID | Title | Priority |
|----|-------|----------|
| STR-SEC-001 | Implement Row-Level Security Policies | P0-Critical |
| STR-SEC-002 | Restrict Anonymous Access & Auth Guards | P0-Critical |
| STR-SEC-003 | Add API Rate Limiting (Upstash Redis) | P0-Critical |
| STR-SEC-004 | Implement Input Validation (Zod) | P1-High |
| STR-DB-002 | Add Database Indexes | P1-High |
| STR-MON-001 | Set Up Sentry Error Monitoring | P1-High |

═══════════════════════════════════════════════════════════════════════════
FIRST STEP
═══════════════════════════════════════════════════════════════════════════

1. Navigate to the project directory
2. Explore the current project structure
3. List existing files in: app/, lib/, supabase/
4. Identify which Supabase tables exist
5. Present your implementation plan for STR-SEC-001

Begin now.
```

---

## 4.2 STORY-BY-STORY COMMANDS

### After Claude Code presents the plan for STR-SEC-001, say:

```
Approved. Implement STR-SEC-001: Row-Level Security Policies.

ACCEPTANCE CRITERIA:
- AC-01: Enable RLS on tables: profiles, orders, order_items, payments, shipments, addresses
- AC-02: Users can only SELECT their own orders (user_id = auth.uid())
- AC-03: Admin users can access all records
- AC-04: Anonymous users get empty results on protected tables
- AC-05: INSERT policies auto-set user_id to auth.uid()

DELIVERABLES:
1. Create: supabase/migrations/20260129_001_add_rls_policies.sql
2. The SQL should:
   - Enable RLS on each table
   - Create SELECT policy for authenticated users (own data only)
   - Create INSERT policy that sets user_id = auth.uid()
   - Create UPDATE policy for own data
   - Create DELETE policy for own data (if applicable)
   - Create admin policy for users with admin role

3. Show me the complete SQL file
4. Explain how to run it in Supabase SQL Editor
5. Create basic test documentation

FORBIDDEN FILES: .env, .env.local, supabase/config.toml

Begin implementation.
```

---

### After STR-SEC-001 is complete, say:

```
STR-SEC-001 complete. Now implement STR-SEC-002: Auth Guards.

ACCEPTANCE CRITERIA:
- AC-01: Request without auth token AND without guest email to /api/upload → 401
- AC-02: Request without auth token to /api/transform → 401
- AC-03: Request with valid guest email to /api/upload → proceeds
- AC-04: Request with valid Supabase JWT → validates and proceeds
- AC-05: Request with expired/invalid token → 401

DELIVERABLES:
1. Create: src/middleware/authGuard.ts
   - Export middleware function
   - Check for Supabase JWT in Authorization header
   - Check for guest email in request body (for upload)
   - Return 401 with JSON error for unauthorized requests
   
2. Create: src/lib/auth/validateToken.ts
   - Validate Supabase JWT using service role
   - Return user object if valid, null if invalid

3. Modify: src/app/api/upload/route.ts
   - Apply auth guard
   - Allow guest with email

4. Modify: src/app/api/transform/route.ts
   - Apply auth guard
   - Require authenticated user

5. Create: __tests__/middleware/authGuard.test.ts
   - Test all acceptance criteria

Begin implementation.
```

---

### After STR-SEC-002 is complete, say:

```
STR-SEC-002 complete. Now implement STR-SEC-003: Rate Limiting.

ACCEPTANCE CRITERIA:
- AC-01: Upload endpoint: 10 requests/minute, 11th → 429
- AC-02: Transform endpoint: 5 requests/minute, 6th → 429
- AC-03: All responses include X-RateLimit-Limit, X-RateLimit-Remaining headers
- AC-04: User A hitting limit does not affect User B
- AC-05: Anonymous requests use IP address for tracking

DELIVERABLES:
1. Create: src/lib/redis/upstash.ts
   - Initialize Upstash Redis client
   - Use environment variables: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

2. Create: src/middleware/rateLimit.ts
   - Export configurable rate limit middleware
   - Support different limits per endpoint
   - Add X-RateLimit-* headers to response
   - Return 429 Too Many Requests when exceeded

3. Apply to: src/app/api/upload/route.ts (10/min)
4. Apply to: src/app/api/transform/route.ts (5/min)

5. Create: __tests__/middleware/rateLimit.test.ts

Begin implementation.
```

---

### After STR-SEC-003 is complete, say:

```
STR-SEC-003 complete. Now implement STR-SEC-004: Input Validation.

ACCEPTANCE CRITERIA:
- AC-01: All API routes validate request body with Zod schema
- AC-02: Invalid data type → 400 Bad Request with error details
- AC-03: Missing required field → 400 with list of missing fields
- AC-04: HTML/script tags in strings → stripped or escaped
- AC-05: Numeric strings for number fields → coerced to numbers

DELIVERABLES:
1. Create: src/lib/validation/schemas/upload.ts
   - File type validation (image/*)
   - File size limit (10MB)
   - Optional caption (string, max 200 chars)

2. Create: src/lib/validation/schemas/transform.ts
   - style: enum of valid styles
   - imageId: string UUID
   - options: optional object

3. Create: src/lib/validation/schemas/checkout.ts
   - items: array of order items
   - shipping address
   - payment method

4. Create: src/lib/validation/schemas/orders.ts
   - Query params for listing orders

5. Create: src/lib/validation/index.ts
   - Export all schemas
   - Export validate() helper function

6. Create: __tests__/lib/validation/schemas.test.ts

Begin implementation.
```

---

### After STR-SEC-004 is complete, say:

```
STR-SEC-004 complete. Now implement STR-DB-002: Database Indexes.

ACCEPTANCE CRITERIA:
- AC-01: Index on orders.user_id
- AC-02: Index on orders.status
- AC-03: Index on orders.created_at
- AC-04: Index on payments.order_id
- AC-05: Index on payments.status
- AC-06: Index on order_items.order_id

DELIVERABLES:
1. Create: supabase/migrations/20260129_002_add_indexes.sql

The SQL should:
- Use CREATE INDEX IF NOT EXISTS
- Use appropriate index types (btree for most)
- Add composite index on orders (user_id, status) for common query
- Add index on created_at for date range queries

2. Show me the complete SQL
3. Explain how to verify indexes are working (EXPLAIN ANALYZE)

Begin implementation.
```

---

### After STR-DB-002 is complete, say:

```
STR-DB-002 complete. Now implement STR-MON-001: Sentry Monitoring.

ACCEPTANCE CRITERIA:
- AC-01: Unhandled errors in API routes → sent to Sentry with stack trace
- AC-02: Environment (dev/staging/prod) visible in Sentry
- AC-03: Optional: Slack notification on new error types

DELIVERABLES:
1. Create: sentry.client.config.ts
   - Initialize Sentry for browser
   - Set dsn from SENTRY_DSN
   - Set environment from NODE_ENV

2. Create: sentry.server.config.ts
   - Initialize Sentry for server
   - Same configuration

3. Create: src/lib/monitoring/sentry.ts
   - Export captureException() wrapper
   - Export captureMessage() wrapper
   - Add user context attachment

4. Modify: next.config.js
   - Integrate @sentry/nextjs

5. Create: src/components/ErrorBoundary.tsx
   - Wrap children
   - Capture errors with Sentry
   - Show friendly error UI

Begin implementation.
```

---

## 4.3 WAVE 1 COMPLETION VERIFICATION

### After all 6 stories, say:

```
All Wave 1 stories should be complete. Let's verify:

1. LIST all files created during Wave 1

2. RUN TypeScript compilation check:
   npx tsc --noEmit

3. RUN tests (if vitest is configured):
   npm run test

4. CREATE a Wave 1 Completion Report with:
   - All files created (with paths)
   - All files modified (with paths)
   - Tests created and their status
   - Any warnings or issues
   - Verification that each acceptance criterion is met

5. VERIFY the Supabase migrations are ready to run

If all checks pass, Wave 1 is ready for my final approval.
```

---

## 4.4 WAVE 1 APPROVAL AND WAVE 2 START

### When Wave 1 is verified, say:

```
Wave 1 APPROVED. ✅

Before starting Wave 2, I need to:
1. Run the RLS migration in Supabase SQL Editor
2. Run the indexes migration in Supabase SQL Editor
3. Deploy to verify Sentry is receiving errors

Once confirmed, we'll start Wave 2: Payments & Billing.

[After you've run migrations and tested]

Wave 2 is ready to begin. The first story is STR-PAY-003: Invoice Generation System.

Present your implementation plan for STR-PAY-003.
```

---

## 4.5 EMERGENCY COMMANDS

### If something goes wrong:

```
STOP. Do not continue with the current task.

[Describe the issue]

Show me:
1. The last 5 files you modified
2. What changes were made
3. How to revert if needed
```

### If you need to restart a story:

```
RESET story [STR-XXX-NNN].

Delete all files created for this story and start fresh.
Show me what will be deleted before proceeding.
```

### If Claude Code seems stuck:

```
STATUS check.

Show me:
1. Current story being worked on
2. Acceptance criteria completed
3. Acceptance criteria remaining
4. Any blockers
```

---

## PHASE 4 SUMMARY CHECKLIST

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 4: CLAUDE CODE EXECUTION                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  □ 4.1 Initial setup command copied and sent to Claude Code               ║
║  □ 4.2 Ready to send story-by-story commands                              ║
║  □ 4.3 Understand Wave 1 completion verification                          ║
║  □ 4.4 Know how to approve and start Wave 2                               ║
║  □ 4.5 Emergency commands saved for reference                             ║
║                                                                            ║
║  READY TO EXECUTE? □ YES                                                   ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

# ═══════════════════════════════════════════════════════════════════════════
# FINAL PRE-FLIGHT CHECKLIST
# ═══════════════════════════════════════════════════════════════════════════

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                    FOOTPRINT WAVE PRE-FLIGHT CHECKLIST                     ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  PHASE 1: SYSTEM READINESS                                                ║
║  ─────────────────────────                                                ║
║  □ Project directory accessible                                           ║
║  □ Core directories exist                                                 ║
║  □ .env.local configured                                                  ║
║  □ npm install successful                                                 ║
║  □ Git repository clean                                                   ║
║  □ Dev server starts                                                      ║
║                                                                            ║
║  PHASE 2: WAVE 1 READY                                                    ║
║  ────────────────────                                                     ║
║  □ Stories directory created                                              ║
║  □ All 6 stories reviewed                                                 ║
║  □ Dependencies installed (zod, upstash, sentry, vitest)                 ║
║  □ Acceptance criteria understood                                         ║
║                                                                            ║
║  PHASE 3: TOOLS CONFIGURED                                                ║
║  ─────────────────────────                                                ║
║  □ Supabase accessible                                                    ║
║  □ Upstash Redis working (PING → PONG)                                   ║
║  □ Sentry project created                                                 ║
║  □ All env variables set                                                  ║
║  □ Vitest configured                                                      ║
║                                                                            ║
║  PHASE 4: EXECUTION READY                                                 ║
║  ────────────────────────                                                 ║
║  □ Initial command ready                                                  ║
║  □ Story commands ready                                                   ║
║  □ Emergency commands saved                                               ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║   ALL CHECKS PASSED?                                                       ║
║                                                                            ║
║   □ YES - READY TO START WAVE 1                                           ║
║                                                                            ║
║   □ NO - RESOLVE ISSUES ABOVE FIRST                                       ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

# QUICK REFERENCE CARD

## Commands at a Glance

| Action | Command |
|--------|---------|
| Navigate to project | `cd /Volumes/SSD-01/Projects/Footprint/footprint` |
| Check env vars | `grep "=" .env.local \| cut -d'=' -f1` |
| Install deps | `npm install zod @upstash/redis @upstash/ratelimit @sentry/nextjs` |
| Run tests | `npm run test` |
| Type check | `npx tsc --noEmit` |
| Start dev | `npm run dev` |

## Story Execution Order

```
1. STR-SEC-001 → RLS Policies (Supabase SQL)
2. STR-SEC-002 → Auth Guards (middleware)
3. STR-SEC-003 → Rate Limiting (Upstash)
4. STR-SEC-004 → Input Validation (Zod)
5. STR-DB-002 → Database Indexes (Supabase SQL)
6. STR-MON-001 → Sentry Monitoring
```

## After Wave 1

```
1. Run migrations in Supabase SQL Editor
2. Deploy to staging/production
3. Verify Sentry receives test error
4. Approve Wave 1
5. Start Wave 2: Payments & Billing
```

---

**Document Created:** 2026-01-29  
**Estimated Pre-Flight Time:** 1 hour  
**Estimated Wave 1 Execution:** 3-5 days  
**Next Step:** Start with Phase 1.1 - Project Directory Access
