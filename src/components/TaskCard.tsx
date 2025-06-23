
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className={`text-lg font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComplete(task.id)}
            className="h-8 w-8 p-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </Button>
        </div>
        {task.content && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {task.content}
          </p>
        )}
      </CardHeader>

      <CardContent className="py-3">
        <div className="space-y-2">
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                Due {format(task.dueDate, 'MMM d, yyyy')}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          )}
          
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {completedSubtasks}/{totalSubtasks} subtasks
              </Badge>
              {completedSubtasks === totalSubtasks && totalSubtasks > 0 && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  All Done!
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(task.id)}
          className="flex-1 mr-2"
        >
          Open
        </Button>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(task.id)}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
