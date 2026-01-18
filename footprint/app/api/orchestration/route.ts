import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/orchestration
 * Fetches agent status and orchestration data from Supabase
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch agent statuses
    const { data: agents, error: agentsError } = await supabase
      .from('agent_status')
      .select('*')
      .order('agent');

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return NextResponse.json({ error: agentsError.message }, { status: 500 });
    }

    // Fetch sprints
    const { data: sprints, error: sprintsError } = await supabase
      .from('sprints')
      .select('*')
      .order('id');

    if (sprintsError) {
      console.error('Error fetching sprints:', sprintsError);
      return NextResponse.json({ error: sprintsError.message }, { status: 500 });
    }

    // Fetch epics
    const { data: epics, error: epicsError } = await supabase
      .from('epics')
      .select('*')
      .order('id');

    if (epicsError) {
      console.error('Error fetching epics:', epicsError);
      return NextResponse.json({ error: epicsError.message }, { status: 500 });
    }

    return NextResponse.json({
      agents: agents || [],
      sprints: sprints || [],
      epics: epics || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Orchestration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/orchestration
 * Updates agent status
 */
export async function POST(request: Request) {
  try {
    const { agent, status, currentStory, lastAction } = await request.json();

    if (!agent) {
      return NextResponse.json({ error: 'Missing agent' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('agent_status')
      .upsert({
        agent,
        status: status || 'active',
        current_story: currentStory,
        last_action: lastAction,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'agent',
      });

    if (error) {
      console.error('Error updating agent status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Orchestration POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
