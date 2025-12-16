export interface Category {
    _id: string;
    name: string;
    description: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
}

export type CategoryName = 'Pharmacy' | 'Lab Tests' | 'Pet Care' | 'Consults' | 'Wellness';
