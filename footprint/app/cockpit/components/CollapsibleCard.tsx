'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type { Story } from '@/data/dashboard/dev-progress';
import { ProgressBar } from './ProgressBar';
import { StoryRow } from './StoryRow';

export function CollapsibleCard({
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-4">
            <div className="flex items-center gap-4">
              {/* Expand Icon */}
              <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />

              {/* Icon */}
              <span className="text-2xl">{icon}</span>

              {/* Title & Subtitle */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{title}</CardTitle>
                  {badge && (
                    <Badge variant="secondary" className={badge.color}>
                      {badge.text}
                    </Badge>
                  )}
                </div>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
              </div>

              {/* Progress */}
              <div className="flex items-center gap-4">
                <ProgressBar percentage={progress.percentage} />
                <span className="text-sm font-medium text-muted-foreground w-20 text-right">
                  {progress.done}/{progress.total} done
                </span>
                <span className={`text-lg font-bold w-12 text-right ${progress.percentage === 100 ? 'text-green-600' : 'text-foreground'}`}>
                  {progress.percentage}%
                </span>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <div className="bg-muted/30">
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
              <div className="px-5 py-4 text-sm text-muted-foreground italic">No stories yet</div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
