// Utility function to generate 6-digit OTP
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility function to send OTP via SMS (using Twilio)
export const sendOTP = async (mobileNumber: string, otp: string): Promise<boolean> => {
    try {
        // For development, just log the OTP
        if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID) {
            console.log('🔧 Running in development mode - OTP will be logged instead of sent');
            console.log(`📱 OTP for ${mobileNumber}: ${otp}`);
            console.log('✅ OTP logged successfully');
            return true;
        }

        // Production: Use Twilio
        console.log(`🚀 Attempting to send OTP to ${mobileNumber} via Twilio...`);

        // Check for required environment variables
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            throw new Error('Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
        }

        if (!process.env.TWILIO_PHONE_NUMBER) {
            throw new Error('Missing TWILIO_PHONE_NUMBER in .env');
        }

        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const message = await client.messages.create({
            body: `Your Medical Store verification code is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobileNumber}` // Assuming Indian numbers
        });

        console.log(`✅ OTP sent successfully to ${mobileNumber}`);
        console.log(`📨 Message SID: ${message.sid}`);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending OTP:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            moreInfo: error.moreInfo
        });
        return false;
    }
};
