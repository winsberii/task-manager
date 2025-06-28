
import { useEffect } from 'react';
import { Task } from '../types/task';
import { TaskDetailHeader } from './task-detail/TaskDetailHeader';
import { TaskInfo } from './task-detail/TaskInfo';
import { SubtasksList } from './task-detail/SubtasksList';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  highlightSubtaskId?: string;
}

export const TaskDetail = ({ task, onBack, highlightSubtaskId }: TaskDetailProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations for real-time sync
  const addSubtaskMutation = useMutation({
    mutationFn: ({ taskId, data, subtaskGroupId }: { taskId: string; data: any; subtaskGroupId?: string }) => 
      taskService.addSubtask(taskId, data, subtaskGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, data }: { subtaskId: string; data: any }) => 
      taskService.updateSubtask(subtaskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => 
      taskService.deleteSubtask(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completeSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => 
      taskService.toggleSubtaskComplete(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const addSubtaskGroupMutation = useMutation({
    mutationFn: ({ taskId, groupName }: { taskId: string; groupName: string }) => 
      taskService.addSubtaskGroup(taskId, groupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateSubtaskGroupMutation = useMutation({
    mutationFn: ({ groupId, groupName }: { groupId: string; groupName: string }) => 
      taskService.updateSubtaskGroup(groupId, groupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Group updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update group',
        variant: 'destructive',
      });
    },
  });

  const deleteSubtaskGroupMutation = useMutation({
    mutationFn: (groupId: string) => 
      taskService.deleteSubtaskGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.toggleTaskComplete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => 
      taskService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  const reorderSubtasksMutation = useMutation({
    mutationFn: ({ subtaskIds, groupId }: { subtaskIds: string[]; groupId?: string }) => 
      taskService.reorderSubtasks(subtaskIds, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const reorderSubtaskGroupsMutation = useMutation({
    mutationFn: ({ taskId, groupIds }: { taskId: string; groupIds: string[] }) => 
      taskService.reorderSubtaskGroups(taskId, groupIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const copySubtaskUrl = (subtaskId: string) => {
    const url = `${window.location.origin}/task/${task.id}/subtask/${subtaskId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Subtask link has been copied to clipboard",
    });
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'subtask-group') {
      const groupIds = task.subtaskGroups.map(group => group.id);
      const [removed] = groupIds.splice(source.index, 1);
      groupIds.splice(destination.index, 0, removed);
      
      reorderSubtaskGroupsMutation.mutate({ taskId: task.id, groupIds });
    } else if (type === 'subtask') {
      const sourceGroupId = source.droppableId === 'ungrouped' ? undefined : source.droppableId;
      const destGroupId = destination.droppableId === 'ungrouped' ? undefined : destination.droppableId;

      if (sourceGroupId === destGroupId) {
        const ungroupedSubtasks = task.subtasks.filter(subtask => 
          !task.subtaskGroups.some(group => 
            group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
          )
        );
        
        const subtasks = sourceGroupId 
          ? task.subtaskGroups.find(g => g.id === sourceGroupId)?.subtasks || []
          : ungroupedSubtasks;
        
        const subtaskIds = subtasks.map(s => s.id);
        const [removed] = subtaskIds.splice(source.index, 1);
        subtaskIds.splice(destination.index, 0, removed);
        
        reorderSubtasksMutation.mutate({ subtaskIds, groupId: sourceGroupId });
      } else {
        const ungroupedSubtasks = task.subtasks.filter(subtask => 
          !task.subtaskGroups.some(group => 
            group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
          )
        );
        
        const subtaskId = sourceGroupId 
          ? task.subtaskGroups.find(g => g.id === sourceGroupId)?.subtasks[source.index]?.id
          : ungroupedSubtasks[source.index]?.id;
        
        if (subtaskId) {
          taskService.moveSubtask(subtaskId, destGroupId || null).then(() => {
            queryClient.invalidateQueries({ queryKey: ['task', task.id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          });
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
    }, 30000);

    return () => clearInterval(interval);
  }, [task.id, queryClient]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TaskDetailHeader taskId={task.id} onBack={onBack} />
      
      <TaskInfo 
        task={task}
        onUpdateTask={(taskId, data) => updateTaskMutation.mutate({ taskId, data })}
        onCompleteTask={(taskId) => completeTaskMutation.mutate(taskId)}
      />

      <SubtasksList
        task={task}
        highlightSubtaskId={highlightSubtaskId}
        onAddSubtask={(data) => addSubtaskMutation.mutate({ taskId: task.id, data })}
        onAddGroup={(groupName) => addSubtaskGroupMutation.mutate({ taskId: task.id, groupName })}
        onAddSubtaskToGroup={(groupId, data) => addSubtaskMutation.mutate({ taskId: task.id, data, subtaskGroupId: groupId })}
        onUpdateSubtask={(subtaskId, data) => updateSubtaskMutation.mutate({ subtaskId, data })}
        onDeleteSubtask={(subtaskId) => deleteSubtaskMutation.mutate(subtaskId)}
        onCompleteSubtask={(subtaskId) => completeSubtaskMutation.mutate(subtaskId)}
        onUpdateGroup={(groupId, groupName) => updateSubtaskGroupMutation.mutate({ groupId, groupName })}
        onDeleteGroup={(groupId) => deleteSubtaskGroupMutation.mutate(groupId)}
        onCopySubtaskUrl={copySubtaskUrl}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};
