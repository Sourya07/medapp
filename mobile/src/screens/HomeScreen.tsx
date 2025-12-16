import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { medicineAPI } from '../services/api';
import { Medicine } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { location, locationName, isLoading: locationLoading } = useLocation();
    const { getTotalItems, addToCart } = useCart();
    const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedMedicines();
    }, []);

    const fetchFeaturedMedicines = async () => {
        try {
            const response = await medicineAPI.search(
                'health',
                location?.latitude,
                location?.longitude,
                false
            );
            setFeaturedMedicines(response.data.data?.slice(0, 6) || []);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (medicine: Medicine) => {
        addToCart(medicine, 1);
    };

    // Truncate location name to first 2 words
    const getShortLocation = () => {
        if (!locationName) {
            return location ? 'Location Detected' : 'Set Location';
        }
        const words = locationName.split(/[,\s]+/);
        return words.slice(0, 2).join(' ');
    };

    const cartItemCount = getTotalItems();

    return (
        <View style={styles.container}>
            {/* Header with Location and Cart */}
            <View style={styles.header}>
                <View style={styles.locationContainer}>
                    <View style={styles.locationIcon}>
                        <Ionicons name="location" size={24} color="#FFF" />
                    </View>
                    <View style={styles.locationTextContainer}>
                        <Text style={styles.locationLabel}>Current Location</Text>
                        {locationLoading ? (
                            <ActivityIndicator size="small" color="#0066FF" />
                        ) : (
                            <TouchableOpacity style={styles.locationDropdown}>
                                <Text style={styles.locationValue} numberOfLines={1}>
                                    {getShortLocation()}
                                </Text>
                                <Ionicons name="chevron-down" size={14} color="#0066FF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="cart-outline" size={28} color="#1F2937" />
                    {cartItemCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <TouchableOpacity
                    style={styles.searchBar}
                    onPress={() => navigation.navigate('MedicineSearch', {})}
                    activeOpacity={0.7}
                >
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                    <Text style={styles.searchPlaceholder}>Search For Medicines</Text>
                </TouchableOpacity>

                {/* Categories Section */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigation.navigate('MedicineSearch', { category: 'Pharmacy' })}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#FFE5E5' }]}>
                            <Ionicons name="medkit" size={32} color="#FF6B6B" />
                        </View>
                        <Text style={styles.categoryText}>Pharmacy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigation.navigate('MedicineSearch', { category: 'Lab Tests' })}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#E5F3FF' }]}>
                            <Ionicons name="flask" size={32} color="#0066FF" />
                        </View>
                        <Text style={styles.categoryText}>Lab tests</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigation.navigate('MedicineSearch', { category: 'Pet Care' })}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#FFF3E5' }]}>
                            <Ionicons name="paw" size={32} color="#FF9500" />
                        </View>
                        <Text style={styles.categoryText}>Pet Care</Text>
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>NEW</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigation.navigate('MedicineSearch', { category: 'Consults' })}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="medical" size={32} color="#4CAF50" />
                        </View>
                        <Text style={styles.categoryText}>Consults</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigation.navigate('MedicineSearch', { category: 'Wellness' })}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#F3E5F5' }]}>
                            <Ionicons name="fitness" size={32} color="#9C27B0" />
                        </View>
                        <Text style={styles.categoryText}>Wellness</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Services Section */}
                <View style={styles.servicesContainer}>
                    <TouchableOpacity
                        style={[styles.serviceCard, { backgroundColor: '#F0F9FF' }]}
                        onPress={() => navigation.navigate('MedicineSearch', {})}
                    >
                        <View style={[styles.serviceIcon, { backgroundColor: '#CFFAFE' }]}>
                            <Ionicons name="medical" size={32} color="#00A69C" />
                        </View>
                        <Text style={styles.serviceName}>Health Checkup</Text>
                        <Text style={styles.serviceDescription} numberOfLines={2}>
                            Book Lab Tests & Health Packages
                        </Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.servicePrice}>₹299</Text>
                            <Text style={styles.servicePriceOld}>₹500</Text>
                        </View>
                        <TouchableOpacity style={styles.bookButton}>
                            <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.serviceCard, { backgroundColor: '#F0F9FF' }]}
                        onPress={() => navigation.navigate('MedicineSearch', {})}
                    >
                        <View style={[styles.serviceIcon, { backgroundColor: '#9DBDFF' }]}>
                            <Ionicons name="fitness" size={32} color="#4F7CFF" />
                        </View>
                        <Text style={styles.serviceName}>Wellness Plan</Text>
                        <Text style={styles.serviceDescription} numberOfLines={2}>
                            Preventive Care & Wellness Programs
                        </Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.servicePrice}>₹599</Text>
                            <Text style={styles.servicePriceOld}>₹999</Text>
                        </View>
                        <TouchableOpacity style={styles.bookButton}>
                            <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                {/* Wellness Products Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Wellness Product</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MedicineSearch', {})}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#00B4D8" style={styles.loader} />
                ) : featuredMedicines.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.productsScroll}
                    >
                        {featuredMedicines.map((medicine, index) => (
                            <TouchableOpacity
                                key={medicine._id}
                                style={styles.productCard}
                                onPress={() =>
                                    navigation.navigate('MedicineDetail', { medicineId: medicine._id })
                                }
                            >
                                {index === 0 && (
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>25% OFF</Text>
                                    </View>
                                )}
                                {medicine.imageUrl ? (
                                    <Image
                                        source={{ uri: medicine.imageUrl }}
                                        style={styles.productImage}
                                    />
                                ) : (
                                    <View style={[styles.productImage, styles.placeholderImage]}>
                                        <Ionicons name="medkit" size={48} color="#9CA3AF" />
                                    </View>
                                )}
                                <Text style={styles.productName} numberOfLines={2}>
                                    {medicine.name}
                                </Text>
                                <View style={styles.productFooter}>
                                    <Text style={styles.productPrice}>₹{medicine.price.toFixed(2)}</Text>
                                    {medicine.quantity > 0 && (
                                        <TouchableOpacity
                                            style={styles.addProductButton}
                                            onPress={() => handleAddToCart(medicine)}
                                        >
                                            <Ionicons name="add" size={20} color="#FFF" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyProducts}>
                        <Text style={styles.emptyText}>No products available</Text>
                    </View>
                )}

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                    <Ionicons name="home" size={24} color="#00B4D8" />
                    <Text style={styles.navLabelActive}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navLabel}>Notification</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItemCenter}
                    onPress={() => navigation.navigate('MedicineSearch', {})}
                >
                    <View style={styles.centerButton}>
                        <Ionicons name="medical-outline" size={28} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('OrderHistory')}
                >
                    <Ionicons name="document-text-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navLabel}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Profile' as any)}
                >
                    <Ionicons name="person-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navLabel}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    locationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0066FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationTextContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    locationDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0066FF',
    },
    cartButton: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 12,
    },
    searchPlaceholder: {
        fontSize: 16,
        color: '#9CA3AF',
        flex: 1,
    },
    categoriesContainer: {
        marginTop: 16,
        marginBottom: 20,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    categoryCard: {
        alignItems: 'center',
        width: 90,
        position: 'relative',
    },
    categoryIcon: {
        width: 70,
        height: 70,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
    },
    newBadge: {
        position: 'absolute',
        top: -4,
        right: 6,
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    newText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
    },
    servicesContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 16,
        marginBottom: 24,
    },
    serviceCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        minHeight: 240,
        justifyContent: 'space-between',
    },
    serviceIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    serviceDescription: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 14,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0066FF',
    },
    servicePriceOld: {
        fontSize: 14,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    bookButton: {
        backgroundColor: '#00B4D8',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        width: '100%',
    },
    bookButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    viewAllText: {
        fontSize: 14,
        color: '#00B4D8',
        fontWeight: '600',
    },
    loader: {
        marginVertical: 40,
    },
    productsScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    productCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        width: 150,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 1,
    },
    discountText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    productImage: {
        width: 126,
        height: 126,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'contain',
    },
    placeholderImage: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        height: 36,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0066FF',
    },
    addProductButton: {
        width: 28,
        height: 28,
        backgroundColor: '#00B4D8',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyProducts: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 10,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        justifyContent: 'center',
    },
    navItemCenter: {
        flex: 1,
        alignItems: 'center',
        marginTop: -24,
    },
    navLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    navLabelActive: {
        fontSize: 11,
        color: '#00B4D8',
        marginTop: 4,
        fontWeight: '600',
    },
    centerButton: {
        width: 56,
        height: 56,
        backgroundColor: '#0066FF',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default HomeScreen;