'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  RefreshCw,
  Bot,
  Calendar,
  Target,
  Mountain,
  FileText,
  Map,
  Puzzle,
  Search,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';
import {
  dashboardConfig,
  stories as initialStories,
  features,
  sprints,
  components,
  epics,
  screens,
  screenCategories,
  getStoriesBySprint,
  getStoriesByComponent,
  statusConfig,
  type Story,
  type StoryStatus,
} from '@/data/dashboard/dev-progress';

import { type AgentData } from './components/AgentRow';
import { StoryModal } from './components/StoryModal';
import { StoryRow } from './components/StoryRow';
import { CollapsibleCard } from './components/CollapsibleCard';
import { SprintView } from './components/views/SprintView';
import { EpicsView } from './components/views/EpicsView';
import { PagesView } from './components/views/PagesView';
import { SitemapView } from './components/views/SitemapView';
import { AgentsView } from './components/views/AgentsView';

type ViewMode = 'sprints' | 'features' | 'components' | 'epics' | 'sitemap' | 'pages' | 'agents' | 'command';

// Agent data for multi-agent framework
const agents: AgentData[] = [
  {
    id: 'pm',
    name: 'PM Agent',
    model: 'Opus 4.5',
    role: 'Orchestration',
    worktree: '/Users/mymac/Desktop/airview-worktrees/agent-pm',
    branch: 'agent-pm/workspace',
    status: 'offline',
    stories: [],
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'cto',
    name: 'CTO Agent',
    model: 'Opus 4.5',
    role: 'Architecture, Security',
    worktree: '/Users/mymac/Desktop/airview-worktrees/agent-cto',
    branch: 'cto-workspace',
    status: 'active',
    stories: [],
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'frontend-a',
    name: 'Frontend-A',
    model: 'Sonnet 4',
    role: 'Layout, Design System',
    worktree: '/Users/mymac/Desktop/AirView-worktrees/frontend-a',
    branch: 'develop',
    status: 'offline',
    stories: ['UI-011', 'UI-013', 'UI-015'],
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'frontend-b',
    name: 'Frontend-B',
    model: 'Sonnet 4',
    role: 'Features, Components',
    worktree: '/Users/mymac/Desktop/AirView-worktrees/frontend-b',
    branch: 'develop',
    status: 'offline',
    stories: ['UI-012', 'UI-014'],
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'qa',
    name: 'QA Agent',
    model: 'Sonnet 4',
    role: 'Testing, Quality',
    worktree: '/Users/mymac/Desktop/AirView-worktrees/qa',
    branch: 'qa-validation',
    status: 'standby',
    stories: [],
    color: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'backend-1',
    name: 'Backend-1',
    model: 'Sonnet 4',
    role: 'Database, Auth, API',
    worktree: '/Users/mymac/Desktop/airview-worktrees/backend-1',
    branch: 'backend-1-waiting',
    status: 'standby',
    stories: [],
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'backend-2',
    name: 'Backend-2',
    model: 'Sonnet 4',
    role: 'PayPlus, S3, Email',
    worktree: '/Users/mymac/Desktop/airview-worktrees/backend-2',
    branch: 'backend-2-waiting',
    status: 'standby',
    stories: [],
    color: 'bg-pink-100 text-pink-800',
  },
];

// UI Pages data - all implemented pages with their routes
const uiPages = [
  {
    category: 'Public',
    icon: '🌐',
    pages: [
      { name: 'Homepage', route: '/', status: 'done' as const, mockup: '11-homepage.html' },
      { name: 'Pilot Directory', route: '/pilots', status: 'done' as const, mockup: '32-pilot-directory.html' },
    ],
  },
  {
    category: 'Authentication',
    icon: '🔐',
    pages: [
      { name: 'Login', route: '/login', status: 'done' as const, mockup: '01-login.html' },
      { name: 'Role Selection', route: '/register', status: 'done' as const, mockup: '02-register-role.html' },
      { name: 'Client Registration', route: '/register/client', status: 'done' as const, mockup: '03-register-client.html' },
      { name: 'Pilot Registration', route: '/register/pilot', status: 'done' as const, mockup: '04-register-pilot.html' },
      { name: 'Forgot Password', route: '/forgot-password', status: 'done' as const, mockup: '12-forgot-password.html' },
    ],
  },
  {
    category: 'Client Dashboard',
    icon: '👤',
    pages: [
      { name: 'Client Dashboard', route: '/dashboard', status: 'done' as const, mockup: '05-client-dashboard.html' },
      { name: 'Client Projects', route: '/dashboard/projects', status: 'done' as const, mockup: '07-client-projects.html' },
      { name: 'Client Settings', route: '/dashboard/settings', status: 'done' as const, mockup: '31-client-settings.html' },
    ],
  },
  {
    category: 'Project Creation',
    icon: '📝',
    pages: [
      { name: 'Step 1 - Service Type', route: '/projects/new/step-1', status: 'planned' as const, mockup: '08-create-project-step1.html' },
      { name: 'Step 2 - Location', route: '/projects/new/step-2', status: 'planned' as const, mockup: '09-create-project-step2.html' },
      { name: 'Step 3 - Details', route: '/projects/new/step-3', status: 'planned' as const, mockup: '10-create-project-step3.html' },
      { name: 'Step 4 - Media', route: '/projects/new/step-4', status: 'planned' as const, mockup: '14-create-project-step4.html' },
      { name: 'Step 5 - Review', route: '/projects/new/step-5', status: 'planned' as const, mockup: '15-create-project-step5.html' },
    ],
  },
  {
    category: 'Project Details',
    icon: '📋',
    pages: [
      { name: 'Project Detail', route: '/projects/[id]', status: 'planned' as const, mockup: '16-project-detail.html' },
      { name: 'Proposals Comparison', route: '/projects/[id]/proposals', status: 'planned' as const, mockup: '17-proposals-comparison.html' },
    ],
  },
  {
    category: 'Messaging',
    icon: '💬',
    pages: [
      { name: 'Messages List', route: '/messages', status: 'planned' as const, mockup: '18-messages.html' },
      { name: 'Conversation', route: '/messages/[id]', status: 'planned' as const, mockup: '19-conversation.html' },
    ],
  },
  {
    category: 'Pilot Dashboard',
    icon: '✈️',
    pages: [
      { name: 'Pilot Dashboard', route: '/pilot/dashboard', status: 'planned' as const, mockup: '06-pilot-dashboard.html' },
      { name: 'Opportunities', route: '/pilot/opportunities', status: 'planned' as const, mockup: '20-pilot-opportunities.html' },
      { name: 'Opportunity Detail', route: '/pilot/opportunities/[id]', status: 'planned' as const, mockup: '21-opportunity-detail.html' },
      { name: 'My Projects', route: '/pilot/projects', status: 'planned' as const, mockup: '22-pilot-projects.html' },
      { name: 'Project Management', route: '/pilot/projects/[id]', status: 'planned' as const, mockup: '23-pilot-project-manage.html' },
      { name: 'My Proposals', route: '/pilot/proposals', status: 'planned' as const, mockup: '24-pilot-proposals.html' },
    ],
  },
  {
    category: 'Pilot Finances',
    icon: '💰',
    pages: [
      { name: 'Earnings', route: '/pilot/earnings', status: 'planned' as const, mockup: '25-pilot-earnings.html' },
      { name: 'Payout Request', route: '/pilot/payout', status: 'planned' as const, mockup: '26-pilot-payout.html' },
    ],
  },
  {
    category: 'Pilot Subscription',
    icon: '⭐',
    pages: [
      { name: 'Subscription Plans', route: '/pilot/subscription', status: 'planned' as const, mockup: '27-pilot-subscription-plans.html' },
      { name: 'Manage Subscription', route: '/pilot/subscription/manage', status: 'planned' as const, mockup: '28-pilot-subscription-manage.html' },
    ],
  },
  {
    category: 'Pilot Profile',
    icon: '🎨',
    pages: [
      { name: 'Portfolio', route: '/pilot/portfolio', status: 'planned' as const, mockup: '29-pilot-portfolio.html' },
      { name: 'Settings', route: '/pilot/settings', status: 'planned' as const, mockup: '30-pilot-settings.html' },
      { name: 'Public Profile', route: '/pilots/[id]', status: 'planned' as const, mockup: '13-pilot-profile.html' },
    ],
  },
];

// Agent status type from API
interface AgentStatus {
  agent: string;
  displayName: string;
  model: string;
  active: boolean;
  story: string | null;
  gate: string | null;
  status: 'active' | 'offline' | 'standby';
  lastAction: string;
  timestamp: string;
  worktree: string;
  branch: string;
  assignment: {
    stories: string[];
    role: string;
  };
}

export default function DevDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('sprints');
  const [selectedSprintId, setSelectedSprintId] = useState<number>(3);
  const [stories, setStories] = useState<Record<string, Story>>(initialStories);
  const [syncingStories, setSyncingStories] = useState<Set<string>>(new Set());
  const [isSyncingDB, setIsSyncingDB] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Fetch agent statuses from API
  const fetchAgentStatuses = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      const res = await fetch('/api/agents/status');
      const data = await res.json();
      if (data.statuses) {
        setAgentStatuses(data.statuses);
      }
    } catch (error) {
      logger.error('Failed to fetch agent statuses', error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  // Fetch stories from Supabase on mount
  const fetchStoriesFromDB = useCallback(async () => {
    setIsSyncingDB(true);
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.stories) {
        setStories(prev => ({ ...prev, ...data.stories }));
        setDbConnected(true);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      logger.error('Failed to fetch stories from DB', error);
      setDbConnected(false);
    } finally {
      setIsSyncingDB(false);
    }
  }, []);

  // Initial fetch of stories from Supabase
  useEffect(() => {
    fetchStoriesFromDB();
  }, [fetchStoriesFromDB]);

  // Auto-refresh agent status every 10 seconds when on agents tab
  useEffect(() => {
    if (viewMode === 'agents') {
      fetchAgentStatuses();
      const interval = setInterval(fetchAgentStatuses, 10000);
      return () => clearInterval(interval);
    }
  }, [viewMode, fetchAgentStatuses]);

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
  const getStoriesWithStatus = useCallback((storyList: Story[]) => {
    return storyList.map(s => stories[s.id] || s);
  }, [stories]);

  // Get sprint stories with current status
  const getSprintStoriesWithStatus = useCallback((sprintId: number) => {
    return getStoriesWithStatus(getStoriesBySprint(sprintId));
  }, [getStoriesWithStatus]);

  // Filter stories based on search query
  const filteredStories = searchQuery
    ? Object.values(stories).filter(story =>
        story.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.agent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.component?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  dbConnected === null ? 'bg-gray-400 animate-pulse' :
                  dbConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-600">
                  {dbConnected === null ? 'Connecting...' :
                   dbConnected ? (
                     lastSyncTime ? `Synced ${lastSyncTime.toLocaleTimeString()}` : 'DB Connected'
                   ) : 'DB Offline'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStoriesFromDB}
                disabled={isSyncingDB}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingDB ? 'animate-spin' : ''}`} />
                {isSyncingDB ? 'Syncing...' : 'Sync'}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories, agents, epics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mt-5">
            <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="sprints" className="gap-2">
                <Calendar className="h-4 w-4" />
                Sprints
              </TabsTrigger>
              <TabsTrigger value="features" className="gap-2">
                <Target className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="epics" className="gap-2">
                <Mountain className="h-4 w-4" />
                Epics
              </TabsTrigger>
              <TabsTrigger value="pages" className="gap-2">
                <FileText className="h-4 w-4" />
                Pages
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="gap-2">
                <Map className="h-4 w-4" />
                Sitemap
              </TabsTrigger>
              <TabsTrigger value="components" className="gap-2">
                <Puzzle className="h-4 w-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2">
                <Bot className="h-4 w-4" />
                Agents
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Results
                  <Badge variant="secondary">{filteredStories.length} found</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStories.length > 0 ? (
                  <div className="space-y-1">
                    {filteredStories.slice(0, 10).map(story => (
                      <StoryRow
                        key={story.id}
                        story={story}
                        onSync={syncStory}
                        isSyncing={syncingStories.has(story.id)}
                        onOpenDetails={openStoryDetails}
                      />
                    ))}
                    {filteredStories.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        +{filteredStories.length - 10} more results. Refine your search.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No stories found matching &quot;{searchQuery}&quot;
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-3">
          {/* Sprint View */}
          {viewMode === 'sprints' && (
            <SprintView
              sprints={sprints}
              selectedSprintId={selectedSprintId}
              onSelectSprint={setSelectedSprintId}
              getSprintStories={getSprintStoriesWithStatus}
              getProgress={getProgress}
              stories={stories}
              onOpenDetails={openStoryDetails}
            />
          )}

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

          {/* Epics View */}
          {viewMode === 'epics' && (
            <EpicsView epics={epics} features={features} stories={stories} />
          )}

          {/* Pages View */}
          {viewMode === 'pages' && (
            <PagesView uiPages={uiPages} />
          )}

          {/* Sitemap View */}
          {viewMode === 'sitemap' && (
            <SitemapView
              screens={screens}
              screenCategories={screenCategories}
              stories={stories}
              onOpenDetails={openStoryDetails}
            />
          )}

          {/* Agents View */}
          {viewMode === 'agents' && (
            <AgentsView
              agents={agents}
              agentStatuses={agentStatuses}
              isLoadingAgents={isLoadingAgents}
              onRefresh={fetchAgentStatuses}
            />
          )}
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
