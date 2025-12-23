'use client';

import { useState, useCallback } from 'react';
import {
  dashboardConfig,
  stories as initialStories,
  features,
  sprints,
  components,
  getStoriesBySprint,
  getStoriesByComponent,
  statusConfig,
  agentConfig,
  type Story,
  type StoryStatus,
} from '@/data/dashboard/dev-progress';

type ViewMode = 'sprints' | 'features' | 'components';

// Generate agent kickstart prompt
function generateAgentPrompt(story: Story): string {
  const linearUrl = story.linearId
    ? `https://linear.app/${dashboardConfig.linearWorkspace}/issue/${story.linearId}`
    : 'N/A';

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE - ${dashboardConfig.name.toUpperCase()}
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM
║  ✅ Gates: 0→1→2→3→4→5
║  📋 Story: ${story.id} | Agent: ${story.agent || 'Unassigned'}
╚══════════════════════════════════════════════════════════════════════════════╝

## Agent Identity Declaration

**Model**: Claude (Sonnet 4 / Opus 4.5)
**Role**: ${story.agent || 'Developer'}
**Story**: ${story.id}
**Linear**: ${linearUrl}

---

## 📋 Story Details

**ID**: ${story.id}
**Title**: ${story.title}
**Description**: ${story.description || 'See Linear for full details'}
**Status**: ${story.status}
**Points**: ${story.points || 'Not estimated'}
**Component**: ${story.component || 'General'}
${story.blockedBy?.length ? `**Blocked By**: ${story.blockedBy.join(', ')}` : ''}

---

## ✅ Agent Checklist

Before starting work, confirm:

1. [ ] **Read CLAUDE.md** - Understand project context and coding conventions
2. [ ] **Verify Worktree** - Working in isolated worktree for this story
3. [ ] **Read Full Story** - Open Linear link and read all acceptance criteria
4. [ ] **Check Dependencies** - Ensure blockers are resolved

---

## 🚀 Workflow Steps

### Gate 1 - Planning
\`\`\`bash
# Create feature branch
git checkout -b feature/${story.id.toLowerCase()}-[description]

# Create gate files
mkdir -p .claudecode/milestones/sprint-X/${story.id}/
touch .claudecode/milestones/sprint-X/${story.id}/START.md
touch .claudecode/milestones/sprint-X/${story.id}/ROLLBACK-PLAN.md

# Tag start point
git tag ${story.id}-start
\`\`\`

### Gate 2 - TDD Implementation
1. Write tests FIRST (target 80%+ coverage)
2. Implement to pass tests
3. Refactor if needed
4. Run: \`npm test && npx tsc --noEmit\`

### Gate 3 - Ready for QA
1. All tests passing
2. TypeScript clean (0 errors)
3. Lint clean
4. Update PM inbox: \`.claudecode/handoffs/pm-inbox.md\`

---

## 📝 PM Notification Template

When ready for QA, write to \`pm-inbox.md\`:

\`\`\`markdown
## ${story.id} Ready for QA

**From**: ${story.agent || 'Developer'}
**Date**: [DATE]
**Status**: Gate 2 Complete - Ready for QA

### Summary
- [What was implemented]
- [Key decisions made]

### Test Results
- Tests: XX passing
- Coverage: XX%
- TypeScript: 0 errors

### Files Changed
- [List main files]

Ready for Gate 3 QA validation.
\`\`\`

---

## ⚠️ Safety Reminders

- **NEVER** merge without QA approval
- **NEVER** skip gates
- **ALWAYS** work in isolated worktree
- **ALWAYS** write tests first (TDD)
- **ALWAYS** update PM on progress

---

**Start by displaying this banner, then proceed with Gate 1.**
`.trim();
}

// Story Details Modal Component
function StoryModal({
  story,
  isOpen,
  onClose,
}: {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  const prompt = generateAgentPrompt(story);
  const linearUrl = story.linearId
    ? `https://linear.app/${dashboardConfig.linearWorkspace}/issue/${story.linearId}`
    : null;

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-indigo-600">{story.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[story.status].bgColor} ${statusConfig[story.status].color}`}>
                {statusConfig[story.status].label}
              </span>
              {story.agent && (
                <span className={`text-sm ${agentConfig[story.agent]?.color || 'text-gray-500'}`}>
                  {story.agent}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-1">{story.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Points</div>
              <div className="text-lg font-bold text-gray-900">{story.points || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Component</div>
              <div className="text-lg font-bold text-gray-900">{story.component || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Linear</div>
              {linearUrl ? (
                <a href={linearUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline">
                  {story.linearId}
                </a>
              ) : (
                <div className="text-lg font-bold text-gray-400">-</div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Blocked By</div>
              <div className="text-lg font-bold text-gray-900">
                {story.blockedBy?.length ? story.blockedBy.join(', ') : 'None'}
              </div>
            </div>
          </div>

          {/* Agent Instructions */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="font-semibold text-gray-900">Agent Kickstart Prompt</span>
              </div>
              <button
                onClick={copyPrompt}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-sm text-gray-800 bg-gray-50 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
              {prompt}
            </pre>
          </div>

          {/* Instructions Summary */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">📌 Agent Instructions Summary</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-900">
              <li>Validate Safety Protocol compliance (CLAUDE.md)</li>
              <li>Follow Workflow 2.0 (CTO → PM → Agent → QA → PM)</li>
              <li>Work in isolated worktree</li>
              <li>Read full story details from Linear</li>
              <li>Perform Gate 0 research (if needed) and TDD</li>
              <li>Update PM via inbox on progress</li>
              <li>Start with Safety Banner to confirm role</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Copy the prompt above and paste it to start the agent
          </div>
          <div className="flex items-center gap-3">
            {linearUrl && (
              <a
                href={linearUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Open in Linear
              </a>
            )}
            <button
              onClick={copyPrompt}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy & Start Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sync icon component
function SyncIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  const color = percentage === 100
    ? 'bg-green-500'
    : percentage >= 50
    ? 'bg-blue-500'
    : percentage > 0
    ? 'bg-amber-500'
    : 'bg-gray-200';

  return (
    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: StoryStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}

function StoryRow({
  story,
  onSync,
  isSyncing,
  onOpenDetails,
}: {
  story: Story;
  onSync: (storyId: string) => void;
  isSyncing: boolean;
  onOpenDetails: (story: Story) => void;
}) {
  const isDone = story.status === 'done';
  const linearUrl = story.linearId
    ? `https://linear.app/${dashboardConfig.linearWorkspace}/issue/${story.linearId}`
    : null;

  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 ${isDone ? 'bg-green-50/50' : ''}`}>
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Story ID */}
      <span className={`font-mono text-sm w-16 flex-shrink-0 ${isDone ? 'text-green-600' : 'text-gray-500'}`}>
        {story.id}
      </span>

      {/* Title */}
      <span className={`flex-1 text-sm ${isDone ? 'text-green-700 line-through' : 'text-gray-900'}`}>
        {story.title}
      </span>

      {/* Status */}
      <StatusBadge status={story.status} />

      {/* Agent */}
      {story.agent && (
        <span className={`text-xs w-20 text-right ${agentConfig[story.agent]?.color || 'text-gray-500'}`}>
          {story.agent}
        </span>
      )}

      {/* Points */}
      {story.points && (
        <span className="text-xs text-gray-400 w-8 text-right">{story.points}pt</span>
      )}

      {/* Linear Link */}
      {linearUrl ? (
        <a
          href={linearUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700 w-16 text-right"
        >
          {story.linearId}
        </a>
      ) : (
        <span className="w-16" />
      )}

      {/* Sync Button */}
      {story.linearId && (
        <button
          onClick={() => onSync(story.id)}
          disabled={isSyncing}
          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
          title="Sync with Linear"
        >
          <SyncIcon spinning={isSyncing} />
        </button>
      )}

      {/* Details Button */}
      <button
        onClick={() => onOpenDetails(story)}
        className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
        title="View Details & Agent Prompt"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}

function CollapsibleCard({
  title,
  subtitle,
  icon,
  progress,
  stories: cardStories,
  defaultOpen = false,
  badge,
  onSyncStory,
  syncingStories,
  onOpenDetails,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  progress: { done: number; total: number; percentage: number };
  stories: Story[];
  defaultOpen?: boolean;
  badge?: { text: string; color: string };
  onSyncStory: (storyId: string) => void;
  syncingStories: Set<string>;
  onOpenDetails: (story: Story) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Expand Icon */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        {/* Icon */}
        <span className="text-2xl">{icon}</span>

        {/* Title & Subtitle */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {badge && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <ProgressBar percentage={progress.percentage} />
          <span className="text-sm font-medium text-gray-600 w-20 text-right">
            {progress.done}/{progress.total} done
          </span>
          <span className={`text-lg font-bold w-12 text-right ${progress.percentage === 100 ? 'text-green-600' : 'text-gray-900'}`}>
            {progress.percentage}%
          </span>
        </div>
      </button>

      {/* Stories List - Collapsible */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50/50">
          {cardStories.length > 0 ? (
            cardStories.map(story => (
              <StoryRow
                key={story.id}
                story={story}
                onSync={onSyncStory}
                isSyncing={syncingStories.has(story.id)}
                onOpenDetails={onOpenDetails}
              />
            ))
          ) : (
            <div className="px-5 py-4 text-sm text-gray-500 italic">No stories yet</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DevDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('sprints');
  const [stories, setStories] = useState<Record<string, Story>>(initialStories);
  const [syncingStories, setSyncingStories] = useState<Set<string>>(new Set());
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openStoryDetails = (story: Story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
  };

  // Calculate progress with current stories state
  const getProgress = useCallback((storyList: Story[]) => {
    const done = storyList.filter(s => stories[s.id]?.status === 'done').length;
    const total = storyList.length;
    return { done, total, percentage: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [stories]);

  const overall = useCallback(() => {
    const allStories = Object.values(stories);
    const done = allStories.filter(s => s.status === 'done').length;
    const total = allStories.length;
    return { done, total, percentage: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [stories])();

  // Sync single story with Linear
  const syncStory = async (storyId: string) => {
    const story = stories[storyId];
    if (!story?.linearId) return;

    setSyncingStories(prev => new Set(prev).add(storyId));
    setSyncError(null);

    try {
      const response = await fetch(`/api/linear/sync?issueId=${story.linearId}`);
      const data = await response.json();

      if (response.ok && data.status) {
        setStories(prev => ({
          ...prev,
          [storyId]: {
            ...prev[storyId],
            status: data.status as StoryStatus,
          },
        }));
      } else {
        setSyncError(data.error || 'Failed to sync');
      }
    } catch {
      setSyncError('Network error');
    } finally {
      setSyncingStories(prev => {
        const next = new Set(prev);
        next.delete(storyId);
        return next;
      });
    }
  };

  // Sync all stories with Linear
  const syncAll = async () => {
    setIsGlobalSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch(`/api/linear/sync?projectId=${dashboardConfig.linearProjectId}`);
      const data = await response.json();

      if (response.ok && data.issues) {
        const updates: Record<string, Story> = { ...stories };

        data.issues.forEach((issue: { id: string; status: string }) => {
          // Find story by linearId
          const storyEntry = Object.entries(stories).find(
            ([, s]) => s.linearId === issue.id
          );
          if (storyEntry) {
            const [storyId, story] = storyEntry;
            updates[storyId] = {
              ...story,
              status: issue.status as StoryStatus,
            };
          }
        });

        setStories(updates);
        setLastSyncTime(new Date());
      } else {
        setSyncError(data.error || 'Failed to sync');
      }
    } catch {
      setSyncError('Network error - check LINEAR_API_KEY in .env');
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  const sprintStatusBadge = (status: string) => {
    if (status === 'active') return { text: 'Active', color: 'bg-blue-100 text-blue-700' };
    if (status === 'completed') return { text: 'Done', color: 'bg-green-100 text-green-700' };
    return { text: 'Planned', color: 'bg-gray-100 text-gray-600' };
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      'P0': 'bg-red-100 text-red-700',
      'P1': 'bg-orange-100 text-orange-700',
      'P2': 'bg-yellow-100 text-yellow-700',
      'P3': 'bg-gray-100 text-gray-600',
    };
    return { text: priority, color: colors[priority] || colors['P3'] };
  };

  // Get stories with current status from state
  const getStoriesWithStatus = (storyList: Story[]) => {
    return storyList.map(s => stories[s.id] || s);
  };

  return (
    <div className="text-left">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dashboardConfig.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{dashboardConfig.name} - {dashboardConfig.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sync All Button */}
              <button
                onClick={syncAll}
                disabled={isGlobalSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <SyncIcon spinning={isGlobalSyncing} />
                {isGlobalSyncing ? 'Syncing...' : 'Sync All'}
              </button>

              {/* Linear Link */}
              <a
                href={dashboardConfig.linearProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 19.5h20L12 2zm0 4l6.5 11.5h-13L12 6z" />
                </svg>
                Open Linear
              </a>
            </div>
          </div>

          {/* Sync Status */}
          {(lastSyncTime || syncError) && (
            <div className="mt-2 text-xs">
              {syncError ? (
                <span className="text-red-500">{syncError}</span>
              ) : (
                <span className="text-gray-400">
                  Last synced: {lastSyncTime?.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}

          {/* Overall Progress Bar */}
          <div className="mt-5 flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-500">{overall.done} of {overall.total} stories completed</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${overall.percentage}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-indigo-600">{overall.percentage}%</span>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            {(['sprints', 'features', 'components'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {mode === 'sprints' && '📅 Sprints'}
                {mode === 'features' && '🎯 Features'}
                {mode === 'components' && '🧩 Components'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="space-y-3">
          {/* Sprint View */}
          {viewMode === 'sprints' && sprints.map(sprint => {
            const sprintStories = getStoriesWithStatus(getStoriesBySprint(sprint.id));
            const progress = getProgress(sprintStories);
            return (
              <CollapsibleCard
                key={sprint.id}
                title={sprint.name}
                subtitle={sprint.focus}
                icon={sprint.status === 'completed' ? '✅' : sprint.status === 'active' ? '🔄' : '📋'}
                progress={progress}
                stories={sprintStories}
                defaultOpen={sprint.status === 'active'}
                badge={sprintStatusBadge(sprint.status)}
                onSyncStory={syncStory}
                syncingStories={syncingStories}
                onOpenDetails={openStoryDetails}
              />
            );
          })}

          {/* Feature View */}
          {viewMode === 'features' && Object.values(features).map(feature => {
            const featureStories = getStoriesWithStatus(feature.stories);
            const progress = getProgress(featureStories);
            return (
              <CollapsibleCard
                key={feature.id}
                title={`${feature.id}: ${feature.name}`}
                subtitle={feature.description}
                icon="🎯"
                progress={progress}
                stories={featureStories}
                defaultOpen={progress.percentage > 0 && progress.percentage < 100}
                badge={priorityBadge(feature.priority)}
                onSyncStory={syncStory}
                syncingStories={syncingStories}
                onOpenDetails={openStoryDetails}
              />
            );
          })}

          {/* Component View */}
          {viewMode === 'components' && components.map(component => {
            const componentStories = getStoriesWithStatus(getStoriesByComponent(component));
            if (componentStories.length === 0) return null;
            const progress = getProgress(componentStories);
            return (
              <CollapsibleCard
                key={component}
                title={component}
                icon="🧩"
                progress={progress}
                stories={componentStories}
                defaultOpen={false}
                onSyncStory={syncStory}
                syncingStories={syncingStories}
                onOpenDetails={openStoryDetails}
              />
            );
          })}
        </div>

        {/* Status Summary */}
        <div className="mt-8 grid grid-cols-6 gap-3">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = Object.values(stories).filter(s => s.status === status).length;
            return (
              <div key={status} className={`p-3 rounded-lg ${config.bgColor} text-center`}>
                <div className={`text-xl font-bold ${config.color}`}>{count}</div>
                <div className={`text-xs ${config.color}`}>{config.label}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Click sync icon on any story or use &quot;Sync All&quot; to fetch latest from Linear
        </div>
      </main>

      {/* Story Details Modal */}
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
