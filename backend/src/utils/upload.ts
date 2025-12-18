import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Increased to 10MB
    }
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
    // Check if Cloudinary credentials are present
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'medical-store/medicines',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload failed, falling back to local:', error);
                        // Fallback to local if Cloudinary fails significantly? 
                        // Usually reject if creds are wrong.
                        saveToLocal(file).then(resolve).catch(reject);
                    } else {
                        resolve(result!.secure_url);
                    }
                }
            );

            uploadStream.end(file.buffer);
        });
    } else {
        // Fallback to local storage if no Cloudinary config
        console.log('Cloudinary not configured, using local storage');
        return saveToLocal(file);
    }
};

// Local storage helper
const saveToLocal = async (file: Express.Multer.File): Promise<string> => {
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, file.buffer, (err) => {
            if (err) {
                reject(err);
            } else {
                // Return relative path accessible via http://localhost:PORT/uploads/filename
                // The frontend/API should handle the base URL.
                // Depending on implementation, returning full URL is safer.
                const port = process.env.PORT || 5001; // Assuming port 5001 as seen in logs
                // We'll return a full URL if possible, or a relative one.
                // Let's assume absolute URL for simplicity for now.
                resolve(`http://localhost:${port}/uploads/${filename}`);
            }
        });
    });
};

export default cloudinary;
