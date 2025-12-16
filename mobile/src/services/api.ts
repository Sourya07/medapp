import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Expo requires EXPO_PUBLIC_ prefix for env vars or use @env
const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://192.168.29.237:5001/api';

console.log('🔧 API Configuration:');
console.log('📡 API_URL:', API_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if (refreshToken) {
                    const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken,
                    });

                    const newAccessToken = data.data.accessToken;
                    await SecureStore.setItemAsync('accessToken', newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// API functions
export const authAPI = {
    sendOTP: (mobileNumber: string) => {
        console.log('📤 Sending OTP request to:', `${API_URL}/auth/send-otp`);
        console.log('📱 Mobile number:', mobileNumber);
        return api.post('/auth/send-otp', { mobileNumber })
            .then(response => {
                console.log('✅ OTP request successful:', response.data);
                return response;
            })
            .catch(error => {
                console.error('❌ OTP request failed:', error.message);
                console.error('Error details:', error.response?.data || error);
                throw error;
            });
    },

    verifyOTP: (mobileNumber: string, otp: string) =>
        api.post('/auth/verify-otp', { mobileNumber, otp }),

    updateLocation: (latitude: number, longitude: number) =>
        api.post('/auth/update-location', { latitude, longitude }),
};

export const storeAPI = {
    getNearbyStores: (latitude?: number, longitude?: number, radius?: number) =>
        api.get('/stores/nearby', { params: { latitude, longitude, radius } }),

    getStoreById: (id: string) =>
        api.get(`/stores/${id}`),
};

export const medicineAPI = {
    search: (query: string, latitude?: number, longitude?: number, nearbyOnly?: boolean) => {
        const params: any = { query };
        if (latitude) params.latitude = latitude;
        if (longitude) params.longitude = longitude;
        if (nearbyOnly !== undefined) params.nearbyOnly = nearbyOnly;

        return api.get('/medicines/search', { params });
    },
    getByCategory: (category: string, page = 1, limit = 20) =>
        api.get(`/medicines/category/${category}`, { params: { page, limit } }),
    getById: (id: string) => api.get(`/medicines/${id}`),
    getByStore: (storeId: string) => api.get(`/medicines/store/${storeId}`),
};

export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getByName: (name: string) => api.get(`/categories/${name}`),
};

export const orderAPI = {
    createOrder: (storeId: string, items: any[], notes?: string) =>
        api.post('/orders', { storeId, items, notes }),

    getOrderById: (id: string) =>
        api.get(`/orders/${id}`),

    getOrderHistory: () =>
        api.get('/orders/history'),
};

export default api;
