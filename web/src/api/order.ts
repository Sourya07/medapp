import api from './axios';
import type { Medicine } from './medicine';

export interface OrderItem {
    medicine: Medicine;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    _id: string;
    user: {
        _id: string;
        mobileNumber: string;
    };
    store: {
        _id: string;
        name: string;
        address: string;
    };
    items: OrderItem[];
    totalPrice: number;
    status: 'Pending' | 'Ready' | 'Picked Up' | 'Cancelled';
    deliveryAddress?: {
        name: string;
        fullName: string;
        phoneNumber: string;
        addressLine1: string;
        addressLine2?: string;
        landmark: string;
        pincode: string;
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export const getAllOrders = async (status?: string) => {
    const params = status && status !== 'All' ? { status } : {};
    const response = await api.get('/orders/all', { params });
    return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
};
