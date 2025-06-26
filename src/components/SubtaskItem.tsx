
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Edit, Trash2, Save, X } from 'lucide-react';
import { Subtask, SubtaskFormData } from '../types/task';
import { format } from 'date-fns';

interface SubtaskItemProps {
  subtask: Subtask;
  onUpdate: (subtaskId: string, data: SubtaskFormData) => void;
  onDelete: (subtaskId: string) => void;
  onComplete: (subtaskId: string) => void;
}

export const SubtaskItem = ({ subtask, onUpdate, onDelete, onComplete }: SubtaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: subtask.name,
    content: subtask.content || ''
  });

  const handleSave = () => {
    if (editData.name.trim()) {
      onUpdate(subtask.id, editData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: subtask.name,
      content: subtask.content || ''
    });
    setIsEditing(false);
  };

  const isCompleted = !!subtask.completeDate;

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Subtask name..."
            />
            <Textarea
              value={editData.content}
              onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Subtask description..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {subtask.name}
                </h4>
                {subtask.content && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subtask.content}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComplete(subtask.id)}
                  className="h-8 w-8 p-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(subtask.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isCompleted && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Completed
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
