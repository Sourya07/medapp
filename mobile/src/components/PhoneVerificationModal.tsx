import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface PhoneVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const { sendOTP, verifyPhoneForCheckout } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (phoneNumber.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            await sendOTP(phoneNumber);
            setOtpSent(true);
            Alert.alert('Success', 'OTP sent to your mobile number');
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
            await verifyPhoneForCheckout(phoneNumber, otp);
            Alert.alert('Success', 'Phone number verified successfully!');
            onSuccess();
            handleClose();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPhoneNumber('');
        setOtp('');
        setOtpSent(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={60} color="#0066FF" />
                    </View>

                    <Text style={styles.title}>Verify Phone Number</Text>
                    <Text style={styles.subtitle}>
                        {otpSent
                            ? `Enter the OTP sent to ${phoneNumber}`
                            : 'Enter your mobile number to proceed with checkout'}
                    </Text>

                    {!otpSent ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile Number"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleVerifyOTP}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Verify & Continue</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                <Text style={styles.resendText}>Resend OTP</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    resendText: {
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PhoneVerificationModal;
