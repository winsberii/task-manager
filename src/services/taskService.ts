import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFormData, Subtask, SubtaskGroup, SubtaskFormData } from '@/types/task';

export const taskService = {
  // Get all tasks for the current user with subtasks and subtask groups
  async getTasks(): Promise<Task[]> {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    // Fetch subtasks and subtask groups for all tasks
    const taskIds = tasksData.map(task => task.id);
    
    const [subtasksResult, subtaskGroupsResult] = await Promise.all([
      supabase
        .from('subtasks')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: true }),
      supabase
        .from('subtask_groups')
        .select(`
          *,
          subtasks (*)
        `)
        .in('task_id', taskIds)
        .order('created_at', { ascending: true })
    ]);

    if (subtasksResult.error) {
      console.error('Error fetching subtasks:', subtasksResult.error);
      throw subtasksResult.error;
    }

    if (subtaskGroupsResult.error) {
      console.error('Error fetching subtask groups:', subtaskGroupsResult.error);
      throw subtaskGroupsResult.error;
    }

    // Group subtasks by task_id (only ungrouped subtasks)
    const ungroupedSubtasks = subtasksResult.data.filter(st => !st.subtask_group_id);
    const subtasksByTask = ungroupedSubtasks.reduce((acc, subtask) => {
      if (!acc[subtask.task_id]) {
        acc[subtask.task_id] = [];
      }
      acc[subtask.task_id].push({
        id: subtask.id,
        name: subtask.name,
        content: subtask.content || '',
        dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
        completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
        createdAt: new Date(subtask.created_at),
        updatedAt: new Date(subtask.updated_at)
      });
      return acc;
    }, {} as Record<string, Subtask[]>);

    // Group subtask groups by task_id
    const subtaskGroupsByTask = subtaskGroupsResult.data.reduce((acc, group) => {
      if (!acc[group.task_id]) {
        acc[group.task_id] = [];
      }
      acc[group.task_id].push({
        id: group.id,
        name: group.name,
        subtasks: (group.subtasks || []).map((st: any) => ({
          id: st.id,
          name: st.name,
          content: st.content || '',
          dueDate: st.due_date ? new Date(st.due_date) : undefined,
          completeDate: st.complete_date ? new Date(st.complete_date) : undefined,
          createdAt: new Date(st.created_at),
          updatedAt: new Date(st.updated_at)
        })),
        createdAt: new Date(group.created_at),
        updatedAt: new Date(group.updated_at)
      });
      return acc;
    }, {} as Record<string, SubtaskGroup[]>);

    return tasksData.map(task => ({
      id: task.id,
      name: task.name,
      content: task.content || '',
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completeDate: task.complete_date ? new Date(task.complete_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      subtasks: subtasksByTask[task.id] || [],
      subtaskGroups: subtaskGroupsByTask[task.id] || []
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
  },

  // Add subtask to task
  async addSubtask(taskId: string, subtaskData: SubtaskFormData, subtaskGroupId?: string): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        subtask_group_id: subtaskGroupId || null,
        name: subtaskData.name,
        content: subtaskData.content || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Update subtask
  async updateSubtask(subtaskId: string, subtaskData: SubtaskFormData): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .update({
        name: subtaskData.name,
        content: subtaskData.content || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Delete subtask
  async deleteSubtask(subtaskId: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  },

  // Toggle subtask completion
  async toggleSubtaskComplete(subtaskId: string): Promise<Subtask> {
    // First get the current subtask to check its completion status
    const { data: currentSubtask, error: fetchError } = await supabase
      .from('subtasks')
      .select('complete_date')
      .eq('id', subtaskId)
      .single();

    if (fetchError) {
      console.error('Error fetching subtask:', fetchError);
      throw fetchError;
    }

    const isCompleted = !!currentSubtask.complete_date;
    const newCompleteDate = isCompleted ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from('subtasks')
      .update({
        complete_date: newCompleteDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling subtask completion:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: data.complete_date ? new Date(data.complete_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Add subtask group
  async addSubtaskGroup(taskId: string, groupName: string): Promise<SubtaskGroup> {
    const { data, error } = await supabase
      .from('subtask_groups')
      .insert({
        task_id: taskId,
        name: groupName
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subtask group:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      subtasks: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Delete subtask group
  async deleteSubtaskGroup(groupId: string): Promise<void> {
    const { error } = await supabase
      .from('subtask_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting subtask group:', error);
      throw error;
    }
  },

  // Move subtask between groups
  async moveSubtask(subtaskId: string, targetGroupId: string | null): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .update({
        subtask_group_id: targetGroupId,
        updated_at: new Date().toISOString()
      })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error moving subtask:', error);
      throw error;
    }
  }
};
