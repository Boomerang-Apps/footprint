import { Progress } from '@/components/ui/progress';

export function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-32">
      <Progress
        value={percentage}
        className={`h-2 ${
          percentage === 100 ? '[&>div]:bg-green-500' :
          percentage >= 50 ? '[&>div]:bg-blue-500' :
          percentage > 0 ? '[&>div]:bg-amber-500' : ''
        }`}
      />
    </div>
  );
}
