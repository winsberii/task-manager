
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Edit, Save, X, Copy } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Draggable } from 'react-beautiful-dnd';
import { SubtaskFormData } from '@/types/task';
import { DragHandle } from './DragHandle';

interface EnhancedSubtaskItemProps {
  subtask: any;
  index: number;
  isGrouped: boolean;
  highlightSubtaskId?: string;
  onUpdateSubtask: (subtaskId: string, data: SubtaskFormData) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onCompleteSubtask: (subtaskId: string) => void;
  onCopySubtaskUrl: (subtaskId: string) => void;
  isDragging?: boolean;
}

export const EnhancedSubtaskItem = ({
  subtask,
  index,
  isGrouped,
  highlightSubtaskId,
  onUpdateSubtask,
  onDeleteSubtask,
  onCompleteSubtask,
  onCopySubtaskUrl,
  isDragging = false
}: EnhancedSubtaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: subtask.name,
    content: subtask.content || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: subtask.name,
      content: subtask.content || ''
    });
  };

  const handleSave = () => {
    if (editData.name.trim()) {
      onUpdateSubtask(subtask.id, editData);
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

  return (
    <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-50 transition-colors ${
            highlightSubtaskId === subtask.id ? 'bg-blue-50 border border-blue-200' : ''
          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          id={`subtask-${subtask.id}`}
        >
          <div {...provided.dragHandleProps} className="flex-shrink-0 mt-1">
            <DragHandle isDragging={snapshot.isDragging} />
          </div>
          
          {isGrouped && <span className="text-gray-400 text-sm mt-0.5">•</span>}
          <button
            onClick={() => onCompleteSubtask(subtask.id)}
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
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="text-sm h-7"
              />
              {editData.content !== undefined && (
                <Textarea
                  value={editData.content}
                  onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                  className="text-xs"
                  rows={2}
                />
              )}
              <div className="flex gap-1">
                <Button size="sm" onClick={handleSave} className="h-6 text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <ContextMenu>
              <ContextMenuTrigger asChild>
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
                      onClick={handleEdit}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 transition-opacity"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </ContextMenuTrigger>
              
              <ContextMenuContent>
                <ContextMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Subtask
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onCopySubtaskUrl(subtask.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Subtask Link
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>
      )}
    </Draggable>
  );
};
