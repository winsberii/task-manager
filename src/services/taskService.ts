
import { taskOperations } from "./taskOperations";
import { subtaskOperations } from "./subtaskOperations";
import { subtaskGroupOperations } from "./subtaskGroupOperations";
import { tagOperations } from "./tagOperations";

export const taskService = {
  // Task operations
  ...taskOperations,
  
  // Subtask operations
  ...subtaskOperations,
  
  // Subtask group operations
  ...subtaskGroupOperations,
  
  // Tag operations
  ...tagOperations,
};
