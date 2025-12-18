import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MedicineSearchScreen from '../screens/MedicineSearchScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import { MapScreen } from '../screens/PlaceholderScreens';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import TabNavigator, { TabParamList } from './TabNavigator';
import { NavigatorScreenParams } from '@react-navigation/native';

import OrderSuccessScreen from '../screens/OrderSuccessScreen';

export type RootStackParamList = {
    Login: undefined;
    Main: NavigatorScreenParams<TabParamList>;
    MedicineDetail: { medicineId: string };
    Cart: undefined; // Keeping these for compatibility if directly accessed via Navigate, but theoretically should use Main
    Checkout: undefined;
    OrderDetail: { orderId: string };
    OrderSuccess: undefined;
    Map: { storeId: string };
    AddAddress: { mode: 'add' | 'edit'; address?: any };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#3B82F6' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                {/* Everyone lands on Home - no login gate */}
                <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="MedicineDetail"
                    component={MedicineDetailScreen}
                    options={{ title: 'Medicine Details' }}
                />
                <Stack.Screen
                    name="Checkout"
                    component={CheckoutScreen}
                    options={{ title: 'Checkout' }}
                />
                <Stack.Screen
                    name="OrderDetail"
                    component={OrderDetailScreen}
                    options={{ title: 'Order Details' }}
                />
                <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ title: 'Store Location' }}
                />
                <Stack.Screen
                    name="AddAddress"
                    component={AddAddressScreen}
                    options={({ route }) => ({
                        title: route.params.mode === 'edit' ? 'Edit Address' : 'Add New Address'
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
