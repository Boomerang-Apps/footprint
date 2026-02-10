'use client';

import { Check, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { dashboardConfig, type Story } from '@/data/dashboard/dev-progress';
import { StatusBadge } from './StatusBadge';

export function StoryRow({
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
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 ${isDone ? 'bg-green-50/50' : ''}`}>
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'}`}>
        {isDone && <Check className="h-3 w-3 text-white" />}
      </div>

      {/* Story ID */}
      <span className={`font-mono text-sm w-16 flex-shrink-0 ${isDone ? 'text-green-600' : 'text-muted-foreground'}`}>
        {story.id}
      </span>

      {/* Title */}
      <span className={`flex-1 text-sm ${isDone ? 'text-green-700 line-through' : 'text-foreground'}`}>
        {story.title}
      </span>

      {/* Status */}
      <StatusBadge status={story.status} />

      {/* Agent */}
      {story.agent && (
        <Badge variant="outline" className="text-xs w-auto">
          {story.agent}
        </Badge>
      )}

      {/* Points */}
      {story.points && (
        <span className="text-xs text-muted-foreground w-8 text-right">{story.points}pt</span>
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onSync(story.id)}
          disabled={isSyncing}
          title="Sync with Linear"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      )}

      {/* Details Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onOpenDetails(story)}
        title="View Details & Agent Prompt"
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
  );
}
