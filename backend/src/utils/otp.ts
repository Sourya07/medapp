// Utility function to generate 6-digit OTP
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility function to send OTP - Placeholder for Firebase Migration
// In Firebase Auth, the CLIENT sends the OTP (or handles it). 
// The Backend mostly verifies the ID Token. 
// However, if we need custom OTP SMS (not Firebase), we would put it here.
// For now, we will just log it.
export const sendOTP = async (mobileNumber: string, otp: string): Promise<boolean> => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 OTP for ${mobileNumber}: ${otp}`);
        return true;
    }
    // TODO: Integrate Firebase Admin if we want to trigger SMS from backend (unlikely for Phone Auth)
    console.log('Use Firebase Client SDK for phone auth.');
    return true;
};
