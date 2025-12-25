#!/usr/bin/env npx tsx
/**
 * Sync dev-progress.ts to Supabase database
 *
 * Usage: npx tsx scripts/sync-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Import dev-progress data
import { stories, sprints, features } from '../data/dashboard/dev-progress';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function syncDatabase() {
  console.log('Starting database sync...\n');

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

  // Sync sprints
  console.log('Syncing sprints...');
  const sprintData = sprints.map(sprint => ({
    id: sprint.id,
    name: sprint.name,
    focus: sprint.focus,
    status: sprint.status,
    start_date: sprint.startDate || null,
    end_date: sprint.endDate || null,
  }));

  const { error: sprintError } = await supabase
    .from('sprints')
    .upsert(sprintData, { onConflict: 'id' });

  if (sprintError) {
    console.error('Sprint sync error:', sprintError.message);
  } else {
    console.log(`  ✅ Synced ${sprintData.length} sprints`);
  }

  // Sync stories
  console.log('\nSyncing stories...');
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

  const { error: storyError } = await supabase
    .from('stories')
    .upsert(storyData, { onConflict: 'id' });

  if (storyError) {
    console.error('Story sync error:', storyError.message);
  } else {
    console.log(`  ✅ Synced ${storyData.length} stories`);
  }

  // Print summary
  const done = storyData.filter(s => s.status === 'done').length;
  const inProgress = storyData.filter(s => s.status === 'in-progress').length;
  const inReview = storyData.filter(s => s.status === 'in-review').length;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Sync Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total Stories: ${storyData.length}`);
  console.log(`  ✅ Done:        ${done}`);
  console.log(`  🔵 In Progress: ${inProgress}`);
  console.log(`  🟡 In Review:   ${inReview}`);
  console.log(`  📋 Backlog:     ${storyData.length - done - inProgress - inReview}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ Database sync complete!`);
}

syncDatabase().catch(console.error);
