import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    mobileNumber: string;
    otp: string;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
}

const OTPSchema: Schema = new Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            trim: true
        },
        otp: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Auto-delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>('OTP', OTPSchema);
