-- Migration: Create Development Tracking Tables
-- Dev Dashboard: Stories, Epics, Sprints, Agent Status
-- Description: Tables for multi-agent development tracking

-- ============================================
-- EPICS TABLE
-- ============================================
CREATE TABLE epics (
  id VARCHAR(20) PRIMARY KEY,  -- e.g., EPIC-01
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('done', 'in-progress', 'planned')),
  priority CHAR(1) DEFAULT 'M' CHECK (priority IN ('M', 'S', 'C', 'W')),  -- MoSCoW
  target_sprints VARCHAR(50),
  story_count INT DEFAULT 0,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SPRINTS TABLE
-- ============================================
CREATE TABLE sprints (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  focus TEXT,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('completed', 'active', 'planned')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STORIES TABLE
-- ============================================
CREATE TABLE stories (
  id VARCHAR(20) PRIMARY KEY,  -- e.g., AV-101, UI-001
  linear_id VARCHAR(20),       -- Linear issue identifier (e.g., AV-123)
  linear_uuid UUID,            -- Linear UUID
  epic_id VARCHAR(20) REFERENCES epics(id),
  sprint_id INT REFERENCES sprints(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'backlog' CHECK (status IN ('done', 'in-review', 'in-progress', 'blocked', 'backlog', 'not-created')),
  agent VARCHAR(50),           -- Assigned agent (e.g., Frontend-A, Backend-1)
  points INT,
  priority CHAR(1) DEFAULT 'M' CHECK (priority IN ('M', 'S', 'C', 'W')),
  component VARCHAR(100),
  mockup VARCHAR(255),         -- Path to HTML mockup
  screen_ref VARCHAR(20),      -- Screen reference
  acceptance_criteria JSONB,
  technical_notes TEXT,
  gate0_ref VARCHAR(255),
  database_tables JSONB,       -- Array of Supabase tables this story touches
  blocked_by JSONB,            -- Array of blocking story IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_agent ON stories(agent);
CREATE INDEX idx_stories_sprint_id ON stories(sprint_id);
CREATE INDEX idx_stories_epic_id ON stories(epic_id);
CREATE INDEX idx_stories_linear_id ON stories(linear_id);

-- ============================================
-- AGENT_STATUS TABLE
-- ============================================
CREATE TABLE agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent VARCHAR(50) UNIQUE NOT NULL,  -- e.g., pm, cto, frontend-a
  display_name VARCHAR(100) NOT NULL,
  model VARCHAR(50),                   -- e.g., Opus 4.5, Sonnet 4
  role VARCHAR(255),
  worktree VARCHAR(500),
  branch VARCHAR(255),
  active BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('active', 'offline', 'standby', 'error')),
  current_story VARCHAR(20) REFERENCES stories(id),
  current_gate INT CHECK (current_gate BETWEEN 0 AND 5),
  last_action TEXT,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agent lookups
CREATE INDEX idx_agent_status_agent ON agent_status(agent);
CREATE INDEX idx_agent_status_active ON agent_status(active);

-- ============================================
-- EPIC_STORIES JUNCTION (for many-to-many if needed)
-- ============================================
CREATE TABLE epic_stories (
  epic_id VARCHAR(20) REFERENCES epics(id) ON DELETE CASCADE,
  story_id VARCHAR(20) REFERENCES stories(id) ON DELETE CASCADE,
  PRIMARY KEY (epic_id, story_id)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epics_updated_at
  BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_status_updated_at
  BEFORE UPDATE ON agent_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update epic stats when stories change
CREATE OR REPLACE FUNCTION update_epic_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update story count and total points for the epic
  UPDATE epics
  SET
    story_count = (SELECT COUNT(*) FROM stories WHERE epic_id = COALESCE(NEW.epic_id, OLD.epic_id)),
    total_points = (SELECT COALESCE(SUM(points), 0) FROM stories WHERE epic_id = COALESCE(NEW.epic_id, OLD.epic_id)),
    status = CASE
      WHEN (SELECT COUNT(*) FROM stories WHERE epic_id = COALESCE(NEW.epic_id, OLD.epic_id) AND status != 'done') = 0
           AND (SELECT COUNT(*) FROM stories WHERE epic_id = COALESCE(NEW.epic_id, OLD.epic_id)) > 0
      THEN 'done'
      WHEN (SELECT COUNT(*) FROM stories WHERE epic_id = COALESCE(NEW.epic_id, OLD.epic_id) AND status IN ('in-progress', 'in-review')) > 0
      THEN 'in-progress'
      ELSE 'planned'
    END
  WHERE id = COALESCE(NEW.epic_id, OLD.epic_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_epic_stats_on_story_change
  AFTER INSERT OR UPDATE OR DELETE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_epic_stats();

-- ============================================
-- ROW LEVEL SECURITY (Optional - enable as needed)
-- ============================================
-- These tables are for internal dev tracking, so RLS may not be needed
-- ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE epics IS 'Development epics for AirView - 11 total epics';
COMMENT ON TABLE sprints IS 'Development sprints for organizing work';
COMMENT ON TABLE stories IS 'User stories and tasks - synced with Linear';
COMMENT ON TABLE agent_status IS 'Real-time status of multi-agent framework agents';
