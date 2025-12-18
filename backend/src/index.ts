import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import storeRoutes from './routes/store';
import medicineRoutes from './routes/medicine';
import orderRoutes from './routes/order';
import adminRoutes from './routes/admin';
import addressRoutes from './routes/address';
import categoryRoutes from './routes/category';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req: Request, _res: Response, next: Function) => {
    console.log(`📥 ${req.method} ${req.url} - IP: ${req.ip}`);
    console.log(`🔑 Headers: ${JSON.stringify(req.headers.authorization ? 'Present' : 'Missing')}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Medical Store API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-store';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🏥 Medical Store API ready at http://localhost:${PORT}`);
    });
};

startServer();

export default app;
