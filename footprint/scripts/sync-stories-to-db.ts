/**
 * Sync Stories to Supabase
 *
 * This script reads stories from dev-progress.ts and syncs them to Supabase.
 * Run with: npx tsx scripts/sync-stories-to-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import { stories, sprints, features } from '../data/dashboard/dev-progress';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSprints() {
  console.log('\n📅 Syncing sprints...');

  const sprintData = sprints.map(s => ({
    id: s.id,
    name: s.name,
    focus: s.focus,
    status: s.status,
    start_date: s.startDate || null,
    end_date: s.endDate || null,
  }));

  const { data, error } = await supabase
    .from('sprints')
    .upsert(sprintData, { onConflict: 'id' });

  if (error) {
    console.error('Sprint sync error:', error.message);
  } else {
    console.log(`✅ Synced ${sprintData.length} sprints`);
  }
}

async function syncStories() {
  console.log('\n📝 Syncing stories...');

  // Map stories to find their sprint
  const storyToSprint: Record<string, number> = {};
  sprints.forEach(sprint => {
    sprint.features.forEach(featureId => {
      const feature = features[featureId];
      if (feature) {
        feature.stories.forEach(story => {
          storyToSprint[story.id] = sprint.id;
        });
      }
    });
  });

  const storyData = Object.values(stories).map(s => ({
    id: s.id,
    linear_id: s.linearId || null,
    linear_uuid: s.linearUuid || null,
    title: s.title,
    description: s.description || null,
    status: s.status,
    agent: s.agent || null,
    points: s.points || null,
    component: s.component || null,
    blocked_by: s.blockedBy || null,
    sprint_id: storyToSprint[s.id] || null,
  }));

  // Upsert in batches
  const batchSize = 50;
  let synced = 0;

  for (let i = 0; i < storyData.length; i += batchSize) {
    const batch = storyData.slice(i, i + batchSize);
    const { error } = await supabase
      .from('stories')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message);
    } else {
      synced += batch.length;
    }
  }

  console.log(`✅ Synced ${synced}/${storyData.length} stories`);
}

async function main() {
  console.log('🚀 Starting Footprint story sync to Supabase...');
  console.log(`Database: ${supabaseUrl}`);

  await syncSprints();
  await syncStories();

  console.log('\n✨ Sync complete!');
}

main().catch(console.error);
