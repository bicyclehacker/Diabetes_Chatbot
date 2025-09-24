'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Bot,
    User,
    Send,
    Plus,
    MessageSquare,
    Trash2,
    Edit3,
    MoreHorizontal,
    Menu,
    Sparkles,
    Clock,
    Search,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { api } from '@/lib/api';

import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamps: Date;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

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

export function ChatbotInterface() {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        null
    );

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renamingSessionId, setRenamingSessionId] = useState<string>('');
    const [newTitle, setNewTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentSession = chatSessions.find(
        (session) => session.id === currentSessionId
    );
    const filteredSessions = chatSessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.messages]);

    const selectChat = async (sessionId: string) => {
        // Prevent re-fetching if the chat is already selected
        if (currentSessionId === sessionId) return;

        setCurrentSessionId(sessionId);
        setSidebarOpen(false); // Close sidebar on mobile

        // Find the chat in the current state
        const chat = chatSessions.find((s) => s.id === sessionId);

        // Only fetch messages if they haven't been loaded for this session yet
        if (chat && chat.messages.length === 0) {
            try {
                setIsLoading(true);
                const messagesData = await api.getMessages(sessionId);

                const loadedMessages = messagesData.map((msg: any) => ({
                    id: msg._id,
                    role: msg.role,
                    content: msg.content,
                    timestamps: new Date(msg.createdAt),
                }));

                // Update the state with the newly loaded messages
                setChatSessions((prev) =>
                    prev.map((session) =>
                        session.id === sessionId
                            ? { ...session, messages: loadedMessages }
                            : session
                    )
                );
            } catch (error) {
                console.error(
                    'Failed to load messages for chat:',
                    sessionId,
                    error
                );
            } finally {
                setIsLoading(false);
            }
        }
    };

    // ✨ FIX: Add this useEffect to load chats when the component starts
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                const chatsData = await api.getChats();

                const sessions = chatsData.map((chat: any) => ({
                    id: chat._id,
                    title: chat.title,
                    messages: [], // Messages will be loaded when a chat is selected
                    createdAt: new Date(chat.createdAt),
                    updatedAt: new Date(chat.updatedAt),
                }));

                setChatSessions(sessions);

                // Automatically select the most recent chat
                if (sessions.length > 0) {
                    await selectChat(sessions[0].id);
                }
            } catch (error) {
                console.error('Failed to load initial chats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []); // The empty array [] ensures this runs only once on mount

    // ✅ Correctly uses `api.createChat`
    const createNewChat = async () => {
        try {
            setIsLoading(true);
            const data = await api.createChat('New Chat');

            const newSession: ChatSession = {
                id: data._id,
                title: data.title,
                messages: [],
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt),
            };

            setChatSessions((prev) => [newSession, ...prev]);
            setCurrentSessionId(newSession.id);
            setSidebarOpen(false);
        } catch (error) {
            console.error('Error creating new chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ✨ FIX: Integrated API call and robust state handling
    const deleteChat = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const originalSessions = chatSessions;

        // Optimistically update the UI for a faster user experience
        setChatSessions((prev) =>
            prev.filter((session) => session.id !== sessionId)
        );

        try {
            // Call the backend API to permanently delete the chat
            await api.deleteChat(sessionId);

            // If the active chat was deleted, switch to another one
            if (currentSessionId === sessionId) {
                const remaining = originalSessions.filter(
                    (session) => session.id !== sessionId
                );
                if (remaining.length > 0) {
                    setCurrentSessionId(remaining[0].id);
                } else {
                    createNewChat(); // Create a new chat if it was the last one
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            // If the API call fails, revert the UI to its original state
            setChatSessions(originalSessions);
        }
    };

    // ✅ No changes needed, this function just prepares the dialog
    const openRenameDialog = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const session = chatSessions.find((s) => s.id === sessionId);
        if (session) {
            setRenamingSessionId(sessionId);
            setNewTitle(session.title);
            setRenameDialogOpen(true);
        }
    };

    // ✨ FIX: Integrated API call for renaming
    const handleRename = async () => {
        if (!newTitle.trim() || !renamingSessionId) return;

        const originalSessions = chatSessions;
        const trimmedTitle = newTitle.trim();

        // Optimistically update the UI
        setChatSessions((prev) =>
            prev.map((session) =>
                session.id === renamingSessionId
                    ? { ...session, title: trimmedTitle }
                    : session
            )
        );
        setRenameDialogOpen(false);

        try {
            // Call the backend API to save the new title
            await api.updateChat(renamingSessionId, { title: trimmedTitle });
        } catch (error) {
            console.error('Error renaming chat:', error);
            // If the API fails, revert the UI change
            setChatSessions(originalSessions);
            setRenameDialogOpen(true); // Optional: reopen dialog on failure
        } finally {
            setRenamingSessionId('');
            setNewTitle('');
        }
    };

    // ✨ FIX: Integrated real API call for sending messages
    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || !currentSessionId || isLoading) return;

        const trimmedContent = messageContent.trim();
        const userMessage: Message = {
            id: Date.now().toString(), // Temporary ID for the UI
            role: 'user',
            content: trimmedContent,
            timestamps: new Date(),
        };

        // --- START: MODIFIED LOGIC ---

        // 1. Find the current session and determine if it needs a new title.
        const currentSession = chatSessions.find(
            (s) => s.id === currentSessionId
        );
        const isNewChat = currentSession?.title === 'New Chat';
        let newTitle = currentSession?.title || 'New Chat';

        if (isNewChat) {
            // Create a truncated title if the message is long.
            newTitle =
                trimmedContent.length > 14
                    ? `${trimmedContent.slice(0, 11)}...` // Slice less to make room for "..."
                    : trimmedContent;
        }

        // 2. Optimistically update the UI with the user's message and the new title.
        setChatSessions((prev) =>
            prev.map((session) => {
                if (session.id === currentSessionId) {
                    return {
                        ...session,
                        messages: [...session.messages, userMessage],
                        title: newTitle, // Use the new title we just calculated
                        updatedAt: new Date(),
                    };
                }
                return session;
            })
        );

        // 3. If the title was changed, send the update to the backend API.
        // This runs in the background and doesn't block the UI.
        if (isNewChat) {
            try {
                await api.updateChat(currentSessionId, { title: newTitle });
            } catch (error) {
                console.error(
                    'Failed to update chat title on the backend:',
                    error
                );
                // Optional: You could add logic here to revert the title in the UI if the API call fails.
            }
        }

        // --- END: MODIFIED LOGIC ---

        setIsLoading(true);
        setInput('');

        try {
            // 4. Call the backend API to get the assistant's response.
            const assistantResponse = await api.sendMessage(
                currentSessionId,
                trimmedContent
            );

            const assistantMessage: Message = {
                id: assistantResponse._id, // Use the real ID from the backend
                role: 'bot',
                content: assistantResponse.content,
                timestamps: new Date(assistantResponse.createdAt), // Use real timestamp
            };

            // 5. Update the UI with the final bot response.
            setChatSessions((prev) =>
                prev.map((session) => {
                    if (session.id === currentSessionId) {
                        return {
                            ...session,
                            messages: [...session.messages, assistantMessage],
                            updatedAt: new Date(),
                        };
                    }
                    return session;
                })
            );
        } catch (error) {
            console.error('Error sending message:', error);
            // You could add an error message to the chat UI here.
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ No changes needed for these handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (prompt: string) => {
        sendMessage(prompt);
    };

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

    const formatMessageTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <Button
                    onClick={createNewChat}
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
                    {filteredSessions.map((session) => (
                        <div
                            key={session.id}
                            className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                currentSessionId === session.id
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm'
                                    : 'hover:bg-white hover:shadow-sm border border-transparent'
                            }`}
                            onClick={() => selectChat(session.id)}
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
                                    <Clock className="h-3 w-3" />
                                    {formatTime(session.updatedAt)}
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-gray-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                >
                                    <DropdownMenuItem
                                        onClick={(e) =>
                                            openRenameDialog(session.id, e)
                                        }
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) =>
                                            deleteChat(session.id, e)
                                        }
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
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

    return (
        <div className="flex h-screen bg-white">
            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Enter new chat title..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRenameDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={!newTitle.trim()}
                        >
                            Rename
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 border-r border-gray-200">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="lg:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                        </Sheet>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 truncate">
                                    {currentSession?.title || 'New Chat'}
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

                {/* Messages Area */}
                <ScrollArea className="flex-1 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        {!currentSession?.messages.length ? (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                    <Bot className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                    Welcome to DiabetesAI
                                </h2>
                                <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                                    Your personal diabetes management assistant.
                                    Ask me about blood sugar monitoring,
                                    nutrition, medications, or any
                                    health-related questions.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                                    {quickSuggestions.map(
                                        (suggestion, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="p-6 h-auto text-left justify-start hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200 bg-white"
                                                onClick={() =>
                                                    handleSuggestionClick(
                                                        suggestion.prompt
                                                    )
                                                }
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
                                                            {
                                                                suggestion.description
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {currentSession.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-4 ${
                                            message.role === 'user'
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${
                                                message.role === 'user'
                                                    ? 'flex-row-reverse'
                                                    : 'flex-row'
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
                                                    message.role === 'user'
                                                        ? 'items-end'
                                                        : 'items-start'
                                                }`}
                                            >
                                                <div
                                                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                        message.role === 'user'
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                            : 'bg-white border border-gray-200 text-gray-900'
                                                    }`}
                                                >
                                                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                        <ReactMarkdown>
                                                            {message.content ||
                                                                ''}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 px-2">
                                                    {formatMessageTime(
                                                        message.timestamps
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                                            animationDelay:
                                                                '0.1s',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '0.2s',
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

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask DiabetesAI anything about diabetes management..."
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
                            DiabetesAI can make mistakes. Always verify
                            important medical information with your healthcare
                            provider.
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
