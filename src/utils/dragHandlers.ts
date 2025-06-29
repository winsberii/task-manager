
import { Task } from '@/types/task';
import { taskService } from '@/services/taskService';
import { useQueryClient } from '@tanstack/react-query';

export const createDragEndHandler = (
  task: Task,
  reorderSubtasksMutation: any,
  reorderSubtaskGroupsMutation: any,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: any
) => {
  return (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Show optimistic UI feedback
    toast({
      title: "Reordering...",
      description: "Updating order, please wait",
    });

    if (type === 'subtask-group') {
      const groupIds = task.subtaskGroups
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(group => group.id);
      const [removed] = groupIds.splice(source.index, 1);
      groupIds.splice(destination.index, 0, removed);
      
      reorderSubtaskGroupsMutation.mutate({ taskId: task.id, groupIds });
    } else if (type === 'subtask') {
      const sourceGroupId = source.droppableId === 'ungrouped' ? undefined : source.droppableId;
      const destGroupId = destination.droppableId === 'ungrouped' ? undefined : destination.droppableId;

      if (sourceGroupId === destGroupId) {
        // Reordering within the same group or ungrouped area
        const ungroupedSubtasks = task.subtasks
          .filter(subtask => 
            !task.subtaskGroups.some(group => 
              group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
            )
          )
          .sort((a, b) => a.orderIndex - b.orderIndex);
        
        const subtasks = sourceGroupId 
          ? task.subtaskGroups.find(g => g.id === sourceGroupId)?.subtasks.sort((a, b) => a.orderIndex - b.orderIndex) || []
          : ungroupedSubtasks;
        
        const subtaskIds = subtasks.map(s => s.id);
        const [removed] = subtaskIds.splice(source.index, 1);
        subtaskIds.splice(destination.index, 0, removed);
        
        reorderSubtasksMutation.mutate({ subtaskIds, groupId: sourceGroupId });
      } else {
        // Moving between groups
        const ungroupedSubtasks = task.subtasks
          .filter(subtask => 
            !task.subtaskGroups.some(group => 
              group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
            )
          )
          .sort((a, b) => a.orderIndex - b.orderIndex);
        
        const subtaskId = sourceGroupId 
          ? task.subtaskGroups.find(g => g.id === sourceGroupId)?.subtasks.sort((a, b) => a.orderIndex - b.orderIndex)[source.index]?.id
          : ungroupedSubtasks[source.index]?.id;
        
        if (subtaskId) {
          taskService.moveSubtask(subtaskId, destGroupId || null, destination.index).then(() => {
            queryClient.invalidateQueries({ queryKey: ['task', task.id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast({
              title: 'Success',
              description: 'Subtask moved successfully',
            });
          }).catch(() => {
            toast({
              title: 'Error',
              description: 'Failed to move subtask',
              variant: 'destructive',
            });
          });
        }
      }
    }
  };
};

export const createCopySubtaskUrl = (taskId: string, toast: any) => {
  return (subtaskId: string) => {
    const url = `${window.location.origin}/task/${taskId}/subtask/${subtaskId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Subtask link has been copied to clipboard",
    });
  };
};
