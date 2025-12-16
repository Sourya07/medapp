import { Schema, model } from 'mongoose';

interface IAddress {
    user: Schema.Types.ObjectId;
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
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
            // e.g., "Home", "Office", "Mom's Place"
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            maxlength: 15
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        addressLine2: {
            type: String,
            trim: true,
            maxlength: 200
        },
        landmark: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9]{6}$/
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function (coords: number[]) {
                        return coords.length === 2;
                    },
                    message: 'Coordinates must be [longitude, latitude]'
                }
            }
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Geospatial index for location-based queries
AddressSchema.index({ location: '2dsphere' });

// Compound index for user's addresses
AddressSchema.index({ user: 1, isDefault: -1 });

// Ensure only one default address per user
AddressSchema.pre('save', async function (next) {
    if (this.isDefault) {
        // Unset other default addresses for this user
        await Address.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

const Address = model<IAddress>('Address', AddressSchema);

export default Address;
