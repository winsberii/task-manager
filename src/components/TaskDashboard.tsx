
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { taskService } from '@/services/taskService';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskDetail } from '@/components/TaskDetail';
import { Task, TaskFormData, SubtaskFormData } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

export const TaskDashboard = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
      console.error('Create task error:', error);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }: { taskId: string; taskData: TaskFormData }) =>
      taskService.updateTask(taskId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      setEditingTask(null);
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
      console.error('Update task error:', error);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
      console.error('Delete task error:', error);
    },
  });

  // Toggle task completion mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: taskService.toggleTaskComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
      console.error('Toggle complete error:', error);
    },
  });

  // Copy task mutation
  const copyTaskMutation = useMutation({
    mutationFn: taskService.copyTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task copied successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to copy task',
        variant: 'destructive',
      });
      console.error('Copy task error:', error);
    },
  });

  // Add subtask mutation
  const addSubtaskMutation = useMutation({
    mutationFn: ({ taskId, subtaskData, subtaskGroupId }: { 
      taskId: string; 
      subtaskData: SubtaskFormData; 
      subtaskGroupId?: string 
    }) => taskService.addSubtask(taskId, subtaskData, subtaskGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add subtask',
        variant: 'destructive',
      });
      console.error('Add subtask error:', error);
    },
  });

  // Update subtask mutation
  const updateSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, subtaskData }: { subtaskId: string; subtaskData: SubtaskFormData }) =>
      taskService.updateSubtask(subtaskId, subtaskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update subtask',
        variant: 'destructive',
      });
      console.error('Update subtask error:', error);
    },
  });

  // Delete subtask mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) => taskService.deleteSubtask(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete subtask',
        variant: 'destructive',
      });
      console.error('Delete subtask error:', error);
    },
  });

  // Toggle subtask completion mutation
  const toggleSubtaskCompleteMutation = useMutation({
    mutationFn: (subtaskId: string) => taskService.toggleSubtaskComplete(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update subtask status',
        variant: 'destructive',
      });
      console.error('Toggle subtask complete error:', error);
    },
  });

  // Add subtask group mutation
  const addSubtaskGroupMutation = useMutation({
    mutationFn: ({ taskId, groupName }: { taskId: string; groupName: string }) =>
      taskService.addSubtaskGroup(taskId, groupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask group added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add subtask group',
        variant: 'destructive',
      });
      console.error('Add subtask group error:', error);
    },
  });

  // Delete subtask group mutation
  const deleteSubtaskGroupMutation = useMutation({
    mutationFn: (groupId: string) => taskService.deleteSubtaskGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask group deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete subtask group',
        variant: 'destructive',
      });
      console.error('Delete subtask group error:', error);
    },
  });

  // Move subtask mutation
  const moveSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, targetGroupId }: { subtaskId: string; targetGroupId: string | null }) =>
      taskService.moveSubtask(subtaskId, targetGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Subtask moved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to move subtask',
        variant: 'destructive',
      });
      console.error('Move subtask error:', error);
    },
  });

  const handleCreateTask = (taskData: TaskFormData) => {
    createTaskMutation.mutate(taskData);
  };

  const handleUpdateTask = (taskData: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ taskId: editingTask.id, taskData });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleToggleComplete = (taskId: string) => {
    toggleCompleteMutation.mutate(taskId);
  };

  const handleCopyTask = (taskId: string) => {
    copyTaskMutation.mutate(taskId);
  };

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  if (selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600">Error loading tasks. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tasks yet. Create your first task to get started!</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleToggleComplete}
              onClick={(task) => handleOpenTask(task.id)}
              onCopy={handleCopyTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  );
};
