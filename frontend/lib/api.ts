import { User } from '@/components/settings';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchWithAuth = async (
    endpoint: string,
    options?: RequestInit
) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options?.headers,
        },
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
        throw new Error('Session expired');
    }

    if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
            const errorData = await response.json();
            console.error('Server Error Response: ', errorData);
            errorMessage = errorData.message || errorMessage;
        } catch (err) {
            // Fallback if response is not JSON
            const text = await response.text();
            if (text && text.length < 500) {
                errorMessage = text;
            }
        }

        throw new Error(errorMessage);
    }

    try {
        return await response.json();
    } catch {
        return null; // In case response is empty (like DELETE)
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

    // Chats
    getChats: () => fetchWithAuth('/chats'),
    createChat: (title: string) =>
        fetchWithAuth('/chats', {
            method: 'POST',
            body: JSON.stringify({ title }),
        }),

    // Messages
    getMessages: (chatId: string) =>
        fetchWithAuth(`/messages?chatId=${chatId}`),
    sendMessage: (chatId: string, content: string) =>
        fetchWithAuth('/messages', {
            method: 'POST',
            body: JSON.stringify({ chatId, content, role: 'user' }),
        }),
};

// Example usage in components:
// const data = await fetchWithAuth('/glucose');
