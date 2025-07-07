
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { TagBadge } from '../tag/TagBadge';

interface TaskCardBadgesProps {
  task: Task;
  isCompleted: boolean;
  isOverdue: boolean;
  onTagClick?: (tagId: string) => void;
}

export const TaskCardBadges = ({ task, isCompleted, isOverdue, onTagClick }: TaskCardBadgesProps) => {
  return (
    <div className="flex flex-col items-end gap-2 flex-shrink-0">
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

      {/* Task Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-end">
          {task.tags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onClick={onTagClick ? () => onTagClick(tag.id) : undefined}
              clickable={!!onTagClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
