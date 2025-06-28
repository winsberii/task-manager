
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SubtaskGroupFormProps {
  onAdd: (groupName: string) => void;
  onCancel: () => void;
}

export const SubtaskGroupForm = ({ onAdd, onCancel }: SubtaskGroupFormProps) => {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = () => {
    if (groupName.trim()) {
      onAdd(groupName);
      setGroupName('');
    }
  };

  return (
    <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-2">
        <Input
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit}>
            Add Group
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
