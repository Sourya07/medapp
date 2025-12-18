import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../services/addressAPI';
import { Address } from '../types';

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Profile'>,
    StackNavigationProp<RootStackParamList>
>;

import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import app from '../firebaseConfig'; // Get app instance for config

const ProfileScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, logout, login, isGuestMode } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    // Login State
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [verificationId, setVerificationId] = useState<any>(null);
    const recaptchaVerifier = React.useRef<FirebaseRecaptchaVerifierModal>(null);

    useEffect(() => {
        if (user) {
            fetchAddresses();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const response = await addressAPI.getAddresses();
            setAddresses(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auth Handlers (Updated for Firebase)
    const handleSendOTP = async () => {
        if (mobileNumber.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setAuthLoading(true);
        try {
            const phoneNumber = '+91' + mobileNumber;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current!);
            setVerificationId(confirmationResult);
            setOtpSent(true);
            Alert.alert('Success', 'OTP sent to your mobile number');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.code === 'auth/invalid-phone-number' ? 'Invalid Phone Number' : error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter valid 6-digit OTP');
            return;
        }

        setAuthLoading(true);
        try {
            let idToken;

            if (verificationId && verificationId.confirm) {
                const confirmation = verificationId;
                const userCredential = await confirmation.confirm(otp);
                idToken = await userCredential.user.getIdToken();
            } else {
                throw new Error('Verification session lost. Please retry.');
            }

            // Send to Backend
            await login(idToken);
            // On success, user state updates automatically
        } catch (error: any) {
            if (error.code === 'auth/invalid-verification-code') {
                Alert.alert('Error', 'Invalid OTP Code');
            } else {
                Alert.alert('Error', error.message || 'Verification failed');
            }
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };

    const handleDeleteAddress = (addressId: string) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressAPI.deleteAddress(addressId);
                            fetchAddresses();
                            Alert.alert('Success', 'Address deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete address');
                        }
                    }
                }
            ]
        );
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            await addressAPI.setDefaultAddress(addressId);
            fetchAddresses();
        } catch (error) {
            Alert.alert('Error', 'Failed to set default address');
        }
    };

    if (!user) {
        return (
            <View style={guestStyles.container}>
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={app.options}
                />
                <View style={guestStyles.content}>
                    <Ionicons name="person-circle-outline" size={80} color="#0066FF" />
                    <Text style={guestStyles.title}>Login to Profile</Text>
                    <Text style={guestStyles.subtitle}>
                        Manage your addresses and orders
                    </Text>

                    <View style={guestStyles.form}>
                        {/* Login Form */}
                        {!otpSent ? (
                            <>
                                <TextInput
                                    style={guestStyles.input}
                                    placeholder="Mobile Number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={mobileNumber}
                                    onChangeText={setMobileNumber}
                                />
                                <TouchableOpacity style={guestStyles.button} onPress={handleSendOTP}>
                                    {authLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={guestStyles.buttonText}>Send OTP</Text>
                                    )}
                                </TouchableOpacity>
                                <FirebaseRecaptchaBanner />
                            </>
                        ) : (
                            <>
                                <TextInput
                                    style={guestStyles.input}
                                    placeholder="Enter OTP / Code"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                                <TouchableOpacity style={guestStyles.button} onPress={handleVerifyOTP}>
                                    {authLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={guestStyles.buttonText}>Verify & Login</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={guestStyles.resendButton}
                                    onPress={() => setOtpSent(false)}
                                >
                                    <Text style={guestStyles.resendText}>Change Number</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* User Info */}
            <View style={styles.userSection}>
                <View style={styles.userIconContainer}>
                    <Ionicons name="person" size={40} color="#FFF" />
                </View>
                <Text style={styles.userName}>{user?.mobileNumber || 'User'}</Text>
            </View>

            {/* Addresses Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Saved Addresses</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddAddress' as any, { mode: 'add' })}
                    >
                        <Ionicons name="add-circle" size={24} color="#0066FF" />
                        <Text style={styles.addButtonText}>Add New</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0066FF" style={styles.loader} />
                ) : addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={60} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No addresses saved</Text>
                        <Text style={styles.emptySubtext}>Add your delivery address to continue</Text>
                    </View>
                ) : (
                    addresses.map((address) => (
                        <View key={address._id} style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <View style={styles.addressNameRow}>
                                    <Ionicons
                                        name={address.isDefault ? 'home' : 'location'}
                                        size={20}
                                        color={address.isDefault ? '#0066FF' : '#6B7280'}
                                    />
                                    <Text style={styles.addressName}>{address.name}</Text>
                                    {address.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultText}>Default</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.addressActions}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('AddAddress' as any, {
                                            mode: 'edit',
                                            address
                                        })}
                                    >
                                        <Ionicons name="pencil" size={20} color="#0066FF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteAddress(address._id)}
                                        style={{ marginLeft: 16 }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.addressFullName}>{address.fullName}</Text>
                            <Text style={styles.addressLine}>{address.addressLine1}</Text>
                            {address.addressLine2 && (
                                <Text style={styles.addressLine}>{address.addressLine2}</Text>
                            )}
                            <Text style={styles.addressLine}>
                                Landmark: {address.landmark}
                            </Text>
                            <Text style={styles.addressLine}>
                                Pincode: {address.pincode}
                            </Text>
                            <Text style={styles.addressPhone}>{address.phoneNumber}</Text>

                            {!address.isDefault && (
                                <TouchableOpacity
                                    style={styles.setDefaultButton}
                                    onPress={() => handleSetDefault(address._id)}
                                >
                                    <Text style={styles.setDefaultText}>Set as Default</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    userSection: {
        backgroundColor: '#0066FF',
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    userIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    section: {
        backgroundColor: '#FFF',
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addButtonText: {
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        marginVertical: 40,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    addressNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    defaultBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0066FF',
    },
    addressActions: {
        flexDirection: 'row',
    },
    addressFullName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    addressLine: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    addressPhone: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    setDefaultButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    setDefaultText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0066FF',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B6B',
    },
});

const guestStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
    input: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    button: {
        width: '100%',
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    resendButton: {
        marginTop: 12,
        alignItems: 'center',
    },
    resendText: {
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ProfileScreen;
