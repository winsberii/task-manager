import { db } from "@/lib/db";
import { getCurrentUserId } from "./taskService";
import { Task, TaskFormData } from "@/types/task";
import { TaskServiceInterface } from "./types";

export const taskOperations: TaskServiceInterface = {
  // Get all tasks for the current user with subtasks, subtask groups, and tags
  async getTasks(): Promise<Task[]> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const tasks = await db`
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'content', s.content,
              'due_date', s.due_date,
              'complete_date', s.complete_date,
              'created_at', s.created_at,
              'updated_at', s.updated_at,
              'order_index', s.order_index,
              'skipped', s.skipped,
              'subtask_group_id', s.subtask_group_id
            )
          ) FILTER (WHERE s.id IS NOT NULL AND s.subtask_group_id IS NULL), 
          '[]'
        ) as subtasks,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', sg.id,
              'name', sg.name,
              'created_at', sg.created_at,
              'updated_at', sg.updated_at,
              'order_index', sg.order_index,
              'subtasks', COALESCE(sg_subtasks.subtasks, '[]'::json)
            )
          ) FILTER (WHERE sg.id IS NOT NULL),
          '[]'
        ) as subtask_groups,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tag.id,
              'name', tag.name,
              'color', tag.color,
              'created_at', tag.created_at,
              'updated_at', tag.updated_at
            )
          ) FILTER (WHERE tag.id IS NOT NULL),
          '[]'
        ) as tags
      FROM tasks t
      LEFT JOIN subtasks s ON t.id = s.task_id AND s.subtask_group_id IS NULL
      LEFT JOIN subtask_groups sg ON t.id = sg.task_id
      LEFT JOIN LATERAL (
        SELECT json_agg(
          jsonb_build_object(
            'id', gs.id,
            'name', gs.name,
            'content', gs.content,
            'due_date', gs.due_date,
            'complete_date', gs.complete_date,
            'created_at', gs.created_at,
            'updated_at', gs.updated_at,
            'order_index', gs.order_index,
            'skipped', gs.skipped
          ) ORDER BY gs.order_index
        ) as subtasks
        FROM subtasks gs
        WHERE gs.subtask_group_id = sg.id
      ) sg_subtasks ON sg.id IS NOT NULL
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tag ON tt.tag_id = tag.id
      WHERE t.user_id = ${userId}
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

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
      tags: task.task_tags?.map((taskTag: any) => ({
        ...taskTag.tags,
        createdAt: new Date(taskTag.tags.created_at),
        updatedAt: new Date(taskTag.tags.updated_at),
      })) || [],
    }));
  },

  // Get a specific task
  async getTask(taskId: string): Promise<Task> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const [task] = await db`
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'content', s.content,
              'due_date', s.due_date,
              'complete_date', s.complete_date,
              'created_at', s.created_at,
              'updated_at', s.updated_at,
              'order_index', s.order_index,
              'skipped', s.skipped,
              'subtask_group_id', s.subtask_group_id
            )
          ) FILTER (WHERE s.id IS NOT NULL AND s.subtask_group_id IS NULL), 
          '[]'
        ) as subtasks,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', sg.id,
              'name', sg.name,
              'created_at', sg.created_at,
              'updated_at', sg.updated_at,
              'order_index', sg.order_index,
              'subtasks', COALESCE(sg_subtasks.subtasks, '[]'::json)
            )
          ) FILTER (WHERE sg.id IS NOT NULL),
          '[]'
        ) as subtask_groups,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tag.id,
              'name', tag.name,
              'color', tag.color,
              'created_at', tag.created_at,
              'updated_at', tag.updated_at
            )
          ) FILTER (WHERE tag.id IS NOT NULL),
          '[]'
        ) as tags
      FROM tasks t
      LEFT JOIN subtasks s ON t.id = s.task_id AND s.subtask_group_id IS NULL
      LEFT JOIN subtask_groups sg ON t.id = sg.task_id
      LEFT JOIN LATERAL (
        SELECT json_agg(
          jsonb_build_object(
            'id', gs.id,
            'name', gs.name,
            'content', gs.content,
            'due_date', gs.due_date,
            'complete_date', gs.complete_date,
            'created_at', gs.created_at,
            'updated_at', gs.updated_at,
            'order_index', gs.order_index,
            'skipped', gs.skipped
          ) ORDER BY gs.order_index
        ) as subtasks
        FROM subtasks gs
        WHERE gs.subtask_group_id = sg.id
      ) sg_subtasks ON sg.id IS NOT NULL
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tag ON tt.tag_id = tag.id
      WHERE t.id = ${taskId} AND t.user_id = ${userId}
      GROUP BY t.id
    `;

    if (!task) {
      throw new Error('Task not found');
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
      tags: task.task_tags?.map((taskTag: any) => ({
        ...taskTag.tags,
        createdAt: new Date(taskTag.tags.created_at),
        updatedAt: new Date(taskTag.tags.updated_at),
      })) || [],
    };
  },

  // Create a new task
  async createTask(data: TaskFormData): Promise<Task> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const [task] = await db`
      INSERT INTO tasks (name, content, due_date, user_id)
      VALUES (${data.name}, ${data.content}, ${data.dueDate ? data.dueDate.toISOString().split('T')[0] : null}, ${userId})
      RETURNING *
    `;

    // Add tags if provided
    if (data.tagIds && data.tagIds.length > 0) {
      const { tagOperations } = await import('./tagOperations');
      await tagOperations.addTagsToTask(task.id, data.tagIds);
    }

    return {
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completeDate: task.complete_date ? new Date(task.complete_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      subtasks: [],
      subtaskGroups: [],
      tags: [],
    };
  },

  // Update an existing task
  async updateTask(taskId: string, data: TaskFormData): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    await db`
      UPDATE tasks 
      SET 
        name = ${data.name},
        content = ${data.content},
        due_date = ${data.dueDate ? data.dueDate.toISOString().split('T')[0] : null},
        updated_at = now()
      WHERE id = ${taskId} AND user_id = ${userId}
    `;

    // Update tags if provided
    if (data.tagIds !== undefined) {
      const { tagOperations } = await import('./tagOperations');
      await tagOperations.updateTaskTags(taskId, data.tagIds);
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    await db`
      DELETE FROM tasks 
      WHERE id = ${taskId} AND user_id = ${userId}
    `;
  },

  // Toggle task completion
  async toggleTaskComplete(taskId: string): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // First get the current task
    const [task] = await db`
      SELECT complete_date FROM tasks 
      WHERE id = ${taskId} AND user_id = ${userId}
    `;

    if (!task) {
      throw new Error('Task not found');
    }

    const newCompleteDate = task.complete_date ? null : new Date().toISOString();

    await db`
      UPDATE tasks 
      SET 
        complete_date = ${newCompleteDate},
        updated_at = now()
      WHERE id = ${taskId} AND user_id = ${userId}
    `;
  },

  // Copy a task with all subtasks and subtask groups (but without tags)
  async copyTask(taskId: string): Promise<Task> {
    const originalTask = await taskOperations.getTask(taskId);

    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const [data] = await db`
      INSERT INTO tasks (name, content, due_date, user_id)
      VALUES (
        ${`${originalTask.name} (Copy)`},
        ${originalTask.content},
        ${originalTask.dueDate ? originalTask.dueDate.toISOString().split('T')[0] : null},
        ${userId}
      )
      RETURNING *
    `;

    const newTaskId = data.id;

    const groupIdMapping: { [oldId: string]: string } = {};
    
    for (const group of originalTask.subtaskGroups) {
      const [newGroup] = await db`
        INSERT INTO subtask_groups (task_id, name, order_index)
        VALUES (${newTaskId}, ${group.name}, ${group.orderIndex})
        RETURNING *
      `;

      groupIdMapping[group.id] = newGroup.id;

      for (const subtask of group.subtasks) {
         await db`
           INSERT INTO subtasks (
             task_id, subtask_group_id, name, content, due_date, 
             order_index, complete_date, skipped
           )
           VALUES (
             ${newTaskId}, ${newGroup.id}, ${subtask.name}, ${subtask.content},
             ${subtask.dueDate ? subtask.dueDate.toISOString().split('T')[0] : null},
             ${subtask.orderIndex}, null, false
           )
         `;
      }
    }

    const ungroupedSubtasks = originalTask.subtasks.filter(subtask => 
      !originalTask.subtaskGroups.some(group => 
        group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
      )
    );

    for (const subtask of ungroupedSubtasks) {
       await db`
         INSERT INTO subtasks (
           task_id, subtask_group_id, name, content, due_date,
           order_index, complete_date, skipped
         )
         VALUES (
           ${newTaskId}, null, ${subtask.name}, ${subtask.content},
           ${subtask.dueDate ? subtask.dueDate.toISOString().split('T')[0] : null},
           ${subtask.orderIndex}, null, false
         )
       `;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content || '',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      completeDate: undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subtasks: [],
      subtaskGroups: [],
      tags: []
    };
  },
};
