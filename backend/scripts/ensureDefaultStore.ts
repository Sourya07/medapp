import mongoose from 'mongoose';
import Store from '../src/models/Store';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-store';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const ensureDefaultStore = async () => {
    await connectDB();

    const STORE_NAME = 'ABCD Medical Store';

    try {
        let store = await Store.findOne({ name: STORE_NAME });

        if (!store) {
            console.log(`Creating default store: ${STORE_NAME}...`);
            store = await Store.create({
                name: STORE_NAME,
                address: '123 Main St, Central City',
                location: {
                    type: 'Point',
                    coordinates: [77.5946, 12.9716] // Bangalore coordinates as default
                },
                contactNumber: '9876543210',
                serviceRadius: 100, // Large radius for default
                isActive: true
            });
            console.log('✅ Default store created successfully');
        } else {
            console.log('ℹ️ Default store already exists');
        }

        console.log('\n==========================================');
        console.log(`STORE_ID=${store._id}`);
        console.log(`STORE_NAME="${store.name}"`);
        console.log('==========================================\n');

    } catch (error) {
        console.error('Error ensuring default store:', error);
    } finally {
        await mongoose.disconnect();
    }
};

ensureDefaultStore();
