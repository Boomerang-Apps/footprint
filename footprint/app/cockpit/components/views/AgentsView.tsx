'use client';

import {
  RefreshCw,
  Bot,
  Activity,
  Clock,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AgentRow, type AgentData } from '../AgentRow';

interface AgentStatus {
  agent: string;
  status: 'active' | 'offline' | 'standby';
  assignment?: {
    stories: string[];
    role: string;
  };
}

interface AgentsViewProps {
  agents: AgentData[];
  agentStatuses: AgentStatus[];
  isLoadingAgents: boolean;
  onRefresh: () => void;
}

export function AgentsView({ agents, agentStatuses, isLoadingAgents, onRefresh }: AgentsViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg"><Activity className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-2xl font-bold text-green-700">{agentStatuses.filter(a => a.status === 'active').length}</p>
              <p className="text-xs text-green-600">Running</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{agentStatuses.filter(a => a.status === 'standby').length}</p>
              <p className="text-xs text-blue-600">Standby</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-gray-400 rounded-lg"><Zap className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{agentStatuses.filter(a => a.status === 'offline').length}</p>
              <p className="text-xs text-gray-600">Offline</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg"><Bot className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{agentStatuses.length || 7}</p>
              <p className="text-xs text-purple-600">Total Agents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold">Multi-Agent Framework</h3>
                <p className="text-sm text-muted-foreground">Workflow 2.0: CTO → PM → Agent → QA → PM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoadingAgents}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAgents ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild variant="secondary" size="sm">
                <a href="/.claudecode/CTO-CRASH-RECOVERY.md" target="_blank" rel="noopener noreferrer">
                  Recovery Docs
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {agents.map(agent => {
          const liveStatus = agentStatuses.find(a => a.agent === agent.id);
          const updatedAgent = liveStatus ? {
            ...agent,
            status: liveStatus.status,
            stories: liveStatus.assignment?.stories || agent.stories,
          } : agent;
          return <AgentRow key={agent.id} agent={updatedAgent} />;
        })}
      </div>
    </div>
  );
}
