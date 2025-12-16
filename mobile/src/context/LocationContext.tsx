import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as ExpoLocation from 'expo-location';
import { authAPI } from '../services/api';
import { Location } from '../types';

interface LocationContextType {
    location: Location | null;
    locationName: string | null;
    isLoading: boolean;
    error: string | null;
    requestPermission: () => Promise<boolean>;
    getCurrentLocation: () => Promise<void>;
    updateBackendLocation: (latitude: number, longitude: number) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [locationName, setLocationName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-detect location on mount
    useEffect(() => {
        autoDetectLocation();
    }, []);

    const autoDetectLocation = async () => {
        setIsLoading(true);
        try {
            // Check if permission is already granted
            const { status } = await ExpoLocation.getForegroundPermissionsAsync();

            if (status === 'granted') {
                await fetchCurrentLocation();
            } else {
                // Request permission
                const { status: newStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
                if (newStatus === 'granted') {
                    await fetchCurrentLocation();
                } else {
                    setError('Location permission denied');
                }
            }
        } catch (err: any) {
            console.log('Auto-detect location error:', err.message);
            setError(null); // Don't show error for auto-detect
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentLocation = async () => {
        try {
            const currentLocation = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.Balanced,
            });

            const newLocation = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            setLocation(newLocation);

            // Reverse geocode to get address name
            const [geocode] = await ExpoLocation.reverseGeocodeAsync({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude
            });

            if (geocode) {
                const addressName = [
                    geocode.subregion,
                    geocode.city,
                    geocode.region
                ].filter(Boolean).join(', ');
                setLocationName(addressName || 'Current Location');
            }

            // Update backend (silently, don't block) - skip if no token
            try {
                await updateBackendLocation(newLocation.latitude, newLocation.longitude);
            } catch (err) {
                // Silently fail for guest users - they don't have tokens
                console.log('Backend location update skipped (likely guest mode)');
            }
        } catch (err: any) {
            throw err;
        }
    };

    const requestPermission = async (): Promise<boolean> => {
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setError('Permission to access location was denied');
                return false;
            }

            return true;
        } catch (err) {
            setError('Error requesting location permission');
            return false;
        }
    };

    const getCurrentLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const hasPermission = await requestPermission();

            if (!hasPermission) {
                setIsLoading(false);
                return;
            }

            await fetchCurrentLocation();
        } catch (err: any) {
            setError(err.message || 'Error getting location');
        } finally {
            setIsLoading(false);
        }
    };

    const updateBackendLocation = async (latitude: number, longitude: number) => {
        try {
            await authAPI.updateLocation(latitude, longitude);
        } catch (err) {
            console.error('Error updating backend location:', err);
        }
    };

    return (
        <LocationContext.Provider
            value={{
                location,
                locationName,
                isLoading,
                error,
                requestPermission,
                getCurrentLocation,
                updateBackendLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
