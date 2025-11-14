'use client';

import type React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatSession } from '@/types/chat';

import { ChatWelcome } from '@/components/chat/ChatWelcome';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ISource } from '../chatbot-interface';

interface ChatMessageAreaProps {
    session: ChatSession | undefined;
    isLoading: boolean;
    onSuggestionClick: (prompt: string) => void;
    messagesEndRef: React.Ref<HTMLDivElement>;
    sources: ISource[];
}

export function ChatMessageArea({
    session,
    isLoading,
    onSuggestionClick,
    messagesEndRef,
    sources,
}: ChatMessageAreaProps) {
    return (
        <ScrollArea className="flex-1 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {!session?.messages.length ? (
                    <ChatWelcome onSuggestionClick={onSuggestionClick} />
                ) : (
                    <div className="space-y-6">
                        {session.messages.map((message, index) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                sources={sources}
                                isLastMessage={
                                    index === session.messages.length - 1
                                }
                            />
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 justify-start">
                                <Avatar className="h-10 w-10 shadow-sm">
                                    <AvatarFallback className="bg-white border border-gray-200">
                                        <Bot className="h-5 w-5 text-gray-600" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: '0.1s',
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: '0.2s',
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            DiabetesAI is thinking...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
