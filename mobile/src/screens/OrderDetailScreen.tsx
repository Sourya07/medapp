import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderAPI } from '../services/api';
import { Order, OrderStatus } from '../types';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen = () => {
    const route = useRoute<OrderDetailRouteProp>();
    const navigation = useNavigation();
    const { orderId } = route.params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await orderAPI.getOrderById(orderId);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return '#F59E0B';
            case OrderStatus.READY:
                return '#10B981';
            case OrderStatus.PICKED_UP:
                return '#3B82F6';
            case OrderStatus.CANCELLED:
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centerContainer}>
                <Text>Order not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                </View>
                <Text style={styles.dateText}>
                    Placed on {new Date(order.createdAt).toLocaleString()}
                </Text>
            </View>

            {/* Store Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Store Details</Text>
                <Text style={styles.storeName}>{order.store.name}</Text>
                <Text style={styles.addressText}>{order.store.address}</Text>
                <Text style={styles.addressText}>{order.store.contactNumber}</Text>
            </View>

            {/* Delivery Address Section */}
            {order.deliveryAddress && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <Text style={styles.nameText}>{order.deliveryAddress.fullName}</Text>
                    <Text style={styles.addressText}>{order.deliveryAddress.addressLine1}</Text>
                    {order.deliveryAddress.addressLine2 && (
                        <Text style={styles.addressText}>{order.deliveryAddress.addressLine2}</Text>
                    )}
                    <Text style={styles.addressText}>
                        {order.deliveryAddress.landmark}, {order.deliveryAddress.pincode}
                    </Text>
                    <Text style={styles.phoneText}>Phone: {order.deliveryAddress.phoneNumber}</Text>
                </View>
            )}

            {/* Items Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items</Text>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Bill Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Item Total</Text>
                    <Text style={styles.summaryValue}>₹{order.totalPrice.toFixed(2)}</Text>
                </View>

                {/* Add delivery charges if kept separately, assuming total includes it for now */}

                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{order.totalPrice.toFixed(2)}</Text>
                </View>
            </View>

            {order.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Notes</Text>
                    <Text style={styles.notesText}>{order.notes}</Text>
                </View>
            )}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 14,
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 8,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 2,
        lineHeight: 20,
    },
    nameText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    phoneText: {
        fontSize: 14,
        color: '#4B5563',
        marginTop: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemName: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
        marginBottom: 2,
    },
    itemQuantity: {
        fontSize: 13,
        color: '#6B7280',
    },
    itemInfo: {
        flex: 1,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    notesText: {
        fontSize: 14,
        color: '#4B5563',
        fontStyle: 'italic',
    },
});

export default OrderDetailScreen;
