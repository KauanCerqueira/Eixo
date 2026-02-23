import React from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../../theme';

export const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
    card: { 
        backgroundColor: '#fff', 
        borderWidth: THEME.borderWidth, 
        borderColor: '#000', 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 16,
        // Hard Shadow
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0, 
    }
});
