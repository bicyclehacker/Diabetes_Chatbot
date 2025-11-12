'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

export function ChatInput({
    input,
    onInputChange,
    onSubmit,
    isLoading,
}: ChatInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when loading stops
    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={onInputChange}
                            placeholder="Ask DiabetesAI anything..."
                            className="pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 shadow-sm"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
                    DiabetesAI can make mistakes. Always verify important
                    medical information with your healthcare provider.
                </div>
            </form>
        </div>
    );
}
