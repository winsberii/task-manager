import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TaskDetail } from '../components/TaskDetail';
import { taskService } from '../services/taskService';
import { Task, TaskFormData, SubtaskFormData } from '../types/task';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [tasks, setTasks] = useState(taskService.getAllTasks());
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const { toast } = useToast();

  const refreshTasks = () => {
    setTasks(taskService.getAllTasks());
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.content && task.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const now = new Date();
    const isOverdue = task.dueDate && !task.completeDate && now > task.dueDate;
    const isCompleted = !!task.completeDate;
    
    switch (filterStatus) {
      case 'active':
        return matchesSearch && !isCompleted;
      case 'completed':
        return matchesSearch && isCompleted;
      case 'overdue':
        return matchesSearch && isOverdue;
      default:
        return matchesSearch;
    }
  });

  const handleCreateTask = (taskData: TaskFormData) => {
    const newTask = taskService.createTask(taskData);
    refreshTasks();
    toast({
      title: "Task created",
      description: `"${newTask.name}" has been created successfully.`,
    });
  };

  const handleUpdateTask = (taskData: TaskFormData) => {
    if (editingTask) {
      taskService.updateTask(editingTask.id, taskData);
      refreshTasks();
      if (selectedTask && selectedTask.id === editingTask.id) {
        const updatedTask = taskService.getTaskById(editingTask.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
      toast({
        title: "Task updated",
        description: `"${taskData.name}" has been updated successfully.`,
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = taskService.getTaskById(taskId);
    taskService.deleteTask(taskId);
    refreshTasks();
    
    if (selectedTask && selectedTask.id === taskId) {
      setCurrentView('list');
      setSelectedTask(null);
    }
    
    toast({
      title: "Task deleted",
      description: `"${task?.name}" has been deleted.`,
    });
  };

  const handleCopyTask = (taskId: string) => {
    const copiedTask = taskService.copyTask(taskId);
    refreshTasks();
    toast({
      title: "Task copied",
      description: `"${copiedTask?.name}" has been created.`,
    });
  };

  const handleCompleteTask = (taskId: string) => {
    const task = taskService.completeTask(taskId);
    refreshTasks();
    
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(task);
    }
    
    toast({
      title: task?.completeDate ? "Task completed" : "Task reopened",
      description: `"${task?.name}" has been ${task?.completeDate ? 'marked as complete' : 'reopened'}.`,
    });
  };

  const handleOpenTask = (taskId: string) => {
    const task = taskService.getTaskById(taskId);
    if (task) {
      setSelectedTask(task);
      setCurrentView('detail');
    }
  };

  const handleAddSubtask = (taskId: string, subtaskData: SubtaskFormData) => {
    taskService.addSubtask(taskId, subtaskData);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: "Subtask added",
      description: `"${subtaskData.name}" has been added.`,
    });
  };

  const handleUpdateSubtask = (taskId: string, subtaskId: string, subtaskData: SubtaskFormData) => {
    taskService.updateSubtask(taskId, subtaskId, subtaskData);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: "Subtask updated",
      description: `"${subtaskData.name}" has been updated.`,
    });
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    taskService.deleteSubtask(taskId, subtaskId);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: "Subtask deleted",
      description: "The subtask has been deleted.",
    });
  };

  const handleCompleteSubtask = (taskId: string, subtaskId: string) => {
    const subtask = taskService.completeSubtask(taskId, subtaskId);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: subtask?.completeDate ? "Subtask completed" : "Subtask reopened",
      description: `"${subtask?.name}" has been ${subtask?.completeDate ? 'completed' : 'reopened'}.`,
    });
  };

  const handleAddSubtaskGroup = (taskId: string, groupName: string) => {
    taskService.addSubtaskGroup(taskId, groupName);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: "Group added",
      description: `"${groupName}" group has been created.`,
    });
  };

  const handleDeleteSubtaskGroup = (taskId: string, groupId: string) => {
    taskService.deleteSubtaskGroup(taskId, groupId);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: "Group deleted",
      description: "The subtask group has been deleted.",
    });
  };

  const handleMoveSubtask = (taskId: string, subtaskId: string, sourceGroupId: string | null, targetGroupId: string | null, targetIndex: number) => {
    taskService.moveSubtask(taskId, subtaskId, sourceGroupId, targetGroupId, targetIndex);
    refreshTasks();
    const updatedTask = taskService.getTaskById(taskId);
    if (updatedTask) setSelectedTask(updatedTask);
    
    toast({
      title: "Subtask moved",
      description: "The subtask has been moved successfully.",
    });
  };

  if (currentView === 'detail' && selectedTask) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <TaskDetail
          task={selectedTask}
          onBack={() => {
            setCurrentView('list');
            setSelectedTask(null);
          }}
          onAddSubtask={handleAddSubtask}
          onUpdateSubtask={handleUpdateSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onCompleteSubtask={handleCompleteSubtask}
          onCompleteTask={handleCompleteTask}
          onAddSubtaskGroup={handleAddSubtaskGroup}
          onDeleteSubtaskGroup={handleDeleteSubtaskGroup}
          onMoveSubtask={handleMoveSubtask}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-1 text-sm">Organize your tasks and boost productivity</p>
          </div>
          <Button onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value: typeof filterStatus) => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-xs text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-green-600">
              {tasks.filter(t => t.completeDate).length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-orange-600">
              {tasks.filter(t => !t.completeDate).length}
            </div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-red-600">
              {tasks.filter(t => t.dueDate && !t.completeDate && new Date() > t.dueDate).length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(task) => {
                setEditingTask(task);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteTask}
              onCopy={handleCopyTask}
              onComplete={handleCompleteTask}
              onOpen={handleOpenTask}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-5xl mb-3">📝</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first task!'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            )}
          </div>
        )}

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
        />
      </div>
    </div>
  );
};

export default Index;
