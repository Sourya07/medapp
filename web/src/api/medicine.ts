import api from './axios';

export interface Medicine {
    _id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    prescriptionRequired: boolean;
    category: string;
    subcategory?: string;
    manufacturer?: string;
    dosage?: string;
    discount?: number;
    isActive: boolean;
}

export const getMedicines = async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get('/medicines/search', { params });
    // Search endpoint returns { success: true, data: [...] }
    return response.data;
};

export const getMedicineById = async (id: string) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
};

export const createMedicine = async (data: Partial<Medicine>) => {
    const response = await api.post('/medicines', data);
    return response.data;
};

export const updateMedicine = async (id: string, data: Partial<Medicine>) => {
    const response = await api.put(`/medicines/${id}`, data);
    return response.data;
};

export const deleteMedicine = async (id: string) => {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/medicines/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
