
import { taskOperations } from "./taskOperations";
import { subtaskOperations } from "./subtaskOperations";
import { subtaskGroupOperations } from "./subtaskGroupOperations";

export const taskService = {
  // Task operations
  ...taskOperations,
  
  // Subtask operations
  ...subtaskOperations,
  
  // Subtask group operations
  ...subtaskGroupOperations,
};
