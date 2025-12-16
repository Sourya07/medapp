import api from './api';

export interface Address {
    _id: string;
    user: string;
    name: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark: string;
    pincode: string;
    location: {
        type: string;
        coordinates: number[]; // [longitude, latitude]
    };
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressData {
    name: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark: string;
    pincode: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
}

export const addressAPI = {
    // Get all user addresses
    getAddresses: () => {
        return api.get('/addresses');
    },

    // Create new address
    createAddress: (data: CreateAddressData) => {
        return api.post('/addresses', data);
    },

    // Update address
    updateAddress: (id: string, data: Partial<CreateAddressData>) => {
        return api.put(`/addresses/${id}`, data);
    },

    // Delete address
    deleteAddress: (id: string) => {
        return api.delete(`/addresses/${id}`);
    },

    // Set default address
    setDefaultAddress: (id: string) => {
        return api.patch(`/addresses/${id}/default`);
    }
};
