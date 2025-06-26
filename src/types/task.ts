
export interface Subtask {
  id: string;
  name: string;
  content: string;
  dueDate?: Date;
  completeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubtaskGroup {
  id: string;
  name: string;
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
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
}

export interface TaskFormData {
  name: string;
  content: string;
  dueDate?: Date;
}

export interface SubtaskFormData {
  name: string;
  content: string;
}
