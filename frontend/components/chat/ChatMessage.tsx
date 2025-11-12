'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import type { Message } from '@/types/chat';
import AIMessage from '../AImessageContent'; // Assuming this path is correct

// Helper function
const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
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
                    <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                    >
                        {/* FIX: Removed redundant extra div that was here */}
                        <AIMessage content={message.content} />
                    </div>
                    <div className="text-xs text-gray-500 px-2">
                        {formatMessageTime(message.timestamps)}
                    </div>
                </div>
            </div>
        </div>
    );
}
