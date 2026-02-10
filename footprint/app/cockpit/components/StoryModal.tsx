'use client';

import { useState } from 'react';
import { dashboardConfig, statusConfig, agentConfig, type Story } from '@/data/dashboard/dev-progress';
import { generateAgentPrompt } from '../lib/agent-prompt';

export function StoryModal({
  story,
  isOpen,
  onClose,
}: {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  const prompt = generateAgentPrompt(story);
  const linearUrl = story.linearId
    ? `https://linear.app/${dashboardConfig.linearWorkspace}/issue/${story.linearId}`
    : null;

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-indigo-600">{story.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[story.status].bgColor} ${statusConfig[story.status].color}`}>
                {statusConfig[story.status].label}
              </span>
              {story.agent && (
                <span className={`text-sm ${agentConfig[story.agent]?.color || 'text-gray-500'}`}>
                  {story.agent}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-1">{story.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Points</div>
              <div className="text-lg font-bold text-gray-900">{story.points || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Component</div>
              <div className="text-lg font-bold text-gray-900">{story.component || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Linear</div>
              {linearUrl ? (
                <a href={linearUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline">
                  {story.linearId}
                </a>
              ) : (
                <div className="text-lg font-bold text-gray-400">-</div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Blocked By</div>
              <div className="text-lg font-bold text-gray-900">
                {story.blockedBy?.length ? story.blockedBy.join(', ') : 'None'}
              </div>
            </div>
          </div>

          {/* Agent Instructions */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="font-semibold text-gray-900">Agent Kickstart Prompt</span>
              </div>
              <button
                onClick={copyPrompt}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-sm text-gray-800 bg-gray-50 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
              {prompt}
            </pre>
          </div>

          {/* Instructions Summary */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">📌 Agent Instructions Summary</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-900">
              <li>Validate Safety Protocol compliance (CLAUDE.md)</li>
              <li>Follow Workflow 2.0 (CTO → PM → Agent → QA → PM)</li>
              <li>Work in isolated worktree</li>
              <li>Read full story details from Linear</li>
              <li>Perform Gate 0 research (if needed) and TDD</li>
              <li>Update PM via inbox on progress</li>
              <li>Start with Safety Banner to confirm role</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Copy the prompt above and paste it to start the agent
          </div>
          <div className="flex items-center gap-3">
            {linearUrl && (
              <a
                href={linearUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Open in Linear
              </a>
            )}
            <button
              onClick={copyPrompt}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy & Start Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
