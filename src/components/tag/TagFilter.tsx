
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { Tag } from '@/types/tag';
import { TagBadge } from './TagBadge';

interface TagFilterProps {
  tags: Tag[];
  selectedTagIds: string[];
  onFilterChange: (tagIds: string[]) => void;
}

export const TagFilter = ({ tags, selectedTagIds, onFilterChange }: TagFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(tag => !selectedTagIds.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onFilterChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onFilterChange([...selectedTagIds, tagId]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter by Tags
          {selectedTagIds.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedTagIds.length}
            </Badge>
          )}
        </Button>

        {selectedTagIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              removable
              clickable={false}
              onRemove={() => handleTagToggle(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Tag Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-64">
          {availableTags.length > 0 ? (
            <div>
              <p className="text-sm font-medium mb-2">Select tags to filter:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onClick={() => handleTagToggle(tag.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">All tags are selected</p>
          )}
        </div>
      )}
    </div>
  );
};
