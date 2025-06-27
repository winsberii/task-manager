import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Calendar, CheckCircle2, Circle, ExternalLink, Copy, ChevronDown, ChevronRight, Edit, Save, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Task, SubtaskFormData, TaskFormData } from '../types/task';
import { SubtaskItem } from './SubtaskItem';
import { format } from 'date-fns';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  highlightSubtaskId?: string;
}

export const TaskDetail = ({ task, onBack, highlightSubtaskId }: TaskDetailProps) => {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ name: '', content: '' });
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddSubtaskInGroup, setShowAddSubtaskInGroup] = useState<string | null>(null);
  const [newGroupSubtask, setNewGroupSubtask] = useState({ name: '', content: '' });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [taskEditData, setTaskEditData] = useState({
    name: task.name,
    content: task.content || ''
  });
  const [subtaskEditData, setSubtaskEditData] = useState<{[key: string]: { name: string; content: string }}>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations for real-time sync
  const addSubtaskMutation = useMutation({
    mutationFn: ({ taskId, data, subtaskGroupId }: { taskId: string; data: SubtaskFormData; subtaskGroupId?: string }) => 
      taskService.addSubtask(taskId, data, subtaskGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, data }: { subtaskId: string; data: SubtaskFormData }) => 
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

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskFormData }) => 
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

  // Filter subtasks to only show those that don't belong to any group
  const ungroupedSubtasks = task.subtasks.filter(subtask => 
    !task.subtaskGroups.some(group => 
      group.subtasks.some(groupSubtask => groupSubtask.id === subtask.id)
    )
  );

  const handleAddSubtask = () => {
    if (newSubtask.name.trim()) {
      addSubtaskMutation.mutate({ taskId: task.id, data: newSubtask });
      setNewSubtask({ name: '', content: '' });
      setShowAddSubtask(false);
    }
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addSubtaskGroupMutation.mutate({ taskId: task.id, groupName: newGroupName });
      setNewGroupName('');
      setShowAddGroup(false);
    }
  };

  const handleAddSubtaskToGroup = (groupId: string) => {
    if (newGroupSubtask.name.trim()) {
      addSubtaskMutation.mutate({ taskId: task.id, data: newGroupSubtask, subtaskGroupId: groupId });
      setNewGroupSubtask({ name: '', content: '' });
      setShowAddSubtaskInGroup(null);
    }
  };

  const handleUpdateSubtask = (subtaskId: string, data: SubtaskFormData) => {
    updateSubtaskMutation.mutate({ subtaskId, data });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtaskMutation.mutate(subtaskId);
  };

  const handleCompleteSubtask = (subtaskId: string) => {
    completeSubtaskMutation.mutate(subtaskId);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleDeleteSubtaskGroup = (groupId: string) => {
    deleteSubtaskGroupMutation.mutate(groupId);
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const copyTaskUrl = () => {
    const url = `${window.location.origin}/task/${task.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Task link has been copied to clipboard",
    });
  };

  const copySubtaskUrl = (subtaskId: string) => {
    const url = `${window.location.origin}/task/${task.id}/subtask/${subtaskId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Subtask link has been copied to clipboard",
    });
  };

  const openTaskInNewWindow = () => {
    window.open(`/task/${task.id}`, '_blank');
  };

  const handleUpdateTask = () => {
    if (taskEditData.name.trim()) {
      updateTaskMutation.mutate({ 
        taskId: task.id, 
        data: {
          name: taskEditData.name,
          content: taskEditData.content,
          dueDate: task.dueDate
        }
      });
      setIsEditingTask(false);
    }
  };

  const handleCancelTaskEdit = () => {
    setTaskEditData({
      name: task.name,
      content: task.content || ''
    });
    setIsEditingTask(false);
  };

  const handleEditSubtask = (subtaskId: string, subtask: any) => {
    setEditingSubtaskId(subtaskId);
    setSubtaskEditData(prev => ({
      ...prev,
      [subtaskId]: {
        name: subtask.name,
        content: subtask.content || ''
      }
    }));
  };

  const handleUpdateSubtaskInline = (subtaskId: string) => {
    const editData = subtaskEditData[subtaskId];
    if (editData && editData.name.trim()) {
      handleUpdateSubtask(subtaskId, editData);
      setEditingSubtaskId(null);
      setSubtaskEditData(prev => {
        const newData = { ...prev };
        delete newData[subtaskId];
        return newData;
      });
    }
  };

  const handleCancelSubtaskEdit = (subtaskId: string) => {
    setEditingSubtaskId(null);
    setSubtaskEditData(prev => {
      const newData = { ...prev };
      delete newData[subtaskId];
      return newData;
    });
  };

  const renderSubtaskItem = (subtask: any, isGrouped = false) => {
    const isEditing = editingSubtaskId === subtask.id;
    const editData = subtaskEditData[subtask.id] || { name: subtask.name, content: subtask.content || '' };

    return (
      <ContextMenu key={subtask.id}>
        <ContextMenuTrigger asChild>
          <div
            id={`subtask-${subtask.id}`}
            className={`flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-50 transition-colors ${
              highlightSubtaskId === subtask.id ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            {isGrouped && <span className="text-gray-400 text-sm mt-0.5">•</span>}
            <button
              onClick={() => handleCompleteSubtask(subtask.id)}
              className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
            >
              {subtask.completeDate ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
            
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={editData.name}
                  onChange={(e) => setSubtaskEditData(prev => ({
                    ...prev,
                    [subtask.id]: { ...editData, name: e.target.value }
                  }))}
                  className="text-sm h-7"
                />
                {editData.content !== undefined && (
                  <Textarea
                    value={editData.content}
                    onChange={(e) => setSubtaskEditData(prev => ({
                      ...prev,
                      [subtask.id]: { ...editData, content: e.target.value }
                    }))}
                    className="text-xs"
                    rows={2}
                  />
                )}
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => handleUpdateSubtaskInline(subtask.id)} className="h-6 text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCancelSubtaskEdit(subtask.id)} className="h-6 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={`text-sm block ${
                      subtask.completeDate ? 'line-through text-gray-500' : isGrouped ? 'text-gray-600' : 'text-gray-700'
                    }`}>
                      {subtask.name}
                    </span>
                    {subtask.content && (
                      <p className={`text-xs mt-0.5 line-clamp-1 ${
                        isGrouped ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {subtask.content}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSubtask(subtask.id, subtask)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 transition-opacity"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleEditSubtask(subtask.id, subtask)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Subtask
          </ContextMenuItem>
          <ContextMenuItem onClick={() => copySubtaskUrl(subtask.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Subtask Link
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  useEffect(() => {
    // Set up real-time sync interval
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [task.id, queryClient]);

  useEffect(() => {
    // Auto-expand all groups initially for better visibility
    const allGroupIds = new Set(task.subtaskGroups.map(group => group.id));
    setExpandedGroups(allGroupIds);
  }, [task.subtaskGroups]);

  const isCompleted = !!task.completeDate;
  const isOverdue = task.dueDate && !task.completeDate && new Date() > task.dueDate;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyTaskUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={openTaskInNewWindow}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Window
          </Button>
        </div>
      </div>

      {/* Task Info */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditingTask ? (
                    <div className="space-y-3">
                      <Input
                        value={taskEditData.name}
                        onChange={(e) => setTaskEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="text-xl font-semibold"
                      />
                      <Textarea
                        value={taskEditData.content}
                        onChange={(e) => setTaskEditData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Task description..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateTask}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancelTaskEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className={`text-2xl ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.name}
                          </CardTitle>
                          {task.content && (
                            <p className="text-muted-foreground mt-2">{task.content}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => setIsEditingTask(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {!isEditingTask && (
                  <Button
                    variant="ghost"
                    onClick={() => handleCompleteTask(task.id)}
                    className="h-10 w-10 p-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                {task.dueDate && (
                  <Badge variant={isOverdue ? "destructive" : "outline"} className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {format(task.dueDate, 'MMM d, yyyy')}
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive">
                    Overdue
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsEditingTask(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Task
          </ContextMenuItem>
          <ContextMenuItem onClick={copyTaskUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Task Link
          </ContextMenuItem>
          <ContextMenuItem onClick={openTaskInNewWindow}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Window
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Compact Subtasks Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Subtasks</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddGroup(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Group
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddSubtask(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subtask
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Add new subtask form */}
          {showAddSubtask && (
            <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Input
                  placeholder="Subtask name..."
                  value={newSubtask.name}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, name: e.target.value }))}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Subtask description..."
                  value={newSubtask.content}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, content: e.target.value }))}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddSubtask}>
                    Add Subtask
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddSubtask(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add new group form */}
          {showAddGroup && (
            <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Input
                  placeholder="Group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddGroup}>
                    Add Group
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddGroup(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Compact List View */}
          <div className="space-y-1">
            {/* Individual Subtasks (only ungrouped ones) */}
            {ungroupedSubtasks.length > 0 && (
              <div className="space-y-1">
                {ungroupedSubtasks.map((subtask) => renderSubtaskItem(subtask, false))}
              </div>
            )}

            {/* Subtask Groups */}
            {task.subtaskGroups.map((group) => (
              <div key={group.id} className="mt-3">
                {/* Group Header */}
                <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                  <button
                    onClick={() => toggleGroupExpansion(group.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-semibold text-gray-900 text-sm">
                      {group.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({group.subtasks.filter(s => s.completeDate).length}/{group.subtasks.length})
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddSubtaskInGroup(group.id)}
                      className="h-6 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubtaskGroup(group.id)}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Add subtask to group form */}
                {showAddSubtaskInGroup === group.id && (
                  <div className="ml-6 mb-2 p-2 border border-dashed border-gray-300 rounded bg-gray-50">
                    <div className="space-y-2">
                      <Input
                        placeholder="Subtask name..."
                        value={newGroupSubtask.name}
                        onChange={(e) => setNewGroupSubtask(prev => ({ ...prev, name: e.target.value }))}
                        className="text-sm h-8"
                      />
                      <Textarea
                        placeholder="Subtask description..."
                        value={newGroupSubtask.content}
                        onChange={(e) => setNewGroupSubtask(prev => ({ ...prev, content: e.target.value }))}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddSubtaskToGroup(group.id)} className="h-7 text-xs">
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowAddSubtaskInGroup(null)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Subtasks */}
                {expandedGroups.has(group.id) && (
                  <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-3">
                    {group.subtasks.map((subtask) => renderSubtaskItem(subtask, true))}
                    {group.subtasks.length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-2">
                        No subtasks in this group yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {ungroupedSubtasks.length === 0 && task.subtaskGroups.length === 0 && !showAddSubtask && !showAddGroup && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No subtasks yet. Add your first subtask to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
