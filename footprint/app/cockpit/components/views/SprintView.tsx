'use client';

import {
  ChevronRight,
  CheckCircle2,
  Calendar,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Story } from '@/data/dashboard/dev-progress';

interface Sprint {
  id: number;
  name: string;
  focus: string;
  status: string;
}

interface SprintViewProps {
  sprints: Sprint[];
  selectedSprintId: number;
  onSelectSprint: (id: number) => void;
  getSprintStories: (sprintId: number) => Story[];
  getProgress: (stories: Story[]) => { done: number; total: number; percentage: number };
  stories: Record<string, Story>;
  onOpenDetails: (story: Story) => void;
}

export function SprintView({
  sprints,
  selectedSprintId,
  onSelectSprint,
  getSprintStories,
  getProgress,
  stories,
  onOpenDetails,
}: SprintViewProps) {
  const allStories = Object.values(stories);
  const done = allStories.filter(s => s.status === 'done').length;
  const inReview = allStories.filter(s => s.status === 'in-review').length;
  const inProgress = allStories.filter(s => s.status === 'in-progress').length;
  const blocked = allStories.filter(s => s.status === 'blocked').length;
  const backlog = allStories.filter(s => s.status === 'backlog').length;
  const notCreated = allStories.filter(s => s.status === 'not-created').length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sprints.map(sprint => {
          const sprintStories = getSprintStories(sprint.id);
          const progress = getProgress(sprintStories);
          const isExpanded = selectedSprintId === sprint.id;

          return (
            <Collapsible
              key={sprint.id}
              open={isExpanded}
              onOpenChange={() => onSelectSprint(isExpanded ? 0 : sprint.id)}
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
                          onClick={() => onOpenDetails(story)}
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
      </div>

      <p className="text-center text-sm text-gray-400">
        Click sync icon on any story or use &quot;Sync All&quot; to fetch latest from Linear
      </p>
    </div>
  );
}
