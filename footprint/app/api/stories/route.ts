import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

async function verifyAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }
  return null;
}

/**
 * GET /api/stories
 * Fetches all stories from Supabase for the dev dashboard
 */
export async function GET(request: Request) {
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited;

  const authError = await verifyAdmin();
  if (authError) return authError;

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
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited;

  const authError = await verifyAdmin();
  if (authError) return authError;

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
