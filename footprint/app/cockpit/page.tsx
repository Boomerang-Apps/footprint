'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Play,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Loader2,
  Bot,
  Calendar,
  Target,
  Mountain,
  FileText,
  Map,
  Puzzle,
  Users,
  Search,
  X,
  Activity,
  Clock,
  Zap,
  CircleDot,
  AlertCircle,
  CheckCircle2,
  Timer,
  GitBranch,
  Check,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/separator';
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

import { AgentRow, type AgentData } from './components/AgentRow';
import { StoryModal } from './components/StoryModal';
import { StoryRow } from './components/StoryRow';
import { CollapsibleCard } from './components/CollapsibleCard';

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
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
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
              {/* DB Connection Indicator with Last Sync */}
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

              {/* Sync from DB Button */}
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
            <div className="space-y-4">
              <div className="space-y-3">
                {sprints.map(sprint => {
                  const sprintStories = getStoriesWithStatus(getStoriesBySprint(sprint.id));
                  const progress = getProgress(sprintStories);
                  const isExpanded = selectedSprintId === sprint.id;

                  return (
                    <Collapsible
                      key={sprint.id}
                      open={isExpanded}
                      onOpenChange={() => setSelectedSprintId(isExpanded ? 0 : sprint.id)}
                    >
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="w-full">
                          <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              sprint.status === 'completed' ? 'bg-green-100' :
                              sprint.status === 'active' ? 'bg-blue-100' :
                              'bg-amber-50'
                            }`}>
                              {sprint.status === 'completed' ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : sprint.status === 'active' ? (
                                <Calendar className="h-5 w-5 text-blue-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-amber-600" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{sprint.name}</span>
                                <Badge variant={sprint.status === 'completed' || sprint.status === 'active' ? 'default' : 'secondary'} className={`text-xs ${
                                  sprint.status === 'completed' ? 'bg-green-500' :
                                  sprint.status === 'active' ? 'bg-blue-500' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                  {sprint.status === 'completed' ? 'Done' : sprint.status === 'active' ? 'Active' : 'Planned'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{sprint.focus}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-32">
                                <Progress value={progress.percentage} className="h-2" />
                              </div>
                              <span className="text-sm text-gray-500 w-16 text-right">{progress.done}/{progress.total} done</span>
                              <span className="text-lg font-bold w-12 text-right">{progress.percentage}%</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t divide-y">
                            {sprintStories.map((story, idx) => {
                              const stepMap: Record<string, number> = {
                                'not-created': -1, 'backlog': 0, 'blocked': 0,
                                'in-progress': 1, 'in-review': 2, 'done': 4,
                              };
                              const currentStep = stepMap[story.status] ?? 0;

                              return (
                                <div
                                  key={story.id}
                                  className={`px-4 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer ${
                                    story.status === 'in-progress' ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => openStoryDetails(story)}
                                >
                                  <span className="text-gray-400 text-sm w-6 pl-10">{idx + 1}</span>
                                  <Badge variant="outline" className="text-xs">{story.id}</Badge>
                                  <span className="flex-1 text-sm">{story.title}</span>
                                  <span className="text-sm font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {story.agent || '-'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    story.status === 'done' ? 'bg-green-100 text-green-700' :
                                    story.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                    story.status === 'in-review' ? 'bg-purple-100 text-purple-700' :
                                    story.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {story.status === 'done' ? 'Done' :
                                     story.status === 'in-progress' ? 'In Progress' :
                                     story.status === 'in-review' ? 'In Review' :
                                     story.status === 'blocked' ? 'Blocked' :
                                     story.status === 'backlog' ? 'Backlog' : 'Not Created'}
                                  </span>
                                  <div className="flex items-center gap-1 text-[9px] font-semibold">
                                    {(['B', 'C', 'R', 'Q', 'D'] as const).map((letter, step) => (
                                      <span
                                        key={letter}
                                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                          story.status === 'blocked' && step === 0 ? 'bg-red-500 text-white' :
                                          step < currentStep ? 'bg-green-500 text-white' :
                                          step === currentStep ? (currentStep === 4 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white') :
                                          'bg-gray-200 text-gray-400'
                                        }`}
                                      >
                                        {letter}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>

              {/* Bottom Stats Bar */}
              <div className="grid grid-cols-6 gap-3">
                {(() => {
                  const allStories = getStoriesWithStatus(Object.values(stories));
                  const done = allStories.filter(s => s.status === 'done').length;
                  const inReview = allStories.filter(s => s.status === 'in-review').length;
                  const inProgress = allStories.filter(s => s.status === 'in-progress').length;
                  const blocked = allStories.filter(s => s.status === 'blocked').length;
                  const backlog = allStories.filter(s => s.status === 'backlog').length;
                  const notCreated = allStories.filter(s => s.status === 'not-created').length;

                  return (
                    <>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{done}</p>
                        <p className="text-xs text-gray-500">Done</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">{inReview}</p>
                        <p className="text-xs text-gray-500">In Review</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">{inProgress}</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{blocked}</p>
                        <p className="text-xs text-gray-500">Blocked</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-600">{backlog}</p>
                        <p className="text-xs text-gray-500">Backlog</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-400">{notCreated}</p>
                        <p className="text-xs text-gray-400">Not Created</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <p className="text-center text-sm text-gray-400">
                Click sync icon on any story or use &quot;Sync All&quot; to fetch latest from Linear
              </p>
            </div>
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
            <div className="space-y-4">
              {epics.map(epic => {
                const epicFeatures = epic.features.map(fId => features[fId]).filter(Boolean);
                const epicStories = epicFeatures.flatMap(f => f.stories);
                const done = epicStories.filter(s => stories[s.id]?.status === 'done').length;
                const total = epicStories.length;
                const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <div key={epic.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🏔️</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-purple-600">{epic.id}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                epic.status === 'done' ? 'bg-green-100 text-green-700' :
                                epic.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {epic.status === 'in-progress' ? 'In Progress' : epic.status === 'done' ? 'Done' : 'Planned'}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mt-1">{epic.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{epic.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
                          <div className="text-xs text-gray-500">{done}/{total} stories</div>
                          <div className="text-xs text-gray-400 mt-1">{epic.totalPoints || 0} pts</div>
                        </div>
                      </div>
                      <div className="mt-4 w-full h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {epicFeatures.map(f => (
                          <span key={f.id} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">
                            {f.id}: {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pages View */}
          {viewMode === 'pages' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h3 className="font-semibold text-emerald-900">UI Pages</h3>
                      <p className="text-sm text-emerald-700">
                        {uiPages.reduce((acc, cat) => acc + cat.pages.filter(p => p.status === 'done').length, 0)} of {uiPages.reduce((acc, cat) => acc + cat.pages.length, 0)} pages implemented
                      </p>
                    </div>
                  </div>
                  <a href="/design_mockups/index.html" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                    View All Mockups
                  </a>
                </div>
              </div>

              {uiPages.map(category => {
                const doneCount = category.pages.filter(p => p.status === 'done').length;
                return (
                  <div key={category.category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{category.icon}</span>
                          <h3 className="font-semibold text-gray-900">{category.category}</h3>
                        </div>
                        <span className={`text-sm font-medium ${doneCount === category.pages.length ? 'text-green-600' : 'text-gray-500'}`}>
                          {doneCount}/{category.pages.length} done
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {category.pages.map(page => {
                        const isDone = page.status === 'done';
                        const isClickable = isDone && !page.route.includes('[');
                        return (
                          <div key={page.route} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDone ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium ${isDone ? 'text-gray-900' : 'text-gray-500'}`}>{page.name}</span>
                                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{page.route}</code>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {page.mockup && (
                                  <a href={`/design_mockups/${page.mockup}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors">
                                    Mockup
                                  </a>
                                )}
                                {isClickable ? (
                                  <a href={page.route} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium">
                                    Open Page
                                  </a>
                                ) : (
                                  <span className={`text-xs px-2 py-1 rounded ${isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {isDone ? 'Done' : 'Planned'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sitemap View */}
          {viewMode === 'sitemap' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-amber-900">Design Mockups</h3>
                      <p className="text-sm text-amber-700">19 HTML mockups - source of truth for implementation</p>
                    </div>
                  </div>
                  <a href="/design_mockups/index.html" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                    View All Mockups
                  </a>
                </div>
              </div>

              {Object.entries(screenCategories).map(([category, config]) => {
                const categoryScreens = screens.filter(s => s.category === category);
                if (categoryScreens.length === 0) return null;
                const done = categoryScreens.filter(s => s.status === 'done').length;
                const hasMockup = categoryScreens.filter(s => s.mockup).length;

                return (
                  <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className={`px-5 py-3 ${config.bgColor} border-b border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                          {hasMockup > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                              {hasMockup} mockups
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{done}/{categoryScreens.length} done</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {categoryScreens.map(screen => (
                        <div key={screen.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  screen.status === 'done' ? 'bg-green-500' :
                                  screen.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                                }`} />
                                <span className="font-medium text-gray-900">{screen.name}</span>
                                <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{screen.path}</code>
                                {screen.mockup && (
                                  <a href={`/design_mockups/${screen.mockup}`} target="_blank" rel="noopener noreferrer" className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors flex items-center gap-1">
                                    🎨 Mockup
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{screen.description}</p>
                              {screen.stories && screen.stories.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {screen.stories.map(storyId => (
                                    <span
                                      key={storyId}
                                      className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded cursor-pointer hover:bg-indigo-100"
                                      onClick={() => {
                                        const story = stories[storyId];
                                        if (story) openStoryDetails(story);
                                      }}
                                    >
                                      {storyId}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                              screen.status === 'done' ? 'bg-green-100 text-green-700' :
                              screen.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {screen.status === 'in-progress' ? 'In Progress' : screen.status === 'done' ? 'Done' : 'Planned'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Agents View */}
          {viewMode === 'agents' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg"><Activity className="h-5 w-5 text-white" /></div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{agentStatuses.filter(a => a.status === 'active').length}</p>
                      <p className="text-xs text-green-600">Running</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{agentStatuses.filter(a => a.status === 'standby').length}</p>
                      <p className="text-xs text-blue-600">Standby</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-gray-400 rounded-lg"><Zap className="h-5 w-5 text-white" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-700">{agentStatuses.filter(a => a.status === 'offline').length}</p>
                      <p className="text-xs text-gray-600">Offline</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg"><Bot className="h-5 w-5 text-white" /></div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{agentStatuses.length || 7}</p>
                      <p className="text-xs text-purple-600">Total Agents</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bot className="h-6 w-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">Multi-Agent Framework</h3>
                        <p className="text-sm text-muted-foreground">Workflow 2.0: CTO → PM → Agent → QA → PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={fetchAgentStatuses} disabled={isLoadingAgents}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAgents ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button asChild variant="secondary" size="sm">
                        <a href="/.claudecode/CTO-CRASH-RECOVERY.md" target="_blank" rel="noopener noreferrer">
                          Recovery Docs
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {agents.map(agent => {
                  const liveStatus = agentStatuses.find(a => a.agent === agent.id);
                  const updatedAgent = liveStatus ? {
                    ...agent,
                    status: liveStatus.status,
                    stories: liveStatus.assignment?.stories || agent.stories,
                  } : agent;
                  return <AgentRow key={agent.id} agent={updatedAgent} />;
                })}
              </div>
            </div>
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
