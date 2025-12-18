import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    return (
        <View style={styles.bottomNav}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                // Custom rendering for the center button (MedicineSearch)
                if (route.name === 'MedicineSearch') {
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.navItemCenter}
                            onPress={onPress}
                        >
                            <View style={styles.centerButton}>
                                <Ionicons name="medical-outline" size={28} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    );
                }

                // Icon mapping
                let iconName: any = 'home-outline';
                if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
                else if (route.name === 'Cart') iconName = isFocused ? 'cart' : 'cart-outline';
                else if (route.name === 'OrderHistory') iconName = isFocused ? 'document-text' : 'document-text-outline';
                else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

                // Label mapping
                let labelText = label as string;
                if (route.name === 'OrderHistory') labelText = 'History';

                const color = isFocused ? '#00B4D8' : '#9CA3AF';

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.navItem}
                        onPress={onPress}
                    >
                        <Ionicons name={iconName} size={24} color={color} />
                        <Text style={[styles.navLabel, { color, fontWeight: isFocused ? '600' : '400' }]}>
                            {labelText}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 20, // Safe area padding simulation
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
        marginTop: 4,
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

export default CustomTabBar;
