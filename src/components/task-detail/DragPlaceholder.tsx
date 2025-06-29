
import { Card } from '@/components/ui/card';

interface DragPlaceholderProps {
  isDraggingOver: boolean;
  isGrouped?: boolean;
}

export const DragPlaceholder = ({ isDraggingOver, isGrouped = false }: DragPlaceholderProps) => {
  return (
    <Card 
      className={`
        transition-all duration-200 border-2 border-dashed
        ${isDraggingOver 
          ? 'border-blue-400 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-gray-50'
        }
        ${isGrouped ? 'ml-4' : ''}
        h-12 flex items-center justify-center
      `}
    >
      <span className={`text-sm ${isDraggingOver ? 'text-blue-600' : 'text-gray-400'}`}>
        {isDraggingOver ? 'Drop here' : 'Drag item here'}
      </span>
    </Card>
  );
};
