
-- Add order_index columns to subtasks and subtask_groups tables
ALTER TABLE subtasks ADD COLUMN order_index INTEGER DEFAULT 0;
ALTER TABLE subtask_groups ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing records to have sequential order indexes
WITH ranked_subtasks AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY task_id, subtask_group_id ORDER BY created_at) - 1 as new_order
    FROM subtasks
)
UPDATE subtasks 
SET order_index = ranked_subtasks.new_order 
FROM ranked_subtasks 
WHERE subtasks.id = ranked_subtasks.id;

WITH ranked_groups AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY created_at) - 1 as new_order
    FROM subtask_groups
)
UPDATE subtask_groups 
SET order_index = ranked_groups.new_order 
FROM ranked_groups 
WHERE subtask_groups.id = ranked_groups.id;

-- Add indexes for better query performance
CREATE INDEX idx_subtasks_order ON subtasks(task_id, subtask_group_id, order_index);
CREATE INDEX idx_subtask_groups_order ON subtask_groups(task_id, order_index);
