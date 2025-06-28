import { supabase } from "@/integrations/supabase/client";
import { Task, TaskFormData, SubtaskFormData } from "@/types/task";

export const taskService = {
  // Get all tasks for the current user with subtasks and subtask groups
  async getTasks(): Promise<Task[]> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks (*),
        subtask_groups (
          *,
          subtasks (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return tasks.map(task => ({
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completeDate: task.complete_date ? new Date(task.complete_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      subtasks: task.subtasks.map((subtask: any) => ({
        ...subtask,
        dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
        completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
        createdAt: new Date(subtask.created_at),
        updatedAt: new Date(subtask.updated_at),
      })),
      subtaskGroups: task.subtask_groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.created_at),
        updatedAt: new Date(group.updated_at),
        subtasks: group.subtasks.map((subtask: any) => ({
          ...subtask,
          dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
          completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
          createdAt: new Date(subtask.created_at),
          updatedAt: new Date(subtask.updated_at),
        })),
      })),
    }));
  },

  // Get a specific task
  async getTask(taskId: string): Promise<Task> {
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks (*),
        subtask_groups (
          *,
          subtasks (*)
        )
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      throw error;
    }

    return {
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completeDate: task.complete_date ? new Date(task.complete_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      subtasks: task.subtasks.map((subtask: any) => ({
        ...subtask,
        dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
        completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
        createdAt: new Date(subtask.created_at),
        updatedAt: new Date(subtask.updated_at),
      })),
      subtaskGroups: task.subtask_groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.created_at),
        updatedAt: new Date(group.updated_at),
        subtasks: group.subtasks.map((subtask: any) => ({
          ...subtask,
          dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
          completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
          createdAt: new Date(subtask.created_at),
          updatedAt: new Date(subtask.updated_at),
        })),
      })),
    };
  },

  // Create a new task
  async createTask(data: TaskFormData): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        name: data.name,
        content: data.content,
        due_date: data.dueDate ? data.dueDate.toISOString().split('T')[0] : null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return {
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completeDate: task.complete_date ? new Date(task.complete_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      subtasks: [],
      subtaskGroups: [],
    };
  },

  // Update an existing task
  async updateTask(taskId: string, data: TaskFormData): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        name: data.name,
        content: data.content,
        due_date: data.dueDate ? data.dueDate.toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
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
  async toggleTaskComplete(taskId: string): Promise<void> {
    // First get the current task
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('complete_date')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      console.error('Error fetching task:', fetchError);
      throw fetchError;
    }

    const newCompleteDate = task.complete_date ? null : new Date().toISOString();

    const { error } = await supabase
      .from('tasks')
      .update({
        complete_date: newCompleteDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
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

  // Add subtask
  async addSubtask(taskId: string, subtaskData: SubtaskFormData, subtaskGroupId?: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        subtask_group_id: subtaskGroupId || null,
        name: subtaskData.name,
        content: subtaskData.content,
      });

    if (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  },

  // Update subtask
  async updateSubtask(subtaskId: string, subtaskData: SubtaskFormData): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .update({
        name: subtaskData.name,
        content: subtaskData.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
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
  async toggleSubtaskComplete(subtaskId: string): Promise<void> {
    // First get the current subtask
    const { data: subtask, error: fetchError } = await supabase
      .from('subtasks')
      .select('complete_date')
      .eq('id', subtaskId)
      .single();

    if (fetchError) {
      console.error('Error fetching subtask:', fetchError);
      throw fetchError;
    }

    const isCompleted = !!subtask.complete_date;
    const { error } = await supabase
      .from('subtasks')
      .update({
        complete_date: isCompleted ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error toggling subtask completion:', error);
      throw error;
    }
  },

  // Add subtask group
  async addSubtaskGroup(taskId: string, groupName: string): Promise<void> {
    const { error } = await supabase
      .from('subtask_groups')
      .insert({
        task_id: taskId,
        name: groupName,
      });

    if (error) {
      console.error('Error adding subtask group:', error);
      throw error;
    }
  },

  // Update subtask group
  async updateSubtaskGroup(groupId: string, groupName: string): Promise<void> {
    const { error } = await supabase
      .from('subtask_groups')
      .update({
        name: groupName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (error) {
      console.error('Error updating subtask group:', error);
      throw error;
    }
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

  // Move subtask
  async moveSubtask(subtaskId: string, targetGroupId: string | null): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .update({
        subtask_group_id: targetGroupId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error moving subtask:', error);
      throw error;
    }
  },

  // New reordering functions
  async reorderSubtasks(subtaskIds: string[], groupId?: string): Promise<void> {
    // For now, we'll update the order by updating timestamps
    // In a production app, you'd want a proper order field in the database
    const promises = subtaskIds.map((id, index) =>
      supabase
        .from('subtasks')
        .update({
          updated_at: new Date(Date.now() + index).toISOString(),
        })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    
    for (const result of results) {
      if (result.error) {
        console.error('Error reordering subtasks:', result.error);
        throw result.error;
      }
    }
  },

  async reorderSubtaskGroups(taskId: string, groupIds: string[]): Promise<void> {
    // For now, we'll update the order by updating timestamps
    // In a production app, you'd want a proper order field in the database
    const promises = groupIds.map((id, index) =>
      supabase
        .from('subtask_groups')
        .update({
          updated_at: new Date(Date.now() + index).toISOString(),
        })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    
    for (const result of results) {
      if (result.error) {
        console.error('Error reordering subtask groups:', result.error);
        throw result.error;
      }
    }
  }
};
