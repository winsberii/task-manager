
import AppHeader from "@/components/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Task Manager</h2>
            <p className="text-gray-600">Manage your tasks efficiently and stay organized.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Your Dashboard</h3>
            <p className="text-gray-600">
              This is your protected dashboard. You can only see this content when you're signed in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
