-- Migration: Add Orchestration Features
-- Adds sprint phases, execution order, and progress tracking

-- ============================================
-- SPRINT PHASES TABLE
-- ============================================
-- Phases define execution order within a sprint
-- Stories in the same phase can run in PARALLEL
-- Phases execute SEQUENTIALLY (phase 1 before phase 2)

CREATE TABLE IF NOT EXISTS sprint_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id INT REFERENCES sprints(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  name VARCHAR(100),
  description TEXT,
  execution_type VARCHAR(20) DEFAULT 'parallel' CHECK (execution_type IN ('parallel', 'sequential')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('completed', 'active', 'pending', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sprint_id, phase_number)
);

-- Add phase reference to stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS phase_id UUID REFERENCES sprint_phases(id),
ADD COLUMN IF NOT EXISTS execution_order INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100);

-- Add progress to agent_status
ALTER TABLE agent_status
ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMPTZ;

-- ============================================
-- PM PLANS TABLE
-- ============================================
-- Stores PM and CTO plans for visibility

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id INT REFERENCES sprints(id),
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('pm', 'cto', 'qa')),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'completed', 'archived')),
  created_by VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXECUTION LOG TABLE
-- ============================================
-- Tracks what agents did and when

CREATE TABLE IF NOT EXISTS execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent VARCHAR(50) NOT NULL,
  story_id VARCHAR(20) REFERENCES stories(id),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  gate INT CHECK (gate BETWEEN 0 AND 5),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_execution_log_agent ON execution_log(agent);
CREATE INDEX idx_execution_log_story ON execution_log(story_id);
CREATE INDEX idx_execution_log_timestamp ON execution_log(timestamp DESC);

-- ============================================
-- VIEWS
-- ============================================

-- View: Stories ready to execute (all dependencies done)
CREATE OR REPLACE VIEW ready_stories AS
SELECT s.*
FROM stories s
WHERE s.status IN ('backlog', 'blocked')
AND (
  s.blocked_by IS NULL
  OR s.blocked_by = '[]'::jsonb
  OR NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(s.blocked_by) AS blocker_id
    JOIN stories blocker ON blocker.id = blocker_id
    WHERE blocker.status != 'done'
  )
);

-- View: Current sprint overview
CREATE OR REPLACE VIEW sprint_overview AS
SELECT
  sp.id as sprint_id,
  sp.name as sprint_name,
  sp.status as sprint_status,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT CASE WHEN s.status = 'done' THEN s.id END) as done_stories,
  COUNT(DISTINCT CASE WHEN s.status = 'in-progress' THEN s.id END) as active_stories,
  COUNT(DISTINCT CASE WHEN s.status = 'in-review' THEN s.id END) as review_stories,
  COUNT(DISTINCT CASE WHEN s.status IN ('backlog', 'blocked') THEN s.id END) as pending_stories,
  ROUND(
    COUNT(DISTINCT CASE WHEN s.status = 'done' THEN s.id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT s.id), 0) * 100
  ) as completion_percentage
FROM sprints sp
LEFT JOIN stories s ON s.sprint_id = sp.id
GROUP BY sp.id, sp.name, sp.status;

-- View: Agent workload
CREATE OR REPLACE VIEW agent_workload AS
SELECT
  a.agent,
  a.display_name,
  a.status as agent_status,
  a.current_story,
  a.progress,
  COUNT(s.id) as assigned_stories,
  COUNT(CASE WHEN s.status = 'done' THEN 1 END) as completed_stories,
  COUNT(CASE WHEN s.status IN ('in-progress', 'in-review') THEN 1 END) as active_stories,
  ARRAY_AGG(s.id ORDER BY s.execution_order) FILTER (WHERE s.status != 'done') as pending_queue
FROM agent_status a
LEFT JOIN stories s ON LOWER(s.agent) = LOWER(a.agent)
GROUP BY a.agent, a.display_name, a.status, a.current_story, a.progress;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_sprint_phases_updated_at
  BEFORE UPDATE ON sprint_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE sprint_phases IS 'Defines execution phases within sprints - stories in same phase run parallel';
COMMENT ON TABLE plans IS 'PM, CTO, QA plans for sprint visibility';
COMMENT ON TABLE execution_log IS 'Audit log of agent actions';
COMMENT ON VIEW ready_stories IS 'Stories with all dependencies completed, ready for execution';
COMMENT ON VIEW sprint_overview IS 'High-level sprint progress metrics';
COMMENT ON VIEW agent_workload IS 'Per-agent workload and queue';
