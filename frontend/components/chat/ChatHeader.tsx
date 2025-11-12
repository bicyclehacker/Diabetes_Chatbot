'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Menu } from 'lucide-react';

interface ChatHeaderProps {
    currentSessionTitle: string;
    onOpenSidebar: () => void;
}

export function ChatHeader({
    currentSessionTitle,
    onOpenSidebar,
}: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={onOpenSidebar} // Use prop for mobile menu
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 truncate">
                            {currentSessionTitle}
                        </h1>
                        <p className="text-sm text-gray-500">
                            DiabetesAI Assistant
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 font-medium">
                        Online
                    </span>
                </div>
            </div>
        </div>
    );
}
