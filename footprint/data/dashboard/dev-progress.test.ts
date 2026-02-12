import { describe, it, expect } from 'vitest';
import {
  stories,
  features,
  sprints,
  dashboardConfig,
  statusConfig,
  agentConfig,
  components,
  pages,
  pageGroups,
  uiPages,
  agents,
  epics,
  screens,
  screenCategories,
  getStoriesByComponent,
  getStoriesBySprint,
  getSprintProgress,
  getFeatureProgress,
  getOverallProgress,
} from './dev-progress';

describe('Dev Progress Data', () => {
  describe('dashboardConfig', () => {
    it('has required config fields', () => {
      expect(dashboardConfig.name).toBe('Footprint');
      expect(dashboardConfig.linearWorkspace).toBe('boomerang-apps');
      expect(dashboardConfig.title).toBeDefined();
      expect(dashboardConfig.subtitle).toBeDefined();
    });
  });

  describe('stories', () => {
    it('contains stories with required fields', () => {
      const allStories = Object.values(stories);
      expect(allStories.length).toBeGreaterThan(0);

      for (const story of allStories) {
        expect(story.id).toBeDefined();
        expect(story.title).toBeDefined();
        expect(story.status).toBeDefined();
        expect(['done', 'in-review', 'in-progress', 'blocked', 'backlog', 'not-created']).toContain(story.status);
      }
    });

    it('has valid blockedBy references', () => {
      const storyIds = new Set(Object.keys(stories));
      for (const story of Object.values(stories)) {
        if (story.blockedBy) {
          for (const blockerId of story.blockedBy) {
            expect(storyIds.has(blockerId)).toBe(true);
          }
        }
      }
    });
  });

  describe('features', () => {
    it('contains features with stories', () => {
      const allFeatures = Object.values(features);
      expect(allFeatures.length).toBeGreaterThan(0);

      for (const feature of allFeatures) {
        expect(feature.id).toBeDefined();
        expect(feature.name).toBeDefined();
        expect(feature.stories).toBeDefined();
        expect(['P0', 'P1', 'P2', 'P3']).toContain(feature.priority);
      }
    });
  });

  describe('sprints', () => {
    it('contains sprints with valid status', () => {
      expect(sprints.length).toBeGreaterThan(0);
      for (const sprint of sprints) {
        expect(['completed', 'active', 'planned']).toContain(sprint.status);
        expect(sprint.features.length).toBeGreaterThan(0);
      }
    });

    it('references valid feature IDs', () => {
      const featureIds = new Set(Object.keys(features));
      for (const sprint of sprints) {
        for (const fId of sprint.features) {
          expect(featureIds.has(fId)).toBe(true);
        }
      }
    });
  });

  describe('statusConfig', () => {
    it('has config for all statuses', () => {
      const statuses: Array<keyof typeof statusConfig> = ['done', 'in-review', 'in-progress', 'blocked', 'backlog', 'not-created'];
      for (const status of statuses) {
        expect(statusConfig[status]).toBeDefined();
        expect(statusConfig[status].label).toBeDefined();
        expect(statusConfig[status].color).toBeDefined();
        expect(statusConfig[status].bgColor).toBeDefined();
      }
    });
  });

  describe('agentConfig', () => {
    it('has config for known agents', () => {
      expect(agentConfig['CTO']).toBeDefined();
      expect(agentConfig['PM']).toBeDefined();
      expect(agentConfig['Frontend-A']).toBeDefined();
      expect(agentConfig['Frontend-B']).toBeDefined();
      expect(agentConfig['Backend-1']).toBeDefined();
      expect(agentConfig['Backend-2']).toBeDefined();
    });
  });

  describe('components', () => {
    it('is a readonly array of component names', () => {
      expect(components.length).toBeGreaterThan(0);
      expect(components).toContain('Upload');
      expect(components).toContain('AI');
      expect(components).toContain('Payment');
    });
  });

  describe('pages', () => {
    it('contains pages with routes', () => {
      expect(pages.length).toBeGreaterThan(0);
      for (const page of pages) {
        expect(page.route).toBeDefined();
        expect(page.name).toBeDefined();
        expect(page.nameHe).toBeDefined();
      }
    });
  });

  describe('pageGroups', () => {
    it('groups pages by category', () => {
      expect(pageGroups.length).toBeGreaterThan(0);
      for (const group of pageGroups) {
        expect(group.pageIds.length).toBeGreaterThan(0);
      }
    });
  });

  describe('uiPages', () => {
    it('has categories with pages', () => {
      expect(uiPages.length).toBeGreaterThan(0);
      for (const category of uiPages) {
        expect(category.category).toBeDefined();
        expect(category.pages.length).toBeGreaterThan(0);
      }
    });
  });

  describe('agents', () => {
    it('has agents with required fields', () => {
      expect(agents.length).toBeGreaterThan(0);
      for (const agent of agents) {
        expect(agent.id).toBeDefined();
        expect(agent.name).toBeDefined();
        expect(agent.model).toBeDefined();
        expect(['active', 'offline', 'standby']).toContain(agent.status);
      }
    });
  });

  describe('epics', () => {
    it('has epics referencing valid features', () => {
      const featureIds = new Set(Object.keys(features));
      expect(epics.length).toBeGreaterThan(0);
      for (const epic of epics) {
        for (const fId of epic.features) {
          expect(featureIds.has(fId)).toBe(true);
        }
      }
    });
  });

  describe('screens', () => {
    it('has screens with paths', () => {
      expect(screens.length).toBeGreaterThan(0);
      for (const screen of screens) {
        expect(screen.path).toBeDefined();
        expect(['done', 'in-progress', 'planned']).toContain(screen.status);
      }
    });
  });

  describe('screenCategories', () => {
    it('has styling for known categories', () => {
      expect(screenCategories['marketing']).toBeDefined();
      expect(screenCategories['order-flow']).toBeDefined();
      expect(screenCategories['admin']).toBeDefined();
      expect(screenCategories['dev']).toBeDefined();
    });
  });
});

describe('Helper Functions', () => {
  describe('getStoriesByComponent', () => {
    it('returns stories for a known component', () => {
      const uploadStories = getStoriesByComponent('Upload');
      expect(uploadStories.length).toBeGreaterThan(0);
      for (const s of uploadStories) {
        expect(s.component).toBe('Upload');
      }
    });

    it('returns empty array for unknown component', () => {
      expect(getStoriesByComponent('NonExistent')).toEqual([]);
    });
  });

  describe('getStoriesBySprint', () => {
    it('returns stories for sprint 0 (Infrastructure)', () => {
      const s0 = getStoriesBySprint(0);
      expect(s0.length).toBeGreaterThan(0);
    });

    it('returns empty array for nonexistent sprint', () => {
      expect(getStoriesBySprint(999)).toEqual([]);
    });
  });

  describe('getSprintProgress', () => {
    it('returns progress for a completed sprint', () => {
      const progress = getSprintProgress(0);
      expect(progress.done).toBeGreaterThan(0);
      expect(progress.total).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
    });

    it('returns zeros for nonexistent sprint', () => {
      const progress = getSprintProgress(999);
      expect(progress).toEqual({ done: 0, total: 0, percentage: 0 });
    });
  });

  describe('getFeatureProgress', () => {
    it('returns progress for a known feature', () => {
      const progress = getFeatureProgress('F0');
      expect(progress.total).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('returns zeros for unknown feature', () => {
      const progress = getFeatureProgress('F999');
      expect(progress).toEqual({ done: 0, total: 0, percentage: 0 });
    });
  });

  describe('getOverallProgress', () => {
    it('returns overall project progress', () => {
      const progress = getOverallProgress();
      expect(progress.total).toBe(Object.keys(stories).length);
      expect(progress.done).toBeLessThanOrEqual(progress.total);
      expect(progress.percentage).toBeGreaterThan(0);
    });
  });
});
