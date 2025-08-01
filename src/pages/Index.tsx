import AppHeader from "@/components/AppHeader";
import { TaskDashboard } from "@/components/TaskDashboard";
import { useRandomQuote } from "@/hooks/useRandomQuote";
const Index = () => {
  const { data: quote, isLoading: isLoadingQuote } = useRandomQuote();
  
  return <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {isLoadingQuote 
                ? "Manage your tasks efficiently and stay organized." 
                : quote?.quote_text || "Manage your tasks efficiently and stay organized."
              }
            </p>
          </div>
          
          <TaskDashboard />
        </div>
      </div>
    </div>;
};
export default Index;