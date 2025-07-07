
import { Tag } from './tag';

export interface Subtask {
  id: string;
  name: string;
  content: string;
  dueDate?: Date;
  completeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  orderIndex: number;
}

export interface SubtaskGroup {
  id: string;
  name: string;
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  orderIndex: number;
}

export interface Task {
  id: string;
  name: string;
  content: string;
  dueDate?: Date;
  completeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  subtasks: Subtask[];
  subtaskGroups: SubtaskGroup[];
  tags: Tag[];
}

export interface TaskFormData {
  name: string;
  content: string;
  dueDate?: Date;
  tagIds?: string[];
}

export interface SubtaskFormData {
  name: string;
  content: string;
}
