
import { 
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';
import { ExternalLink, Edit, Copy, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task } from '@/types/task';

interface TaskCardContextMenuProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onCopy?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskCardContextMenu = ({ task, onEdit, onCopy, onDelete }: TaskCardContextMenuProps) => {
  const handleOpenInNewWindow = () => {
    window.open(`/task/${task.id}`, '_blank');
  };

  return (
    <ContextMenuContent>
      {onEdit && (
        <ContextMenuItem onClick={() => onEdit(task)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Task
        </ContextMenuItem>
      )}
      <ContextMenuItem onClick={handleOpenInNewWindow}>
        <ExternalLink className="h-4 w-4 mr-2" />
        Open in New Window
      </ContextMenuItem>
      <ContextMenuItem asChild>
        <Link to={`/task/${task.id}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Link>
      </ContextMenuItem>
      {onCopy && (
        <ContextMenuItem onClick={() => onCopy(task.id)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Task
        </ContextMenuItem>
      )}
      {onDelete && (
        <ContextMenuItem onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Task
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  );
};
