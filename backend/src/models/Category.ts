import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            enum: ['Pharmacy', 'Lab Tests', 'Pet Care', 'Consults', 'Wellness']
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        displayOrder: {
            type: Number,
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

export default mongoose.model<ICategory>('Category', CategorySchema);
