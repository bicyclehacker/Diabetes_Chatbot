import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface AIMessageProps {
    content: string;
}

const AIMessage: React.FC<AIMessageProps> = ({ content }) => {
    return (
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    a: ({ node, ...props }) => (
                        <a
                            {...props}
                            className="text-blue-600 underline hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                }}
            >
                {content || ''}
            </ReactMarkdown>
        </div>
    );
};

export default AIMessage;
