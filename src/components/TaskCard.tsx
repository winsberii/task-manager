
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/types/task';
import { 
  ContextMenu,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useNavigate } from 'react-router-dom';
import { TaskCardContent } from './task-card/TaskCardContent';
import { TaskCardActions } from './task-card/TaskCardActions';
import { TaskCardBadges } from './task-card/TaskCardBadges';
import { TaskCardContextMenu } from './task-card/TaskCardContextMenu';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick?: (task: Task) => void;
  onCopy?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onTagClick?: (tagId: string) => void;
}

export const TaskCard = ({ task, onComplete, onCopy, onDelete, onEdit, onTagClick }: TaskCardProps) => {
  const navigate = useNavigate();
  const isCompleted = !!task.completeDate;
  const isOverdue = task.dueDate && !task.completeDate && new Date() > task.dueDate;

  const handleCardClick = () => {
    navigate(`/task/${task.id}`);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div onClick={handleCardClick}>
          <Card 
            className="w-full hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <TaskCardContent 
                  task={task}
                  isCompleted={isCompleted}
                  isOverdue={isOverdue}
                  onComplete={onComplete}
                />
                
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <TaskCardActions
                    task={task}
                    onEdit={onEdit}
                    onCopy={onCopy}
                    onDelete={onDelete}
                  />
                  
                  <TaskCardBadges
                    task={task}
                    isCompleted={isCompleted}
                    isOverdue={isOverdue}
                    onTagClick={onTagClick}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContextMenuTrigger>
      
      <TaskCardContextMenu
        task={task}
        onEdit={onEdit}
        onCopy={onCopy}
        onDelete={onDelete}
      />
    </ContextMenu>
  );
};
