import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (only if env vars are set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET() {
  // If Supabase is not configured, return empty response
  if (!supabase) {
    return NextResponse.json({
      stories: {},
      count: 0,
      message: 'Supabase not configured - using local dev-progress.ts data'
    });
  }

  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .order('id');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to match the dashboard format
    const storiesMap: Record<string, {
      id: string;
      linearId?: string;
      linearUuid?: string;
      title: string;
      description?: string;
      status: string;
      agent?: string;
      points?: number;
      sprint?: number;
      component?: string;
      blockedBy?: string[];
    }> = {};

    stories?.forEach(story => {
      storiesMap[story.id] = {
        id: story.id,
        linearId: story.linear_id,
        linearUuid: story.linear_uuid,
        title: story.title,
        description: story.description,
        status: story.status,
        agent: story.agent,
        points: story.points,
        sprint: story.sprint_id,
        component: story.component,
        blockedBy: story.blocked_by,
      };
    });

    return NextResponse.json({
      stories: storiesMap,
      count: stories?.length || 0
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({
      error: 'Supabase not configured',
      message: 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, title, status, agent, points, sprint_id, component } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'ID and title required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('stories')
      .upsert({
        id,
        title,
        status: status || 'backlog',
        agent,
        points,
        sprint_id,
        component,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, story: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!supabase) {
    return NextResponse.json({
      error: 'Supabase not configured'
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('stories')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, story: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}
