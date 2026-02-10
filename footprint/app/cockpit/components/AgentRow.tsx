'use client';

import { useState } from 'react';
import {
  Play,
  PlayCircle,
  Copy,
  Check,
  ChevronRight,
  Terminal,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export interface AgentData {
  id: string;
  name: string;
  model: string;
  role: string;
  worktree: string;
  branch: string;
  status: 'active' | 'offline' | 'standby';
  stories: string[];
  color: string;
}

export function AgentRow({ agent }: { agent: AgentData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [copied, setCopied] = useState<'terminal' | 'prompt' | 'instructions' | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startProgress, setStartProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const startupSteps = [
    { step: 1, label: 'Copying terminal command...', duration: 300 },
    { step: 2, label: 'Preparing agent definition...', duration: 300 },
    { step: 3, label: 'Loading safety framework...', duration: 300 },
    { step: 4, label: 'Preparing inbox check...', duration: 200 },
    { step: 5, label: 'Ready to launch!', duration: 200 },
  ];

  const terminalCommand = `cd ${agent.worktree} && claude`;

  const kickstartPrompt = `I am RECOVERING as ${agent.name} for AirView Marketplace.

EXECUTING MANDATORY STARTUP SEQUENCE:

Step 1/5: Reading my agent definition...
Step 2/5: Reading safety framework...
Step 3/5: Reading workflow protocol...
Step 4/5: Checking my inbox...
Step 5/5: Verifying current branch state...

Please read these files IN ORDER:
1. .claudecode/agents/${agent.id}-agent.md
2. .claudecode/workflows/SAFETY-FRAMEWORK.md
3. .claudecode/handoffs/${agent.id}-inbox.md

MY ROLE: ${agent.role}
${agent.stories.length > 0 ? `MY ASSIGNED STORIES: ${agent.stories.join(', ')}` : ''}
WORKTREE: ${agent.worktree}
BRANCH: ${agent.branch}

Output Identity Declaration with Safety Banner and await PM guidance.`;

  const startAgent = async () => {
    setIsStarting(true);
    setStartProgress(0);

    for (let i = 0; i < startupSteps.length; i++) {
      const step = startupSteps[i];
      setCurrentStep(step.label);
      setStartProgress(((i + 1) / startupSteps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    const fullInstructions = `${terminalCommand}\n\n--- PASTE THIS AFTER TERMINAL OPENS ---\n\n${kickstartPrompt}`;
    await navigator.clipboard.writeText(fullInstructions);

    setIsStarting(false);
    setHasStarted(true);
    setCurrentStep('COPIED! Now open Terminal and paste (Cmd+V)');
  };

  const copyToClipboard = async (text: string, type: 'terminal' | 'prompt' | 'instructions') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusColors = {
    active: 'bg-green-500',
    offline: 'bg-gray-400',
    standby: 'bg-blue-500',
  };

  const statusVariants = {
    active: 'default' as const,
    offline: 'secondary' as const,
    standby: 'outline' as const,
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-4">
            <div className="flex items-center gap-4">
              {/* Expand Icon */}
              <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />

              {/* Status Indicator */}
              <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`} />

              {/* Agent Name & Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <Badge variant="secondary" className={agent.color}>
                    {agent.model}
                  </Badge>
                </div>
                <CardDescription>{agent.role}</CardDescription>
              </div>

              {/* Stories */}
              {agent.stories.length > 0 && (
                <div className="flex gap-1">
                  {agent.stories.map(s => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Status Badge */}
              <Badge variant={statusVariants[agent.status]} className="capitalize">
                {agent.status}
              </Badge>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-5 space-y-4 bg-muted/30">
            {/* Terminal Command */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Terminal className="h-3 w-3" />
                Terminal Command
              </label>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-900 text-green-400 px-3 py-2 rounded text-sm font-mono">
                  {terminalCommand}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(terminalCommand, 'terminal')}
                >
                  {copied === 'terminal' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Kickstart Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Kickstart Prompt</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => copyToClipboard(kickstartPrompt, 'prompt')}
                >
                  {copied === 'prompt' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  Copy Prompt
                </Button>
              </div>
              <pre className="bg-gray-900 text-green-400 px-4 py-3 rounded text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                {kickstartPrompt}
              </pre>
            </div>

            {/* Paste Instructions Area */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Paste Instructions for {agent.name}
              </label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={`Paste code or instructions to send to ${agent.name}...`}
                className="h-32 font-mono text-sm resize-y"
              />
              {instructions && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(instructions, 'instructions')}
                  >
                    {copied === 'instructions' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    Copy Instructions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInstructions('')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Worktree:</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">{agent.worktree.split('/').pop()}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Branch:</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">{agent.branch}</code>
              </div>
            </div>

            <Separator />

            {/* Current Story Highlight */}
            {agent.stories.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Current Story: <strong>{agent.stories[0]}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Start Agent Button */}
            <div className="space-y-3">
              {/* Progress Bar - shows during starting */}
              {isStarting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{currentStep}</span>
                    <span className="text-green-600 font-bold">{Math.round(startProgress)}%</span>
                  </div>
                  <Progress value={startProgress} className="h-2" />
                </div>
              )}

              {/* Success Message - shows after started */}
              {hasStarted && !isStarting && (
                <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <Check className="h-5 w-5" />
                    <span className="font-bold">Command Copied to Clipboard!</span>
                  </div>
                  <ol className="text-sm text-green-700 dark:text-green-300 list-decimal list-inside space-y-1">
                    <li>Open <strong>Terminal</strong> app (Cmd + Space → Terminal)</li>
                    <li>Press <strong>Cmd + V</strong> to paste the command</li>
                    <li>Press <strong>Enter</strong> to run</li>
                    <li>Once Claude opens, paste again for kickstart prompt</li>
                  </ol>
                </div>
              )}

              {/* Button */}
              <Button
                onClick={startAgent}
                disabled={isStarting}
                className={`w-full ${hasStarted ? 'bg-green-600 hover:bg-green-700' : ''}`}
                size="lg"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : hasStarted ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copied! Click to Copy Again
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start {agent.name}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
