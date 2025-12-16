import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    mobileNumber: string;
    location: {
        type: string;
        coordinates: number[]; // [longitude, latitude]
    };
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return /^[0-9]{10}$/.test(v);
                },
                message: 'Mobile number must be 10 digits'
            }
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0] // [longitude, latitude]
            }
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Create geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', UserSchema);
