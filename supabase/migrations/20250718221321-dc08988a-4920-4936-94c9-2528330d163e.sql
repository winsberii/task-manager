-- Add skipped column to subtasks table
ALTER TABLE public.subtasks 
ADD COLUMN skipped BOOLEAN NOT NULL DEFAULT false;