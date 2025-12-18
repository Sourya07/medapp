import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { addressAPI, Address } from '../services/addressAPI';

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Cart'>,
    StackNavigationProp<RootStackParamList>
>;

const CartScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const isFocused = useIsFocused();
    const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
    const [promoCode, setPromoCode] = useState('');

    useEffect(() => {
        if (isFocused) {
            fetchDefaultAddress();
        }
    }, [isFocused]);

    const fetchDefaultAddress = async () => {
        try {
            const response = await addressAPI.getAddresses();
            const addresses = response.data.data || [];
            if (addresses.length > 0) {
                const def = addresses.find((a: Address) => a.isDefault) || addresses[0];
                setDefaultAddress(def);
            } else {
                setDefaultAddress(null);
            }
        } catch (error) {
            console.error('Failed to fetch address:', error);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        // Check if all items are from the same store
        const storeIds = new Set(cart.map(item => {
            const store = typeof item.medicine.store === 'object' ? item.medicine.store._id : item.medicine.store;
            return store;
        }));

        if (storeIds.size > 1) {
            Alert.alert('Error', 'All items must be from the same store');
            return;
        }

        navigation.navigate('Checkout');
    };

    const renderCartItem = ({ item }: { item: CartItem }) => {
        // Assume store is populated
        return (
            <View style={styles.itemRow}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {item.medicine.imageUrl ? (
                        <Image source={{ uri: item.medicine.imageUrl }} style={styles.itemImage} />
                    ) : (
                        <View style={[styles.itemImage, styles.placeholderImage]}>
                            <Text>💊</Text>
                        </View>
                    )}
                </View>

                {/* Details */}
                <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.medicine.name}</Text>
                    {/* Assuming pack size or description could go here, mocking for now */}
                    <Text style={styles.itemSubtitle}>1 Pack</Text>
                </View>

                {/* Price & Actions */}
                <View style={styles.itemRight}>
                    <Text style={styles.itemPrice}>₹{item.medicine.price.toFixed(2)}</Text>

                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            onPress={() => item.quantity > 1 ? updateQuantity(item.medicine._id, item.quantity - 1) : removeFromCart(item.medicine._id)}
                            style={styles.qtyAction}
                        >
                            <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                        </TouchableOpacity>

                        <Text style={styles.qtyText}>{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={() => updateQuantity(item.medicine._id, item.quantity + 1)}
                            style={[styles.qtyAction, styles.qtyAdd]}
                        >
                            <Ionicons name="add" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>My Cart</Text>
                        <Text style={styles.headerSubtitle}>0 Items in Total</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('MedicineSearch', {})}
                    >
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Group items by store logic could go here if we supported multi-store carts visually,
    // but right now Checkout only supports one store.
    // We will assume single store for the UI card header.
    const firstItemStore = typeof cart[0].medicine.store === 'object' ? cart[0].medicine.store : null;
    const storeName = firstItemStore ? firstItemStore.name : 'Store';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <Text style={styles.headerSubtitle}>{cart.length} Items in Total</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Items Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.storeIcon}>
                            <Ionicons name="medkit" size={14} color="#FFF" />
                        </View>
                        <Text style={styles.cardHeaderText}>Order From {storeName}</Text>
                        <Text style={styles.cardHeaderPrice}>₹{getTotalPrice().toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    {cart.map(item => (
                        <React.Fragment key={item.medicine._id}>
                            {renderCartItem({ item })}
                            <View style={styles.itemDivider} />
                        </React.Fragment>
                    ))}
                </View>

                {/* Delivery Card */}
                <View style={styles.card}>
                    <View style={styles.deliveryHeader}>
                        <Ionicons name="location-sharp" size={20} color="#00B4D8" />
                        <Text style={styles.deliveryTitle}>Delivery to</Text>
                    </View>

                    <View style={styles.deliveryContent}>
                        {defaultAddress ? (
                            <View style={{ flex: 1 }}>
                                <Text style={styles.deliveryAddress}>
                                    {defaultAddress.addressLine1}, {defaultAddress.addressLine2 ? defaultAddress.addressLine2 + ', ' : ''}{defaultAddress.landmark}
                                </Text>
                                <Text style={styles.deliveryPincode}>
                                    {defaultAddress.city || ''} {defaultAddress.pincode}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.noAddressText}>No address selected</Text>
                        )}

                        <TouchableOpacity
                            style={styles.editAddressButton}
                            onPress={() => navigation.navigate('Main', { screen: 'Profile' } as any)}
                        >
                            <Ionicons name="arrow-forward-circle" size={24} color="#E5E7EB" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Promo Code Card */}
                <View style={styles.card}>
                    <View style={styles.promoHeader}>
                        <Ionicons name="ticket" size={20} color="#00B4D8" />
                        <Text style={styles.promoTitle}>Promo Code</Text>
                    </View>

                    <View style={styles.promoInputContainer}>
                        <TextInput
                            style={styles.promoInput}
                            placeholder="Enter your Code"
                            value={promoCode}
                            onChangeText={setPromoCode}
                        />
                        <TouchableOpacity style={styles.applyButton}>
                            <Text style={styles.applyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Checkout Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    storeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#00B4D8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    cardHeaderText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    cardHeaderPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    imageContainer: {
        marginRight: 12,
    },
    itemImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    itemRight: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 48,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0066FF',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    qtyAction: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyAdd: {
        backgroundColor: '#4ADE80', // Greenish
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        minWidth: 16,
        textAlign: 'center',
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#F9FAFB',
        marginVertical: 8,
    },
    // Delivery Card
    deliveryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    deliveryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    deliveryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deliveryAddress: {
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 2,
    },
    deliveryPincode: {
        fontSize: 12,
        color: '#6B7280',
    },
    noAddressText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    editAddressButton: {
        padding: 4,
    },
    // Promo Card
    promoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    promoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    promoInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 4,
        alignItems: 'center',
    },
    promoInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#1F2937',
    },
    applyButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    applyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00B4D8',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20, // above bottom tabs
        left: 16,
        right: 16,
    },
    checkoutButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default CartScreen;
