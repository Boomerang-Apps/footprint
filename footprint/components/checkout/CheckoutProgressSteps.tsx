import { Check } from 'lucide-react';

const STEPS = [
  { key: 'upload', label: 'העלאה' },
  { key: 'style', label: 'סגנון' },
  { key: 'tweak', label: 'עריכה' },
  { key: 'customize', label: 'התאמה' },
  { key: 'payment', label: 'תשלום' },
];

export function CheckoutProgressSteps() {
  return (
    <div className="border-b border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-1">
          {STEPS.map((step, i) => {
            const isCompleted = i < 4;
            const isActive = i === 4;
            return (
              <div key={step.key} className="flex items-center gap-1" data-step={step.key} data-completed={isCompleted ? 'true' : undefined} data-active={isActive ? 'true' : undefined}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-violet-600 text-white' : isActive ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-500'}
                `}>
                  {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${isCompleted || isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {step.label}
                </span>
                {i < 4 && (
                  <div className={`w-6 h-px mx-1 ${isCompleted ? 'bg-violet-600' : 'bg-zinc-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
