import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Medicine } from '../types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (medicine: Medicine, quantity: number) => void;
    removeFromCart: (medicineId: string) => void;
    updateQuantity: (medicineId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
    loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@medical_cart';
const GUEST_ID_KEY = '@guest_id';

// Generate a simple guest ID
const generateGuestId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [guestId, setGuestId] = useState<string | null>(null);

    // Load cart and guest ID on mount
    useEffect(() => {
        loadCart();
        loadGuestId();
    }, []);

    // Save cart whenever it changes
    useEffect(() => {
        // Only save if cart has been initialized (i.e., not the initial empty state before loading)
        // A simple check like `cart !== null` or a flag could be used if initial load is async
        // For now, `cart.length >= 0` is always true, but ensures `saveCart` is called after initial render
        if (cart.length >= 0) {
            saveCart();
        }
    }, [cart]);

    const loadGuestId = async () => {
        try {
            let id = await AsyncStorage.getItem(GUEST_ID_KEY);
            if (!id) {
                id = generateGuestId();
                await AsyncStorage.setItem(GUEST_ID_KEY, id);
            }
            setGuestId(id);
        } catch (error) {
            console.error('Error loading guest ID:', error);
        }
    };

    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addToCart = (medicine: Medicine, quantity: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.medicine._id === medicine._id
            );

            if (existingItem) {
                return prevCart.map((item) =>
                    item.medicine._id === medicine._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prevCart, { medicine, quantity }];
        });
    };

    const removeFromCart = (medicineId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.medicine._id !== medicineId));
    };

    const updateQuantity = (medicineId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(medicineId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.medicine._id === medicineId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = async () => {
        setCart([]);
        try {
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const getTotalPrice = (): number => {
        return cart.reduce((total, item) => total + item.medicine.price * item.quantity, 0);
    };

    const getTotalItems = (): number => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems,
                loadCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
