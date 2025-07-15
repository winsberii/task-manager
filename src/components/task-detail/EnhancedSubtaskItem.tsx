
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Edit, Save, X, Copy, FileText, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Draggable } from 'react-beautiful-dnd';
import { SubtaskFormData } from '@/types/task';
import { DragHandle } from './DragHandle';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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

  const handleCopyDescription = async () => {
    if (!subtask.content?.trim()) {
      toast({
        title: "No description to copy",
        description: "This subtask doesn't have a description.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(subtask.content);
      toast({
        title: "Description copied!",
        description: "The subtask description has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the description to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-start gap-2 py-2 px-2 rounded hover:bg-gray-50 transition-colors ${
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
            <div className="flex-1 space-y-3">
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="text-sm h-7"
                placeholder="Subtask name..."
              />
              <MarkdownEditor
                value={editData.content}
                onChange={(content) => setEditData(prev => ({ ...prev, content }))}
                placeholder="Subtask description (Markdown supported)..."
                rows={3}
              />
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
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm block ${
                        subtask.completeDate ? 'line-through text-gray-500' : isGrouped ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {subtask.name}
                      </span>
                      {subtask.content && (
                        <div className={`mt-1 ${
                          isGrouped ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <MarkdownRenderer 
                            content={subtask.content} 
                            compact={false}
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            title="Delete Subtask"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subtask</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{subtask.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSubtask(subtask.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Subtask
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {subtask.content?.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyDescription}
                          className="h-6 w-6 p-0"
                          title="Copy Description"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>
              
              <ContextMenuContent>
                <ContextMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Subtask
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={handleCopyDescription}
                  disabled={!subtask.content?.trim()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy Description
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
