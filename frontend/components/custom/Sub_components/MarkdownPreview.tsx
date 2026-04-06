import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownProps) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}