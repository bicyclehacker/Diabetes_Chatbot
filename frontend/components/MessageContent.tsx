import React from 'react';
import LinkifyIt from 'linkify-it';
import DOMPurify from 'dompurify';
import { ExternalLink } from 'lucide-react';

const linkify = new LinkifyIt();

interface MessageContentProps {
    content: string | null | undefined;
}

export default function MessageContent({ content }: MessageContentProps) {
    const cleanContent = DOMPurify.sanitize(content || '', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
    const matches = linkify.match(cleanContent) || [];

    if (matches.length === 0) return <span>{cleanContent}</span>;

    const parts = [];
    let lastIndex = 0;

    matches.forEach((m, i) => {
        const start = m.index;
        const end = m.lastIndex;

        if (start > lastIndex) {
            parts.push(
                <span key={`t-${i}`}>
                    {cleanContent.slice(lastIndex, start)}
                </span>
            );
        }

        parts.push(
            <a
                key={`l-${i}`}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 text-xs transition"
            >
                {m.raw}
                <ExternalLink className="h-3 w-3 text-blue-500" />
            </a>
        );

        lastIndex = end;
    });

    if (lastIndex < cleanContent.length) {
        parts.push(<span key="t-last">{cleanContent.slice(lastIndex)}</span>);
    }

    return (
        <div className="text-sm whitespace-pre-wrap break-words">{parts}</div>
    );
}
