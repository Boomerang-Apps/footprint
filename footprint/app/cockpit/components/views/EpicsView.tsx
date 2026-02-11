'use client';

import type { Story } from '@/data/dashboard/dev-progress';

interface Epic {
  id: string;
  name: string;
  description: string;
  status: string;
  features: string[];
  totalPoints?: number;
}

interface Feature {
  id: string;
  name: string;
  stories: Story[];
}

interface EpicsViewProps {
  epics: Epic[];
  features: Record<string, Feature>;
  stories: Record<string, Story>;
}

export function EpicsView({ epics, features, stories }: EpicsViewProps) {
  return (
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
  );
}
