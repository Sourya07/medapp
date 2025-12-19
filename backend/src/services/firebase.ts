import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin
let firebaseApp: admin.app.App;

try {
    // 1. Try to load from service-account.json in the root or src folder or CWD
    const serviceAccountPathRoot = path.join(__dirname, '../../service-account.json');
    const serviceAccountPathSrc = path.join(__dirname, '../service-account.json');
    const serviceAccountPathCwd = path.join(process.cwd(), 'service-account.json');

    let serviceAccount: any = null;

    if (fs.existsSync(serviceAccountPathRoot)) {
        console.log('🔥 Found service-account.json in root (relative)');
        serviceAccount = require(serviceAccountPathRoot);
    } else if (fs.existsSync(serviceAccountPathSrc)) {
        console.log('🔥 Found service-account.json in src (relative)');
        serviceAccount = require(serviceAccountPathSrc);
    } else if (fs.existsSync(serviceAccountPathCwd)) {
        console.log('🔥 Found service-account.json in CWD');
        serviceAccount = require(serviceAccountPathCwd);
    }

    if (serviceAccount) {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with service-account.json');
    } else {
        // 2. Fallback to Environment Variables (if deployed)
        // Check if essential vars are present
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                })
            });
            console.log('✅ Firebase Admin initialized with Environment Variables');
        } else {
            console.warn('⚠️  Firebase Admin NOT initialized.');
            console.warn('⚠️  Please place "service-account.json" in backend root OR set FIREBASE_ env vars.');
        }
    }

} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
}

export const auth = admin.auth();
export default firebaseApp!;
