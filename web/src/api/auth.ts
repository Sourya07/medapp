import api from './axios';

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        admin: {
            id: string;
            email: string;
            role: string;
        };
        token: string;
    };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/login', { email, password });
    return response.data;
};

// Helper to create an admin if needed (optional)
export const createAdmin = async (email: string, password: string) => {
    const response = await api.post('/admin/create', { email, password });
    return response.data;
};
