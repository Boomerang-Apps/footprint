-- Migration: Update INT-01 status to done, INT-02 to in-progress
-- Date: 2025-12-26

-- INT-01 merged and complete
UPDATE stories SET status = 'done' WHERE id = 'INT-01';

-- INT-02 now in progress
UPDATE stories SET status = 'in-progress' WHERE id = 'INT-02';
