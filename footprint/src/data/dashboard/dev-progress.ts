/**
 * Dev Progress Dashboard Data - UPDATE FOR YOUR PROJECT
 *
 * 1. Change dashboardConfig values below
 * 2. Your stories will be loaded from Supabase automatically
 */

export const dashboardConfig = {
  name: 'YOUR_PROJECT_NAME',           // e.g., 'Uzerflow', 'Footprint'
  title: 'YOUR_PROJECT Dev Dashboard',
  subtitle: 'Your project description',
  linearWorkspace: 'boomerang-apps',
  linearProjectId: 'YOUR_LINEAR_PROJECT_UUID',
  linearProjectUrl: 'https://linear.app/boomerang-apps/project/YOUR_PROJECT_SLUG',
  totalStories: 0,
  totalPoints: 0,
};

export type StoryStatus = 'done' | 'in-review' | 'in-progress' | 'blocked' | 'backlog' | 'not-created';
export type Priority = 'M' | 'S' | 'C' | 'W';

export interface Story {
  id: string;
  linearId?: string;
  linearUuid?: string;
  title: string;
  description?: string;
  status: StoryStatus;
  agent?: string;
  points?: number;
  priority?: Priority;
  sprint?: number;
  blockedBy?: string[];
  component?: string;
  mockup?: string;
  screenRef?: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string;
  gate0Ref?: string;
  databaseTables?: string[];
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
  startDate?: string;
  endDate?: string;
  epics: string[];
}

export interface Epic {
  id: string;
  name: string;
  description: string;
  status: 'done' | 'in-progress' | 'planned';
  priority: Priority;
  targetSprints: string;
  storyCount: number;
  totalPoints: number;
  stories: string[];
  features: string[];
}

export interface Screen {
  id: string;
  name: string;
  route: string;
  description: string;
  status: 'done' | 'in-progress' | 'planned';
  category: 'public' | 'auth' | 'client' | 'pilot' | 'admin';
  stories: string[];
  mockup?: string;
}

// Empty defaults - will be populated from Supabase
export const stories: Record<string, Story> = {};
export const features: Record<string, Feature> = {};
export const sprints: Sprint[] = [];
export const epics: Record<string, Epic> = {};
export const screens: Record<string, Screen> = {};
export const components: string[] = [];
export const screenCategories: string[] = [];

// Helper functions
export function getStoriesByComponent(component: string): Story[] {
  return Object.values(stories).filter(s => s.component === component);
}

export function getStoriesBySprint(sprintId: number): Story[] {
  return Object.values(stories).filter(s => s.sprint === sprintId);
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
  'Frontend-A': { label: 'Frontend-A', color: 'text-purple-600' },
  'Frontend-B': { label: 'Frontend-B', color: 'text-indigo-600' },
  'Backend-1': { label: 'Backend-1', color: 'text-orange-600' },
  'Backend-2': { label: 'Backend-2', color: 'text-pink-600' },
  'QA': { label: 'QA', color: 'text-teal-600' },
};
