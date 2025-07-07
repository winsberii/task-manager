
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Tag } from '@/types/tag';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  clickable?: boolean;
}

export const TagBadge = ({ tag, onClick, onRemove, removable = false, clickable = true }: TagBadgeProps) => {
  return (
    <Badge 
      style={{ backgroundColor: tag.color }}
      className={`text-white text-xs font-medium ${clickable ? 'cursor-pointer hover:opacity-80' : ''} inline-flex items-center gap-1`}
      onClick={clickable ? onClick : undefined}
    >
      {tag.name}
      {removable && onRemove && (
        <X 
          className="h-3 w-3 ml-1 hover:bg-white/20 rounded cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </Badge>
  );
};
