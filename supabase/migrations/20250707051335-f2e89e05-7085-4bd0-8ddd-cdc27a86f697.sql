
-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for task-tag relationships
CREATE TABLE public.task_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, tag_id)
);

-- Add Row Level Security to tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags table
CREATE POLICY "Users can view their own tags" 
  ON public.tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" 
  ON public.tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" 
  ON public.tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" 
  ON public.tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security to task_tags table
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for task_tags table
CREATE POLICY "Users can view their own task tags" 
  ON public.task_tags 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create task tags for their own tasks" 
  ON public.task_tags 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own task tags" 
  ON public.task_tags 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_task_tags_task_id ON public.task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON public.task_tags(tag_id);
