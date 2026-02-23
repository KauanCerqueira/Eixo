import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../theme';

type BadgeVariant = 'pending' | 'done' | 'urgent' | 'info' | 'success';

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => {
    // Neubrutalism: Always black border, vibrant BG
    const variantStyles = {
        pending: { bg: THEME.colors.warning, text: '#000' },
        done: { bg: THEME.colors.success, text: '#000' },
        success: { bg: THEME.colors.success, text: '#000' },
        urgent: { bg: THEME.colors.error, text: '#FFF' },
        info: { bg: THEME.colors.info, text: '#FFF' },
    }[variant];

    return (
        <View style={[styles.badge, { backgroundColor: variantStyles.bg }]}>
            <Text style={[styles.text, { color: variantStyles.text }]}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: { 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 8, // Less rounded
        borderWidth: 2,
        borderColor: '#000',
        alignSelf: 'flex-start',
    },
    text: { 
        fontSize: 12, 
        fontWeight: '900' 
    }
});
