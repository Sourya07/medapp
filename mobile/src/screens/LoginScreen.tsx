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

const LoginScreen = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const { sendOTP, login, continueAsGuest } = useAuth();

    const handleSendOTP = async () => {
        if (mobileNumber.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            await sendOTP(mobileNumber);
            setOtpSent(true);
            Alert.alert('Success', 'OTP sent to your mobile number');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await login(mobileNumber, otp);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        continueAsGuest();
    };

    return (
        <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>🏥 Medical Store</Text>
                    <Text style={styles.subtitle}>
                        Get medicines delivered from nearby stores
                    </Text>

                    <View style={styles.card}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            editable={!otpSent}
                        />

                        {otpSent && (
                            <TextInput
                                style={styles.input}
                                placeholder="Enter OTP"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={otp}
                                onChangeText={setOtp}
                                autoFocus
                            />
                        )}

                        {loading ? (
                            <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
                        ) : (
                            <>
                                {!otpSent ? (
                                    <>
                                        <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
                                            <Text style={styles.buttonText}>Send OTP</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.guestButton}
                                            onPress={handleGuestMode}
                                        >
                                            <Text style={styles.guestButtonText}>Browse as Guest</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
                                            <Text style={styles.buttonText}>Verify OTP</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.resendButton}
                                            onPress={handleSendOTP}
                                        >
                                            <Text style={styles.resendText}>Resend OTP</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
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
