import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Calendar, CheckCircle2, Circle, ExternalLink, Copy } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, SubtaskFormData } from '../types/task';
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations for real-time sync
  const addSubtaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: SubtaskFormData }) => 
      taskService.addSubtask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: ({ taskId, subtaskId, data }: { taskId: string; subtaskId: string; data: SubtaskFormData }) => 
      taskService.updateSubtask(taskId, subtaskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => 
      taskService.deleteSubtask(taskId, subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completeSubtaskMutation = useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => 
      taskService.toggleSubtaskComplete(taskId, subtaskId),
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
    mutationFn: ({ taskId, groupId }: { taskId: string; groupId: string }) => 
      taskService.deleteSubtaskGroup(taskId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const moveSubtaskMutation = useMutation({
    mutationFn: ({ taskId, subtaskId, sourceGroupId, targetGroupId, targetIndex }: {
      taskId: string;
      subtaskId: string;
      sourceGroupId: string | null;
      targetGroupId: string | null;
      targetIndex: number;
    }) => taskService.moveSubtask(taskId, subtaskId, sourceGroupId, targetGroupId, targetIndex),
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
      const newSubtaskData = { ...newGroupSubtask };
      addSubtaskMutation.mutate({ taskId: task.id, data: newSubtaskData });
      setNewGroupSubtask({ name: '', content: '' });
      setShowAddSubtaskInGroup(null);
    }
  };

  const handleUpdateSubtask = (subtaskId: string, data: SubtaskFormData) => {
    updateSubtaskMutation.mutate({ taskId: task.id, subtaskId, data });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtaskMutation.mutate({ taskId: task.id, subtaskId });
  };

  const handleCompleteSubtask = (subtaskId: string) => {
    completeSubtaskMutation.mutate({ taskId: task.id, subtaskId });
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleAddSubtaskGroup = (taskId: string, groupName: string) => {
    addSubtaskGroupMutation.mutate({ taskId, groupName });
  };

  const handleDeleteSubtaskGroup = (taskId: string, groupId: string) => {
    deleteSubtaskGroupMutation.mutate({ taskId, groupId });
  };

  const handleMoveSubtask = (taskId: string, subtaskId: string, sourceGroupId: string | null, targetGroupId: string | null, targetIndex: number) => {
    moveSubtaskMutation.mutate({ taskId, subtaskId, sourceGroupId, targetGroupId, targetIndex });
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceGroupId = source.droppableId === 'ungrouped' ? null : source.droppableId;
    const targetGroupId = destination.droppableId === 'ungrouped' ? null : destination.droppableId;

    handleMoveSubtask(task.id, draggableId, sourceGroupId, targetGroupId, destination.index);
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

  useEffect(() => {
    // Set up real-time sync interval
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [task.id, queryClient]);

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
                  <CardTitle className={`text-2xl ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.name}
                  </CardTitle>
                  {task.content && (
                    <p className="text-muted-foreground mt-2">{task.content}</p>
                  )}
                </div>
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

      {/* Subtasks Section */}
      <Card>
        <CardHeader>
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
        
        <CardContent className="space-y-4">
          {/* Add new subtask form */}
          {showAddSubtask && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Subtask name..."
                  value={newSubtask.name}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, name: e.target.value }))}
                />
                <Textarea
                  placeholder="Subtask description..."
                  value={newSubtask.content}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, content: e.target.value }))}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddSubtask}>
                    Add Subtask
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddSubtask(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add new group form */}
          {showAddGroup && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddGroup}>
                    Add Group
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddGroup(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            {/* Ungrouped subtasks */}
            {task.subtasks.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Individual Subtasks</h4>
                <Droppable droppableId="ungrouped">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {task.subtasks.map((subtask, index) => (
                        <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
                          {(provided, snapshot) => (
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <div
                                  id={`subtask-${subtask.id}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all duration-200 ${
                                    snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''
                                  } ${
                                    highlightSubtaskId === subtask.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                  }`}
                                >
                                  <SubtaskItem
                                    subtask={subtask}
                                    onUpdate={handleUpdateSubtask}
                                    onDelete={handleDeleteSubtask}
                                    onComplete={handleCompleteSubtask}
                                  />
                                </div>
                              </ContextMenuTrigger>
                              
                              <ContextMenuContent>
                                <ContextMenuItem onClick={() => copySubtaskUrl(subtask.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Subtask Link
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}

            {/* Subtask groups */}
            {task.subtaskGroups.map(group => (
              <div key={group.id} className="space-y-3">
                <Separator />
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{group.name}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSubtaskInGroup(group.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subtask
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubtaskGroup(task.id, group.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete Group
                    </Button>
                  </div>
                </div>

                {/* Add subtask to group form */}
                {showAddSubtaskInGroup === group.id && (
                  <Card className="border-dashed">
                    <CardContent className="p-4 space-y-3">
                      <Input
                        placeholder="Subtask name..."
                        value={newGroupSubtask.name}
                        onChange={(e) => setNewGroupSubtask(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Subtask description..."
                        value={newGroupSubtask.content}
                        onChange={(e) => setNewGroupSubtask(prev => ({ ...prev, content: e.target.value }))}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddSubtaskToGroup(group.id)}>
                          Add Subtask
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowAddSubtaskInGroup(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Droppable droppableId={group.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 min-h-[60px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {group.subtasks.map((subtask, index) => (
                        <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
                          {(provided, snapshot) => (
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <div
                                  id={`subtask-${subtask.id}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all duration-200 ${
                                    snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''
                                  } ${
                                    highlightSubtaskId === subtask.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                  }`}
                                >
                                  <SubtaskItem
                                    subtask={subtask}
                                    onUpdate={handleUpdateSubtask}
                                    onDelete={handleDeleteSubtask}
                                    onComplete={handleCompleteSubtask}
                                  />
                                </div>
                              </ContextMenuTrigger>
                              
                              <ContextMenuContent>
                                <ContextMenuItem onClick={() => copySubtaskUrl(subtask.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Subtask Link
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {group.subtasks.length === 0 && !showAddSubtaskInGroup && (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          Drop subtasks here or create new ones
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>

          {task.subtasks.length === 0 && task.subtaskGroups.length === 0 && !showAddSubtask && !showAddGroup && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No subtasks yet. Add your first subtask to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
