import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: number[]; // [longitude, latitude]
    };
    serviceRadius: number; // in kilometers
    contactNumber: string;
    openingHours?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StoreSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        serviceRadius: {
            type: Number,
            default: 50, // 50 km default
            min: 1,
            max: 100
        },
        contactNumber: {
            type: String,
            required: true
        },
        openingHours: {
            type: String,
            default: '24/7'
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

// Create geospatial index for location-based queries
StoreSchema.index({ location: '2dsphere' });

export default mongoose.model<IStore>('Store', StoreSchema);
