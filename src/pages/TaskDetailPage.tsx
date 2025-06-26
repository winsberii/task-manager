
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TaskDetail } from '@/components/TaskDetail';
import { taskService } from '@/services/taskService';
import { Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const TaskDetailPage = () => {
  const { taskId, subtaskId } = useParams<{ taskId: string; subtaskId?: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getTask(taskId!),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (error) {
      console.error('Error loading task:', error);
      navigate('/');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (subtaskId && task) {
      // Scroll to subtask when URL contains subtaskId
      const scrollToSubtask = () => {
        const element = document.getElementById(`subtask-${subtaskId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-subtask');
          setTimeout(() => {
            element.classList.remove('highlight-subtask');
          }, 2000);
        }
      };
      // Small delay to ensure DOM is rendered
      setTimeout(scrollToSubtask, 100);
    }
  }, [subtaskId, task]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Task not found</h1>
            <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go back to tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <TaskDetail 
          task={task}
          onBack={() => navigate('/')}
          highlightSubtaskId={subtaskId}
        />
      </div>
    </div>
  );
};

export default TaskDetailPage;
