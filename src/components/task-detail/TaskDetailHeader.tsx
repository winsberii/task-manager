
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailHeaderProps {
  taskId: string;
  onBack: () => void;
}

export const TaskDetailHeader = ({ taskId, onBack }: TaskDetailHeaderProps) => {
  const { toast } = useToast();

  const copyTaskUrl = () => {
    const url = `${window.location.origin}/task/${taskId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Task link has been copied to clipboard",
    });
  };

  const openTaskInNewWindow = () => {
    window.open(`/task/${taskId}`, '_blank');
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tasks
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyTaskUrl}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        <Button variant="outline" size="sm" onClick={openTaskInNewWindow}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Window
        </Button>
      </div>
    </div>
  );
};
