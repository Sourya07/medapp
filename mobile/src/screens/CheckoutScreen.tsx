import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { addressAPI } from '../services/addressAPI';
import { Address } from '../types';
import PhoneVerificationModal from '../components/PhoneVerificationModal';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { cart, getTotalPrice, clearCart } = useCart();
    const { isPhoneVerified } = useAuth();
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [checkingAddress, setCheckingAddress] = useState(true);
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('COD');

    useEffect(() => {
        checkUserAddresses();
    }, []);

    const checkUserAddresses = async () => {
        try {
            const response = await addressAPI.getAddresses();
            const userAddresses = response.data.data || [];
            setAddresses(userAddresses);

            if (userAddresses.length === 0) {
                // No addresses - redirect to add address
                Alert.alert(
                    'Address Required',
                    'Please add a delivery address to proceed with checkout',
                    [
                        {
                            text: 'Add Address',
                            onPress: () => navigation.navigate('AddAddress', { mode: 'add' })
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                // Select default address or first one
                const defaultAddr = userAddresses.find((addr: Address) => addr.isDefault);
                setSelectedAddress(defaultAddr || userAddresses[0]);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            Alert.alert('Error', 'Failed to load addresses');
        } finally {
            setCheckingAddress(false);
        }
    };

    const handlePlaceOrder = async () => {
        // Check if phone is verified
        if (!isPhoneVerified) {
            setShowPhoneVerification(true);
            return;
        }

        setLoading(true);
        try {
            // Get store ID from first item
            const storeId = typeof cart[0].medicine.store === 'object'
                ? cart[0].medicine.store._id
                : cart[0].medicine.store;

            // Validate store ID exists
            if (!storeId) {
                Alert.alert('Error', 'Store information is missing. Please try again.');
                setLoading(false);
                return;
            }

            // Prepare items
            const items = cart.map(item => ({
                medicineId: item.medicine._id,
                quantity: item.quantity,
            }));

            const response = await orderAPI.createOrder(storeId, items, notes);

            clearCart();
            Alert.alert(
                'Success',
                'Order placed successfully!',
                [
                    {
                        text: 'View Order',
                        onPress: () => navigation.navigate('OrderDetail', { orderId: response.data.data._id }),
                    },
                    {
                        text: 'Go Home',
                        onPress: () => navigation.navigate('Home'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (checkingAddress) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0066FF" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Checking addresses...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Delivery Address Section */}
            {selectedAddress && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <View style={styles.addressRow}>
                            <Ionicons name="location" size={20} color="#0066FF" />
                            <Text style={styles.addressName}>{selectedAddress.name}</Text>
                        </View>
                        <Text style={styles.addressFullName}>{selectedAddress.fullName}</Text>
                        <Text style={styles.addressText}>{selectedAddress.addressLine1}</Text>
                        {selectedAddress.addressLine2 && (
                            <Text style={styles.addressText}>{selectedAddress.addressLine2}</Text>
                        )}
                        <Text style={styles.addressText}>Landmark: {selectedAddress.landmark}</Text>
                        <Text style={styles.addressText}>Pincode: {selectedAddress.pincode}</Text>
                        <Text style={styles.addressPhone}>{selectedAddress.phoneNumber}</Text>
                    </View>
                </View>
            )}

            {/* Order Summary Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {cart.map(item => (
                    <View key={item.medicine._id} style={styles.orderItem}>
                        <Text style={styles.itemName}>{item.medicine.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>
                            ₹{(item.medicine.price * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <TextInput
                    style={styles.notesInput}
                    placeholder="Any special instructions..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {/* Payment Method Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentOptions}>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'COD' && styles.paymentOptionSelected
                        ]}
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <Ionicons
                            name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
                            size={24}
                            color={paymentMethod === 'COD' ? '#0066FF' : '#9CA3AF'}
                        />
                        <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'UPI' && styles.paymentOptionSelected
                        ]}
                        onPress={() => setPaymentMethod('UPI')}
                    >
                        <Ionicons
                            name={paymentMethod === 'UPI' ? 'radio-button-on' : 'radio-button-off'}
                            size={24}
                            color={paymentMethod === 'UPI' ? '#0066FF' : '#9CA3AF'}
                        />
                        <Text style={styles.paymentOptionText}>UPI Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'CARD' && styles.paymentOptionSelected
                        ]}
                        onPress={() => setPaymentMethod('CARD')}
                    >
                        <Ionicons
                            name={paymentMethod === 'CARD' ? 'radio-button-on' : 'radio-button-off'}
                            size={24}
                            color={paymentMethod === 'CARD' ? '#0066FF' : '#9CA3AF'}
                        />
                        <Text style={styles.paymentOptionText}>Card / Wallet</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{getTotalPrice().toFixed(2)}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
            ) : (
                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
                    <Text style={styles.placeOrderButtonText}>Place Order</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.note}>
                Your order will be ready for pickup. You'll receive the store location once the order is confirmed.
            </Text>

            {/* Phone Verification Modal */}
            <PhoneVerificationModal
                visible={showPhoneVerification}
                onClose={() => setShowPhoneVerification(false)}
                onSuccess={() => {
                    setShowPhoneVerification(false);
                    // Auto-proceed to place order after verification
                    handlePlaceOrder();
                }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    changeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066FF',
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addressFullName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    addressPhone: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#6B7280',
        marginHorizontal: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    notesInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
    },
    totalSection: {
        backgroundColor: '#fff',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    placeOrderButton: {
        backgroundColor: '#3B82F6',
        margin: 16,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    note: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 12,
        paddingHorizontal: 32,
        marginBottom: 32,
    },
    loader: {
        margin: 32,
    },
    paymentOptions: {
        gap: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        gap: 12,
    },
    paymentOptionSelected: {
        borderColor: '#0066FF',
        backgroundColor: '#EFF6FF',
    },
    paymentOptionText: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
});

export default CheckoutScreen;
