'use client';

import React from 'react';
// --- MOCKS FOR MISSING IMPORTS ---
// (You should use your real imports for these)

import type { Message } from '@/types/chat';
import { ISource } from '../chatbot-interface';
import AIMessage from '../AImessageContent'; // Assuming this path is correct
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookText, Bot, User } from 'lucide-react';

// --- END MOCKS ---

// Helper function
const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface ChatMessageProps {
    message: Message;
    sources: ISource[];
    isLastMessage?: boolean;
}

export function ChatMessage({
    message,
    sources = [],
    isLastMessage = false,
}: ChatMessageProps) {
    console.log(sources);
    return (
        <div
            className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
        >
            <div
                className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
                <Avatar className="h-10 w-10 flex-shrink-0 shadow-sm">
                    <AvatarFallback
                        className={`${
                            message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-white border border-gray-200'
                        }`}
                    >
                        {message.role === 'user' ? (
                            <User className="h-5 w-5" />
                        ) : (
                            <Bot className="h-5 w-5 text-gray-600" />
                        )}
                    </AvatarFallback>
                </Avatar>

                <div
                    className={`flex flex-col gap-1 ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                >
                    {/* --- Message Bubble --- */}
                    <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                    >
                        {/* This component will render the markdown from the bot */}
                        <AIMessage content={message.content} />
                    </div>

                    <div className="text-xs text-gray-500 px-2">
                        {formatMessageTime(message.timestamps)}
                    </div>

                    {/* --- Source List --- */}
                    {/* This block will only render if:
            1. It's a 'bot' message
            2. It's the 'last message' in the chat
            3. The 'sources' array has items
          */}
                    {message.role === 'bot' &&
                        isLastMessage &&
                        sources &&
                        sources.length > 0 && (
                            <div className="mt-3 w-full space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <BookText className="h-4 w-4" />
                                    Sources
                                </h4>
                                <ul className="list-inside space-y-2">
                                    {sources.map((source) => {
                                        const hasUrl =
                                            typeof source.url === 'string' &&
                                            source.url;

                                        // Use 'title', fall back to 'source', then to a default
                                        const displayName =
                                            source.title ||
                                            source.source ||
                                            'Knowledge Base';

                                        return (
                                            <li
                                                key={source.id}
                                                className="group relative rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-600 transition-all hover:bg-gray-50"
                                            >
                                                <div className="font-semibold text-gray-800">
                                                    <span className="text-gray-900">
                                                        {source.id}:{' '}
                                                    </span>

                                                    {/* Conditionally render a link or plain text */}
                                                    {hasUrl ? (
                                                        <a
                                                            href={source.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-blue-600 underline hover:text-blue-700"
                                                        >
                                                            {displayName}
                                                        </a>
                                                    ) : (
                                                        <span className="font-medium text-blue-600">
                                                            {displayName}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Show Author and Page if they exist */}
                                                <div className="pl-2 text-gray-500">
                                                    {source.author && (
                                                        <p>
                                                            <span className="font-medium">
                                                                Author:
                                                            </span>{' '}
                                                            {source.author}
                                                        </p>
                                                    )}
                                                    {source.page && (
                                                        <p>
                                                            <span className="font-medium">
                                                                Page:
                                                            </span>{' '}
                                                            {source.page}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Show the preview */}
                                                {/* <p className="mt-1 pl-2 text-gray-500 italic">
                                                    "{source.preview}"
                                                </p> */}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
