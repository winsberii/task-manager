
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

interface SubtaskFormProps {
  onAdd: (data: { name: string; content: string }) => void;
  onCancel: () => void;
}

export const SubtaskForm = ({ onAdd, onCancel }: SubtaskFormProps) => {
  const [formData, setFormData] = useState({ name: '', content: '' });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({ name: '', content: '' });
    }
  };

  return (
    <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-3">
        <Input
          placeholder="Subtask name..."
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="text-sm"
        />
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="Subtask description (Markdown supported)..."
          rows={3}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit}>
            Add Subtask
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
