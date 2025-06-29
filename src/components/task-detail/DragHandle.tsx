
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragHandleProps {
  isDragging?: boolean;
  isGroup?: boolean;
}

export const DragHandle = ({ isDragging = false, isGroup = false }: DragHandleProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`
        cursor-grab active:cursor-grabbing p-1 h-8 w-8
        hover:bg-gray-100 transition-colors duration-150
        ${isDragging ? 'opacity-50' : ''}
        ${isGroup ? 'text-blue-600' : 'text-gray-400'}
        touch-manipulation
      `}
      style={{ touchAction: 'none' }}
    >
      <GripVertical className="h-4 w-4" />
    </Button>
  );
};
