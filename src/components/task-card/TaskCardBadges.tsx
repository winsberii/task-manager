
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types/task';

interface TaskCardBadgesProps {
  task: Task;
  isCompleted: boolean;
  isOverdue: boolean;
}

export const TaskCardBadges = ({ task, isCompleted, isOverdue }: TaskCardBadgesProps) => {
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
    </div>
  );
};
