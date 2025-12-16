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
import { OrderDetailScreen, MapScreen } from '../screens/PlaceholderScreens';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    MedicineSearch: { category?: string };
    MedicineDetail: { medicineId: string };
    Cart: undefined;
    Checkout: undefined;
    OrderHistory: undefined;
    OrderDetail: { orderId: string };
    Map: { storeId: string };
    Profile: undefined;
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
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="MedicineSearch"
                    component={MedicineSearchScreen}
                    options={{ title: 'Search Medicines' }}
                />
                <Stack.Screen
                    name="MedicineDetail"
                    component={MedicineDetailScreen}
                    options={{ title: 'Medicine Details' }}
                />
                <Stack.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{ title: 'My Cart' }}
                />
                <Stack.Screen
                    name="Checkout"
                    component={CheckoutScreen}
                    options={{ title: 'Checkout' }}
                />
                <Stack.Screen
                    name="OrderHistory"
                    component={OrderHistoryScreen}
                    options={{ title: 'Order History' }}
                />
                <Stack.Screen
                    name="OrderDetail"
                    component={OrderDetailScreen}
                    options={{ title: 'Order Details' }}
                />
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ title: 'Store Location' }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: 'My Profile' }}
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
