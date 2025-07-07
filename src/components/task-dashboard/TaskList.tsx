
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTagIds: string[];
  completionFilter: 'uncompleted' | 'completed' | 'all';
  onToggleComplete: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onCopyTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onTagClick: (tagId: string) => void;
  onCreateTask: () => void;
}

export const TaskList = ({
  tasks,
  filteredTasks,
  selectedTagIds,
  completionFilter,
  onToggleComplete,
  onOpenTask,
  onCopyTask,
  onDeleteTask,
  onEditTask,
  onTagClick,
  onCreateTask,
}: TaskListProps) => {
  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        {selectedTagIds.length > 0 || completionFilter !== 'all' ? (
          <p className="text-gray-500 mb-4">No tasks found with the current filters.</p>
        ) : tasks.length === 0 ? (
          <>
            <p className="text-gray-500 mb-4">No tasks yet. Create your first task to get started!</p>
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </>
        ) : (
          <p className="text-gray-500 mb-4">No tasks match the current filters.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onToggleComplete}
          onClick={(task) => onOpenTask(task.id)}
          onCopy={onCopyTask}
          onDelete={onDeleteTask}
          onEdit={onEditTask}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};
