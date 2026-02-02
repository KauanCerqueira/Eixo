import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 16, marginBottom: 12 }
});
