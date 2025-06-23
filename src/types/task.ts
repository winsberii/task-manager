
export interface Subtask {
  id: string;
  name: string;
  content?: string;
  dueDate?: Date;
  completeDate?: Date;
}

export interface SubtaskGroup {
  id: string;
  name: string;
  subtasks: Subtask[];
}

export interface Task {
  id: string;
  name: string;
  content?: string;
  dueDate?: Date;
  subtasks: Subtask[];
  subtaskGroups: SubtaskGroup[];
  completeDate?: Date;
}

export interface TaskFormData {
  name: string;
  content: string;
  dueDate?: Date;
}

export interface SubtaskFormData {
  name: string;
  content: string;
  dueDate?: Date;
}
