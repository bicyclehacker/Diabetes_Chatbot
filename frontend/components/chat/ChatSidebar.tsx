'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    MessageSquare,
    Trash2,
    Edit3,
    MoreHorizontal,
    Search,
    Clock,
    Sparkles,
} from 'lucide-react';
import type { ChatSession } from '@/types/chat';

// Helper function for formatting time
const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
};

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onCreateChat: () => void;
    onSelectChat: (sessionId: string) => void;
    onOpenRenameDialog: (session: ChatSession) => void;
    onDeleteChat: (sessionId: string) => void;
}

export function ChatSidebar({
    sessions,
    currentSessionId,
    onCreateChat,
    onSelectChat,
    onOpenRenameDialog,
    onDeleteChat,
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSessions = sessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <Button
                    onClick={onCreateChat}
                    className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200"
                    />
                </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    {filteredSessions.map((session) => {
                        // Call formatTime once here
                        const timeAgo = formatTime(session.updatedAt);

                        return (
                            <div
                                key={session.id}
                                className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    currentSessionId === session.id
                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm'
                                        : 'hover:bg-white hover:shadow-sm border border-transparent'
                                }`}
                                onClick={() => onSelectChat(session.id)}
                            >
                                <div
                                    className={`p-2 rounded-lg ${
                                        currentSessionId === session.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                            : 'bg-gray-200 group-hover:bg-gray-300'
                                    }`}
                                >
                                    <MessageSquare
                                        className={`h-4 w-4 ${
                                            currentSessionId === session.id
                                                ? 'text-white'
                                                : 'text-gray-600'
                                        }`}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div
                                        className={`text-sm font-medium truncate whitespace-nowrap ${
                                            currentSessionId === session.id
                                                ? 'text-gray-900'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {session.title}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        {/* Condition is now === 'Just now' */}
                                        {timeAgo === 'Just now' && (
                                            <Clock className="h-3 w-3" />
                                        )}
                                        <span>{timeAgo}</span>
                                    </div>
                                </div>

                                <span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-gray-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenRenameDialog(session);
                                        }}
                                    >
                                        <Edit3 className="h-4 w-4 text-gray-600" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteChat(session.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            DiabetesAI
                        </div>
                        <div className="text-xs text-gray-600">
                            Your health assistant
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
