import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicine extends Document {
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    prescriptionRequired: boolean;
    store?: mongoose.Types.ObjectId; // Optional now - single-store model
    category: string; // Required - Pharmacy, Lab Tests, etc.
    subcategory?: string; // Optional - Pain Relief, Diabetes Care, etc.
    manufacturer?: string;
    dosage?: string; // e.g., "500mg", "10ml"
    discount?: number; // Discount percentage
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MedicineSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        imageUrl: {
            type: String,
            default: ''
        },
        prescriptionRequired: {
            type: Boolean,
            default: false
        },
        store: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: false, // Optional for single-store model
            index: true
        },
        category: {
            type: String,
            required: true,
            enum: ['Pharmacy', 'Lab Tests', 'Pet Care', 'Consults', 'Wellness'],
            index: true
        },
        subcategory: {
            type: String,
            trim: true
        },
        manufacturer: {
            type: String,
            trim: true
        },
        dosage: {
            type: String,
            trim: true
        },
        discount: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Text index for search functionality
MedicineSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);
