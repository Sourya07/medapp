// Placeholder screens - implement these for full functionality

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OrderDetailScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Order Detail Screen - To be implemented</Text>
    </View>
);

export const MapScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Map Screen - To be implemented with React Native Maps</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    text: {
        fontSize: 16,
        color: '#6B7280',
    },
});

export default { OrderDetailScreen, MapScreen };
