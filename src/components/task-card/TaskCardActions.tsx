
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2, ExternalLink } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskCardActionsProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onCopy?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskCardActions = ({ task, onEdit, onCopy, onDelete }: TaskCardActionsProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit?.(task);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onCopy?.(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete?.(task.id);
    }
  };

  const handleOpenInNewWindow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(`/task/${task.id}`, '_blank');
  };

  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
          title="Edit task"
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
      {onCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 hover:bg-gray-200"
          title="Copy task"
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenInNewWindow}
        className="h-6 w-6 p-0 hover:bg-gray-200"
        title="Open in New Window"
      >
        <ExternalLink className="h-3 w-3" />
      </Button>
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
          title="Delete task"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
