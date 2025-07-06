
import React, { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Eye, Edit } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter description...", 
  className,
  rows = 3
}: MarkdownEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {showPreview ? 'Preview' : 'Edit'} • Markdown supported
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-6 px-2 text-xs"
        >
          {showPreview ? (
            <>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </>
          )}
        </Button>
      </div>
      
      {showPreview ? (
        <div className="min-h-[76px] p-3 border border-input rounded-md bg-background">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-muted-foreground text-sm italic">
              {placeholder}
            </p>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="resize-none"
        />
      )}
    </div>
  );
};
