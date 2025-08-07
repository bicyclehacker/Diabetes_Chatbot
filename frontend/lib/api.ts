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
        // Handle token expiration
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
        throw new Error('Session expired');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
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

    // Glucose
    getGlucoseReadings: () => fetchWithAuth('/glucose'),
    addGlucoseReading: (data: any) =>
        fetchWithAuth('/glucose', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Medications
    getMedications: () => fetchWithAuth('/medications'),

    // Reminders
    getReminders: () => fetchWithAuth('/reminders'),

    // Meals
    getMeals: () => fetchWithAuth('/meals'),

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
