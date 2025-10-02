import { User } from '@/components/settings';

const API_BASE_URL = 'https://diabetes-chatbot-m8zv.onrender.com/api';

export const fetchWithAuth = async (
    endpoint: string,
    options?: RequestInit
) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
                ...options?.headers,
            },
        });

        // If unauthorized, logout & redirect
        if (response.status === 401) {
            console.warn('⚠️ Session expired. Redirecting to signin...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/signin';
            throw new Error('Session expired. Please login again.');
        }

        // Handle non-OK responses
        if (!response.ok) {
            let errorText = await response.text();
            let errorData;

            // Try parsing JSON, fallback to raw text
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = {
                    message: errorText || 'Unknown error from server',
                };
            }

            console.group('🚨 API ERROR');
            console.error('URL:', url);
            console.error('Method:', options?.method || 'GET');
            console.error('Status:', response.status);
            console.error('Status Text:', response.statusText);
            console.error('Error Response:', errorData);
            console.error('Request Body:', options?.body || null);
            console.groupEnd();

            throw new Error(
                errorData.message ||
                    errorData.msg ||
                    `Request failed with ${response.status}`
            );
        }

        // Return parsed JSON or null if empty
        try {
            return await response.json();
        } catch {
            return null; // Useful for DELETE responses
        }
    } catch (error: any) {
        console.group('🔥 NETWORK / FETCH ERROR');
        console.error('URL:', url);
        console.error('Method:', options?.method || 'GET');
        console.error('Error Message:', error.message);
        console.error('Full Error Object:', error);
        console.groupEnd();

        throw error;
    }
};

export const api = {
    // Auth
    register: (data: { name: string; email: string; password: string }) =>
        fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: ({ email, password }: { email: string; password: string }) =>
        fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    // Forgot Password APIs (no token needed)
    forgotPassword: ({ email }: { email: string }) =>
        fetchWithAuth('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    verifyOtp: ({ email, otp }: { email: string; otp: string }) =>
        fetchWithAuth('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }),

    resetPassword: ({ token, password }: { token: string; password: string }) =>
        fetchWithAuth('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        }),

    // Get User
    getUser: () => fetchWithAuth('/auth/me'),

    //Update User
    updateUser: (data: Partial<User>) =>
        fetchWithAuth('/auth/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    // Delete User
    deleteUser: () =>
        fetchWithAuth('/auth/delete', {
            method: 'DELETE',
        }),

    // Glucose
    getGlucoseReadings: () => fetchWithAuth('/glucose/'),
    addGlucoseReading: (data: {
        level: number;
        readingType: string;
        notes?: string;
        recordedAt?: Date;
    }) =>
        fetchWithAuth('/glucose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    updateGlucoseReading: (
        id: string,
        data: {
            level?: number;
            readingType?: string;
            notes?: string;
            recordedAt?: Date;
        }
    ) =>
        fetchWithAuth(`/glucose/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteGlucoseReading: (id: string) =>
        fetchWithAuth(`/glucose/${id}`, {
            method: 'DELETE',
        }),

    // Medication
    getMedications: () => fetchWithAuth('/medications/'),

    addMedication: (data: {
        name: string;
        dosage: string;
        frequency: string;
        times: string[]; // e.g., ["08:00 AM", "08:00 PM"]
        notes?: string;
    }) =>
        fetchWithAuth('/medications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    updateMedication: (
        id: string,
        data: {
            name?: string;
            dosage?: string;
            frequency?: string;
            times?: string[];
            notes?: string;
            taken?: boolean;
            lastTaken?: string;
        }
    ) =>
        fetchWithAuth(`/medications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteMedication: (id: string) =>
        fetchWithAuth(`/medications/${id}`, {
            method: 'DELETE',
        }),

    // Meals
    getMeals: () => fetchWithAuth('/meals/'),

    addMeal: (data: {
        name: string;
        type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
        carbs: number;
        calories: number;
        foods: string[];
        description?: string;
    }) =>
        fetchWithAuth('/meals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    updateMeal: (
        id: string,
        data: {
            name?: string;
            type?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
            carbs?: number;
            calories?: number;
            foods?: string[];
            description?: string;
        }
    ) =>
        fetchWithAuth(`/meals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteMeal: (id: string) =>
        fetchWithAuth(`/meals/${id}`, {
            method: 'DELETE',
        }),

    // Reminders (Calendar Events)
    getReminders: () => fetchWithAuth('/reminders/'),

    addReminder: (data: {
        title: string;
        description?: string;
        date: string | Date; // full date (with time)
        time?: string;
        type?:
            | 'medication'
            | 'glucose'
            | 'meal'
            | 'appointment'
            | 'task'
            | 'reminder';
        frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
        emailReminder?: boolean;
        isTask?: boolean;
        completed?: boolean;
        value?: string;
        enabled?: boolean;
        nextDue?: string | Date;
    }) =>
        fetchWithAuth('/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    updateReminder: (
        id: string,
        data: {
            title?: string;
            description?: string;
            date?: string | Date;
            time?: string;
            type?:
                | 'medication'
                | 'glucose'
                | 'meal'
                | 'appointment'
                | 'task'
                | 'reminder';
            frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
            emailReminder?: boolean;
            isTask?: boolean;
            completed?: boolean;
            value?: string;
            enabled?: boolean;
            nextDue?: string | Date;
        }
    ) =>
        fetchWithAuth(`/reminders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteReminder: (id: string) =>
        fetchWithAuth(`/reminders/${id}`, {
            method: 'DELETE',
        }),

    //chats
    getChats: () => fetchWithAuth('/chats'),

    createChat: (title: string) =>
        fetchWithAuth('/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        }),

    updateChat: (chatId: string, data: { title: string }) =>
        fetchWithAuth(`/chats/${chatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteChat: (chatId: string) =>
        fetchWithAuth(`/chats/${chatId}`, {
            method: 'DELETE',
        }),

    // Messages
    getMessages: (chatId: string) =>
        fetchWithAuth(`/messages?chatId=${chatId}`),

    sendMessage: (chatId: string, content: string) =>
        fetchWithAuth('/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId,
                content,
                role: 'user', // user sends messages, bot handled separately
            }),
        }),

    updateMessage: (messageId: string, data: { content: string }) =>
        fetchWithAuth(`/messages/${messageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),

    deleteMessage: (messageId: string) =>
        fetchWithAuth(`/messages/${messageId}`, {
            method: 'DELETE',
        }),
};

// Example usage in components:
// const data = await fetchWithAuth('/glucose');
