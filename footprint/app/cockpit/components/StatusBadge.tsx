import { Badge } from '@/components/ui/Badge';
import { statusConfig, type StoryStatus } from '@/data/dashboard/dev-progress';

export function StatusBadge({ status }: { status: StoryStatus }) {
  const config = statusConfig[status];
  const variants: Record<StoryStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'done': 'default',
    'in-review': 'secondary',
    'in-progress': 'secondary',
    'blocked': 'destructive',
    'backlog': 'outline',
    'not-created': 'outline',
  };
  return (
    <Badge variant={variants[status]} className={`${config.bgColor} ${config.color} border-0`}>
      {config.label}
    </Badge>
  );
}
