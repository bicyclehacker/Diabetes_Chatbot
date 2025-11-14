'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { api } from '@/lib/api';

// Import our new types
import type { ChatSession, Message } from '@/types/chat';

// Import our new modular components
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessageArea } from '@/components/chat/ChatMessageArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatRenameDialog } from '@/components/chat/ChatRenameDialog';

export interface ISource {
    id: string; // e.g., "[Source 1]"
    preview: string; // e.g., "322 - 328 ...."

    // These are the fields from your metadata
    source?: string; // e.g., "data/diabetesone.pdf"
    title?: string; // e.g., "Textbook of Diabetes, FOURTH EDITION"
    author?: string; // e.g., "RICHARD I.G. HOLT"
    page?: number | string; // e.g., 936
    url?: string; // We'll keep checking for this, in case your data has it

    // For any other fields that might exist
    [key: string]: any;
}

export function ChatbotInterface() {
    // --- STATE MANAGEMENT ---
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        null
    );
    const [currentSources, setCurrentSources] = useState<ISource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');

    // State for UI controls
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renamingSession, setRenamingSession] = useState<ChatSession | null>(
        null
    );

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentSession = chatSessions.find(
        (session) => session.id === currentSessionId
    );

    // --- DATA FETCHING & SIDE EFFECTS ---

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.messages]);

    // Load all chat sessions on initial component mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                const chatsData = await api.getChats();

                const sessions = chatsData.map((chat: any) => ({
                    id: chat._id,
                    title: chat.title,
                    messages: [], // Messages will be loaded on-demand
                    createdAt: new Date(chat.createdAt),
                    updatedAt: new Date(chat.updatedAt),
                }));

                setChatSessions(sessions);

                // Automatically select the most recent chat
                if (sessions.length > 0) {
                    await selectChat(sessions[0].id, sessions);
                }
            } catch (error) {
                console.error('Failed to load initial chats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array ensures this runs only once on mount

    // --- API HANDLERS ---

    /**
     * Selects a chat and fetches its messages if they aren't already loaded.
     */
    const selectChat = async (
        sessionId: string,
        sessionsList = chatSessions
    ) => {
        if (currentSessionId === sessionId) return;

        setCurrentSessionId(sessionId);
        setSidebarOpen(false); // Close sidebar on mobile

        const chat = sessionsList.find((s) => s.id === sessionId);

        // Only fetch messages if they haven't been loaded
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

                setChatSessions((prev) =>
                    prev.map((session) =>
                        session.id === sessionId
                            ? { ...session, messages: loadedMessages }
                            : session
                    )
                );
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    /**
     * Creates a new chat session, adds it to state, and selects it.
     */
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

    /**
     * Deletes a chat session from the backend and optimistically from the UI.
     */
    const deleteChat = async (sessionId: string) => {
        const originalSessions = chatSessions;

        // Optimistically update UI
        setChatSessions((prev) =>
            prev.filter((session) => session.id !== sessionId)
        );

        try {
            await api.deleteChat(sessionId);

            // If the active chat was deleted, switch to another
            if (currentSessionId === sessionId) {
                const remaining = originalSessions.filter(
                    (session) => session.id !== sessionId
                );
                if (remaining.length > 0) {
                    await selectChat(remaining[0].id, remaining);
                } else {
                    await createNewChat(); // Create a new chat if it was the last one
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            setChatSessions(originalSessions); // Revert on failure
        }
    };

    /**
     * Opens the rename dialog and sets the session to be renamed.
     */
    const openRenameDialog = (session: ChatSession) => {
        setRenamingSession(session);
        setRenameDialogOpen(true);
    };

    /**
     * Renames a chat session on the backend and optimistically in the UI.
     */
    const handleRename = async (newTitle: string) => {
        if (!newTitle.trim() || !renamingSession) return;

        const originalSessions = chatSessions;
        const trimmedTitle = newTitle.trim();

        // Optimistically update UI
        setChatSessions((prev) =>
            prev.map((session) =>
                session.id === renamingSession.id
                    ? { ...session, title: trimmedTitle }
                    : session
            )
        );
        setRenameDialogOpen(false);

        try {
            await api.updateChat(renamingSession.id, { title: trimmedTitle });
        } catch (error) {
            console.error('Error renaming chat:', error);
            setChatSessions(originalSessions); // Revert on failure
        } finally {
            setRenamingSession(null);
        }
    };

    /**
     * Sends a user message, updates the UI, and gets a bot response.
     */
    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || !currentSessionId || isLoading) return;

        const trimmedContent = messageContent.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: trimmedContent,
            timestamps: new Date(),
        };

        // Optimistically update UI with user message
        setChatSessions((prev) =>
            prev.map((s) =>
                s.id === currentSessionId
                    ? {
                          ...s,
                          messages: [...s.messages, userMessage],
                          updatedAt: new Date(),
                      }
                    : s
            )
        );

        setCurrentSources([]);
        setIsLoading(true);
        setInput('');

        try {
            // CALL API (This now returns { botMessage, newTitle })
            const responseData = await api.sendMessage(
                currentSessionId,
                trimmedContent
            );

            // Destructure the response from the backend
            const {
                botMessage: assistantResponse,
                newTitle,
                sources,
            } = responseData;

            const assistantMessage: Message = {
                id: assistantResponse._id,
                role: 'bot',
                content: assistantResponse.content,
                timestamps: new Date(assistantResponse.createdAt),
            };

            setCurrentSources(sources);

            // UPDATE UI WITH BOT MESSAGE AND NEW TITLE
            setChatSessions((prev) =>
                prev.map((s) => {
                    if (s.id === currentSessionId) {
                        return {
                            ...s,
                            messages: [...s.messages, assistantMessage],
                            updatedAt: new Date(),
                            // If newTitle exists, update the title.
                            // Otherwise, keep the existing title.
                            title: newTitle || s.title,
                        };
                    }
                    return s;
                })
            );
        } catch (error) {
            console.error('Error sending message:', error);
            // Error handling (unchanged)
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'bot',
                content: 'Sorry, I ran into an error. Please try again.',
                timestamps: new Date(),
            };
            setChatSessions((prev) =>
                prev.map((s) =>
                    s.id === currentSessionId
                        ? { ...s, messages: [...s.messages, errorMessage] }
                        : s
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the form submission for sending a message.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    /**
     * Handles clicking on a quick suggestion.
     */
    const handleSuggestionClick = (prompt: string) => {
        sendMessage(prompt);
    };

    // --- RENDER ---

    return (
        <div className="flex h-screen bg-white">
            {/* Rename Dialog (Memoized and controlled) */}
            {renamingSession && (
                <ChatRenameDialog
                    isOpen={renameDialogOpen}
                    onOpenChange={setRenameDialogOpen}
                    onSubmit={handleRename}
                    initialTitle={renamingSession.title}
                />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-100 border-r border-gray-200">
                <ChatSidebar
                    sessions={chatSessions}
                    currentSessionId={currentSessionId}
                    onCreateChat={createNewChat}
                    onSelectChat={selectChat}
                    onOpenRenameDialog={openRenameDialog}
                    onDeleteChat={deleteChat}
                />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0">
                    <ChatSidebar
                        sessions={chatSessions}
                        currentSessionId={currentSessionId}
                        onCreateChat={createNewChat}
                        onSelectChat={selectChat}
                        onOpenRenameDialog={openRenameDialog}
                        onDeleteChat={deleteChat}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatHeader
                    currentSessionTitle={currentSession?.title || 'New Chat'}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <ChatMessageArea
                    session={currentSession}
                    isLoading={isLoading}
                    onSuggestionClick={handleSuggestionClick}
                    messagesEndRef={messagesEndRef}
                    sources={currentSources}
                />

                <ChatInput
                    input={input}
                    onInputChange={(e) => setInput(e.target.value)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
