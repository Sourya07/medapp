import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { medicineAPI } from '../services/api';
import { Medicine, Store, CartItem } from '../types';

type MedicineDetailRouteProp = RouteProp<RootStackParamList, 'MedicineDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'MedicineDetail'>;

const MedicineDetailScreen = () => {
    const route = useRoute<MedicineDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { addToCart, cart } = useCart();
    const { medicineId } = route.params;

    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchMedicineDetails();
    }, [medicineId]);

    const fetchMedicineDetails = async () => {
        try {
            const response = await medicineAPI.getMedicineById(medicineId);
            setMedicine(response.data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load medicine details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (medicine) {
            addToCart(medicine, quantity);
            Alert.alert('Success', `${medicine.name} added to cart`);
        }
    };

    const handleIncrement = () => {
        if (medicine && quantity < medicine.quantity) {
            setQuantity(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const cartItemCount = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066FF" />
            </View>
        );
    }

    if (!medicine) {
        return (
            <View style={[styles.loadingContainer]}>
                <Text style={styles.errorText}>Medicine not found</Text>
            </View>
        );
    }

    const store = typeof medicine.store === 'object' ? medicine.store : null;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {medicine.imageUrl ? (
                        <Image source={{ uri: medicine.imageUrl }} style={styles.productImage} />
                    ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                            <Text style={styles.placeholderEmoji}>💊</Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.contentContainer}>
                    <Text style={styles.productName}>{medicine.name}</Text>

                    {/* Price Section */}
                    <View style={styles.priceRow}>
                        <Text style={styles.currentPrice}>₹{medicine.price.toFixed(2)}</Text>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                                onPress={handleDecrement}
                                disabled={quantity === 1}
                            >
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.quantityButton, quantity >= medicine.quantity && styles.quantityButtonDisabled]}
                                onPress={handleIncrement}
                                disabled={quantity >= medicine.quantity}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description */}
                    {medicine.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.descriptionText}>{medicine.description}</Text>
                        </View>
                    )}

                    {/* Product Details */}
                    <View style={styles.detailsContainer}>
                        {medicine.category && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Category:</Text>
                                <Text style={styles.detailValue}>{medicine.category}</Text>
                            </View>
                        )}
                        {medicine.manufacturer && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Manufacturer:</Text>
                                <Text style={styles.detailValue}>{medicine.manufacturer}</Text>
                            </View>
                        )}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Stock:</Text>
                            <Text style={[styles.detailValue, medicine.quantity > 0 ? styles.inStock : styles.outOfStock]}>
                                {medicine.quantity > 0 ? `${medicine.quantity} units available` : 'Out of Stock'}
                            </Text>
                        </View>
                        {medicine.prescriptionRequired && (
                            <View style={styles.prescriptionNotice}>
                                <Text style={styles.prescriptionIcon}>⚕️</Text>
                                <Text style={styles.prescriptionText}>Prescription Required</Text>
                            </View>
                        )}
                    </View>

                    {/* Store Information */}
                    {store && (
                        <View style={styles.storeSection}>
                            <View style={styles.storeTitleRow}>
                                <Text style={styles.storeIcon}>🏪</Text>
                                <Text style={styles.storeTitle}>Available at</Text>
                            </View>
                            <View style={styles.storeCard}>
                                <View style={styles.storeInfo}>
                                    <Text style={styles.storeName}>{store.name}</Text>
                                    <Text style={styles.storeAddress}>{store.address}</Text>
                                    <Text style={styles.storeContact}>📞 {store.contactNumber}</Text>
                                    {store.openingHours && (
                                        <Text style={styles.storeHours}>🕐 {store.openingHours}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action Button */}
            {medicine.quantity > 0 && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCart}
                    >
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                        {cartItemCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        backgroundColor: '#FFF',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    productImage: {
        width: 280,
        height: 280,
        borderRadius: 16,
        resizeMode: 'contain',
    },
    placeholderImage: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 120,
    },
    contentContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        padding: 20,
    },
    productName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    currentPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0066FF',
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    quantityButton: {
        width: 36,
        height: 36,
        backgroundColor: '#0066FF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    quantityButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginHorizontal: 16,
        minWidth: 30,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    detailsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
    },
    inStock: {
        color: '#10B981',
    },
    outOfStock: {
        color: '#EF4444',
    },
    prescriptionNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    prescriptionIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    prescriptionText: {
        fontSize: 14,
        color: '#D97706',
        fontWeight: '600',
    },
    storeSection: {
        marginTop: 8,
    },
    storeTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    storeIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    storeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    storeCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    storeInfo: {
        gap: 6,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    storeAddress: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    storeContact: {
        fontSize: 13,
        color: '#0066FF',
        marginTop: 4,
    },
    storeHours: {
        fontSize: 13,
        color: '#10B981',
    },
    bottomContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    addToCartButton: {
        backgroundColor: '#0066FF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    cartBadge: {
        position: 'absolute',
        right: 16,
        backgroundColor: '#FFF',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#0066FF',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default MedicineDetailScreen;
