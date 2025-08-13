import { db } from "@/lib/db";
import { taskOperations } from "./taskOperations";
import { subtaskOperations } from "./subtaskOperations";
import { subtaskGroupOperations } from "./subtaskGroupOperations";
import { tagOperations } from "./tagOperations";

// Helper function to get current user ID from context
export function getCurrentUserId(): string | null {
  // This will be set by middleware or auth context
  return localStorage.getItem('current_user_id');
}

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
