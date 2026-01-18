import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/stories
 * Fetches all stories from Supabase for the dev dashboard
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: storiesData, error } = await supabase
      .from('stories')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert array to Record<string, Story> format
    const stories: Record<string, any> = {};
    for (const story of storiesData || []) {
      stories[story.id] = {
        id: story.id,
        linearId: story.linear_id,
        title: story.title,
        description: story.description,
        status: story.status,
        agent: story.agent,
        points: story.points,
        component: story.component,
        blockedBy: story.blocked_by,
        sprintId: story.sprint_id,
      };
    }

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Stories API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/stories
 * Updates a story's status
 */
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('stories')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating story:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stories PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
