export interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamps: Date;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
