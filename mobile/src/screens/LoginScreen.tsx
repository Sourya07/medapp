import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import app from '../firebaseConfig'; // Get app instance for config

const LoginScreen = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState<any>(null); // Changed to any to hold ConfirmationResult
    const recaptchaVerifier = React.useRef<FirebaseRecaptchaVerifierModal>(null);

    const { login } = useAuth();

    // Handle sending OTP (Real Firebase)
    const handleSendOTP = async () => {
        if (mobileNumber.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            const phoneNumber = '+91' + mobileNumber; // Assume +91 for now, can make dynamic
            console.log('Sending OTP to:', phoneNumber);

            // The Firebase JS SDK `signInWithPhoneNumber` requires the ApplicationVerifier
            // which is connected to the Recaptcha Modal via ref.
            // @ts-ignore - API types mismatch with Expo wrapper slightly
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current!);

            // In some versions, it returns a ConfirmationResult (with .confirm), 
            // in others (React Native wrapper context) it might yield a verificationId string.
            // Let's handle the standard JS SDK object which is ConfirmationResult.
            // Actually, wait, `signInWithPhoneNumber` returns `ConfirmationResult`.

            /* 
               NOTE: `expo-firebase-recaptcha` is a bit of a polyfill. 
               If `verificationId` is actually a ConfirmationResult object, we store it.
            */

            setVerificationId(confirmationResult);
            setOtpSent(true);
            Alert.alert('Success', 'OTP sent to your mobile number');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.code === 'auth/invalid-phone-number' ? 'Invalid Phone Number' : error.message);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            let idToken;

            if (verificationId && verificationId.confirm) {
                // It's a ConfirmationResult object
                const confirmation = verificationId;
                const userCredential = await confirmation.confirm(otp);
                idToken = await userCredential.user.getIdToken();
            } else {
                // Fallback or if using pure PhoneAuthProvider.credential (manual flow)
                // const credential = PhoneAuthProvider.credential(verificationId as string, otp);
                // const userCredential = await signInWithCredential(auth, credential);
                // idToken = await userCredential.user.getIdToken();
                throw new Error('Verification session lost. Please retry.');
            }

            console.log('✅ Phone Auth Success. ID Token obtained.');

            // Send to Backend
            await login(idToken);
            // Navigation handled by context

        } catch (error: any) {
            console.error('Verify Error:', error);
            if (error.code === 'auth/invalid-verification-code') {
                Alert.alert('Error', 'Invalid OTP Code');
            } else {
                Alert.alert('Error', error.message || 'Verification failed');
            }
        } finally {
            setLoading(false);
        }
    };

    // Removed handleGuestMode as it's not part of the instruction's scope and `continueAsGuest` is not defined.

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.container}
            >
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={app.options}
                // attemptInvisibleVerification={true} // Optional: try invisible first
                />

                <View style={styles.content}>
                    <Text style={styles.title}>🏥 Medical Store</Text>
                    <Text style={styles.subtitle}>
                        Get medicines delivered from nearby stores
                    </Text>
                    <View style={styles.card}>
                        <View style={styles.formContainer}>
                            {!otpSent ? (
                                <>
                                    <Text style={styles.label}>Mobile Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 10-digit number"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={mobileNumber}
                                        onChangeText={setMobileNumber}
                                    />
                                    {loading ? (
                                        <ActivityIndicator color="#0066FF" />
                                    ) : (
                                        <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
                                            <Text style={styles.buttonText}>Send OTP</Text>
                                        </TouchableOpacity>
                                    )}
                                    <FirebaseRecaptchaBanner />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.label}>Enter OTP</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 6-digit OTP"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        value={otp}
                                        onChangeText={setOtp}
                                    />
                                    {loading ? (
                                        <ActivityIndicator color="#0066FF" />
                                    ) : (
                                        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
                                            <Text style={styles.buttonText}>Verify & Login</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={() => setOtpSent(false)} disabled={loading}>
                                        <Text style={styles.resendText}>Change Number</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#E0F2FE',
        textAlign: 'center',
        marginBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resendButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    resendText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    guestButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    guestButtonText: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '600',
    },
    loader: {
        marginTop: 20,
    },
});

export default LoginScreen;
