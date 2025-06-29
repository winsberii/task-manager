
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  isDragging?: boolean;
  isGroup?: boolean;
}

export const DragHandle = ({ isDragging = false, isGroup = false }: DragHandleProps) => {
  return (
    <div
      className={`
        cursor-grab active:cursor-grabbing p-1 h-8 w-8 flex items-center justify-center
        hover:bg-gray-100 transition-colors duration-150 rounded
        ${isDragging ? 'opacity-50' : ''}
        ${isGroup ? 'text-blue-600' : 'text-gray-400'}
        touch-manipulation
      `}
      style={{ touchAction: 'none' }}
    >
      <GripVertical className="h-4 w-4" />
    </div>
  );
};
