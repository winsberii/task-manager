
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Calendar, Clock, ExternalLink, Copy, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
  onCopy?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export const TaskCard = ({ task, onComplete, onClick, onCopy, onDelete, onEdit }: TaskCardProps) => {
  const isCompleted = !!task.completeDate;
  const isOverdue = task.dueDate && !task.completeDate && new Date() > task.dueDate;
  
  const completedSubtasks = [...task.subtasks, ...task.subtaskGroups.flatMap(g => g.subtasks)]
    .filter(subtask => subtask.completeDate).length;
  const totalSubtasks = task.subtasks.length + task.subtaskGroups.reduce((acc, g) => acc + g.subtasks.length, 0);

  const handleOpenInNewWindow = () => {
    window.open(`/task/${task.id}`, '_blank');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy?.(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete?.(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card 
          className="w-full hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-200"
          onClick={() => onClick(task)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task.id);
                  }}
                  className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm leading-tight truncate ${
                    isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.name}
                  </h3>
                  
                  {task.content && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {task.content}
                    </p>
                  )}

                  {/* Due date display */}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className={`text-xs ${
                        isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                      }`}>
                        Due {format(task.dueDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  
                  {totalSubtasks > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {completedSubtasks}/{totalSubtasks} subtasks
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {/* Action buttons */}
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
                
                {task.dueDate && (
                  <Badge 
                    variant={isOverdue ? "destructive" : "outline"} 
                    className="text-xs flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    {format(task.dueDate, 'MMM d')}
                  </Badge>
                )}
                
                {isCompleted && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    ✓ Done
                  </Badge>
                )}
                
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      
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
    </ContextMenu>
  );
};
