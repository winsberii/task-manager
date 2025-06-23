
import { Task, TaskFormData, Subtask, SubtaskFormData, SubtaskGroup } from '../types/task';

class TaskService {
  private tasks: Task[] = [
    {
      id: '1',
      name: 'Build Task Management App',
      content: 'Create a comprehensive task management application with React and TypeScript',
      dueDate: new Date('2024-07-01'),
      subtasks: [
        {
          id: 'st1',
          name: 'Set up project structure',
          content: 'Initialize React app with TypeScript and Tailwind',
          completeDate: new Date()
        },
        {
          id: 'st2',
          name: 'Create task components',
          content: 'Build task list, task card, and task form components'
        }
      ],
      subtaskGroups: [
        {
          id: 'sg1',
          name: 'Frontend Development',
          subtasks: [
            {
              id: 'st3',
              name: 'Design UI components',
              content: 'Create reusable UI components'
            },
            {
              id: 'st4',
              name: 'Implement drag and drop',
              content: 'Add drag and drop functionality for subtasks'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Learn React Hooks',
      content: 'Master advanced React hooks patterns',
      dueDate: new Date('2024-06-25'),
      subtasks: [],
      subtaskGroups: []
    }
  ];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  createTask(taskData: TaskFormData): Task {
    const newTask: Task = {
      id: Date.now().toString(),
      name: taskData.name,
      content: taskData.content,
      dueDate: taskData.dueDate,
      subtasks: [],
      subtaskGroups: []
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, taskData: Partial<TaskFormData>): Task | null {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;
    
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
    return this.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;
    
    this.tasks.splice(taskIndex, 1);
    return true;
  }

  copyTask(id: string): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const copiedTask: Task = {
      ...task,
      id: Date.now().toString(),
      name: `${task.name} (Copy)`,
      completeDate: undefined,
      subtasks: task.subtasks.map(subtask => ({
        ...subtask,
        id: Date.now().toString() + Math.random(),
        completeDate: undefined
      })),
      subtaskGroups: task.subtaskGroups.map(group => ({
        ...group,
        id: Date.now().toString() + Math.random(),
        subtasks: group.subtasks.map(subtask => ({
          ...subtask,
          id: Date.now().toString() + Math.random(),
          completeDate: undefined
        }))
      }))
    };
    
    this.tasks.push(copiedTask);
    return copiedTask;
  }

  completeTask(id: string): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    task.completeDate = task.completeDate ? undefined : new Date();
    return task;
  }

  addSubtask(taskId: string, subtaskData: SubtaskFormData): Subtask | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      name: subtaskData.name,
      content: subtaskData.content,
      dueDate: subtaskData.dueDate
    };

    task.subtasks.push(newSubtask);
    return newSubtask;
  }

  updateSubtask(taskId: string, subtaskId: string, subtaskData: Partial<SubtaskFormData>): Subtask | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex === -1) return null;

    task.subtasks[subtaskIndex] = { ...task.subtasks[subtaskIndex], ...subtaskData };
    return task.subtasks[subtaskIndex];
  }

  deleteSubtask(taskId: string, subtaskId: string): boolean {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex === -1) return false;

    task.subtasks.splice(subtaskIndex, 1);
    return true;
  }

  completeSubtask(taskId: string, subtaskId: string): Subtask | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return null;

    subtask.completeDate = subtask.completeDate ? undefined : new Date();
    return subtask;
  }

  addSubtaskGroup(taskId: string, groupName: string): SubtaskGroup | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const newGroup: SubtaskGroup = {
      id: Date.now().toString(),
      name: groupName,
      subtasks: []
    };

    task.subtaskGroups.push(newGroup);
    return newGroup;
  }

  deleteSubtaskGroup(taskId: string, groupId: string): boolean {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    const groupIndex = task.subtaskGroups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) return false;

    task.subtaskGroups.splice(groupIndex, 1);
    return true;
  }
}

export const taskService = new TaskService();
