
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '../types/task';
import { Calendar, CheckCircle2, Circle, Copy, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCopy: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onOpen: (taskId: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onCopy, onComplete, onOpen }: TaskCardProps) => {
  const totalSubtasks = task.subtasks.length + task.subtaskGroups.reduce((acc, group) => acc + group.subtasks.length, 0);
  const completedSubtasks = task.subtasks.filter(st => st.completeDate).length + 
    task.subtaskGroups.reduce((acc, group) => acc + group.subtasks.filter(st => st.completeDate).length, 0);

  const isOverdue = task.dueDate && !task.completeDate && new Date() > task.dueDate;
  const isCompleted = !!task.completeDate;

  return (
    <div className={`w-full bg-white border-b border-gray-200 py-4 px-6 transition-all duration-200 hover:bg-gray-50 ${isCompleted ? 'opacity-75' : ''} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Completion checkbox */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComplete(task.id)}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {task.name}
              </h3>
              
              {/* Badges */}
              <div className="flex gap-2">
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs px-2 py-0 h-5">
                    Overdue
                  </Badge>
                )}
                
                {totalSubtasks > 0 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                    {completedSubtasks}/{totalSubtasks}
                  </Badge>
                )}
                
                {completedSubtasks === totalSubtasks && totalSubtasks > 0 && (
                  <Badge variant="default" className="text-xs px-2 py-0 h-5 bg-green-100 text-green-800">
                    Complete
                  </Badge>
                )}
              </div>
            </div>

            {/* Task description and due date */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {task.content && (
                <span className="truncate">{task.content}</span>
              )}
              
              {task.dueDate && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {format(task.dueDate, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpen(task.id)}
            className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Open
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(task.id)}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
