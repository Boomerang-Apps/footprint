import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get sprint overview
    const { data: sprints } = await supabase
      .from('sprints')
      .select('*')
      .order('id');

    // Get all stories with status
    const { data: stories } = await supabase
      .from('stories')
      .select('*')
      .order('execution_order', { ascending: true });

    // Get agent status with workload
    const { data: agents } = await supabase
      .from('agent_status')
      .select('*')
      .order('agent');

    // Get active plan if any
    const { data: activePlan } = await supabase
      .from('plans')
      .select('*')
      .eq('status', 'active')
      .single();

    // Calculate metrics
    const totalStories = stories?.length || 0;
    const doneStories = stories?.filter(s => s.status === 'done').length || 0;
    const activeStories = stories?.filter(s => s.status === 'in-progress').length || 0;
    const reviewStories = stories?.filter(s => s.status === 'in-review').length || 0;
    const blockedStories = stories?.filter(s => s.status === 'blocked').length || 0;
    const backlogStories = stories?.filter(s => s.status === 'backlog').length || 0;

    // Group stories by status for pipeline view
    const pipeline = {
      backlog: stories?.filter(s => s.status === 'backlog') || [],
      blocked: stories?.filter(s => s.status === 'blocked') || [],
      'in-progress': stories?.filter(s => s.status === 'in-progress') || [],
      'in-review': stories?.filter(s => s.status === 'in-review') || [],
      done: stories?.filter(s => s.status === 'done') || [],
    };

    // Group stories by agent
    const agentStories: Record<string, any[]> = {};
    stories?.forEach(story => {
      const agent = story.agent?.toLowerCase() || 'unassigned';
      if (!agentStories[agent]) agentStories[agent] = [];
      agentStories[agent].push(story);
    });

    // Identify ready stories (no blockers or all blockers done)
    const readyStories = stories?.filter(story => {
      if (story.status !== 'backlog' && story.status !== 'blocked') return false;
      if (!story.blocked_by || story.blocked_by.length === 0) return true;
      const blockerIds = Array.isArray(story.blocked_by) ? story.blocked_by : [];
      return blockerIds.every((blockerId: string) => {
        const blocker = stories?.find(s => s.id === blockerId);
        return blocker?.status === 'done';
      });
    }) || [];

    // Build agent workload
    const agentWorkload = agents?.map(agent => {
      const agentKey = agent.agent.toLowerCase();
      const assigned = agentStories[agentKey] || [];
      const queue = assigned
        .filter(s => s.status !== 'done')
        .sort((a, b) => (a.execution_order || 0) - (b.execution_order || 0));

      return {
        ...agent,
        assignedCount: assigned.length,
        completedCount: assigned.filter(s => s.status === 'done').length,
        activeCount: assigned.filter(s => s.status === 'in-progress').length,
        queue: queue.map(s => s.id),
        nextStory: queue[0]?.id || null,
      };
    }) || [];

    // Current sprint (active one)
    const currentSprint = sprints?.find(s => s.status === 'active') || sprints?.[sprints.length - 1];

    return NextResponse.json({
      overview: {
        totalStories,
        doneStories,
        activeStories,
        reviewStories,
        blockedStories,
        backlogStories,
        completionPercentage: totalStories > 0 ? Math.round((doneStories / totalStories) * 100) : 0,
      },
      currentSprint,
      sprints,
      pipeline,
      agents: agentWorkload,
      readyStories,
      activePlan,
      agentStories,
    });
  } catch (error) {
    console.error('Orchestration API error:', error);
    return NextResponse.json({ error: 'Failed to fetch orchestration data' }, { status: 500 });
  }
}

// Update agent status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { agent, status, progress, currentStory, action } = body;

    if (!agent) {
      return NextResponse.json({ error: 'Agent required' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    };

    if (status) updates.status = status;
    if (typeof progress === 'number') updates.progress = progress;
    if (currentStory !== undefined) updates.current_story = currentStory;
    if (action) updates.last_action = action;

    // If setting to active, record start time
    if (status === 'active') {
      updates.started_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('agent_status')
      .update(updates)
      .eq('agent', agent.toLowerCase())
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action if provided
    if (action) {
      await supabase.from('execution_log').insert({
        agent: agent.toLowerCase(),
        story_id: currentStory,
        action,
        details: JSON.stringify({ status, progress }),
      });
    }

    return NextResponse.json({ success: true, agent: data });
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
