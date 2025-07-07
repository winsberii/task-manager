
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { taskService } from '@/services/taskService';
import { Tag } from '@/types/tag';
import { TagBadge } from './TagBadge';
import { useToast } from '@/hooks/use-toast';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export const TagSelector = ({ selectedTagIds, onTagsChange }: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: taskService.getTags,
  });

  const createTagMutation = useMutation({
    mutationFn: taskService.createTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onTagsChange([...selectedTagIds, newTag.id]);
      setNewTagName('');
      setNewTagColor(DEFAULT_COLORS[0]);
      toast({
        title: 'Success',
        description: 'Tag created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive',
      });
    },
  });

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(tag => !selectedTagIds.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate({
        name: newTagName.trim(),
        color: newTagColor,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-2">
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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

        {/* Add Tag Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Tags
        </Button>
      </div>

      {/* Tag Selector Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 space-y-3">
          {/* Available Tags */}
          {availableTags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Available Tags:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onClick={() => handleTagToggle(tag.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Create New Tag */}
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2">Create New Tag:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <div className="flex gap-1">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded border-2 ${
                      newTagColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
