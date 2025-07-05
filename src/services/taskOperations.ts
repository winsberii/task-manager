
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskFormData } from "@/types/task";
import { TaskServiceInterface } from "./types";

export const taskOperations: TaskServiceInterface = {
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
      subtasks: task.subtasks
        .map((subtask: any) => ({
          ...subtask,
          dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
          completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
          createdAt: new Date(subtask.created_at),
          updatedAt: new Date(subtask.updated_at),
          orderIndex: subtask.order_index ?? 0,
        }))
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
      subtaskGroups: task.subtask_groups
        .map((group: any) => ({
          ...group,
          createdAt: new Date(group.created_at),
          updatedAt: new Date(group.updated_at),
          orderIndex: group.order_index ?? 0,
          subtasks: group.subtasks
            .map((subtask: any) => ({
              ...subtask,
              dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
              completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
              createdAt: new Date(subtask.created_at),
              updatedAt: new Date(subtask.updated_at),
              orderIndex: subtask.order_index ?? 0,
            }))
            .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
        }))
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
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
      subtasks: task.subtasks
        .map((subtask: any) => ({
          ...subtask,
          dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
          completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
          createdAt: new Date(subtask.created_at),
          updatedAt: new Date(subtask.updated_at),
          orderIndex: subtask.order_index ?? 0,
        }))
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
      subtaskGroups: task.subtask_groups
        .map((group: any) => ({
          ...group,
          createdAt: new Date(group.created_at),
          updatedAt: new Date(group.updated_at),
          orderIndex: group.order_index ?? 0,
          subtasks: group.subtasks
            .map((subtask: any) => ({
              ...subtask,
              dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
              completeDate: subtask.complete_date ? new Date(subtask.complete_date) : undefined,
              createdAt: new Date(subtask.created_at),
              updatedAt: new Date(subtask.updated_at),
              orderIndex: subtask.order_index ?? 0,
            }))
            .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
        }))
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex),
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

  // Copy a task with all subtasks and subtask groups
  async copyTask(taskId: string): Promise<Task> {
    // First get the original task with all its subtasks and groups
    const originalTask = await this.getTask(taskId);

    // Create the new task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name: `${originalTask.name} (Copy)`,
        content: originalTask.content,
        due_date: originalTask.dueDate ? originalTask.dueDate.toISOString().split('T')[0] : null,
        user_id: originalTask.user_id || (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error copying task:', error);
      throw error;
    }

    const newTaskId = data.id;

    // Copy subtask groups with their order
    const groupIdMapping: { [oldId: string]: string } = {};
    
    for (const group of originalTask.subtaskGroups) {
      const { data: newGroup, error: groupError } = await supabase
        .from('subtask_groups')
        .insert({
          task_id: newTaskId,
          name: group.name,
          order_index: group.orderIndex,
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error copying subtask group:', groupError);
        throw groupError;
      }

      groupIdMapping[group.id] = newGroup.id;

      // Copy subtasks within this group
      for (const subtask of group.subtasks) {
        const { error: subtaskError } = await supabase
          .from('subtasks')
          .insert({
            task_id: newTaskId,
            subtask_group_id: newGroup.id,
            name: subtask.name,
            content: subtask.content,
            due_date: subtask.dueDate ? subtask.dueDate.toISOString().split('T')[0] : null,
            order_index: subtask.orderIndex,
            // Explicitly set complete_date to null to clear completion status
            complete_date: null,
          });

        if (subtaskError) {
          console.error('Error copying subtask in group:', subtaskError);
          throw subtaskError;
        }
      }
    }

    // Copy ungrouped subtasks (those not in any group)
    const ungroupedSubtasks = originalTask.subtasks.filter(subtask => 
      !originalTask.subtaskGroups.some(group => 
        group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
      )
    );

    for (const subtask of ungroupedSubtasks) {
      const { error: subtaskError } = await supabase
        .from('subtasks')
        .insert({
          task_id: newTaskId,
          subtask_group_id: null,
          name: subtask.name,
          content: subtask.content,
          due_date: subtask.dueDate ? subtask.dueDate.toISOString().split('T')[0] : null,
          order_index: subtask.orderIndex,
          // Explicitly set complete_date to null to clear completion status
          complete_date: null,
        });

      if (subtaskError) {
        console.error('Error copying ungrouped subtask:', subtaskError);
        throw subtaskError;
      }
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: undefined, // Clear completion status for the copied task
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subtasks: [],
      subtaskGroups: []
    };
  },
};
