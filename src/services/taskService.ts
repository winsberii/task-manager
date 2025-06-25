
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFormData } from '@/types/task';

export const taskService = {
  // Get all tasks for the current user
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data.map(task => ({
      id: task.id,
      name: task.name,
      content: task.content || '',
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completeDate: task.complete_date ? new Date(task.complete_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      subtasks: [],
      subtaskGroups: []
    }));
  },

  // Create a new task
  async createTask(taskData: TaskFormData): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name: taskData.name,
        content: taskData.content || null,
        due_date: taskData.dueDate ? taskData.dueDate.toISOString().split('T')[0] : null,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subtasks: [],
      subtaskGroups: []
    };
  },

  // Update an existing task
  async updateTask(taskId: string, taskData: TaskFormData): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        name: taskData.name,
        content: taskData.content || null,
        due_date: taskData.dueDate ? taskData.dueDate.toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subtasks: [],
      subtaskGroups: []
    };
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Toggle task completion
  async toggleTaskComplete(taskId: string): Promise<Task> {
    // First get the current task to check its completion status
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('complete_date')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      console.error('Error fetching task:', fetchError);
      throw fetchError;
    }

    const isCompleted = !!currentTask.complete_date;
    const newCompleteDate = isCompleted ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update({
        complete_date: newCompleteDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subtasks: [],
      subtaskGroups: []
    };
  },

  // Copy a task
  async copyTask(taskId: string): Promise<Task> {
    const { data: originalTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      console.error('Error fetching task to copy:', fetchError);
      throw fetchError;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name: `${originalTask.name} (Copy)`,
        content: originalTask.content,
        due_date: originalTask.due_date,
        user_id: originalTask.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error copying task:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subtasks: [],
      subtaskGroups: []
    };
  }
};
