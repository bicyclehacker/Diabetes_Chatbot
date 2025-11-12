'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

const quickSuggestions = [
    {
        icon: '🩺',
        title: 'Blood Sugar Analysis',
        description: 'Help me understand my glucose readings',
        prompt: 'Can you help me analyze my recent blood sugar readings and provide insights?',
    },
    {
        icon: '🍎',
        title: 'Meal Planning',
        description: 'Create a diabetic-friendly meal plan',
        prompt: "Can you suggest a weekly meal plan that's suitable for managing diabetes?",
    },
    {
        icon: '💊',
        title: 'Medication Guide',
        description: 'Information about diabetes medications',
        prompt: 'Can you explain different types of diabetes medications and how they work?',
    },
    {
        icon: '📊',
        title: 'Trend Analysis',
        description: 'Analyze my health data trends',
        prompt: 'Help me understand trends in my diabetes management data',
    },
];

interface ChatWelcomeProps {
    onSuggestionClick: (prompt: string) => void;
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Bot className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Welcome to DiabetesAI
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                Your personal diabetes management assistant. Ask me about blood
                sugar monitoring, nutrition, medications, or any health-related
                questions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {quickSuggestions.map((suggestion, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        className="p-6 h-auto text-left justify-start hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200 bg-white"
                        onClick={() => onSuggestionClick(suggestion.prompt)}
                    >
                        <div className="flex items-start gap-4 w-full">
                            <span className="text-2xl flex-shrink-0">
                                {suggestion.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 mb-1">
                                    {suggestion.title}
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    {suggestion.description}
                                </div>
                            </div>
                        </div>
                    </Button>
                ))}
            </div>
        </div>
    );
}
