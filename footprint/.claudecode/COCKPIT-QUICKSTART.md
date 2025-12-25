# Cockpit - Quickstart Guide

Copy this dashboard to any Next.js project to track development progress with Linear integration.

---

## Quick Setup (5 minutes)

### Step 1: Configure Dashboard Name

In `src/data/dashboard/dev-progress.ts`, set your project info:

```typescript
// Dashboard Configuration
export const dashboardConfig = {
  name: 'AirView',                    // Your project name
  title: 'AirView Dev Dashboard',     // Full dashboard title
  subtitle: 'Real Estate Aerial Marketplace',  // Project description
  linearWorkspace: 'boomerang-apps',  // Your Linear workspace slug
  linearProjectId: '9cc9a53c-...',    // Your Linear project ID
};
```

### Step 2: Create Directory Structure

```bash
mkdir -p src/data/dashboard
mkdir -p src/app/cockpit
```

### Step 2: Copy Files

Copy these 3 files from AirView:

| Source | Destination |
|--------|-------------|
| `src/data/dashboard/dev-progress.ts` | `src/data/dashboard/dev-progress.ts` |
| `src/app/cockpit/page.tsx` | `src/app/cockpit/page.tsx` |
| `src/app/cockpit/layout.tsx` | `src/app/cockpit/layout.tsx` |

### Step 3: Update Project Data

Edit `src/data/dashboard/dev-progress.ts`:

1. **Update Linear URLs** - Replace `boomerang-apps` with your workspace
2. **Update Stories** - Add your project's stories
3. **Update Features** - Define your feature breakdown
4. **Update Sprints** - Define your sprint plan

### Step 4: Access Dashboard

```bash
npm run dev
# Open http://localhost:3000/cockpit
```

---

## File Templates

### 1. Data File (`src/data/dashboard/dev-progress.ts`)

```typescript
/**
 * Dev Progress Dashboard Data
 * Update this file to track your project's progress
 */

export type StoryStatus = 'done' | 'in-review' | 'in-progress' | 'blocked' | 'backlog' | 'not-created';

export interface Story {
  id: string;           // Internal ID (e.g., PROJ-101)
  linearId?: string;    // Linear issue ID (e.g., ABC-123)
  linearUuid?: string;  // Linear UUID for API
  title: string;
  description?: string;
  status: StoryStatus;
  agent?: string;       // Assigned agent/developer
  points?: number;
  blockedBy?: string[]; // IDs of blocking stories
  component?: string;   // Component category
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  prdRef?: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  stories: Story[];
}

export interface Sprint {
  id: number;
  name: string;
  focus: string;
  status: 'completed' | 'active' | 'planned';
  features: string[];
}

// =============================================================================
// YOUR PROJECT STORIES - UPDATE THIS SECTION
// =============================================================================

export const stories: Record<string, Story> = {
  // Example story:
  'PROJ-101': {
    id: 'PROJ-101',
    linearId: 'ABC-123',          // Your Linear issue ID
    linearUuid: 'uuid-here',      // Optional: for API integration
    title: 'Project Setup',
    description: 'Initialize the project',
    status: 'done',               // done | in-review | in-progress | blocked | backlog | not-created
    agent: 'Developer-1',         // Who's working on it
    points: 3,
    component: 'Setup',
  },
  // Add more stories...
};

// =============================================================================
// YOUR FEATURES - UPDATE THIS SECTION
// =============================================================================

export const features: Record<string, Feature> = {
  'F1': {
    id: 'F1',
    name: 'Feature Name',
    description: 'Feature description',
    priority: 'P0',
    stories: [
      stories['PROJ-101'],
      // Add more stories to this feature...
    ],
  },
  // Add more features...
};

// =============================================================================
// YOUR SPRINTS - UPDATE THIS SECTION
// =============================================================================

export const sprints: Sprint[] = [
  {
    id: 1,
    name: 'Sprint 1',
    focus: 'Sprint Focus',
    status: 'active',  // completed | active | planned
    features: ['F1'],  // Feature IDs in this sprint
  },
  // Add more sprints...
];

// =============================================================================
// COMPONENTS (for grouping)
// =============================================================================

export const components = [
  'Setup',
  'UI',
  'API',
  'Database',
  // Add your component categories...
] as const;

export type ComponentType = typeof components[number];

// =============================================================================
// HELPER FUNCTIONS (copy as-is)
// =============================================================================

export function getStoriesByComponent(component: string): Story[] {
  return Object.values(stories).filter(s => s.component === component);
}

export function getStoriesBySprint(sprintId: number): Story[] {
  const sprint = sprints.find(s => s.id === sprintId);
  if (!sprint) return [];
  const sprintStories: Story[] = [];
  sprint.features.forEach(featureId => {
    const feature = features[featureId];
    if (feature) sprintStories.push(...feature.stories);
  });
  return sprintStories;
}

export function getSprintProgress(sprintId: number): { done: number; total: number; percentage: number } {
  const sprintStories = getStoriesBySprint(sprintId);
  const done = sprintStories.filter(s => s.status === 'done').length;
  const total = sprintStories.length;
  return { done, total, percentage: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function getFeatureProgress(featureId: string): { done: number; total: number; percentage: number } {
  const feature = features[featureId];
  if (!feature) return { done: 0, total: 0, percentage: 0 };
  const done = feature.stories.filter(s => s.status === 'done').length;
  const total = feature.stories.length;
  return { done, total, percentage: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function getOverallProgress(): { done: number; total: number; percentage: number } {
  const allStories = Object.values(stories);
  const done = allStories.filter(s => s.status === 'done').length;
  const total = allStories.length;
  return { done, total, percentage: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export const statusConfig: Record<StoryStatus, { label: string; color: string; bgColor: string }> = {
  'done': { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
  'in-review': { label: 'In Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'blocked': { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' },
  'backlog': { label: 'Backlog', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'not-created': { label: 'Not Created', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

export const agentConfig: Record<string, { label: string; color: string }> = {
  'Developer-1': { label: 'Dev-1', color: 'text-purple-600' },
  'Developer-2': { label: 'Dev-2', color: 'text-indigo-600' },
  // Add your team members...
};
```

### 2. Layout File (`src/app/cockpit/layout.tsx`)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dev Progress Dashboard',
  description: 'Development progress tracking',
};

export default function DevDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
```

### 3. Page File (`src/app/cockpit/page.tsx`)

Copy the full page.tsx from AirView. Only update the Linear URL:

```typescript
// Line ~220: Update the Linear project URL
<a
  href="https://linear.app/YOUR-WORKSPACE/project/YOUR-PROJECT-ID"
  ...
>
```

---

## Customization

### Change Linear Workspace

In `page.tsx`, find and update:
```typescript
href="https://linear.app/YOUR-WORKSPACE/project/YOUR-PROJECT-ID"
```

In `dev-progress.ts`, update Linear URLs:
```typescript
linearUrl = story.linearId
  ? `https://linear.app/YOUR-WORKSPACE/issue/${story.linearId}`
  : null;
```

### Add Team Members

In `dev-progress.ts`, update `agentConfig`:
```typescript
export const agentConfig: Record<string, { label: string; color: string }> = {
  'Alice': { label: 'Alice', color: 'text-purple-600' },
  'Bob': { label: 'Bob', color: 'text-indigo-600' },
  'Charlie': { label: 'Charlie', color: 'text-orange-600' },
};
```

### Add Components

In `dev-progress.ts`, update `components`:
```typescript
export const components = [
  'Auth',
  'Dashboard',
  'API',
  'Database',
  'UI',
  'Testing',
] as const;
```

---

## Status Mapping

| Dashboard Status | Linear Status | When to Use |
|------------------|---------------|-------------|
| `done` | Done | Story completed and merged |
| `in-review` | In Review | PR submitted, awaiting review |
| `in-progress` | In Progress | Currently being worked on |
| `blocked` | (any) | Waiting on dependencies |
| `backlog` | Backlog/Todo | Not yet started |
| `not-created` | (none) | Planned but not in Linear |

---

## Keeping in Sync with Linear

### Manual Sync

1. Check Linear for status changes
2. Update `status` field in `dev-progress.ts`
3. Refresh dashboard

### Automated Sync (Future)

For real-time sync, you can:
1. Use Linear webhooks
2. Create an API route to fetch Linear data
3. Use Linear MCP server for Claude Code updates

---

## Troubleshooting

### Dashboard shows 404
- Ensure files are in correct locations
- Restart dev server: `npm run dev`

### Hydration errors
- Don't use `new Date()` in the component
- Use `suppressHydrationWarning` for dynamic content

### RTL layout issues
- Dashboard uses `dir="ltr"` in layout
- Keep main site RTL separate using route groups

---

## Project Structure

```
src/
├── app/
│   ├── cockpit/                # Dashboard (standalone, LTR)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── (site)/                 # Main site (with header/footer, RTL)
│       ├── layout.tsx
│       └── page.tsx
└── data/
    └── dashboard/
        └── dev-progress.ts     # All sprint/feature/story data
```

---

## Example: Adding a New Story

```typescript
// In dev-progress.ts

// 1. Add to stories object
'PROJ-205': {
  id: 'PROJ-205',
  linearId: 'ABC-456',
  title: 'New Feature',
  status: 'backlog',
  agent: 'Developer-1',
  points: 2,
  component: 'UI',
},

// 2. Add to feature
export const features = {
  'F2': {
    ...
    stories: [
      stories['PROJ-201'],
      stories['PROJ-205'],  // Add here
    ],
  },
};
```

---

*Created: 2025-12-22*
*For: Multi-project development tracking*
