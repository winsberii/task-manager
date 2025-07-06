
import { CheckCircle2, Circle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types/task';

interface TaskCardContentProps {
  task: Task;
  isCompleted: boolean;
  isOverdue: boolean;
  onComplete: (taskId: string) => void;
}

export const TaskCardContent = ({ task, isCompleted, isOverdue, onComplete }: TaskCardContentProps) => {
  const completedSubtasks = [...task.subtasks, ...task.subtaskGroups.flatMap(g => g.subtasks)]
    .filter(subtask => subtask.completeDate).length;
  const totalSubtasks = task.subtasks.length + task.subtaskGroups.reduce((acc, g) => acc + g.subtasks.length, 0);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onComplete(task.id);
  };

  return (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <button
        onClick={handleComplete}
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
  );
};
