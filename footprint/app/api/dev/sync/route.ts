import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { stories, sprints, features } from '@/data/dashboard/dev-progress';

// Map our story status to database status
function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'done': 'done',
    'in-review': 'in-review',
    'in-progress': 'in-progress',
    'blocked': 'blocked',
    'backlog': 'backlog',
    'not-created': 'not-created',
  };
  return statusMap[status] || 'backlog';
}

// Map sprint status
function mapSprintStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'completed': 'completed',
    'active': 'active',
    'planned': 'planned',
  };
  return statusMap[status] || 'planned';
}

async function verifyAdmin(request: Request): Promise<NextResponse | null> {
  const rateLimited = await checkRateLimit('strict', request);
  if (rateLimited) return rateLimited;

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

export async function POST(request: Request) {
  const authError = await verifyAdmin(request);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    // Sync sprints first
    const sprintData = sprints.map(sprint => ({
      id: sprint.id,
      name: sprint.name,
      focus: sprint.focus,
      status: mapSprintStatus(sprint.status),
      start_date: sprint.startDate || null,
      end_date: sprint.endDate || null,
    }));

    const { error: sprintError } = await supabase
      .from('sprints')
      .upsert(sprintData, { onConflict: 'id' });

    if (sprintError) {
      console.error('Sprint sync error:', sprintError);
    }

    // Get sprint ID mapping (sprint index to DB id)
    const sprintIdMap: Record<number, number> = {};
    for (const sprint of sprints) {
      sprintIdMap[sprint.id] = sprint.id;
    }

    // Build feature to sprint mapping
    const featureToSprint: Record<string, number> = {};
    for (const sprint of sprints) {
      for (const featureId of sprint.features) {
        featureToSprint[featureId] = sprint.id;
      }
    }

    // Build story to sprint mapping via features
    const storyToSprint: Record<string, number> = {};
    for (const feature of Object.values(features)) {
      const sprintId = featureToSprint[feature.id];
      if (sprintId) {
        for (const story of feature.stories) {
          storyToSprint[story.id] = sprintId;
        }
      }
    }

    // Sync stories
    const storyData = Object.values(stories).map(story => ({
      id: story.id,
      linear_id: story.linearId || null,
      linear_uuid: story.linearUuid || null,
      sprint_id: storyToSprint[story.id] || null,
      title: story.title,
      description: story.description || null,
      status: mapStatus(story.status),
      agent: story.agent || null,
      points: story.points || null,
      component: story.component || null,
      blocked_by: story.blockedBy ? JSON.stringify(story.blockedBy) : null,
    }));

    const { error: storyError, data: syncedStories } = await supabase
      .from('stories')
      .upsert(storyData, { onConflict: 'id' })
      .select();

    if (storyError) {
      console.error('Story sync error:', storyError);
      return NextResponse.json(
        { error: 'Failed to sync stories', details: storyError.message },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      sprints: sprintData.length,
      stories: storyData.length,
      done: storyData.filter(s => s.status === 'done').length,
      inProgress: storyData.filter(s => s.status === 'in-progress').length,
      inReview: storyData.filter(s => s.status === 'in-review').length,
    };

    return NextResponse.json({
      success: true,
      message: 'Dev progress synced to database',
      stats,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authError = await verifyAdmin(request);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    // Get current database state
    const { data: dbStories, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .order('id');

    if (storyError) {
      return NextResponse.json(
        { error: 'Failed to fetch stories', details: storyError.message },
        { status: 500 }
      );
    }

    const { data: dbSprints, error: sprintError } = await supabase
      .from('sprints')
      .select('*')
      .order('id');

    if (sprintError) {
      return NextResponse.json(
        { error: 'Failed to fetch sprints', details: sprintError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stories: dbStories,
      sprints: dbSprints,
      source: 'database',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
