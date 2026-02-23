import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Plus } from 'lucide-react-native';
import { THEME } from '../../theme';

interface FABProps {
    onPress: () => void;
    label?: string;
    bottomOffset?: number;
    rightOffset?: number;
}

export const FAB = ({ onPress, label, bottomOffset = 14, rightOffset = 24 }: FABProps) => {
    const tabBarHeight = useBottomTabBarHeight();
    const computedBottom = Math.max(bottomOffset, tabBarHeight + bottomOffset);

    return (
        <TouchableOpacity
            style={[styles.fab, { bottom: computedBottom, right: rightOffset }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Plus size={32} color={THEME.colors.primary} strokeWidth={3} />
            {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
        </TouchableOpacity>
    );
};

interface AddButtonProps {
    onPress: () => void;
    size?: 'small' | 'large';
}

export const AddButton = ({ onPress, size = 'small' }: AddButtonProps) => (     
    <TouchableOpacity
        style={[styles.addBtn, size === 'large' ? styles.addBtnLarge : styles.addBtnSmall]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Plus size={size === 'large' ? 24 : 16} color="#fff" strokeWidth={3} /> 
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        backgroundColor: THEME.colors.secondary, // Yellow pop!
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
        zIndex: 50,
    },
    label: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
    },
    addBtn: {
        backgroundColor: THEME.colors.success, // Green
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        // Hard Shadow
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    addBtnSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    addBtnLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
    }
});
