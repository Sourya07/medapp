import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { User, APIResponse } from '../types';

interface AuthContextType {
    user: User | null;
    phoneNumber: string | null;
    isPhoneVerified: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    isGuestMode: boolean;
    login: (mobileNumber: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    sendOTP: (mobileNumber: string) => Promise<void>;
    verifyPhoneForCheckout: (mobileNumber: string, otp: string) => Promise<void>;
    continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isGuestMode, setIsGuestMode] = useState(false);

    // Check for existing auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const userData = await SecureStore.getItemAsync('user');
            const guestMode = await SecureStore.getItemAsync('guestMode');
            const savedPhone = await SecureStore.getItemAsync('phoneNumber');
            const phoneVerified = await SecureStore.getItemAsync('phoneVerified');

            if (token && userData) {
                setUser(JSON.parse(userData));
                setIsPhoneVerified(true);
            } else if (guestMode === 'true') {
                setIsGuestMode(true);
                if (savedPhone) {
                    setPhoneNumber(savedPhone);
                    setIsPhoneVerified(phoneVerified === 'true');
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const continueAsGuest = async () => {
        setIsGuestMode(true);
        await SecureStore.setItemAsync('guestMode', 'true');
        setIsLoading(false);
    };

    const sendOTP = async (mobileNumber: string) => {
        try {
            await authAPI.sendOTP(mobileNumber);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const login = async (mobileNumber: string, otp: string) => {
        try {
            const response = await authAPI.verifyOTP(mobileNumber, otp);
            const { user: userData, accessToken, refreshToken } = response.data.data;

            // Store tokens and user data
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            await SecureStore.deleteItemAsync('guestMode');

            setUser(userData);
            setPhoneNumber(mobileNumber);
            setIsPhoneVerified(true);
            setIsGuestMode(false);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const verifyPhoneForCheckout = async (mobileNumber: string, otp: string) => {
        try {
            const response = await authAPI.verifyOTP(mobileNumber, otp);
            const { user: userData, accessToken, refreshToken } = response.data.data;

            // Store minimal data for guest checkout
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            await SecureStore.setItemAsync('phoneNumber', mobileNumber);
            await SecureStore.setItemAsync('phoneVerified', 'true');
            await SecureStore.setItemAsync('user', JSON.stringify(userData));

            setPhoneNumber(mobileNumber);
            setIsPhoneVerified(true);
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Verification failed');
        }
    };

    const logout = async () => {
        try {
            // Clear all user data
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('phoneNumber');
            await SecureStore.deleteItemAsync('phoneVerified');
            await SecureStore.deleteItemAsync('guestMode');

            // Clear cart data
            await AsyncStorage.removeItem('@medical_cart');
            await AsyncStorage.removeItem('@guest_id');

            // Reset state
            setUser(null);
            setPhoneNumber(null);
            setIsPhoneVerified(false);
            setIsGuestMode(false);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                phoneNumber,
                isPhoneVerified,
                isAuthenticated: !!user,
                isLoading,
                isGuestMode,
                login,
                logout,
                sendOTP,
                verifyPhoneForCheckout,
                continueAsGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
