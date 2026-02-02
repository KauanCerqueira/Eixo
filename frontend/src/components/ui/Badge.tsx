import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'pending' | 'done' | 'urgent' | 'info';

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => {
    const variantStyles = {
        pending: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
        done: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
        urgent: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
        info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
    }[variant];

    return (
        <View style={[styles.badge, { backgroundColor: variantStyles.bg, borderColor: variantStyles.border }]}>
            <Text style={[styles.text, { color: variantStyles.text }]}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
    text: { fontSize: 11, fontWeight: 'bold' }
});
