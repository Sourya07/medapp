import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

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
        const store = typeof item.medicine.store === 'object' ? item.medicine.store : null;

        return (
            <View style={styles.cartItem}>
                {item.medicine.imageUrl ? (
                    <Image source={{ uri: item.medicine.imageUrl }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>💊</Text>
                    </View>
                )}

                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.medicine.name}
                    </Text>
                    {store && (
                        <Text style={styles.storeName} numberOfLines={1}>
                            {store.name}
                        </Text>
                    )}
                    <Text style={styles.itemPrice}>₹{item.medicine.price.toFixed(2)} each</Text>
                </View>

                <View style={styles.quantitySection}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.medicine._id, item.quantity - 1)}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.medicine._id, item.quantity + 1)}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.itemTotal}>
                        ₹{(item.medicine.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                        onPress={() => removeFromCart(item.medicine._id)}
                        style={styles.removeButton}
                    >
                        <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (cart.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('MedicineSearch', {})}
                >
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.medicine._id}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>₹{getTotalPrice().toFixed(2)}</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                        <Text style={styles.clearButtonText}>Clear Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutButtonText}>Checkout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    list: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    placeholderImage: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 28,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    storeName: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemPrice: {
        fontSize: 13,
        color: '#3B82F6',
    },
    quantitySection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        backgroundColor: '#fff',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    quantity: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    removeButton: {
        marginTop: 4,
    },
    removeText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    clearButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    checkoutButton: {
        flex: 2,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 32,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CartScreen;
