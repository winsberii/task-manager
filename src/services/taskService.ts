import { Task, TaskFormData, Subtask, SubtaskFormData, SubtaskGroup } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

class TaskService {
  private readonly STORAGE_KEY = 'tasks';

  private loadTasks(): Task[] {
    const storedTasks = localStorage.getItem(this.STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  }

  getAllTasks(): Task[] {
    return this.loadTasks();
  }

  getTaskById(id: string): Task | undefined {
    return this.loadTasks().find(task => task.id === id);
  }

  createTask(taskData: TaskFormData): Task {
    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      subtasks: [],
      subtaskGroups: [],
    };
    const tasks = this.loadTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  updateTask(id: string, taskData: TaskFormData): Task | undefined {
    const tasks = this.loadTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return undefined;
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
    this.saveTasks(tasks);
    return tasks[taskIndex];
  }

  deleteTask(id: string): void {
    let tasks = this.loadTasks();
    tasks = tasks.filter(task => task.id !== id);
    this.saveTasks(tasks);
  }

  copyTask(id: string): Task | undefined {
    const tasks = this.loadTasks();
    const taskToCopy = tasks.find(task => task.id === id);

    if (!taskToCopy) {
      return undefined;
    }

    const newTask: Task = {
      ...taskToCopy,
      id: uuidv4(),
      name: `${taskToCopy.name} (Copy)`,
    };

    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  completeTask(id: string): Task | undefined {
    const tasks = this.loadTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return undefined;
    }

    const task = tasks[taskIndex];
    task.completeDate = task.completeDate ? undefined : new Date();
    this.saveTasks(tasks);
    return task;
  }

  addSubtask(taskId: string, subtaskData: SubtaskFormData): Subtask | null {
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const newSubtask: Subtask = {
      id: uuidv4(),
      ...subtaskData,
    };
    task.subtasks.push(newSubtask);
    this.saveTasks(tasks);
    return newSubtask;
  }

  updateSubtask(taskId: string, subtaskId: string, subtaskData: SubtaskFormData): Subtask | null {
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex !== -1) {
      task.subtasks[subtaskIndex] = { ...task.subtasks[subtaskIndex], ...subtaskData };
      this.saveTasks(tasks);
      return task.subtasks[subtaskIndex];
    }

    for (const group of task.subtaskGroups) {
      const subtaskIndex = group.subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex !== -1) {
        group.subtasks[subtaskIndex] = { ...group.subtasks[subtaskIndex], ...subtaskData };
        this.saveTasks(tasks);
        return group.subtasks[subtaskIndex];
      }
    }

    return null;
  }

  deleteSubtask(taskId: string, subtaskId: string): void {
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);

    task.subtaskGroups.forEach(group => {
      group.subtasks = group.subtasks.filter(st => st.id !== subtaskId);
    });

    this.saveTasks(tasks);
  }

  completeSubtask(taskId: string, subtaskId: string): Subtask | null {
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    for (const subtaskList of [task.subtasks, ...task.subtaskGroups.map(g => g.subtasks)]) {
      const subtask = subtaskList.find(st => st.id === subtaskId);
      if (subtask) {
        subtask.completeDate = subtask.completeDate ? undefined : new Date();
        this.saveTasks(tasks);
        return subtask;
      }
    }

    return null;
  }

  addSubtaskGroup(taskId: string, groupName: string): SubtaskGroup | null {
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const newGroup: SubtaskGroup = {
      id: uuidv4(),
      name: groupName,
      subtasks: [],
    };
    task.subtaskGroups.push(newGroup);
    this.saveTasks(tasks);
    return newGroup;
  }

  deleteSubtaskGroup(taskId: string, groupId: string): void {
    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.subtaskGroups = task.subtaskGroups.filter(group => group.id !== groupId);
    this.saveTasks(tasks);
  }

  moveSubtask(
    taskId: string, 
    subtaskId: string, 
    sourceGroupId: string | null, 
    targetGroupId: string | null, 
    targetIndex: number
  ): void {
    const tasks = this.getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let subtaskToMove: Subtask | null = null;

    // Find and remove the subtask from its current location
    if (sourceGroupId === null) {
      // Moving from ungrouped subtasks
      const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex !== -1) {
        subtaskToMove = task.subtasks.splice(subtaskIndex, 1)[0];
      }
    } else {
      // Moving from a group
      const sourceGroup = task.subtaskGroups.find(g => g.id === sourceGroupId);
      if (sourceGroup) {
        const subtaskIndex = sourceGroup.subtasks.findIndex(st => st.id === subtaskId);
        if (subtaskIndex !== -1) {
          subtaskToMove = sourceGroup.subtasks.splice(subtaskIndex, 1)[0];
        }
      }
    }

    if (!subtaskToMove) return;

    // Add the subtask to its new location
    if (targetGroupId === null) {
      // Moving to ungrouped subtasks
      task.subtasks.splice(targetIndex, 0, subtaskToMove);
    } else {
      // Moving to a group
      const targetGroup = task.subtaskGroups.find(g => g.id === targetGroupId);
      if (targetGroup) {
        targetGroup.subtasks.splice(targetIndex, 0, subtaskToMove);
      }
    }

    this.saveTasks(tasks);
  }

  private findSubtask(taskId: string, subtaskId: string): Subtask | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    return task.subtasks.find(st => st.id === subtaskId) ||
      task.subtaskGroups.flatMap(group => group.subtasks).find(st => st.id === subtaskId);
  }
}

export const taskService = new TaskService();
