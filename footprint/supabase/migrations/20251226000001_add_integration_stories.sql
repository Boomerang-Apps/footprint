-- Migration: Add Sprint 5 Integration Stories
-- Date: 2025-12-26
-- Description: Add INT-01 to INT-05 stories for end-to-end integration

-- Update Sprint 5 to be Integration sprint
UPDATE sprints
SET
  name = 'Sprint 5',
  focus = 'End-to-End Integration',
  status = 'active'
WHERE id = 5;

-- If Sprint 5 doesn't exist, insert it
INSERT INTO sprints (id, name, focus, status)
VALUES (5, 'Sprint 5', 'End-to-End Integration', 'active')
ON CONFLICT (id) DO UPDATE SET
  focus = 'End-to-End Integration',
  status = 'active';

-- Add Sprint 6 if it doesn't exist
INSERT INTO sprints (id, name, focus, status)
VALUES (6, 'Sprint 6', 'User Accounts & Auth', 'planned')
ON CONFLICT (id) DO NOTHING;

-- Insert INT-01 to INT-05 stories
INSERT INTO stories (id, title, description, status, agent, points, component, sprint_id)
VALUES
  ('INT-01', 'Connect Upload to R2 Storage', 'Call /api/upload on image select, store R2 URL in orderStore, show upload progress', 'in-progress', 'Frontend-B', 3, 'Integration', 5),
  ('INT-02', 'Connect Style Selection to AI Transform', 'Call /api/transform when style selected, show real AI preview instead of simulated, handle errors', 'backlog', 'Frontend-B', 5, 'Integration', 5),
  ('INT-03', 'Connect Checkout to Payment APIs', 'Integrate PayPlus (Israeli) and Stripe (wallet) payment flows, handle success/failure callbacks', 'backlog', 'Frontend-B', 5, 'Integration', 5),
  ('INT-04', 'Create Order on Payment Success', 'Create order record in database on successful payment, trigger confirmation email via /api/orders/[id]/confirm', 'backlog', 'Backend-2', 3, 'Integration', 5),
  ('INT-05', 'Connect Confirmation to Order API', 'Fetch real order data from API, display order number, tracking info, WhatsApp share with real data', 'backlog', 'Frontend-B', 2, 'Integration', 5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  agent = EXCLUDED.agent,
  points = EXCLUDED.points,
  component = EXCLUDED.component,
  sprint_id = EXCLUDED.sprint_id;

-- Update OM-04 to done (it was merged)
UPDATE stories SET status = 'done' WHERE id = 'OM-04';

-- Move old Sprint 5 stories to appropriate sprints or mark as backlog
UPDATE stories
SET sprint_id = NULL
WHERE id IN ('CO-03', 'CO-05', 'CO-06', 'AI-05')
  AND sprint_id = 5;
