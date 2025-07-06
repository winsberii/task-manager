
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export const MarkdownRenderer = ({ content, className, compact = false }: MarkdownRendererProps) => {
  // Truncate content if it's too long for compact view
  const displayContent = compact && content.length > 150 
    ? content.substring(0, 150) + '...'
    : content;

  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      compact && "line-clamp-2",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Customize rendering for compact view
          p: ({ children }) => (
            <p className={cn(
              "my-1",
              compact && "inline"
            )}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-1 ml-4 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1 ml-4 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="my-0.5">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
};
