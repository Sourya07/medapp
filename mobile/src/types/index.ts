export interface User {
    id: string;
    mobileNumber: string;
    location: {
        type: string;
        coordinates: number[]; // [longitude, latitude]
    };
}

export interface Store {
    _id: string;
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: number[]; // [longitude, latitude]
    };
    contactNumber: string;
    openingHours?: string;
    distance?: number; // in kilometers
    serviceRadius: number;
    isActive: boolean;
}

export interface Medicine {
    _id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    prescriptionRequired: boolean;
    store?: Store | string; // Optional now - single-store model
    category: string; // Required - Pharmacy, Lab Tests, Pet Care, Consults, Wellness
    subcategory?: string; // Optional - Pain Relief, Diabetes Care, etc.
    manufacturer?: string;
    dosage?: string; // e.g., "500mg", "10ml"
    discount?: number; // Discount percentage (0-100)
    isActive: boolean;
}

export interface OrderItem {
    medicine: string;
    name: string;
    price: number;
    quantity: number;
}

export enum OrderStatus {
    PENDING = 'Pending',
    READY = 'Ready',
    PICKED_UP = 'Picked Up',
    CANCELLED = 'Cancelled'
}

export interface Order {
    _id: string;
    user: string;
    store: Store;
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    medicine: Medicine;
    quantity: number;
}

export interface APIResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
}

export interface Location {
    latitude: number;
    longitude: number;
}

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
        coordinates: number[];
    };
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}
