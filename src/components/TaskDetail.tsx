
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { Task, SubtaskFormData } from '../types/task';
import { SubtaskItem } from './SubtaskItem';
import { format } from 'date-fns';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  onAddSubtask: (taskId: string, data: SubtaskFormData) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, data: SubtaskFormData) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onCompleteSubtask: (taskId: string, subtaskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAddSubtaskGroup: (taskId: string, groupName: string) => void;
  onDeleteSubtaskGroup: (taskId: string, groupId: string) => void;
}

export const TaskDetail = ({
  task,
  onBack,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onCompleteSubtask,
  onCompleteTask,
  onAddSubtaskGroup,
  onDeleteSubtaskGroup
}: TaskDetailProps) => {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ name: '', content: '' });
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddSubtask = () => {
    if (newSubtask.name.trim()) {
      onAddSubtask(task.id, newSubtask);
      setNewSubtask({ name: '', content: '' });
      setShowAddSubtask(false);
    }
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddSubtaskGroup(task.id, newGroupName);
      setNewGroupName('');
      setShowAddGroup(false);
    }
  };

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
      </div>

      {/* Task Info */}
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
              onClick={() => onCompleteTask(task.id)}
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

          {/* Ungrouped subtasks */}
          {task.subtasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Individual Subtasks</h4>
              {task.subtasks.map(subtask => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onUpdate={(subtaskId, data) => onUpdateSubtask(task.id, subtaskId, data)}
                  onDelete={(subtaskId) => onDeleteSubtask(task.id, subtaskId)}
                  onComplete={(subtaskId) => onCompleteSubtask(task.id, subtaskId)}
                />
              ))}
            </div>
          )}

          {/* Subtask groups */}
          {task.subtaskGroups.map(group => (
            <div key={group.id} className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{group.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSubtaskGroup(task.id, group.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Group
                </Button>
              </div>
              {group.subtasks.map(subtask => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onUpdate={(subtaskId, data) => onUpdateSubtask(task.id, subtaskId, data)}
                  onDelete={(subtaskId) => onDeleteSubtask(task.id, subtaskId)}
                  onComplete={(subtaskId) => onCompleteSubtask(task.id, subtaskId)}
                />
              ))}
            </div>
          ))}

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
