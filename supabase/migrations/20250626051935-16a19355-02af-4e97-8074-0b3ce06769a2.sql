
-- Create subtask_groups table
CREATE TABLE public.subtask_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  subtask_group_id UUID REFERENCES public.subtask_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT DEFAULT '',
  due_date DATE,
  complete_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for subtask_groups
ALTER TABLE public.subtask_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for subtask_groups
CREATE POLICY "Users can view their own subtask groups" 
  ON public.subtask_groups 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtask_groups.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create subtask groups for their own tasks" 
  ON public.subtask_groups 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtask_groups.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own subtask groups" 
  ON public.subtask_groups 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtask_groups.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own subtask groups" 
  ON public.subtask_groups 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtask_groups.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Enable Row Level Security for subtasks
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for subtasks
CREATE POLICY "Users can view their own subtasks" 
  ON public.subtasks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create subtasks for their own tasks" 
  ON public.subtasks 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own subtasks" 
  ON public.subtasks 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own subtasks" 
  ON public.subtasks 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));
