import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addressAPI, CreateAddressData } from '../services/addressAPI';
import { Address } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<{ params: { mode: 'add' | 'edit'; address?: Address } }, 'params'>;

const AddAddressScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteParams>();
    const { mode, address: existingAddress } = route.params || { mode: 'add' };

    const [name, setName] = useState(existingAddress?.name || '');
    const [fullName, setFullName] = useState(existingAddress?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState(existingAddress?.phoneNumber || '');
    const [addressLine1, setAddressLine1] = useState(existingAddress?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(existingAddress?.addressLine2 || '');
    const [landmark, setLandmark] = useState(existingAddress?.landmark || '');
    const [pincode, setPincode] = useState(existingAddress?.pincode || '');
    const [latitude, setLatitude] = useState(existingAddress?.location.coordinates[1] || 0);
    const [longitude, setLongitude] = useState(existingAddress?.location.coordinates[0] || 0);
    const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const handleDetectLocation = async () => {
        setDetectingLocation(true);
        try {
            // Request location permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to use this feature');
                setDetectingLocation(false);
                return;
            }

            // Get current position
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);

            // Reverse geocoding to get address
            const [geocode] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (geocode) {
                // Auto-fill address fields
                if (geocode.street) {
                    setAddressLine1(geocode.street);
                }
                if (geocode.subregion || geocode.city) {
                    setAddressLine2(`${geocode.subregion || ''}, ${geocode.city || ''}`);
                }
                if (geocode.postalCode) {
                    setPincode(geocode.postalCode);
                }
                if (geocode.name) {
                    setLandmark(geocode.name);
                }

                Alert.alert('Success', 'Location detected and address fields auto-filled!');
            }
        } catch (error) {
            console.error('Error detecting location:', error);
            Alert.alert('Error', 'Failed to detect location. Please try again.');
        } finally {
            setDetectingLocation(false);
        }
    };

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter address name (e.g., Home, Office)');
            return false;
        }
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return false;
        }
        if (!addressLine1.trim()) {
            Alert.alert('Error', 'Please enter address line 1');
            return false;
        }
        if (!landmark.trim()) {
            Alert.alert('Error', 'Please enter a landmark');
            return false;
        }
        if (!pincode.trim() || !/^[0-9]{6}$/.test(pincode)) {
            Alert.alert('Error', 'Please enter a valid 6-digit pincode');
            return false;
        }
        if (!latitude || !longitude) {
            Alert.alert('Error', 'Please detect your location or enter coordinates');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const data: CreateAddressData = {
                name: name.trim(),
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                addressLine1: addressLine1.trim(),
                addressLine2: addressLine2.trim(),
                landmark: landmark.trim(),
                pincode: pincode.trim(),
                latitude,
                longitude,
                isDefault
            };

            if (mode === 'edit' && existingAddress) {
                await addressAPI.updateAddress(existingAddress._id, data);
                Alert.alert('Success', 'Address updated successfully');
            } else {
                await addressAPI.createAddress(data);
                Alert.alert('Success', 'Address added successfully');
            }

            navigation.goBack();
        } catch (error: any) {
            console.error('Error saving address:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Location Detection Button */}
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleDetectLocation}
                    disabled={detectingLocation}
                >
                    {detectingLocation ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="location" size={20} color="#FFF" />
                            <Text style={styles.locationButtonText}>Use Current Location</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Address Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Home, Office, Mom's Place"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="10-digit mobile number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>

                {/* Address Line 1 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address Line 1 *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="House No., Building, Street"
                        value={addressLine1}
                        onChangeText={setAddressLine1}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Address Line 2 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address Line 2 (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Area, Sector, Locality"
                        value={addressLine2}
                        onChangeText={setAddressLine2}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Landmark */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Landmark *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nearby landmark for easy location"
                        value={landmark}
                        onChangeText={setLandmark}
                    />
                </View>

                {/* Pincode */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Pincode *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChangeText={setPincode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                {/* Default Address Checkbox */}
                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setIsDefault(!isDefault)}
                >
                    <Ionicons
                        name={isDefault ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isDefault ? '#0066FF' : '#9CA3AF'}
                    />
                    <Text style={styles.checkboxLabel}>Set as default address</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {mode === 'edit' ? 'Update Address' : 'Save Address'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    form: {
        padding: 16,
    },
    locationButton: {
        backgroundColor: '#0066FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 8,
        marginBottom: 24,
    },
    locationButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#1F2937',
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 16,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#374151',
    },
    saveButton: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AddAddressScreen;
