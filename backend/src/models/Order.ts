import mongoose, { Document, Schema } from 'mongoose';

export enum OrderStatus {
    PENDING = 'Pending',
    READY = 'Ready',
    PICKED_UP = 'Picked Up',
    CANCELLED = 'Cancelled'
}

export interface IOrderItem {
    medicine: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    store: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalPrice: number;
    status: OrderStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
    medicine: {
        type: Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    name: {
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
        min: 1
    }
});

const OrderSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        store: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: function (items: IOrderItem[]) {
                    return items.length > 0;
                },
                message: 'Order must have at least one item'
            }
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING
        },
        notes: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
