import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';

type OrderSuccessScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>; // Reusing OrderDetail params if we want to pass orderId for tracking

type NavigationProp = CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    BottomTabNavigationProp<TabParamList>
>;

const { width } = Dimensions.get('window');

const OrderSuccessScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    // We expect orderId to be passed via route params if we want to track it
    // but for now we are just styling the static success page
    // const route = useRoute<OrderSuccessScreenRouteProp>();
    // const { orderId } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Icon Animation Placeholder */}
                <View style={styles.iconContainer}>
                    <View style={styles.circleOuter}>
                        <View style={styles.circleInner}>
                            <Ionicons name="checkmark" size={64} color="#FFF" />
                        </View>
                    </View>
                    {/* Decorative elements */}
                    <View style={[styles.decor, styles.decor1]} />
                    <View style={[styles.decor, styles.decor2]} />
                    <View style={[styles.decor, styles.decor3]} />
                </View>

                {/* Text Content */}
                <Text style={styles.title}>Your Order has been accepted</Text>
                <Text style={styles.subtitle}>
                    Your Items Has Been Placed And Is On It's Way To Being Processed
                </Text>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => {
                            // Find the orderId if available, otherwise just go to order history
                            // For this demo, we can go to OrderHistory
                            navigation.navigate('Main', { screen: 'OrderHistory' });
                        }}
                    >
                        <Text style={styles.trackButtonText}>Track my Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                    >
                        <Text style={styles.homeButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    circleOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E8F5E9', // Light green
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4ADE80', // Success green
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    decor: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#60A5FA', // Some blue dots
    },
    decor1: { top: 20, right: 40, backgroundColor: '#F87171' }, // Red
    decor2: { bottom: 30, left: 30, backgroundColor: '#FBBF24' }, // Yellow
    decor3: { top: 50, left: 20, backgroundColor: '#60A5FA' }, // Blue
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1F2937',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6B7280',
        paddingHorizontal: 20,
        lineHeight: 24,
        marginBottom: 48,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    trackButton: {
        backgroundColor: '#0066FF',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    trackButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    homeButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
});

export default OrderSuccessScreen;
