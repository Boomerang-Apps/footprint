'use client';

import type { Story } from '@/data/dashboard/dev-progress';

interface Screen {
  id: string;
  name: string;
  path: string;
  description?: string;
  category: string;
  status: string;
  mockup?: string;
  stories?: string[];
}

interface ScreenCategoryConfig {
  label: string;
  color: string;
  bgColor: string;
}

interface SitemapViewProps {
  screens: Screen[];
  screenCategories: Record<string, ScreenCategoryConfig>;
  stories: Record<string, Story>;
  onOpenDetails: (story: Story) => void;
}

export function SitemapView({ screens, screenCategories, stories, onOpenDetails }: SitemapViewProps) {
  return (
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
                                if (story) onOpenDetails(story);
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
  );
}
