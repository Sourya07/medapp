import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { medicineAPI } from '../services/api';
import { Medicine } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MedicineSearch'>;

const MedicineSearchScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { location } = useLocation();
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(false);
    const [nearbyOnly, setNearbyOnly] = useState(true);

    useEffect(() => {
        // Load all medicines on initial mount
        loadMedicines();
    }, [nearbyOnly]);

    const loadMedicines = async () => {
        setLoading(true);
        try {
            // Use 'a' as default query since backend requires a search term
            const query = searchQuery.trim() || 'a';
            const response = await medicineAPI.search(
                query,
                location?.latitude,
                location?.longitude,
                nearbyOnly
            );
            setMedicines(response.data.data || []);
        } catch (error) {
            console.error('Failed to load medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            // If empty, load all medicines
            loadMedicines();
            return;
        }

        await loadMedicines();
    };

    const handleAddToCart = (medicine: Medicine) => {
        addToCart(medicine, 1);
        Alert.alert('Success', `${medicine.name} added to cart`);
    };

    const renderMedicineCard = ({ item }: { item: Medicine }) => {
        const store = typeof item.store === 'object' ? item.store : null;

        return (
            <TouchableOpacity
                style={styles.medicineCard}
                onPress={() => navigation.navigate('MedicineDetail', { medicineId: item._id })}
            >
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.medicineImage} />
                ) : (
                    <View style={[styles.medicineImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>💊</Text>
                    </View>
                )}

                <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.medicinePrice}>₹{item.price.toFixed(2)}</Text>

                    {store && (
                        <Text style={styles.storeName} numberOfLines={1}>
                            📍 {store.name}
                        </Text>
                    )}

                    <View style={styles.footer}>
                        <Text style={item.quantity > 0 ? styles.inStock : styles.outOfStock}>
                            {item.quantity > 0 ? '✓ In Stock' : 'Out of Stock'}
                        </Text>

                        {item.prescriptionRequired && (
                            <Text style={styles.prescriptionBadge}>Rx</Text>
                        )}
                    </View>
                </View>

                {item.quantity > 0 && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToCart(item)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setNearbyOnly(!nearbyOnly)}
            >
                <Text style={styles.filterText}>
                    {nearbyOnly ? '📍 Nearby stores only' : '🌐 All stores'}
                </Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
            ) : medicines.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        {searchQuery ? 'No medicines found' : 'Start searching for medicines'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={medicines}
                    renderItem={renderMedicineCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    searchSection: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    filterButton: {
        backgroundColor: '#EFF6FF',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    filterText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    medicineCard: {
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
    medicineImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    placeholderImage: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
    },
    medicineInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    medicineName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    medicinePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    storeName: {
        fontSize: 12,
        color: '#6B7280',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inStock: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    outOfStock: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
    },
    prescriptionBadge: {
        backgroundColor: '#FEF3C7',
        color: '#D97706',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    addButton: {
        width: 40,
        height: 40,
        backgroundColor: '#3B82F6',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 40,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default MedicineSearchScreen;
