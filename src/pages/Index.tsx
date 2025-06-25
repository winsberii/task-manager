
import AppHeader from "@/components/AppHeader";
import { TaskDashboard } from "@/components/TaskDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Task Manager</h2>
            <p className="text-gray-600">Manage your tasks efficiently and stay organized.</p>
          </div>
          
          <TaskDashboard />
        </div>
      </div>
    </div>
  );
};

export default Index;
