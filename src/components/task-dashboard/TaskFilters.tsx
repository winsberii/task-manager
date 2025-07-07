
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagFilter } from '@/components/tag/TagFilter';
import { Tag } from '@/types/tag';

type CompletionFilter = 'uncompleted' | 'completed' | 'all';

interface TaskFiltersProps {
  completionFilter: CompletionFilter;
  onCompletionFilterChange: (filter: CompletionFilter) => void;
  tags: Tag[];
  selectedTagIds: string[];
  onTagFilterChange: (tagIds: string[]) => void;
}

export const TaskFilters = ({
  completionFilter,
  onCompletionFilterChange,
  tags,
  selectedTagIds,
  onTagFilterChange,
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Completion Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="completion-filter" className="text-sm font-medium text-gray-700">
          Status:
        </label>
        <Select value={completionFilter} onValueChange={(value: CompletionFilter) => onCompletionFilterChange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uncompleted">Uncompleted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex-1">
          <TagFilter
            tags={tags}
            selectedTagIds={selectedTagIds}
            onFilterChange={onTagFilterChange}
          />
        </div>
      )}
    </div>
  );
};
